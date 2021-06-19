require("dotenv").config()
const ethers = require("ethers")
const abis = require('./abis');

const { mainnet: addresses } = require('./addresses');
const Flashloan = require('./build/contracts/Flashloan.json');

const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org')

// select dexes
const dexes = [
    'mdx',
    'apeswap',
    'pancakeswap',
    'bakeryswap'
];

// configure token to compare with bnb
const token_a_symbol = 'bscbusd'
const token_a_address = eval('addresses.tokens.'+token_a_symbol)
const token_b_symbol = 'bscshiba'
const token_b_address = eval('addresses.tokens.'+token_b_symbol)

// select amount of token A to trade
const amount_token_a = '100'
const amount_token_a_wei = ethers.utils.parseEther(amount_token_a)

const init = async () => {
    let halt = 0;
    provider.on("block", async blockNumber => {
        // if new block received
        if (blockNumber && !halt) {
            halt = 1;
            console.log('time: '+Date())
            console.log(`block number ${blockNumber}`)

            let best_price_a_to_b = {};
            // Get best price from token A to token B
            for (let dex of dexes) {
                try {
                    let dexswap = await new ethers.Contract(eval('addresses.'+dex+'.router'), eval('abis.'+dex), provider);
                    let res = await dexswap.getAmountsOut(amount_token_a_wei, [token_a_address, token_b_address])
                    let token = ethers.utils.formatEther(res[1].toString())
                    if (best_price_a_to_b.amt == undefined) {
                        best_price_a_to_b = {
                            'amt': parseFloat(token),
                            'dex': dex
                        }
                    }
                    if (parseFloat(token) > best_price_a_to_b.amt) {
                        best_price_a_to_b.amt = parseFloat(token)
                        best_price_a_to_b.dex = dex
                    }
                    console.log(dex + ' - ' + amount_token_a + ' ' + token_a_symbol + ' to ' + token_b_symbol + ': ' + token)
                }
                catch(e) {
                    console.log(dex+': '+e.code)
                    continue
                }
            }
            console.log('')
            console.log('BEST exchange rate: '+best_price_a_to_b.amt+' ('+best_price_a_to_b.dex+')')
            console.log('')
            // swapping token B to token A
            for (let dex of dexes) {
                try {
                    let dexswap = await new ethers.Contract(eval('addresses.'+dex+'.router'), eval('abis.'+dex), provider);
                    let res = await dexswap.getAmountsOut(ethers.utils.parseEther(best_price_a_to_b.amt.toString()),[token_b_address,token_a_address])
                    let token = ethers.utils.formatEther(res[1].toString())
                    console.log(dex+' - '+best_price_a_to_b.amt+' '+token_b_symbol+' to '+token_a_symbol+': '+token)
                }
                catch(e) {
                    console.log(dex+': '+e.code)
                    continue
                }
            }

            // const pancakeswap = await new ethers.Contract(addresses.pancakeswap.router, abis.pancakeswap, provider);
            // let p_res = await pancakeswap.getAmountsOut(AMOUNT_TOKEN_WEI,[bscbnb,token_selected])
            // const p_token = ethers.utils.formatEther(p_res[1].toString())
            // console.log('pancakeswap - amt of '+token_symbol+' swapped: '+p_token)
            //
            // // sell token to bnb on apeswap
            // const apeswap = await new ethers.Contract(addresses.apeswap.router, abis.apeswap, provider);
            // let a_res = await apeswap.getAmountsOut(p_res[1],[token_selected,bscbnb])
            // console.log('apeswap - amt of bnb converted: '+ethers.utils.formatEther(a_res[1].toString()))
            //
            // // sell token to bnb on bakeryswap
            // const bakeryswap = await new ethers.Contract(addresses.bakeryswap.router, abis.bakeryswap, provider);
            // let b_res = await bakeryswap.getAmountsOut(p_res[1],[token_selected,bscbnb])
            // console.log('bakeryswap - amt of bnb converted: '+ethers.utils.formatEther(b_res[1].toString()))

            console.log('---')
            halt = 0;
        }
    })
    .on('error', error => {
      console.log(error);
    });
}

init();
