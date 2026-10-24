import { h } from "preact";
import { FaIcon } from "/src/misc";
import { Navbar } from "/src/navbar";
import { MessageList } from "/src/message";
import { Link, useParams, useNavigate } from "react-router-dom";
import { GroupHeader } from "/src/pages";

export default function GroupBoard() {
  const navigate = useNavigate();
  let params = useParams();

  return (
    <main>
      <Navbar />
      <GroupHeader
        isFeed={false}
        id={params.id}
        isMember={true}
        invite={false}
        onSettings={() => navigate(`/groups/${params.id}/settings`)}
      />
      <div class="content">
        <div>
          <div>
            <article id="group" class="justify-content-center d-flex">
              <div class="message-container container-fluid d-flex justify-content-center flex-wrap">
                <MessageList key={params.id} id={params.id} />
              </div>
            </article>
          </div>
          <Link
            class="write-button material-shadow seamless-link"
            to={`/groups/${params.id}/write`}
          >
            <FaIcon family={"solid"} icon={"pencil-alt"} />
          </Link>
        </div>
      </div>
    </main>
  );
}
