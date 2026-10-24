import { h } from "preact";
import { alert, storage, http, router, me } from "/src/core";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Signup() {

  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const updateName = (name) => {
    let user = {};
    if (name) {
      user.name = name;
    }
    return me.fetch().then(me => {
      return http.put(`/api/users/${me.id}`, user).then(res => {
        if (!res) return;
        if (res["error"]) {
          alert.add(res["error"], "alert-danger");
          return;
        }
        return res;
      }).catch(() => null);
    });
  };

  const sendSignupForm = e => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    let login = document.getElementById("login").value || "";
    login.toLowerCase();
    let login_confirm = document.getElementById("login-confirm").value;
    login_confirm.toLowerCase();
    const password = document.getElementById("password").value;

    if (name === "") {
      alert.add(t("name_empty"));
      return;
    }

    if (login === "") {
      alert.add(t("login_no_empty"));
      return;
    }

    if (login !== login_confirm) {
      alert.add(t("login_no_match"));
      return;
    }

    if (password === "") {
      alert.add(t("password_empty"));
      return;
    }


    storage.set("apiKey", "");
    http
      .post("/api/signup", {
        login,
        password,
        invite_key: router.getParam("inviteKey")
      })
      .then(res => {
        if (res && !res.message) {
          storage.set("apiKey", res.api_key);
          updateName(name).then(() => {
            let path;
            if (router.getParam("encodedInvite")) {
              path = "/invitation/" + router.getParam("encodedInvite") + "?e";
            } else {
              path = "/invitation/" + router.getParam("inviteKey");
            }
            setTimeout(() => navigate(path), 100);
          });
        } else {
          alert.add(t(res.message));
        }
      });
  };

  return (
    <div class="signup">
      <div class="signup-form">
        <img src={new URL("/src/assets/zusam_logo.svg", import.meta.url)} />
        <div class="welcome lead">{t("invitation_welcome")}</div>
        <form>
          <div class="form-group mt-2">
            <input
              type="email"
              class="form-control"
              required
              id="name"
              placeholder={t("name")}
            />
            <input
              type="email"
              class="form-control mt-2"
              required
              id="login"
              placeholder={t("login_placeholder")}
            />
          </div>
          <div class="form-group mt-2">
            <input
              type="email"
              class="form-control"
              required
              id="login-confirm"
              placeholder={t("login_confirm")}
            />
          </div>
          <div class="form-group">
            <input
              type="password"
              class="form-control mt-2"
              required
              id="password"
              placeholder={t("password_placeholder")}
            />
          </div>
          <button
            type="submit"
            class="btn btn-light mt-3"
            onClick={e => sendSignupForm(e)}
          >
            {t("signup")}
          </button>
        </form>
      </div>
    </div>
  );
}
