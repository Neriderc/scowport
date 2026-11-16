import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { lang, router, alert, http, util, storage, me as meCore } from "/src/core";
import { $me, updateMe } from "/src/store/me.js";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { showConfirm } from "/src/store/confirm-modal.js";

export default function UserSettings() {

  const { t, i18n } = useTranslation();
  const me = useStore($me);
  const navigate = useNavigate();
  const location = useLocation();
  const [apiKey, setApiKey] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    storage.get("apiKey").then(apiKey => setApiKey(apiKey ?? ""));
    setAlertMessage(t(router.getParam("alert")));
  }, []);

  const resetApiKey = async (event) => {
    console.log(i18n.language);
    console.log(i18n.getResourceBundle(i18n.language, "translation"));
    console.log("Language:", i18n.language);
  console.log("Resolved language:", i18n.resolvedLanguage);
  console.log("Namespaces:", i18n.options.ns);
  console.log("Default namespace:", i18n.options.defaultNS);
  console.log("Resource store:", i18n.store.data);
    event.preventDefault();
    if (await showConfirm({
      title: t("are_you_sure"),
      message: t("you_will_be_logged_out"),
      confirmText: t("reset"),
      cancelText: t("cancel"),
      variant: "primary"
    })) {
      http.post(`/api/users/${me.id}/reset-api-key`, {}).then(() => navigate("/logout")).catch(err => console.warn(err));
    }
  };

  const inputAvatar = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", event => {
      const formData = new FormData();
      formData.append("file", event.target.files[0]);
      http.sendFile(
        formData,
        file => {
          http.put(`/api/users/${me.id}`, { avatar: file["id"] }).then(() => {
            setAlertMessage(t("settings_updated"));
            navigate(`${location.pathname}?alert=settings_updated`);
          }).catch(err => console.warn(err));
        }
      );
    });
    input.click();
  };

  const destroyAccount = async (event) => {
    event.preventDefault();
    if (await showConfirm({
      title: t("are_you_sure"),
      message: t("destroy_account_explain"),
      confirmText: t("delete"),
      cancelText: t("cancel"),
      variant: "danger"
    })) {
      http.delete(`/api/users/${me.id}`).then(() => {
        navigate("/logout");
      }).catch(err => console.warn(err));
    }
  };

  const updateSettings = (event) => {
    event.preventDefault();
    const name = document.querySelector("#settings_form input[name='name']")
      .value;
    const login = document.querySelector("#settings_form input[name='email']")
      .value;
    const password = document.querySelector(
      "#settings_form input[name='password']"
    ).value;
    const notification_emails = document.querySelector(
      "#settings_form select[name='notification_emails']"
    ).value;
    const default_group = document.querySelector(
      "#settings_form select[name='default_group']"
    ).value;
    const default_page = document.querySelector(
      "#settings_form select[name='default_page']"
    ).value;
    const lang = document.querySelector("#settings_form select[name='lang']")
      .value;
    let user = {};
    if (name) {
      user.name = name;
    }
    if (login) {
      user.login = login;
    }
    if (password) {
      user.password = password;
    }
    user["data"] = {
      notification_emails,
      default_group,
      default_page,
      lang
    };
    http.put(`/api/users/${me.id}`, user).then(res => {
      if (!res) return;
      if (res["error"]) {
        alert.add(res["error"], "alert-danger");
      } else {
        meCore.update();
        setAlertMessage(t("settings_updated"));
        navigate(`${location.pathname}?alert=settings_updated`);
      }
    }).catch(() => null);
  };

  if (me && me?.data) {
    return (
      <div className="user-settings">
        <div className="card">
          <div className="identite card-body">
            <div className="container-fluid p-1">
              <div className="row">
                <div className="col-12 col-md-2 text-center">
                  <img
                    className="img-fluid rounded-circle material-shadow avatar"
                    src={
                      me.avatar
                        ? util.crop(me.avatar["id"], 100, 100)
                        : util.defaultAvatar
                    }
                    style={util.backgroundHash(me.id || "")}
                    onError={e => (e.currentTarget.src = util.defaultAvatar)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm mt-2"
                    onClick={inputAvatar}
                  >
                    <span aria-hidden="true">📷</span>{" "}
                    {t("update_photo")}
                  </button>
                </div>
                <div className="col-12 col-md-10">
                  <form id="settings_form" className="mb-3">
                    <div className="form-group">
                      <label htmlFor="name">{t("name")}: </label>
                      <input
                        type="text"
                        name="name"
                        minLength="1"
                        maxLength="128"
                        placeholder={t("name_input")}
                        defaultValue={me.name}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">{t("email")}: </label>
                      <input
                        type="email"
                        name="email"
                        placeholder={t("email_input")}
                        defaultValue={me.login}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="password">{t("password")}: </label>
                      <input
                        type="password"
                        name="password"
                        autoComplete="off"
                        minLength="8"
                        maxLength="128"
                        placeholder={t("password_input")}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="notification_emails">
                        {t("notification_emails")}:
                      </label>
                      <select
                        name="notification_emails"
                        className="form-control"
                        defaultValue={me?.data["notification_emails"] || "immediately"}
                      >
                        <option value="none">{t("none")}</option>
                        <option value="immediately">{t("immediately")}</option>
                        <option value="hourly">{t("hourly")}</option>
                        <option value="daily">{t("daily")}</option>
                        <option value="weekly">{t("weekly")}</option>
                        <option value="monthly">{t("monthly")}</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="default_group">
                        {t("default_group")}:
                      </label>
                      <select
                        name="default_group"
                        className="form-control"
                        defaultValue={me?.data["default_group"]}
                      >
                        {me.groups?.map(e => (
                          <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="default_page">
                        {t("default_page")}:
                      </label>
                      <select
                        name="default_page"
                        className="form-control"
                        defaultValue={me?.data["default_page"] || "default_group"}
                      >
                        <option value="feed">{t("feed")}</option>
                        <option value="default_group">{t("default_group")}</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="capitalize" htmlFor="lang">
                        {t("lang")}:
                      </label>
                      <select
                        name="lang"
                        className="form-control"
                        defaultValue={lang.getCurrentLang()}
                      >
                        {Object.keys(lang.possibleLang).map(k => (
                          <option key={k} value={k}>{lang.possibleLang[k]}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={e => updateSettings(e)}
                      className="btn btn-primary mt-3"
                    >
                      {t("save_changes")}
                    </button>
                  </form>
                  <details className="advanced-settings mt-4">
                    <summary className="mb-3">
                      {t("advanced_settings")}
                    </summary>
                    <form id="api_key_form" className="mb-4">
                      <div className="form-group">
                        <label htmlFor="apiKey">{t("api_key")}: </label>
                        <input
                          type="text"
                          name="apiKey"
                          value={apiKey}
                          className="form-control font-size-80"
                          readOnly
                        />
                      </div>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={resetApiKey}
                      >
                        {t("reset_api_key")}
                      </button>
                    </form>
                    <form id="destroy_form">
                      <label className="d-block" htmlFor="destroy_account">
                        {t("destroy_account_explain")}
                      </label>
                      <button
                        onClick={e => destroyAccount(e)}
                        name="destroy_account"
                        className="btn btn-danger"
                      >
                        {t("destroy_account")}
                      </button>
                    </form>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
        {alertMessage && (
          <div className="global-alert alert alert-success">{alertMessage}</div>
        )}
      </div>
    );
  }
}