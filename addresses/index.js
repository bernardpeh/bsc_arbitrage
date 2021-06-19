const kyberMainnet = require('./kyber-mainnet.json');
const uniswapMainnet = require('./uniswap-mainnet.json');
const dydxMainnet = require('./dydx-mainnet.json');
const tokensMainnet = require('./tokens-mainnet.json');
const apeswapMainnet = require('./apeswap-mainnet.json');
const pancakeswapMainnet = require('./pancakeswap-mainnet.json');
const bakeryswapMainnet = require('./bakeryswap-mainnet.json');
const mdxMainnet = require('./mdx-mainnet.json');

module.exports = {
  mainnet: {
    kyber: kyberMainnet,
    uniswap: uniswapMainnet,
    apeswap: apeswapMainnet,
    pancakeswap: pancakeswapMainnet,
    bakeryswap: bakeryswapMainnet,
    mdx: mdxMainnet,
    dydx: dydxMainnet,
    tokens: tokensMainnet
  }
};
