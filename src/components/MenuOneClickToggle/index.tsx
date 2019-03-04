import React from 'react'
import { State } from '../../types'

export interface OwnProps {
  expressMode: boolean,
}

interface StateProps {
  expressMode: boolean,
}

interface DispatchProps {
  onSomeEvent: () => void
}

type Props = StateProps & DispatchProps & OwnProps

class MenuOneClickToggle extends React.Component<Props, State> {
  handleClick = () => {
    this.setState({
      expressMode: !this.state.expressMode,
    })
  }

  render() {
    {console.log('SORT1' + this.state.expressMode + 'props' + this.props.children)}
    return <div className="menuFeeBalance">
            <p>
                <button style={{ background: '#eaeef3', border: '#eaeef3' }} onClick={this.handleClick}>
                    {this.state.expressMode ? 'Disable' : 'Enable'} <strong> One Click Trade </strong>
                </button>
            </p>
        </div>
  }

}

export default MenuOneClickToggle
