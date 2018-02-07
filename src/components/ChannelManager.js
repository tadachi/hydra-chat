import React, { Component } from 'react'
// Mobx
import { observer } from 'mobx-react'
import store from '../store/store';

// Material-ui
import { withTheme } from 'material-ui/styles'
import Typography from 'material-ui/Typography';
import AddCircleOutline from 'material-ui-icons/AddCircleOutline'
import HighlightOff from 'material-ui-icons/HighlightOff'

// Utility
import { clean } from '../utility/utility'

@observer
class ChannelManager extends Component {

  componentDidMount() {
    // setTimeout(() => {
    //     store.join('#icarusFW')
    //     store.join('#Pasky')
    //     store.join('#Metako')
    //     store.join('#landail')
    //     store.join('#DarkSaber2k')
    //     store.join('#maurice_33')
    //     store.join('#Aquas')
    //     store.join('#Fiercekyo')
    //     store.join('#mulsqi')
    //     store.join('#bafael')
    //     store.join('#theboyks')
    //     store.join('#Raikou')
    //     store.join('#perpetualmm')
    //     store.join('#Bingchang')
    //     store.join('#frokenok')
    //     store.join('#vultus')
    //     store.join('#neohart')
    //     store.join('#zetsubera')
    //     store.join('#procplays')
    //     store.join('#lazerlong')
    //     store.join('#testrunner')
    //     store.join('#jiseed')
    //     store.join('#xxxindyxxx')
    //     store.join('#narcissawright')
    //     store.join('#Goati_')
    //     store.join('#TheLCC')
    //     store.join('#azureseishin')
    //     store.join('#pykn')
    //     store.join('#jiggeh')
    //     store.join('#chuboh')
    //     store.join('#UFotekkie')
    //     store.join('#Ty2358')
    //     store.join('#sakegeist')
    //     store.join('#klaige')
    //     store.join('#Go1den')
    //     store.join('#capnclever')
    //     store.join('#omnigamer')
    //     store.join('#sylux98')
    //     store.join('#swordsmankirby')
    //     store.join('#Macaw45')
    //     store.join('#freddeh')
    //     store.join('#ghou02')
    //     store.join('#tterraj42')
    //     store.join('#superKing13')
    //     store.join('#CavemanDCJ')
    //     store.join('#yagamoth')
    //     store.join('#shadowJacky')
    //     store.join('#Jenja23')
    // }, 4000)
  }

  componentWillUnmount() {
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
          <HighlightOff style={{ cursor: 'pointer', color: 'red', }} onClick={() => store.leave(name)} /> :
          <AddCircleOutline style={{ cursor: 'pointer', color: store.theme.palette.text.primary }} onClick={() => store.join(name)} />

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
      <div id='ChannelManager' >
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
    marginLeft: '4%',
    marginTop: '4%',
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