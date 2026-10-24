import { h } from "preact";
import { me as meService, router } from "/src/core";
import { Navbar } from "/src/navbar";
import { useStore } from "@nanostores/preact";
import { $me } from "/src/store/me.js";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "preact/hooks";
import { FaIcon } from "/src/misc";

export default function Invite() {

  const { t } = useTranslation();
  const me = useStore($me);
  const [loaded, setLoaded] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      meService.fetch().then(user => {
        setLoaded(true);

        if (!user || user?._networkError) {
          return;
        }

        const groupId = router.getParam("group");

        if (groupId && user.groups?.some(group => group.id === groupId)) {
          setSelectedGroups([groupId]);
        }
      });
    }, 100);
  }, []);

  if (!loaded) {
    return;
  }

  const groups = me?.groups || [];

  const toggleGroup = (groupId, checked) => {
    setSelectedGroups(previous =>
      checked
        ? previous.includes(groupId)
          ? previous
          : [...previous, groupId]
        : previous.filter(id => id !== groupId)
    );
  };

  const selectedGroupObjects = groups.filter(group =>
    selectedGroups.includes(group.id)
  );

  const onGenerate = () => {
    const inviteData = selectedGroupObjects.map(group => [
      group.name,
      group.id,
      group.inviteKey,
    ]);

    const bytes = new TextEncoder().encode(JSON.stringify(inviteData));

    const base64 = btoa(
      Array.from(bytes, byte => String.fromCharCode(byte)).join("")
    );

    const encoded = base64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const inviteUrl =
      `${window.location.origin}/invitation/${encoded}?e`;
    const inviteKeyBox = document.getElementById("inviteKeyBox");
    if (inviteKeyBox) {
      inviteKeyBox.value = inviteUrl;
    }
  };


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
                  {t("invite_someone")}
                </h1>
                <div class="group-header-members">
                  <span class="w-75">
                    {t("invite_create_page_explanation")}
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
                  {t("select_groups_to_invite")}
                </h2>

                <p>
                  {t(
                    "select_groups_explanation",
                    "Choose one or more groups to include in your invitation."
                  )}
                </p>

                {groups.length > 0 ? (
                  <div>
                    <div class="list-group invite-group-list">
                      {groups.map(group => (
                        <label
                          key={group.id}
                          class="list-group-item d-flex align-items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            class="form-check-input mt-0"
                            checked={selectedGroups.includes(group.id)}
                            onChange={event =>
                              toggleGroup(group.id, event.currentTarget.checked)
                            }
                          />

                          <span class="flex-grow-1 ps-2 pe-5">
                            {group.name}
                          </span>

                          <small class="text-muted">
                            {t("member_count", {
                              count: group.users?.length ?? 0,
                              defaultValue: `${group.users?.length ?? 0} members`
                            })}
                          </small>
                        </label>
                      ))}
                    </div>

                    <div class="mt-3 d-flex align-items-center flex-wrap gap-2">
                      <span>
                        {selectedGroups.length + " " + t("selected")}
                      </span>

                      <button
                        type="button"
                        class="btn btn-outline-secondary btn-sm"
                        onClick={() => setSelectedGroups(
                          selectedGroups.length === groups.length
                            ? []
                            : groups.map(group => group.id)
                        )}
                      >
                        {selectedGroups.length === groups.length
                          ? t("deselect_all")
                          : t("select_all")}
                      </button>
                    </div>

                    <div class="m-4">
                      <button
                        type="button"
                        class="btn btn-primary"
                        disabled={selectedGroupObjects.length === 0}
                        onClick={onGenerate}
                      >
                        {t("create_invitation_link")}
                      </button>
                    </div>

                    <form class="mb-1 border-bottom pb-1">
                      <div class="form-group">
                        <label for="inviteKey">
                          {t("invitation_link")}:{" "}
                        </label>
                        <input
                          type="text"
                          id="inviteKeyBox"
                          class="form-control font-size-80"
                          readonly="readonly"
                        />
                      </div>
                    </form>
                  </div>
                ) : (
                  <p class="text-muted">
                    {t("no_groups")}
                  </p>
                )}
              </section>
            </div>
          </section>
        </div>
        
      </div>
    </main>
  );
}
