import React from "react";
import { useStore } from "@nanostores/react";
import { MessagePreview } from "/src/message";
import { Navbar } from "/src/navbar";
import { useTranslation } from "react-i18next";
import { $bookmarks } from "/src/store/bookmarks.js";

export default function BookmarkBoard() {

  const { t } = useTranslation();
  const bookmarks = useStore($bookmarks);
  if (bookmarks.length === 0) {
    return (
      <main>
        <Navbar />
        <div className="content">
          <article id="group" className="justify-content-center d-flex">
            <div className="message-container container-fluid d-flex justify-content-center flex-wrap">
              {t("you_have_no_bookmarks")}
            </div>
          </article>
        </div>
      </main>
    );
  }

  if (!Array.isArray(bookmarks) || bookmarks.length < 1) {
    return;
  }

  return (
    <main>
      <Navbar />
      <div className="content">
        <article id="group" className="justify-content-center d-flex">
          <div className="message-container container-fluid d-flex justify-content-center flex-wrap">
            {bookmarks.map((b, i) => {
              return (
                <MessagePreview
                  tabIndex={i + 1}
                  key={b.message.id}
                  id={b.message.id}
                />
              );
            })}
          </div>
        </article>
      </div>
    </main>
  );
}
