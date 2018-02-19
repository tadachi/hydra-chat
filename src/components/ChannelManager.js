import React, { Component } from 'react'
// Mobx
import { observer, } from 'mobx-react'
import { toJS, } from 'mobx';
import store from '../store/store';

// Material-ui
import { withTheme } from 'material-ui/styles'
import Typography from 'material-ui/Typography';
import AddCircleOutline from 'material-ui-icons/AddCircleOutline'
import HighlightOff from 'material-ui-icons/HighlightOff'

@observer
class ChannelManager extends Component {

  componentDidMount() {
    this.updateStreamersTimerID = setInterval(() => {
      if (store.oAuth) {
        store.updateStreamers().then((streams) => {
          const channels = toJS(store.channels.entries())
          for (const [key, value] of channels) {
            const joined = toJS(value).joined
            let stay = true

            for (const [stream, value] of streams) {
              if (key === stream) {
                stay = true
                break
                // Everything is good
              } else {
                stay = false
              }
            }

            if (stay === false && joined === true) {
              store.leave(key).then(() => {
                this.forceUpdate()
                // console.log(key, stay, toJS(store.channels.get(key)))
              })
            }
          }
        })
      }
    },
      120000 // 2 minutes or 120 seconds
    )
  }

  componentWillUnmount() {
    clearInterval(this.updateStreamersTimerID);
  }

  render() {
    let channels = []

    if (store.streams) {
      for (const [k, v] of store.streams.entries()) {
        const displayName = v.displayName
        const name = k
        const game = v.game
        const status = v.status
        const viewers = v.viewers
        let joined = false
        let color = store.theme.palette.background.default

        try {
          if (store.channels.has(name)) {
            joined = store.channels.get(name).joined
            joined ? color = store.channels.get(name).color : color = store.theme.palette.background.default
          }
        } catch (err) {
          console.log(err)
        }

        const button = joined ?
          //Set Autojoin to false if user leaves voluntarily (clicking leave button)
          <HighlightOff style={{ cursor: 'pointer', color: 'red', }} onClick={() => store.leave(name, false).then(this.forceUpdate())} /> :
          <AddCircleOutline style={{ cursor: 'pointer', color: store.theme.palette.text.primary }} onClick={() => store.join(name).then(this.forceUpdate())} />

        channels.push(
          <div style={{ ...ChannelManagerCSS.item, backgroundColor: color }} key={k}>
            <div style={{ ...ChannelManagerCSS.streamer, height: 20 }}><Typography>{displayName}</Typography></div>
            <div style={{ textAlign: 'right', }} >
              <div style={{ textAlign: 'right', height: 20 }}>{button}</div>
            </div>
            {(game !== '' && game !== undefined) ?
              <div style={ChannelManagerCSS.game}><Typography>{game}</Typography></div> :
              <div style={ChannelManagerCSS.game}><Typography>N/A</Typography></div>}
            <div></div>
            <div style={ChannelManagerCSS.status}><Typography>{status}</Typography></div>
            <div style={ChannelManagerCSS.viewers}><Typography>{viewers}</Typography></div>
          </div>
        )
      }
    }

    return (
      <div id='ChannelManager' style={{
        overflowY: 'hidden',
        overflowX: 'hidden'
      }}>
        {channels}
      </div>
    )
  }
}

let ChannelManagerCSS = {
  item: {
    display: 'grid',
    gridTemplateColumns: '75% 25%',
    gridTemplateRows: '75% 25%',
    border: `1px solid ${store.theme.palette.text.primary}`,
    marginTop: '3px',
    padding: '2%',
  },
  streamer: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  game: {
    fontStyle: 'italic',
    opacity: '0.8',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  viewers: {
    opacity: '0.8',
    textAlign: 'right',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  status: {
    fontStyle: 'italic',
    opacity: '0.5',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
}


export default withTheme()(ChannelManager)