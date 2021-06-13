require("dotenv").config()
const ethers = require("ethers")
const abis = require('./abis');

const { mainnet: addresses } = require('./addresses');
const Flashloan = require('./build/contracts/Flashloan.json');

const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org')

// configure token to compare with bnb
const bscbnb = addresses.tokens.bscbnb
const token_selected = eval('addresses.tokens.'+'bsclink')

const AMOUNT_TOKEN = '100'
const AMOUNT_TOKEN_WEI = ethers.utils.parseEther(AMOUNT_TOKEN)

const init = async () => {
    // let currentBlock = '';
    provider.on("block", async blockNumber => {
        // if new block received
        if (blockNumber) {
            console.log(`block number ${blockNumber}`)
            console.log('Amount of bnb to swap: '+AMOUNT_TOKEN)
            console.log('time: '+Date())

            // pancakeswap
            const pancakeswap = await new ethers.Contract(addresses.pancakeswap.router, abis.pancakeswap, provider);
            let p_res = await pancakeswap.getAmountsOut(AMOUNT_TOKEN_WEI,[bscbnb,token_selected])
            const p_bsclink = ethers.utils.formatEther(p_res[1].toString())
            console.log('pancakeswap bsclink: '+p_bsclink)

            // apeswap
            const apeswap = await new ethers.Contract(addresses.apeswap.router, abis.apeswap, provider);
            let a_res = await apeswap.getAmountsOut(p_res[1],[token_selected,bscbnb])
            console.log('apeswap bnb: '+ethers.utils.formatEther(a_res[1].toString()))
            
        }
    })
    .on('error', error => {
      console.log(error);
    });
}

init();
