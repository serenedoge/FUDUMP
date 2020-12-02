fetch = require('node-fetch');
express = require('express');
const zeroXBaseUrl = `https://api.0x.org/swap/v1/quote?`;
const ethplorerBaseUrl = `https://api.ethplorer.io/getAddressInfo/`;
const etherDecimals = '18';

APIHandler = class {
	async getRestAPIJson(baseUrl) {
		let js = 0;
		try {
        	let response = await fetch(baseUrl);
        	js = await response.json();
            if (js.hasOwnProperty('code')) {
            	throw new Error(js['reason'])
            }
        } catch(e) {
			return null;
        }
    	return js;
	}

	async getAllZeroXQuotes(tokenAssets, buyToken) {
		let keys = Object.keys(tokenAssets);
		let transactions = [];
		this.finTransactions = [];
		for(let i = 0; i < keys.length; i++) {
			transactions.push(this.getZeroXQuote(buyToken, keys[i], tokenAssets[keys[i]].balance));
		}
		this.finTransactions = await Promise.allSettled(transactions).then(function(results) {
			let arr = {};
			for (let i2 = 0; i2 < results.length; i2++) {
				if (results[i2].value != null) {
					arr[keys[i2]] = results[i2].value;
				}
			}
			return arr;
		});
		console.log(this.finTransactions);
	}

	async getZeroXQuote(buyToken, sellToken, sellAmount) {
		let paramsZeroX = {'buyToken': buyToken, 'sellToken': sellToken, 'sellAmount': sellAmount};
		let urlZeroXSearch = new URLSearchParams(paramsZeroX);
		let zeroX = await this.getRestAPIJson(zeroXBaseUrl + urlZeroXSearch.toString());
		return zeroX;
	}

	async getEthplorer(cryptoAddress, apiKey) {
		let json = await this.getRestAPIJson(ethplorerBaseUrl + cryptoAddress + `?apiKey=` + apiKey);
		let ethplorerJSON = {};
		ethplorerJSON['Ethereum'] = {'balance': json.ETH.balance * Math.pow(10, etherDecimals), 'decimals': etherDecimals, 'symbol': 'ETH'};
		for(let i = 0; i < json.tokens.length; i++) {
			ethplorerJSON[json.tokens[i].tokenInfo.name] = {'balance': json.tokens[i].balance, 'decimals': json.tokens[i].tokenInfo.decimals, 'symbol': json.tokens[i].tokenInfo.symbol};
		}
		return ethplorerJSON;
    }
}
async function Test() {
	var api = new APIHandler();
	let app = express();
	app.get('/', function(req, res) {
		//api.getEthplorer(process.argv[2], process.argv[3]).then(res => walletAssets = res);
		let walletAdress = req.query.walletAddress;
		let apiKey = req.query.apiKey;
		api.getEthplorer(walletAdress, apiKey).then(function(result) {
			let walletAssets = result;
			res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
			res.json(walletAssets);
		});
	}).listen(1234);
}

Test();