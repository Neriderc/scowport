import React from "react";
import { useStore } from "@nanostores/react";

import { $confirm, closeConfirm } from "../store/confirm-modal.js";

export default function ConfirmModal() {
  const state = useStore($confirm);

  if (!state.open) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={() => closeConfirm(false)}
      ></div>

      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{state.title}</h5>
            </div>

            <div className="modal-body">
              <p>{state.message}</p>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => closeConfirm(false)}
              >
                {state.cancelText}
              </button>

              <button
                className={`btn btn-${state.variant}`}
                onClick={() => closeConfirm(true)}
              >
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
