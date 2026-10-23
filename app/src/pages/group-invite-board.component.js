import { h } from "preact";
import { FaIcon } from "/src/misc";
import { Navbar } from "/src/navbar";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { http, me as meService } from "/src/core";
import { $me } from "/src/store/me.js";
import { useStore } from "@nanostores/preact";
import { useTranslation } from "react-i18next";
import { leaveGroup} from "../settings/group-helpers";
import { useEffect } from "preact/hooks";

export default function GroupInviteBoard() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const me = useStore($me);
  const { t } = useTranslation();

  const decode = encoded => {
    const base64 = encoded
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = base64.padEnd(
      base64.length + (4 - base64.length % 4) % 4,
      "="
    );

    const bytes = Uint8Array.from(
      atob(padded),
      char => char.charCodeAt(0)
    );

    return JSON.parse(new TextDecoder().decode(bytes));
  };

  const isEncodedInvite = searchParams.has("e");

  let inviteGroups = [];
  let invalidInvite = false;

  if (isEncodedInvite && params.id) {
    try {
      const decoded = decode(params.id);
      if (!Array.isArray(decoded)) {
        throw new Error("Expected an array of groups");
      }
      
      inviteGroups = decoded
        .filter(group => Array.isArray(group) && group.length >= 3)
        .map(([name, groupId, inviteKey]) => ({
          name,
          groupId,
          inviteKey
        }));

      if (inviteGroups.length === 0) {
        invalidInvite = true;
      }
    } catch (error) {
      invalidInvite = true;
    }
  } else {
    // Old style invite, go straight to the group.
    http.post(
      `/api/groups/invitation/${params.id}`,
      {}
    ).then((res) => {
      navigate("/groups/" + res.group);
    });
  }

  const isMember = groupId =>
    (me?.groups || []).some(
      group => String(group.id) === String(groupId)
    );
  const onGroupClick = async (e, group) => {
    if (isMember(group.groupId)) {
      const groupObj = me?.groups.find(meGroup => meGroup.id === group.groupId);
      leaveGroup(e, groupObj, null, t);
      return;
    }

    try {
      const res = await http.post(
        `/api/groups/invitation/${group.inviteKey}`,
        {}
      );

      if (res) {
        await meService.update();
      }
    } catch (error) {
      console.error("Failed to join group:", error);
    }
  };

  const onContinue = () => {
    if (inviteGroups.length > 1) {
      navigate("/feed");
    } else {
      navigate(`/groups/${inviteGroups[0].groupId}`);
    }
  };

  useEffect(() => {
    meService.fetch().then(user => {
      if (!user) {
        let path;
        if (isEncodedInvite) {
          path = `/signup?inviteKey=${inviteGroups[0].inviteKey}&encodedInvite=${params.id}`;
        } else {
          path = `/signup?inviteKey=${inviteGroups[0].inviteKey}`;
        }
        navigate(path);
      }
    });
  }, []);
  return (
    <main>
      <Navbar />

      <div class="content">
        <div class="header-container container-fluid">
          <section
            class="header-section"
            aria-label={t("invite_someone")}
          >
            <div class="group-header-main">
              <div class="group-header-avatar">
                <span class="group-header-avatar-placeholder">
                  <FaIcon family="solid" icon="users" />
                </span>
              </div>

              <div class="group-header-info">
                <h1 class="group-header-name">
                  {t("invite_noname")}
                </h1>

                <div class="group-header-members">
                  <span class="w-75">
                    {t("invite_join_page_explanation")}
                  </span>
                </div>
              </div>
            </div>

            <div class="container-fluid">
              <section
                class="invite-groups mt-3"
                aria-labelledby="invite-groups-heading"
              >
                <h2 id="invite-groups-heading">
                  {t("invited_groups")}
                </h2>

                <p>
                  {t("invited_groups_explanation")}
                </p>

                {!invalidInvite && inviteGroups.length > 3 ? (
                  <div class="list-group invite-group-list mb-3">
                    {inviteGroups.map(group => {
                      const joined = isMember(group.groupId);
                      return (
                        <div
                          key={group.groupId}
                          class="list-group-item d-flex align-items-center gap-3"
                        >
                          <span class="flex-grow-1">
                            {group.name}
                          </span>

                          <button
                            type="button"
                            class={`btn ${
                              joined
                                ? "btn-outline-success"
                                : "btn-primary"
                            }`}
                            onClick={(e) => onGroupClick(e,group)}
                          >
                            {joined
                              ? t("joined", "Joined")
                              : t("join_group", "Join group")}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p class="text-muted">
                    {t("invalid_token_error")}
                  </p>
                )}
                <div class="m-4">
                  <button
                    type="button"
                    class="btn btn-primary"
                    onClick={onContinue}
                  >
                    {t("continue")}
                  </button>
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}