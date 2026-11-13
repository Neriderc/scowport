import React, { Fragment, useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { FaIcon } from "/src/misc";
import { Navbar } from "/src/navbar";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { http, me as meService } from "/src/core";
import { $me } from "/src/store/me.js";
import { useTranslation } from "react-i18next";
import { leaveGroup } from "../settings/group-helpers";
import { showConfirm } from "/src/store/confirm-modal.js";

export default function GroupInviteBoard() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const me = useStore($me);
  const { t } = useTranslation();

  const [joiningAll, setJoiningAll] = useState(false);

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
    http.post(`/api/groups/invitation/${params.id}`, {}).catch(() => null).then(res => {
      if (res) navigate(res.group ? "/groups/" + res.group : "/");
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

  const onJoinAll = async () => {
    const groupsToJoin = inviteGroups.filter(
      group => !isMember(group.groupId)
    );

    if (groupsToJoin.length === 0 || joiningAll) {
      return;
    }

    setJoiningAll(true);

    try {
      const results = await Promise.allSettled(
        groupsToJoin.map(group =>
          http.post(`/api/groups/invitation/${group.inviteKey}`, {})
        )
      );

      await meService.update();

      const failed = results.filter(
        result =>
          result.status === "rejected" ||
          !result.value ||
          result.value.error
      ).length;

      if (failed > 0) {
        console.error(`${failed} group invitation(s) failed`);
      }
    } catch (error) {
      console.error("Failed to join groups:", error);
    } finally {
      setJoiningAll(false);
    }
  };

  const onSingleGroupClick = () => {
    http.post(
      `/api/groups/invitation/${inviteGroups[0].inviteKey}`,
      {}
    ).then((res) => {
      navigate("/groups/" + res.group);
    });
  };

  const onContinue = async () => {
    if (!inviteGroups.some(group => !isMember(group.groupId)) || await showConfirm({
      title: t("are_you_sure"),
      message: t("continue_not_all_groups"),
      confirmText: t("continue"),
      cancelText: t("cancel"),
      variant: "success"
    })) {
      if (inviteGroups.length > 1) {
        navigate("/feed");
      } else {
        navigate(`/groups/${inviteGroups[0].groupId}`);
      }
    }
  };

  useEffect(() => {
    meService.fetch().then(user => {
      if (user) { 
        if (!isEncodedInvite && params.id) {
          http.post(
            `/api/groups/invitation/${params.id}`,
            {}
          ).then(res => {
            if (res?.group) {
              navigate("/groups/" + res.group);
            }
          }).catch(error => {
            console.error("Failed to process invitation:", error);
          });
        }
      }  else {
        let path;
        if (isEncodedInvite) {
          path = `/signup?inviteKey=${inviteGroups[0].inviteKey}&encodedInvite=${params.id}`;
        } else {
          path = `/signup?inviteKey=${params.id}`;
        }
        navigate(path);
      }
    });
  }, []);
  return (
    <main>
      <Navbar />

      <div className="content">
        <div className="header-container container-fluid">
          <section
            className="header-section"
            aria-label={t("invite_someone")}
          >
            <div className="group-header-main">
              <div className="group-header-avatar">
                <span className="group-header-avatar-placeholder">
                  <FaIcon family="solid" icon="users" />
                </span>
              </div>

              <div className="group-header-info">
                {inviteGroups.length === 1 ? (
                  <>
                    <h1 className="group-header-name">
                      {t("invite_name")} <strong className="text-primary">{inviteGroups[0].name}</strong>
                    </h1>
                  </>) : (
                  <>
                    <h1 className="group-header-name">
                      {t("invite_noname")}
                    </h1>
                
                    <div className="group-header-members">
                      <span className="w-75">
                        {t("invite_join_page_explanation")}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="container-fluid">
              <section
                className="invite-groups"
                aria-labelledby="invite-groups-heading"
              >
                {inviteGroups.length === 1 ? "" : (
                  <p>
                    {t("invited_groups_explanation")}
                  </p>
                )}
                
                {!invalidInvite ? (
                  inviteGroups.length === 1 ? (
                    <div className="mb-3 text-end">
                      <button
                        type="button"
                        className="btn btn-primary p-3 fs-4"
                        onClick={onSingleGroupClick}
                      >
                        {t("join_group")}
                      </button>
                    </div>
                  ) : (
                    <>


                      <div className="list-group invite-group-list mb-3">
                        {inviteGroups.some(group => !isMember(group.groupId)) && (
                          <div className="d-flex justify-content-end mb-3">
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={onJoinAll}
                              disabled={joiningAll}
                            >
                              {joiningAll ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    aria-hidden="true"
                                  />
                                  {t("joining_groups")}
                                </>
                              ) : (
                                <>
                                  <FaIcon
                                    family="solid"
                                    icon="users"
                                  />
                                  {" "}
                                  {t("join_all_groups")}
                                </>
                              )}
                            </button>
                          </div>
                        )}
                        {inviteGroups.map(group => {
                          const joined = isMember(group.groupId);
                          return (
                            <div
                              key={group.groupId}
                              className="list-group-item d-flex align-items-center gap-3"
                            >
                              <span className="flex-grow-1 fs-5">
                                {group.name}
                              </span>

                              <button
                                type="button"
                                className={`btn ${
                                  joined
                                    ? "btn-outline-success"
                                    : "btn-primary"
                                } fs-6`}
                                onClick={(e) => onGroupClick(e,group)}
                              >
                                {joined ?
                                  <>
                                    <FaIcon family="solid" icon="check-circle" />
                                    {" "}{t("joined")}
                                  </>
                                  : t("join_group")}
                              </button>
                            </div>
                          );
                        })}

                      </div>
                      <div className="mt-3 mb-3">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={onContinue}
                        >
                          {t("continue")}
                        </button>
                      </div>
                    </>
                  )) : (
                  <>
                    <p className="text-muted">
                      {t("invalid_token_error")}
                    </p>
                    <div className="m-4">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onContinue}
                      >
                        {t("continue")}
                      </button>
                    </div>
                  </>
                )}
              </section>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}