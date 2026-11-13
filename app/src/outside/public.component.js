import React from "react";
import { Message } from "/src/message";
import { useParams } from "react-router-dom";

export default function Public() {
  let params = useParams();

  return (
    <article className="justify-content-center d-flex mt-2">
      <div className="container">
        <main>
          <div className="content">
            <article className="mb-3 justify-content-center d-flex">
              <div className="container pb-3">
                <Message
                  focus={false}
                  isPublic={true}
                  isChild={false}
                  token={params.token}
                />
              </div>
            </article>
          </div>
        </main>
      </div>
    </article>
  );
}
