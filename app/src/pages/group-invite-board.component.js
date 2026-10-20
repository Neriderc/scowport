import { h } from "preact";
import { FaIcon } from "/src/misc";
import { Navbar } from "/src/navbar";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { GroupHeader } from "/src/pages";
import { http } from "/src/core";

export default function GroupInviteBoard() {
  const navigate = useNavigate();
  const params = useParams();

  const onJoin = () => {
    http.post(`/api/groups/invitation/${params.id}`, {}).catch(() => null).then(res => {
      if (res) {
        navigate(res.group ? "/groups/" + res.group : "/");
      }
    });
  };
  
  return (
    <main>
      <Navbar />
      <GroupHeader
        isFeed={false}
        id={params.id}
        isMember={false}
        invite={true}
        onSettings={() => navigate(`/groups/${params.id}/settings`)}
        onJoin={onJoin}
      />
    </main>
  );
}
