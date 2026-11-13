import React, { Fragment } from "react";
import { useStore } from "@nanostores/react";
import { util, me, notifications, alert, api } from "/src/core";
import { Link } from "react-router-dom";
import { FaIcon } from "/src/misc";
import { useTranslation } from "react-i18next";
import { HumanTime } from "/src/pages";
import { $bookmarks, addBookmark, removeBookmark } from "/src/store/bookmarks.js";
import MessageReactions from "./message-reactions.component";

export default function MessageFooter(props) {

  const { t } = useTranslation();
  const bookmarks = useStore($bookmarks);
  const isPinned = props?.message?.sortOrder !== undefined;

  return (
    <div className="message-footer">
      <div className="infos">
        {props.message && !props.isPublic && api?.info?.allow_message_reactions && (
          <Fragment>
            <MessageReactions messageId={props.message.id} />
            <div className="dot">&bull;</div>
          </Fragment>
        )}
        {!props?.isPublic && props?.author && props?.author?.id === me.id && (
          <Fragment>
            <a
              className="action seamless-link font-size-90 capitalize d-none d-sm-block"
              onClick={e => props.editMessage(e)}
            >
              {t("edit")}
            </a>
            <div className="dot d-none d-sm-block">&bull;</div>
          </Fragment>
        )}
        {!props?.isPublic && props?.isChild && props?.message && (
          <Fragment>
            <Link
              className="action seamless-link font-size-90 capitalize"
              to={
                `/messages/${props?.message.id}${props?.message?.children.length ? "" : "?focus=reply"}`
              }
              onClick={e => props.replyToMessage(e, props?.message?.children.length)}
            >
              {props?.message?.children.length ? (
                props.message.children.some(e => notifications.isNew(e.id)) ? (
                  <b>
                    {t("replies", {
                      count: props.message.children.length
                    })}
                  </b>
                ) : (
                  t("replies", {
                    count: props.message.children.length
                  })
                )
              ) : (
                t("reply")
              )}
            </Link>
            <div className="dot">&bull;</div>
          </Fragment>
        )}
        <div
          className="date font-size-90"
          title={util.humanFullDate(props?.message.createdAt)}
        >
          <HumanTime timestamp={props?.message.createdAt} />
        </div>
        <Fragment>
          <div className="dot">&bull;</div>
          <div className="font-size-90">
            {
              props?.author && props?.author?.name ? props.author.name : "--"
            }
          </div>
        </Fragment>
      </div>
      <div>
        {!props?.isPublic && (
          <div
            className="options dropdown"
            onClick={e =>
              e?.target?.closest(".dropdown")?.classList.toggle("active")
            }
          >
            <div className="none-if-follows-empty">
              <FaIcon family="solid" icon="ellipsis-h" />
            </div>
            <div className="dropdown-menu dropdown-options">
              {props?.author && props?.author?.id === me.id && (
                <a
                  className="seamless-link capitalize"
                  onClick={e => props.deleteMessage(e)}
                >
                  {t("delete")}
                </a>
              )}
              {api?.info?.allow_public_links && (
                <a
                  className="seamless-link capitalize"
                  onClick={e => props.openPublicLink(e)}
                >
                  {t("public_link")}
                </a>
              )}
              {me.groups?.length > 1 && (
                <a
                  className="seamless-link capitalize"
                  onClick={e => props.shareMessage(e)}
                >
                  {t("share_message")}
                </a>
              )}
              {!props?.message?.isInFront &&
                  props?.author &&
                  props?.author.id == me.id && (
                <a
                  className="seamless-link capitalize"
                  onClick={e => props.publishInGroup(e)}
                >
                  {t("publish_in_group")}
                </a>
              )}
              {props?.message?.isInFront && (
                <a
                  className="seamless-link capitalize"
                  onClick={e => isPinned ? props.unpinInGroup(e) : props.pinInGroup(e)}
                >
                  {isPinned ? t("unpin_in_group") : t("pin_in_group")}
                </a>
              )}
              {!bookmarks.some(b => b.message.id === props?.message.id) && (
                <a
                  className="seamless-link capitalize"
                  onClick={() => {
                    alert.add(t("bookmark_added"));
                    addBookmark(props.message.id);
                  }}
                >
                  {t("add_bookmark")}
                </a>
              )}
              {bookmarks.some(b => b.message.id === props?.message.id) && (
                <a
                  className="seamless-link capitalize"
                  onClick={() => {
                    alert.add(t("bookmark_removed"));
                    removeBookmark(bookmarks.find(b => b.message.id === props.message.id));
                  }}
                >
                  {t("remove_bookmark")}
                </a>
              )}
              {props?.author?.id == me.id && (
                <a
                  className="seamless-link capitalize"
                  onClick={e => props.editMessage(e)}
                >
                  {t("edit")}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
