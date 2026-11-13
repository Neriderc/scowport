import React, { Fragment } from "react";

import { FaIcon } from "/src/misc";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "/src/core";

export default function GroupsDropdownNavbar(props) {
  const { t } = useTranslation();
  return (
    <Fragment>
      {props.groups && (
        <div
          id="groups-nav"
          className="nav-link dropdown groups unselectable"
          tabIndex="-1"
          onClick={e => e.currentTarget.classList.toggle("active")}
        >
          <div className="unselectable pr-1">
            {t("groups")} <FaIcon family={"solid"} icon={"caret-down"} />
          </div>
          <div id="nav-group-list" className="dropdown-menu dropdown-left">
            {props.groups.filter(e => !!e).map(e => (
              <Link
                key={e.id}
                to={`/groups/${e.id}`}
                className="nav-group-item d-block seamless-link unselectable"
              >
                {e.name}
              </Link>
            ))}
            {api?.info?.allow_create_group && (
              <Link
                to={"/create-group"}
                className="seamless-link unselectable"
              >
                {`+ ${t("create_a_group")}`}
              </Link>
            )}

            {api?.info?.show?.group_invitation_links && (
              <Link
                to={"/invite"}
                className="seamless-link unselectable d-inline-flex align-items-center gap-1"
              >
                <FaIcon family="solid" icon="users" fontSize="2rem" />
                {`${t("invite_someone")}`}
              </Link>
            )}
          </div>
        </div>
      )}
    </Fragment>
  );
}
