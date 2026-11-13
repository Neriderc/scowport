import React from "react";
import { FaIcon } from "/src/misc";
import { Navbar } from "/src/navbar";
import { MessageList } from "/src/message";
import { Link } from "react-router-dom";

export default function FeedBoard() {
  return (
    <main>
      <Navbar />
      <div className="content">
        <div>
          <div>
            <article id="group" className="justify-content-center d-flex">
              <div className="message-container container-fluid d-flex justify-content-center flex-wrap">
                <MessageList key="feed" isFeed={true} />
              </div>
            </article>
          </div>
          <Link
            className="write-button material-shadow seamless-link"
            to={"/share"}
          >
            <FaIcon family={"solid"} icon={"pencil-alt"} />
          </Link>
        </div>
      </div>
    </main>
  );
}
