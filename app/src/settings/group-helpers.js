import { showConfirm } from "/src/store/confirm-modal.js";
import { alert, http, me as meService } from "/src/core";


export const leaveGroup = async (event, group, navigate, t) => {
  event.preventDefault();
  if (await showConfirm({
    title: t("are_you_sure"),
    message: t("you_will_need_invite"),
    confirmText: t("quit_group"),
    cancelText: t("cancel"),
    variant: "danger"
  })) {
    if (group.users.length > 1 || await showConfirm({
      title: t("are_you_sure"),
      message: t("you_are_last_group_will_delete"),
      confirmText: t("delete_group"),
      cancelText: t("cancel"),
      variant: "danger"
    })) {
      leave(group, navigate, t);
    }
  }
};

const leave = async (group, navigate, t) => {
  try {
    const res = await http.post(`/api/groups/${group.id}/leave`, {});

    if (!res || !res["entityType"]) {
      alert.add(t("error"), "alert-danger");
      return;
    }
    await meService.update();

    alert.add(t("group_left"));
    navigate("/");
  } catch (e) {
    console.warn(e);
  }
};