const kyberMainnet = require('./kyber-mainnet.json');
const uniswapMainnet = require('./uniswap-mainnet.json');
const dydxMainnet = require('./dydx-mainnet.json');
const tokensMainnet = require('./tokens-mainnet.json');
const apeswapMainnet = require('./apeswap-mainnet.json');
const pancakeswapMainnet = require('./pancakeswap-mainnet.json');

module.exports = {
  mainnet: {
    kyber: kyberMainnet,
    uniswap: uniswapMainnet,
    apeswap: apeswapMainnet,
    pancakeswap: pancakeswapMainnet,
    dydx: dydxMainnet,
    tokens: tokensMainnet
  }
};
