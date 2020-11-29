fetch = require('node-fetch');
const zeroXBaseUrl = `https://api.0x.org/swap/v1/quote?`
const ethplorerBaseUrl = `https://api.ethplorer.io/getAddressInfo/`

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
                                throw new Error(JSON.stringify(js))
                        }
                } catch(e) {
                        console.log(e);
                }
                return js;
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
		ethplorerJSON['ETH'] = json.ETH.balance;
		for(let i = 0; i < json.tokens.length; i++) {
			ethplorerJSON[json.tokens[i].tokenInfo.name] = json.tokens[i].balance/Math.pow(10, json.tokens[i].tokenInfo.decimals);
		}
		console.log(ethplorerJSON);
		return ethplorerJSON;
        }
}

api = new APIHandler(process.argv[2], process.argv[3]);
api.getEthplorer();
