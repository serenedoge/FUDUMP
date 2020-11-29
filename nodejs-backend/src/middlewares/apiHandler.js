fetch = require('node-fetch');
const zeroXBaseUrl = `https://api.0x.org/swap/v1/quote?`;
const ethplorerBaseUrl = `https://api.ethplorer.io/getAddressInfo/`;
const etherDecimals = '18';

APIHandler = class {
	constructor(cryptoAddress, apiKey) {
		this.cryptoAddress = cryptoAddress;
		this.apiKey = apiKey;
	}

	async getRestAPIJson(baseUrl) {
		let js = 0
		try {
                        let response = await fetch(baseUrl);
                        js = await response.json();
                        if (js.hasOwnProperty('code')) {
                                throw new Error(js['reason'])
                        }
                } catch(e) {
                        //console.log(e);
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

	async getEthplorer() {
		let json = await this.getRestAPIJson(ethplorerBaseUrl + this.cryptoAddress + `?apiKey=` + this.apiKey);
		let ethplorerJSON = {};
		ethplorerJSON['ETH'] = {'balance': json.ETH.balance * Math.pow(10, etherDecimals), 'decimals': etherDecimals};
		for(let i = 0; i < json.tokens.length; i++) {
			ethplorerJSON[json.tokens[i].tokenInfo.name] = {'balance': json.tokens[i].balance, 'decimals': json.tokens[i].tokenInfo.decimals};
		}
		return ethplorerJSON;
        }
}
async function Test() {
	let api = new APIHandler(process.argv[2], process.argv[3]);
	let walletAssets = await api.getEthplorer();
	api.getAllZeroXQuotes(walletAssets, 'DAI');
}

Test();
