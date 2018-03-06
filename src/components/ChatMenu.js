import React from 'react';
import { observer } from 'mobx-react'
import store from '../store/store';

// Material-ui
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog'
import Settings from 'material-ui-icons/Settings'
import Delete from 'material-ui-icons/Delete';
import IconButton from 'material-ui/IconButton'
import Checkbox from 'material-ui/Checkbox';
import List, { ListItem, ListItemText } from 'material-ui/List';

// Utility
import { LOCAL_STORAGE, MESSAGES, } from '../utility/localStorageWrapper'
import { removeHashtag } from '../utility/utility'

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
    LOCAL_STORAGE.removeItem(MESSAGES)
  }

  handleToggleMessagesNoColor = () => {
    store.handleToggleMessagesNoColor()
    store.toggleMessagesNoColor()
  }

  handleToggleHighlight = () => {
    store.handleToggleHighlight()
    store.toggleHighlight(removeHashtag(store.joinedChannels[store.channelSelectValue].key))
  }
  
  handleTogglehideNonHighlighted = () => {
    store.handleTogglehideNonHighlighted()
    store.toggleHideNonHighlighted(removeHashtag(store.joinedChannels[store.channelSelectValue].key))
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

          <DialogContent>
            <List>
              <ListItem key={0} dense button>
                <Button variant='raised' color={'primary'} onClick={this.clearChat.bind(this)}>
                  Clear My Chat
                  <Delete />
                </Button>
              </ListItem>
              <ListItem key={1} dense button>
                <ListItemText primary={'Set messages to be colorless:'} />
                <Checkbox
                  checked={store.messagesNoColor}
                  tabIndex={-1}
                  onChange={this.handleToggleMessagesNoColor}
                />
              </ListItem>
              <ListItem key={2} dense button>
                <ListItemText primary={'Highlight current room you are chatting in:'} />
                <Checkbox
                  checked={store.highlight}
                  tabIndex={-1}
                  onChange={this.handleToggleHighlight}
                />
              </ListItem>
              <ListItem key={3} dense button>
                <ListItemText primary={'Hide non-highlighted rooms:'} />
                <Checkbox
                  checked={store.hideNonHighlighted}
                  tabIndex={-1}
                  onChange={this.handleTogglehideNonHighlighted}
                />
              </ListItem>
            </List>
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