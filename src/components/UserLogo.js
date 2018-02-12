import React from 'react'
// Material-ui
import Paper from 'material-ui/Paper';

class UserLogo extends React.Component {

  render() {
    let onError = () => {
      this.refs.user_logo.src = 'http://is2.mzstatic.com/image/thumb/Purple128/v4/f1/b1/7e/f1b17eb1-6589-15c8-7f9c-9c3c0d35e086/source/175x175bb.jpg'
    }

    return (
      <img style={this.props.style}
        onError={onError}
        alt='User Logo'
        src={this.props.img}
        ref='user_logo'
      />
    )
  }
}

export default UserLogo