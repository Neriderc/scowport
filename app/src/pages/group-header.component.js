
import { h, Fragment } from "preact";
import { http } from "/src/core";
import { FaIcon } from "/src/misc";
import { useEffect, useState } from "preact/hooks";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { leaveGroup} from "../settings/group-helpers";


export default function GroupHeader(props) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    http
      .get(`/api/groups/${props.id}`)
      .then(res => {
        if (!cancelled) {
          setGroup(res);
        }
        if (location.pathname.match(/^\/invitation/)) {
          navigate("/groups/" + props.id);
        }
      })
      .catch(e => {
        if ([403, 404].includes(e?.status) && !location.pathname.match(/^\/invitation/)) {
          navigate("/");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [props.id]);

  return (
    <div class="header-container container-fluid">
      <section
        class="header-section"
        aria-label={group?.name || t("group")}
      >
        <div class="group-header-main">
          <div class="group-header-avatar">
            <span class="group-header-avatar-placeholder">
              <FaIcon family="solid" icon="users" />
            </span>
          </div>

          <div class="group-header-info">
            <h1 class="group-header-name">
              {props.invite ? t("invite_noname") :
                loading ? "…" : group?.name}
            </h1>

            {group?.users?.length != null && (
              <div class="group-header-members">
                <FaIcon family="solid" icon="users" />
                <span>
                  {group.users.length} {t("members")}
                </span>
              </div>
            )}
          </div>

          <div class="group-header-actions">
            {props.isMember ? (
              <>
                <button
                  type="button"
                  class="btn btn-outline-primary"
                  onClick={()=>navigate("/invite?group=" + props.id)}
                >
                  <FaIcon family="solid" icon="users" />
                  <span class="d-none d-md-inline">{t("invite_to_group")}</span>
                  <span class="d-inline d-md-none">{t("invite")}</span>
                </button>
                <button
                  type="button"
                  class="btn btn-outline-danger"
                  onClick={e => leaveGroup(e, group, navigate, t)}
                >
                  <FaIcon family="regular" icon="right-from-bracket" />
                  <span class="d-none d-md-inline">{t("quit_group")}</span>
                  <span class="d-inline d-md-none">{t("leave")}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                class="btn btn-primary group-join-button"
                onClick={() => props.onJoin()}
              >
                <FaIcon family="solid" icon="plus" />
                <span>{t("join_group")}</span>
              </button>
            )}
            {props.isMember && (
              <button
                type="button"
                class="btn btn-outline-secondary cog"
                onClick={() => props.onSettings?.(group)}
              >
                <FaIcon family="solid" icon="cog" fontSize="2rem" />
              </button>
            )}
          </div>
        </div>

        <nav class="group-header-divider">

        </nav>
      </section>
    </div>
  );
}
