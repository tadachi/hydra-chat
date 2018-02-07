import React, { Component } from 'react'

import store from '../store/store';
import { observer } from 'mobx-react'

// Material-ui
import { withTheme } from 'material-ui/styles'
import Select from 'material-ui/Select'
import { MenuItem } from 'material-ui/Menu'
import {createMuiTheme} from 'material-ui/styles'

@observer
class ThemeSelect extends Component {

  handleChange(e) {
    console.log(parseInt(e.target.value, 10))
    store.systemThemeValue = parseInt(e.target.value, 10)
    store.systemTheme = store.systemThemes[store.systemThemeValue]
    console.log(store.systemTheme)
    store.theme = createMuiTheme({
      palette: {
        type: store.systemTheme, // Switching the dark mode on is a single property value change.
      },
    });
  }

  render() {
    return (
      <Select onChange={this.handleChange} value={parseInt(store.systemThemeValue, 10)} autoWidth={true} native={false}>
        <MenuItem style={{backgroundColor: this.props.theme.palette.background.default}} key='dark' value={0}>Dark</MenuItem>
        <MenuItem style={{backgroundColor: this.props.theme.palette.background.default}} key='light' value={1}>Light</MenuItem>
      </Select>
    )
  }

}

export default withTheme()(ThemeSelect)