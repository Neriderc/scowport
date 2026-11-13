import React, { useState } from "react";
import { useStore } from "@nanostores/react";
import { router, util } from "/src/core";
import { Search } from "/src/pages";
import { GroupsDropdownNavbar, NotificationsDropdownNavbar, HelpTutorial } from "/src/navbar";
import { Link } from "react-router-dom";
import { $me } from "/src/store/me.js";
import { useTranslation } from "react-i18next";
import { FaIcon } from "/src/misc";
const TOUR_KEY = "app-tour-step";

export default function Navbar() {

  const { t } = useTranslation();
  const me = useStore($me);
  const [tutorialActive, setTutorialActive] = useState(!!localStorage.getItem(TOUR_KEY));
  return (
    <div className="main-nav nav align-items-center z-index-100">
      <div className="navbar-block">
        <div
          id="profile-menu"
          className="menu dropdown cursor-pointer"
          tabIndex="-1"
          onClick={e => e.currentTarget.classList.toggle("active")}
        >
          <div className="rounded-circle avatar unselectable">
            <img
              className="rounded-circle"
              style={util.backgroundHash(me.id)}
              src={
                me.avatar
                  ? util.crop(me.avatar["id"], 80, 80)
                  : util.defaultAvatar
              }
              onError={e => (e.currentTarget.src = util.defaultAvatar)}
            />
          </div>
          <div className="dropdown-menu dropdown-right">
            <Link
              className="d-block seamless-link capitalize"
              to={"/bookmarks"}
            >
              {t("bookmarks")}
            </Link>
            <Link
              className="d-block seamless-link capitalize"
              to={`/users/${me.id}/settings`}
            >
              {t("settings")}
            </Link>
            <Link
              className="d-block seamless-link capitalize"
              to={"/logout"}
            >
              {t("logout")}
            </Link>
          </div>
        </div>
        <NotificationsDropdownNavbar />

        <Link
          to={"/feed"}
          id="feed"
          className={`seamless-link nav-link nav-button unselectable ${router.route === "feed" ? "nav-active" : ""}`}
          title={t("feed_group")}
          aria-label={t("feed_group")}
        >
          <FaIcon
            family={"regular"}
            icon={"house"}
          />
        </Link>
        <button
          id="help"
          className={`seamless-link nav-link nav-button unselectable ${router.route === "help" ? "nav-active" : ""}`}
          title={t("help")}
          aria-label={t("help")}
          onClick={() => { setTutorialActive(true); localStorage.removeItem(TOUR_KEY); }}
        >
          <FaIcon
            family={"solid"}
            icon={"question"}
          />
        </button>
      </div>
      {
        ["messages", "groups"].includes(router.route) && (
          <Search/>
        )}
      <div className="navbar-block">
        <GroupsDropdownNavbar groups={me.groups} />
      </div>
      {tutorialActive && (
        <HelpTutorial
          onDone={() => setTutorialActive(false)}
          TOUR_KEY={TOUR_KEY}
        />
      )}
    </div>
  );
}
