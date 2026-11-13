import React, { Component } from "react";

import { http, util } from "/src/core";
import { withTranslation } from "react-i18next";
import { Navbar } from "/src/navbar";

class CreateGroup extends Component {
  constructor() {
    super();
    this.state = {
      alertMessage: ""
    };
    this.postNewGroup = this.postNewGroup.bind(this);
  }

  postNewGroup(event) {
    event.preventDefault();
    const name = document.querySelector("#create_group_form input[name='name']").value;
    let group = {};
    if (name) {
      group.name = name;
    } else {
      return false;
    }
    group.createdAt = Math.floor(Date.now() / 1000);
    http.post("/api/groups", group).then(res => {
      if (res?.id) window.location = util.toApp(`/groups/${res.id}`);
    }).catch((e) => {
      this.setState({ alertMessage: this.props.t(e.error) });
    });
  }

  render() {
    return (
      <main>
        <Navbar />
        <div className="content">
          <div className="container mt-2">
            <div className="group-settings">
              <div className="card">
                <div className="card-body">
                  <div className="container-fluid p-1">
                    <div className="row">
                      <div className="col-12 col-md-10">
                        <form id="create_group_form" className="mb-1">
                          <div className="form-group">
                            <label for="name">{this.props.t("name")}: </label>
                            <input
                              type="text"
                              name="name"
                              minlength="1"
                              maxlength="128"
                              placeholder={this.props.t("name_input")}
                              className="form-control"
                              required
                            />
                          </div>
                          <button
                            onClick={e => this.postNewGroup(e)}
                            className="btn btn-primary"
                          >
                            {this.props.t("create_the_group")}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {this.state.alertMessage && (
          <div className="global-alert alert alert-danger">{this.state.alertMessage}</div>
        )}
      </main>
    );
  }
}

export default withTranslation()(CreateGroup);
