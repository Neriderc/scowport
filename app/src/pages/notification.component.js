import React, { Fragment, useEffect, useState } from "react";
import { http, util, notifications } from "/src/core";
import { useTranslation } from "react-i18next";
import { FaIcon } from "/src/misc";
import { useNavigate } from "react-router-dom";

export default function Notification(props) {

  const { t } = useTranslation();
  const [target, setTarget] = useState(null);
  const [action, setAction] = useState(null);
  const [title, setTitle] = useState(null);
  const [author, setAuthor] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  
  const getMiniature = (notification) => {
    let imgSrc = util.defaultAvatar;
    if (
      notification?.miniature
      && notification.type != "global_notification"
    ) {
      imgSrc = util.crop(notification?.miniature?.id, 80, 80);
    }
    return (
      <img
        style={util.backgroundHash(notification?.fromUser?.id)}
        src={imgSrc}
        onError={e => setMiniatureOnError(e)}
      />
    );
  };

  const setMiniatureOnError = (event) => {
    event.currentTarget.src = util.defaultAvatar;
  };

  const getAction = (notification) => {
    switch (notification?.type) {
    case "new_message":
      return t("has_posted_in");
    case "new_comment":
      return t("has_commented_on");
    case "user_joined_group":
      return t("has_joined");
    case "user_left_group":
      return t("has_left");
    case "group_name_change":
      return t("changed_group_name");
    default:
      return "";
    }
  };

  const getObject = (notification) => {
    switch (notification?.type) {
    case "new_message":
      return (
        <Fragment>
          <strong>
            {notification?.fromGroup.name}
          </strong>
          {title && (
            <Fragment>
              <br />
              <small><em>{util.limitStrSize(title, 50)}</em></small>
            </Fragment>
          )}
        </Fragment>
      );
    case "new_comment":
      return (
        <span>
          {`${t("the_message_from")} `}
          <strong>{notification?.parentAuthorName}</strong>
          {title && (
            <Fragment>
              <br />
              <small><em>{util.limitStrSize(title, 50)}</em></small>
            </Fragment>
          )}
        </span>
      );
    case "user_joined_group":
    case "user_left_group":
      return (
        <strong>
          {notification?.fromGroup.name}
        </strong>
      );
    case "group_name_change":
      return (
        <span>
          <strong>{notification.data["previousGroupName"]}</strong>
          {` ${t("to")} `}
          <strong>{notification.data["newGroupName"]}</strong>
        </span>
      );
    case "global_notification":
      return notification.data["text"];
    default:
      return "";
    }
  };

  const getTarget = (notification, message_id) => {
    switch (notification?.type) {
    case "user_joined_group":
    case "user_left_group":
    case "group_name_change":
      return `/groups/${notification.fromGroup.id}`;
    case "new_message":
      return `/messages/${notification.target}`;
    case "new_comment":
      return (
        `/messages/${message_id}/${notification.target}`
      );
    case "global_notification":
      return notification.target;
    default:
      return "";
    }
  };

  useEffect(() => {
    http.get(`/api/notifications/${props.id}`, false, 100).then(n => {
      if (n) {
        setTarget(getTarget(n, n?.fromMessage?.id));
        setAction(getAction(n));
        setTitle(n.title);
        if (n?.fromUser?.id) {
          http.get(`/api/users/${n.fromUser.id}`).then(u => {
            if (u) setAuthor(u);
          }).catch(() => null);
        }
        setNotification(n);
      }
    }).catch(() => null);
  }, []);

  if (!notification) {
    return null;
  }
  return (
    <div
      className={`notification seamless-link unselectable ${!notification.read ? "unread" : ""}`}
      title={title}
      onClick={() => navigate(target)}
      role="link"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter") navigate(target);
      }}
    >
      <div className="miniature unselectable">
        {getMiniature(notification)}
      </div>

      <div className="infos">
        <div className="description">
          {notification.type != "global_notification" && (
            <Fragment>
              <strong>{author?.name || "--"}</strong>
              <span>{` ${action} `}</span>
            </Fragment>
          )}
          {getObject(notification)}
        </div>

        <div className="date">
          {util.humanTime(notification.createdAt)}
        </div>
      </div>

      <div
        className="options dropdown"
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
          e.currentTarget.classList.toggle("active");
        }}
      >
        <div className="none-if-follows-empty">
          <FaIcon family="solid" icon="ellipsis-h" />
        </div>

        <div className="dropdown-menu dropdown-options">
          <button
            type="button"
            className="seamless-link capitalize"
            onClick={e => {
              e.stopPropagation();
              notifications.removeMatchingNotifications(notification.id);
            }}
          >
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
