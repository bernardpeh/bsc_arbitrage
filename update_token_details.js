require("dotenv").config()
var con = require('./db/config.js')
const ethers = require("ethers")
const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org')

async function updateToken(id, address) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        console.log(`processing ${id}: ${address}`)
        let token = await new ethers.Contract(address, [
                "function name() view returns (string)",
                "function symbol() view returns (string)",
                "function decimals() view returns (uint)",
                "function totalSupply() view returns (uint)"]
            ,provider)

        let token_name = await token.name()
        let token_symbol = await token.symbol()
        let token_decimals = await token.decimals()
        let token_total_supply = await token.totalSupply()

        console.log('token name is '+token_name)
        console.log('token symbol is '+token_symbol)
        console.log('token decimals is '+token_decimals)
        console.log('token supply is '+token_total_supply)
        await con.query(`update bsc_coin set name='${token_name}',symbol='${token_symbol}',decimals='${token_decimals}',total_supply='${token_total_supply}' where id='${id}'`)
    }
    catch (e) {
        console.log(e)
    }
}

const init = async () => {
    await con.query(`set names utf8mb4`)
    await con.query(`select id, contract_address from bsc_coin where symbol is null order by counter desc`, async (error, res, fields) => {
        if (error) {
            throw error
        }

        res.forEach( async (v) => {
            await updateToken(v.id, v.contract_address)
        });
    })
}

init()
