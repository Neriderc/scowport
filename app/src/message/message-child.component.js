import React from "react";
import Message from "./message.component.js";

export default function MessageChild(props) {
  return (
    <Message
      id={props.id}
      isChild={true}
      depth={props?.depth + 1}
      replyToParent={props.replyToParent}
    />
  );
}
