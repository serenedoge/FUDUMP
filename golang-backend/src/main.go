package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"strconv"
	"strings"
)

func main() {
	http.HandleFunc("/", handler)
	log.Fatal(http.ListenAndServe(":1234", nil))
	return
}

func handler(w http.ResponseWriter, r *http.Request) {
	api := &APIHandler{}
	jsonString, _ := json.Marshal(api.getEthplorer(r.URL.Query()["walletAddress"][0], r.URL.Query()["apiKey"][0]))
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonString)
}

func (api APIHandler) getZeroXCurrPrice(sellToken string, decimals uint64) float64 {
	var zeroXQuote ZeroXQuote
	respStr := api.getRestAPIJson(fmt.Sprintf(ZEROXURLPRICEFORMATSTR, "ETH", sellToken, uint64(math.Pow(10, float64(decimals)))))

	err := json.Unmarshal([]byte(respStr), &zeroXQuote)

	if err != nil {
		return 0
	} else {
		res, _ := strconv.ParseFloat(zeroXQuote.Price, 64)
		return res
	}
}

func (api APIHandler) getRestAPIJson(baseURL string) string {
	resp, err := http.Get(baseURL)

	if err != nil {
		log.Fatalln(err)
	}

	defer resp.Body.Close()

	htmlData, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		log.Fatalln(err)
	}

	return string(htmlData)
}

func (api APIHandler) getBoughtEthPriceForToken(cryptoAddress, apiKey, tokenAddress string, decimals uint64) float64 {
	var tokHist AddrTokHistory
	var tsHist TxInfo
	var ct int
	respStr := api.getRestAPIJson(fmt.Sprintf(ETHPLORERADDRHIST, cryptoAddress, apiKey, tokenAddress))
	json.Unmarshal([]byte(respStr), &tokHist)
	for i, v := range tokHist.Operations {
		if strings.Compare(v.Type, "transfer") == 0 {
			ct = i
			break
		}
	}
	respStr = api.getRestAPIJson(fmt.Sprintf(ETHPLORERTSHIST, tokHist.Operations[ct].TransactionHash, apiKey))
	json.Unmarshal([]byte(respStr), &tsHist)
	oplen := len(tsHist.Operations)
	f1, _ := strconv.ParseFloat(tsHist.Operations[0].Value, 64)
	f2, _ := strconv.ParseFloat(tsHist.Operations[oplen-1].Value, 64)

	return f1 / f2
}

func (api APIHandler) getEthplorer(cryptoAddress, apiKey string) map[string]WalletAsset {
	var walletAPI EthplorerWalletAPI
	var eth WalletAsset
	var decs uint64
	ethplorerJSON := make(map[string]WalletAsset)
	respStr := api.getRestAPIJson(fmt.Sprintf(ETHPLORERFORMATSTR, cryptoAddress, apiKey))
	json.Unmarshal([]byte(respStr), &walletAPI)

	if walletAPI.ETH.Balance > 0.01 {
		eth.Balance = walletAPI.ETH.Balance * math.Pow(10, 18)
		eth.Decimals = 18
		eth.Symbol = "ETH"
		eth.Address = "0"
		eth.CurrUsdPrice = walletAPI.ETH.Price.Rate
		ethplorerJSON["Ethereum"] = eth
	}

	for _, element := range walletAPI.Tokens {
		var curr WalletAsset
		decs, _ = strconv.ParseUint(element.TokenInfo.Decimals, 10, 32)
		if element.Balance > 0.01*math.Pow(10, float64(decs)) {
			curr.Balance = element.Balance
			curr.Decimals = decs
			curr.Symbol = element.TokenInfo.Symbol
			curr.Address = element.TokenInfo.Address
			curr.CurrEthPrice = api.getZeroXCurrPrice(curr.Address, curr.Decimals)
			curr.CurrUsdPrice = element.TokenInfo.Price.Rate
			curr.BoughtEthPrice = api.getBoughtEthPriceForToken(cryptoAddress, apiKey, element.TokenInfo.Address, curr.Decimals)
			curr.PercentChange = fmt.Sprintf("%.2f", ((curr.CurrEthPrice-curr.BoughtEthPrice)/curr.BoughtEthPrice)*100)
			ethplorerJSON[element.TokenInfo.Name] = curr
		}
	}
	return ethplorerJSON
}
