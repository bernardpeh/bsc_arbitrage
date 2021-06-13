require("dotenv").config()
const Web3 = require('web3');
const { ChainId, Token, TokenAmount, Pair } = require('@uniswap/sdk');
const abis = require('./abis');
const { mainnet: addresses } = require('./addresses');
const Flashloan = require('./build/contracts/Flashloan.json');

const web3 = new Web3(
  new Web3.providers.WebsocketProvider(process.env.INFURA_URL)
);
const { address: admin } = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);

const kyber = new web3.eth.Contract(
  abis.kyber.kyberNetworkProxy,
  addresses.kyber.kyberNetworkProxy
);

// configure token to compare with eth
const token_selected = 'link'
const token_selected_address = eval('addresses.tokens.'+token_selected)

const ONE_WEI = web3.utils.toBN(web3.utils.toWei('1'));
const AMOUNT_TOKEN_WEI = web3.utils.toBN(web3.utils.toWei('20000'));
const DIRECTION = {
  KYBER_TO_UNISWAP: 0,
  UNISWAP_TO_KYBER: 1
};

const init = async () => {
  const networkId = await web3.eth.net.getId();
  // const flashloan = new web3.eth.Contract(
  //   Flashloan.abi,
  //   Flashloan.networks[networkId].address
  // );
  
  let ethPrice;
  const updateEthPrice = async () => {
    const results = await kyber
      .methods
      .getExpectedRate(
        '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          addresses.tokens.dai,
        1
      )
      .call();
    ethPrice = web3.utils.toBN('1').mul(web3.utils.toBN(results.expectedRate)).div(ONE_WEI);
    console.log('kyber: eth to dai '+ethPrice)
  }
  await updateEthPrice();
  setInterval(updateEthPrice, 15000);

  web3.eth.subscribe('newBlockHeaders')
    .on('data', async block => {
      console.log(`New block received. Block # ${block.number}`);

      const [token, weth] = await Promise.all(
        [token_selected_address, addresses.tokens.weth].map(tokenAddress => (
          Token.fetchData(
            ChainId.MAINNET,
            tokenAddress,
          )
      )));
      const tokenWeth = await Pair.fetchData(
        token,
        weth,
      );

      const amountsEth = await Promise.all([
        kyber
          .methods
          .getExpectedRate(
              token_selected_address,
              '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
              AMOUNT_TOKEN_WEI
          ) 
          .call(),
        tokenWeth.getOutputAmount(new TokenAmount(token, AMOUNT_TOKEN_WEI)),
      ]);

      const ethFromKyber = AMOUNT_TOKEN_WEI.mul(web3.utils.toBN(amountsEth[0].expectedRate)).div(ONE_WEI);
      const ethFromUniswap = web3.utils.toBN(amountsEth[1][0].raw.toString());

        console.log(token_selected+' to eth:kyber '+ethFromKyber)
        console.log(token_selected+' to eth:uniswap '+ethFromUniswap)

      const amountsToken = await Promise.all([
        kyber
          .methods
          .getExpectedRate(
            '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
              token_selected_address,
              ethFromUniswap.toString()
          ) 
          .call(),
        tokenWeth.getOutputAmount(new TokenAmount(weth, ethFromKyber.toString())),
      ]);

      const tokenFromKyber = ethFromUniswap.mul(web3.utils.toBN(amountsToken[0].expectedRate)).div(ONE_WEI);
      const tokenFromUniswap = web3.utils.toBN(amountsToken[1][0].raw.toString());

        console.log('eth to '+token_selected+':kyber '+tokenFromKyber)
        console.log('eth to '+token_selected+':uniswap '+tokenFromUniswap)

      console.log(`Kyber -> Uniswap. ${token_selected} input / output: ${web3.utils.fromWei(AMOUNT_TOKEN_WEI.toString())} / ${web3.utils.fromWei(tokenFromUniswap.toString())}`);
      console.log(`Uniswap -> Kyber. ${token_selected} input / output: ${web3.utils.fromWei(AMOUNT_TOKEN_WEI.toString())} / ${web3.utils.fromWei(tokenFromKyber.toString())}`);

      if(tokenFromUniswap.gt(AMOUNT_TOKEN_WEI)) {
          console.log('triggering '+token_selected+' from uniswap')
        const tx = flashloan.methods.initiateFlashloan(
          addresses.dydx.solo, 
          token_selected_address,
          AMOUNT_TOKEN_WEI,
          DIRECTION.KYBER_TO_UNISWAP
        );
        const [gasPrice, gasCost] = await Promise.all([
          web3.eth.getGasPrice(),
          tx.estimateGas({from: admin}),
        ]);

        const txCost = web3.utils.toBN(gasCost).mul(web3.utils.toBN(gasPrice)).mul(ethPrice);
        const profit = tokenFromUniswap.sub(AMOUNT_TOKEN_WEI).sub(txCost);
          console.log('estimated profit is '+profit)
        if(profit > 0) {
          console.log('Arb opportunity found Kyber -> Uniswap!');
          console.log(`Expected profit: ${web3.utils.fromWei(profit)} Dai`);
          const data = tx.encodeABI();
          const txData = {
            from: admin,
            to: flashloan.options.address,
            data,
            gas: gasCost,
            gasPrice
          };
          const receipt = await web3.eth.sendTransaction(txData);
          console.log(`Transaction hash: ${receipt.transactionHash}`);
        }
      }

      if(tokenFromKyber.gt(AMOUNT_TOKEN_WEI)) {
          console.log('triggering '+token_selected+' from kyber')
        const tx = flashloan.methods.initiateFlashloan(
          addresses.dydx.solo,
          token_selected_address,
          AMOUNT_TOKEN_WEI,
          DIRECTION.UNISWAP_TO_KYBER
        );
        const [gasPrice, gasCost] = await Promise.all([
          web3.eth.getGasPrice(),
          tx.estimateGas({from: admin}),
        ]);
        const txCost = web3.utils.toBN(gasCost).mul(web3.utils.toBN(gasPrice)).mul(ethPrice);
        const profit = tokenFromKyber.sub(AMOUNT_TOKEN_WEI).sub(txCost);
        console.log('estimated profit is '+profit)
        if(profit > 0) {
          console.log('Arb opportunity found Uniswap -> Kyber!');
          console.log(`Expected profit: ${web3.utils.fromWei(profit)} Dai`);
          const data = tx.encodeABI();
          const txData = {
            from: admin,
            to: flashloan.options.address,
            data,
            gas: gasCost,
            gasPrice
          };
          const receipt = await web3.eth.sendTransaction(txData);
          console.log(`Transaction hash: ${receipt.transactionHash}`);
        }
      }
    })
    .on('error', error => {
      console.log(error);
    });
}
init();
