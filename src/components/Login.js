import React, { Component } from "react";
import store from "../store/store";

// Material-ui
import Button from "material-ui/Button";

class Login extends Component {
  render() {
    return (
      <Button
        href={store.twitchLoginUrl}
        style={{ ...this.props.style }}
        disabled={this.props.disabled}
        color={this.props.color}
      >
        Login With Twitch
      </Button>
    );
  }
}

export default Login;
