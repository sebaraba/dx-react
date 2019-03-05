import React from 'react'
import { State } from '../../types'
import { setExpressMode } from '../../actions/expressMode'

const MenuExpressMode = ({ expressMode } : State) =>
    <div className="menuFeeBalance">
        <p>
            {console.log('SORTING' + expressMode)}
            <button style={{ background: '#eaeef3', border: '#eaeef3' }} onClick={event1 => {
              event1.preventDefault()
              setExpressMode({ expressMode: false })
            }}>
                {expressMode ? 'Disable' : 'Enable'} <strong> One Click Trade </strong>
            </button>
        </p>
    </div>

export default MenuExpressMode
