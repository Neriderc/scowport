import React, { Component } from "react";

export default class GenericEmbed extends Component {
  render() {
    if (this.state.revealed) {
      return (
        <div className="embed-responsive embed-responsive-16by9">
          <iframe
            allowfullscreen
            className="embed-responsive-item"
            referrerpolicy="strict-origin-when-cross-origin"
            src={this.props.url}
          />
        </div>
      );
    }
    return (
      <div
        className="embed-preview"
        onClick={() => this.setState({revealed: true})}
      >
        <div className={this.props.playBtnClass} />
        <img src={this.props.preview} />
      </div>
    );
  }
}
