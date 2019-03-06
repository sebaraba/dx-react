import React from 'react'
import { Balance } from 'types'
import { Link } from 'react-router-dom'
import { URLS } from 'globals'
import { setExpressMode } from '../../actions/expressMode'
// Hook in props:
// MGN amount found via TokenMGN.balanceOf(user.address)
// Fee level should be estimated in DX via MGN.totalSupply() vs Users supply
// Fee percentages can be found via Dom's numbers

export interface MenuFeeBalanceProps {
  feeRatio: number,
  mgnSupply: Balance,
  showFeeRatio: boolean,
  expressMode: boolean,
  dispatch(mode: any): void
}

const MenuFeeBalance = ({ feeRatio, mgnSupply, showFeeRatio, expressMode, dispatch }: MenuFeeBalanceProps) =>
    <div className="menuFeeBalance">
        {!expressMode &&
        <p>
            <a
                href={URLS.DXDAO}
                target="_blank"
                title="MAGNOLIA - click for more info"
            >
                MGN <strong>{showFeeRatio ? mgnSupply : 'N/A'}</strong>
            </a>
        </p>}
        <p>
            <Link title="Liquidity Contribution - click for more info" to={URLS.LIQUIDITY_CONTRIBUTION}>
                Liq. Contr. <strong>{showFeeRatio ? `${feeRatio * 100}%` : 'N/A'}</strong>
            </Link>
        </p>
        <p>
            <button style={{ background: '#eaeef3', border: '#eaeef3' }} onClick={event1 => {
              event1.preventDefault()
              dispatch(setExpressMode({ expressMode: !expressMode }))
            }}>
                {expressMode ? 'Disable' : 'Enable'} <strong> One Click Trade </strong>
            </button>
        </p>
    </div>

export default MenuFeeBalance
