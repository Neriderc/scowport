import React from "react";
import { Navbar, GroupSearch } from "/src/navbar";
import { useParams } from "react-router-dom";

export default function GroupSearchWrapper() {
  let params = useParams();
  return (
    <main>
      <Navbar />
      <div className="content">
        <article className="mb-3">
          <div className="container pb-3">
            <GroupSearch key={params.id} id={params.id} />
          </div>
        </article>
      </div>
    </main>
  );
}
