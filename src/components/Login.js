import React, { Component } from 'react'

// Material-ui
import Button from 'material-ui/Button'

class Login extends Component {
  constructor(props) {
    super(props)

    //     this.url = `https://api.twitch.tv/kraken/oauth2/authorize
    // ?client_id=${this.props.client_id}
    // &redirect_uri=https://mtc3.now.sh
    // &response_type=token
    // &scope=openid+chat_login+user_read
    // &state=c3ab8aa609ea11e793ae92361f002671`
    //   }

    this.url = `https://api.twitch.tv/kraken/oauth2/authorize
?client_id=${this.props.client_id}
&redirect_uri=http://localhost:3000/chat
&response_type=token
&scope=openid+chat_login+user_read
&state=c3ab8aa609ea11e793ae92361f002671`
  }

  render() {
    return (
      <Button
        href={this.url} style={{ ...this.props.style }}
        disabled={this.props.disabled}
        color={this.props.color} raised>
        Login With Twitch
        </Button>
    )
  }

}

export default Login