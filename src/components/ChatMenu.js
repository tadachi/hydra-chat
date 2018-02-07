import React from 'react';
import { observer } from 'mobx-react'
import store from '../store/store';

// Material-ui
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog'
import Settings from 'material-ui-icons/Settings'
import Delete from 'material-ui-icons/Delete';
import IconButton from 'material-ui/IconButton'

@observer
class ChatMenu extends React.Component {

  handleClickOpen = () => {
    store.chatMenuOpen = true
  }

  handleClose = () => {
    store.chatMenuOpen = false
  }

  clearChat() {
    store.messages = []
    store.msg_id = 0
    // Remove past saved twitch chat messages on clear
    // LOCAL_STORAGE.removeItem(MESSAGES)
  }


  componentDidMount() { }

  render() {

    return (
      <div>
        <IconButton onClick={this.handleClickOpen}><Settings style={{ cursor: 'pointer', color: 'lightgrey' }} /></IconButton>
        <Dialog
          open={store.chatMenuOpen}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Settings</DialogTitle>
          <DialogContent>
            {/* <DialogContentText>
              To subscribe to this website, please enter your email address here. We will send
              updates occationally.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Email Address"
              type="email"
              fullWidth
            /> */}
            <Button color={'primary'} onClick={this.clearChat.bind(this)}>
              Clear My Chat
              <Delete />
            </Button>
          </DialogContent>
          {/* <DialogContent>
            <Button raised onClick={this.test.bind(this)}>
              Test
            </Button>
          </DialogContent> */}
          <DialogActions>
            <Button onClick={this.handleClose}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default ChatMenu