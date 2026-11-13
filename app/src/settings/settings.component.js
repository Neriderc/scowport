import React from "react";
import { useStore } from "@nanostores/react";
import UserSettings from "./user-settings.component.js";
import GroupSettings from "./group-settings.component.js";
import { Navbar } from "/src/navbar";
import { Link, useParams } from "react-router-dom";
import { $me } from "/src/store/me.js";
import { useTranslation } from "react-i18next";

export default function Settings() {

  const params = useParams();
  const { t } = useTranslation();
  const me = useStore($me);

  return (
    <main>
      <Navbar />
      <div className="content">
        <article className="mt-2 justify-content-center d-flex">
          <div className="container pb-3">
            <div className="settings">
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <Link
                    className={`nav-link${params.type == "users" ? " active" : ""}`}
                    to={`/users/${me.id}/settings`}
                  >
                    {t("account")}
                  </Link>
                </li>
                {me.groups?.length > 0 && (
                  <li
                    className="nav-item dropdown group-list"
                    tabIndex="-1"
                    onClick={e => e.currentTarget.classList.toggle("active")}
                  >
                    <div
                      className={`nav-link${params.type == "groups" ? " active" : ""}`}
                    >
                      {t("groups")}
                    </div>
                    <div className="dropdown-menu">
                      {me.groups?.map(e => (
                        <Link
                          key={`/groups/${e.id}/settings`}
                          className="seamless-link"
                          to={`/groups/${e.id}/settings`}
                        >
                          {e.name}
                        </Link>
                      ))}
                    </div>
                  </li>
                )}
              </ul>
              {params.type === "users" && (
                <UserSettings id={params.id} key={params.id} />
              )}
              {params.type === "groups" && (
                <GroupSettings id={params.id} key={params.id} />
              )}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
