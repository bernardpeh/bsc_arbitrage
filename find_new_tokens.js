require("dotenv").config()
var con = require('./db/config.js')

const ethers = require("ethers")
const abis = require('./abis');

const { mainnet: addresses } = require('./addresses');

const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org')

const init = async () => {
    let topic = [
        ethers.utils.id("Transfer(address,address,uint256)"),
        null,
        []
    ]
    provider.on(topic, async (log) => {
        // let token = await event
        let token_address = await log.address
        // insert into db
        await con.query(`insert into bsc_coin (contract_address) values ('${token_address}')`, async (error, res, fields) => {
            if (error) {
                // update token counter
                await con.query(`update bsc_coin set counter=counter+1 where contract_address='${token_address}'`)
                console.log(token_address + ' duplicated. Skipping...');
            }
        })
    })
}

init();
