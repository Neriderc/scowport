import React from "react";
import { util } from "/src/core";

export default function MessageHead(props) {
  return (
    <div className="message-head d-flex">
      {!props.isPublic && (
        <div>
          <img
            className={
              `rounded-circle material-shadow avatar${ 
                props.author && props.author.name ? "" : " removed-user"}`
            }
            style={util.backgroundHash(
              props.author && props.author.name ? props.author && props.author.id : ""
            )}
            src={
              props.author && props.author.avatar
                ? util.crop(props.author.avatar.id, 100, 100)
                : util.defaultAvatar
            }
            title={props.author && props.author.name ? props.author.name : ""}
          />
        </div>
      )}
      {!props.isChild && !props.isPublic && (
        <div className="infos">
          <span className="capitalize author">
            {props.author && props.author.name ? props.author.name : ""}
          </span>
        </div>
      )}
    </div>
  );
}
