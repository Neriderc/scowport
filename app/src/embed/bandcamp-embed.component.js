import React, { Component } from "react";

export default class BandCampEmbed extends Component {
  render() {
    const embedUrl =
      `${this.props.url 
      }/size=large/bgcol=f5f5f5/linkcol=0687f5/minimal=true/tracklist=false/`;
    if (this.state.revealed) {
      return (
        <div className={"bandcamp-embed embed-responsive embed-responsive-1by1"}>
          <iframe className={"embed-responsive-item"} src={embedUrl} />
        </div>
      );
    }
    return (
      <div
        className={"embed-preview"}
        onClick={() => this.setState({ revealed: true })}
      >
        <div className={"bandcamp"} />
        <img src={this.props.preview} />
      </div>
    );
  }
}
