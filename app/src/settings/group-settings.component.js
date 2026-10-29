import { h } from "preact";
import { alert, http, util, router, api } from "/src/core";
import { useEffect, useState } from "preact/hooks";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { leaveGroup} from "./group-helpers";
import { FaIcon } from "/src/misc";

export default function GroupSettings() {

  const params = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [group, setGroup] = useState({});
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    http.get(`/api/groups/${params.id}`).then(
      group => {
        if (!group) return;
        setGroup(group);
        Promise.all(group.users.map(u => http.get(`/api/users/${u.id}`).catch(() => null).then(u => u))).then(
          users => setUsers(users.filter(u => u != null))
        );
      }
    ).catch((e) => {
      if ([403, 404].includes(e?.status)) {
        // We don't have access to group: notify and go to default page
        alert.add(t("group_access_denied"), "alert-danger");
        navigate("/");
        return;
      }
    });
    setAlertMessage(t(router.getParam("alert")));
  }, []);
  
  const updateSettings = (event) => {
    event.preventDefault();
    const name = document.querySelector("#settings_form input[name='name']").value;
    if (name) {
      group.name = name;
    }
    setGroup(Object.assign({}, group));
    http.put(`/api/groups/${group.id}`, group).then(res => {
      if (!res) return;
      setGroup(res);
      setAlertMessage(t("group_updated"));
      navigate(`${location.pathname}?alert=group_updated`);
    }).catch(() => null);
  };

  return (
    <div>
      <div class="group-settings mb-3">
        <div class="card">
          <div class="card-body">
            <div class="container-fluid p-1">
              <div class="row">
                <div class="col-12 col-md-10">
                  <form id="settings_form" class="mb-1 border-bottom pb-1">
                    <div class="form-group">
                      <label for="name">{t("name")}: </label>
                      <input
                        type="text"
                        name="name"
                        minlength="1"
                        maxlength="128"
                        placeholder={t("name_input")}
                        value={group.name}
                        class="form-control"
                        required
                      />
                    </div>
                    <button
                      onClick={updateSettings}
                      class="btn btn-outline-secondary mt-2"
                    >
                      {t("save_changes")}
                    </button>
                  </form>

                  <form>
                    {api?.info?.show?.group_invitation_links && (
                      <button
                        type="button"
                        class="btn btn-outline-primary"
                        onClick={()=>navigate("/invite?group=" + params.id)}
                      >
                        <FaIcon family="solid" icon="users" />
                        <span class="ms-2">{t("invite_to_group")}</span>
                      </button>
                    )}
                    <button
                      onClick={e => leaveGroup(e, group, navigate, t)}
                      class="btn btn-outline-danger ms-2"
                    >
                      {t("quit_group")}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="user-list mb-3">
        <h3>{t("users")}</h3>
        {users.map(
          user =>
            user && (
              <div class="user-card" key={user.id}>
                <img
                  class="avatar material-shadow-with-hover"
                  style={util.backgroundHash(user.id)}
                  src={
                    user.avatar
                      ? util.crop(user.avatar["id"], 200, 200)
                      : util.defaultAvatar
                  }
                  onError={e => (e.currentTarget.src = util.defaultAvatar)}
                />
                <span>{user["name"]}</span>
              </div>
            )
        )}
      </div>
      {alertMessage && (
        <div class="global-alert alert alert-success">{alertMessage}</div>
      )}
    </div>
  );
}
