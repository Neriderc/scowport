import React from "react";
import { router } from "/src/core";
import Message from "./message.component.js";
import { Navbar } from "/src/navbar";
import { useParams } from "react-router-dom";

export default function MessageParent(props) {
  let params = useParams();
  return (
    <main>
      <Navbar />
      <div className="content">
        <article className="mb-3 justify-content-center d-flex">
          <div className="container pb-3">
            <Message
              focus={!!router.getParam("focus", router.search)}
              isPublic={false}
              isChild={false}
              message={props?.message}
              id={params.id}
              key={params.id}
              depth={0}
            />
          </div>
        </article>
      </div>
    </main>
  );
}
