import React from 'react'
// Material-ui
import Paper from 'material-ui/Paper';

const logo = {
  width: '100%',
}

class UserPaper extends React.Component {

  render() {
    let onError = () => {
      this.refs.user_logo.src = 'http://is2.mzstatic.com/image/thumb/Purple128/v4/f1/b1/7e/f1b17eb1-6589-15c8-7f9c-9c3c0d35e086/source/175x175bb.jpg'
    }

    return (
      <Paper>
        <div style={this.props.style}>
          <img style={logo}
            onError={onError}
            alt='User Logo'
            src={this.props.img}
            ref='user_logo'
            />
        </div>
        {/* <div>{this.props.name}</div> */}
        {this.props.children}
      </Paper>
    )
  }
}

export default UserPaper