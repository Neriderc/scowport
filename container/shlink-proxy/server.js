
const express = require("express");

const app = express();
app.use(express.json({ limit: "8kb" }));

const {
  PORT = 3000,
  ZUSAM_API_URL,
  SHLINK_API_URL,
  SHLINK_API_KEY,
  INVITE_APP_ORIGIN,
} = process.env;

if (
  !ZUSAM_API_URL ||
  !SHLINK_API_URL ||
  !SHLINK_API_KEY ||
  !INVITE_APP_ORIGIN
) {
  throw new Error("Missing required environment variables");
}

const allowedOrigin = new URL(INVITE_APP_ORIGIN).origin;

app.post("/api/shortlink", async (req, res) => {
  try {
    const token = req.get("X-AUTH-TOKEN");

    if (!token) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const meResponse = await fetch(
      `${ZUSAM_API_URL}/api/me`,
      {
        headers: {
          "X-AUTH-TOKEN": token,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (meResponse.status === 401 || meResponse.status === 403) {
      return res.status(401).json({
        error: "Invalid or expired session",
      });
    }

    if (!meResponse.ok) {
      console.error("Zusam authentication check failed:",
        meResponse.status);

      return res.status(502).json({
        error: "Unable to verify your session",
      });
    }

    const { longUrl } = req.body || {};

    if (typeof longUrl !== "string") {
      return res.status(400).json({
        error: "longUrl is required",
      });
    }

    const inviteUrl = new URL(longUrl);

      if (
      inviteUrl.origin !== allowedOrigin ||
      !inviteUrl.pathname.startsWith("/invitation/")
    ) {
      return res.status(400).json({
        error: "Invalid invitation URL",
      });
    }

    const shlinkResponse = await fetch(
      `${SHLINK_API_URL}/rest/v3/short-urls`,
      {
        method: "POST",
        headers: {
          "X-Api-Key": SHLINK_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          longUrl: inviteUrl.toString(),
          findIfExists: true,
        }),
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!shlinkResponse.ok) {
      console.error("Shlink request failed:",
        shlinkResponse.status);

      return res.status(502).json({
        error: "Unable to create short URL",
      });
    }

    const result = await shlinkResponse.json();

    return res.json({
      shortUrl: result.shortUrl,
    });
  } catch (error) {
    console.error("Shortening request failed:", error.message);

    return res.status(500).json({
      error: "Unable to create short URL",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Shlink proxy listening on ${PORT}`);
});
