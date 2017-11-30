/* eslint no-console:0 */
const DutchExchangeETHGNO = artifacts.require('./DutchExchangeETHGNO.sol')
const { getTime, increaseTimeBy } = require('./utils')(web3)

/**
 * truffle exec trufflescripts/start_auction.js
 * if auction isn't running,
 * sets time to auction start + 1 hour
 */

const hour = 3600

module.exports = async () => {
  const dx = await DutchExchangeETHGNO.deployed()
  const auctionStart = (await dx.auctionStart()).toNumber()
  const now = getTime()
  const timeUntilStart = auctionStart - now

  const auctionIndex = (await dx.auctionIndex()).toNumber()

  // auctionStart is in the future
  if (timeUntilStart > 0) {
    increaseTimeBy(timeUntilStart + hour)
    console.log(`ETH -> GNO auction ${auctionIndex} started`)
  } else {
    console.log(`ETH -> GNO auction ${auctionIndex} is already running`)
  }
}