import React from "react";
import { Writer } from "/src/writer";
import { Navbar } from "/src/navbar";
import { useParams } from "react-router-dom";

export default function GroupWriter() {
  let params = useParams();

  return (
    <main>
      <Navbar />
      <div className="content">
        <article className="mb-3">
          <div className="container pb-3">
            <Writer focus={true} group={params.id} />
          </div>
        </article>
      </div>
    </main>
  );
}
