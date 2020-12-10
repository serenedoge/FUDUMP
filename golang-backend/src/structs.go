package main

const ZEROXURLFORMATSTR = "https://api.0x.org/swap/v1/quote?buyToken=%s&sellToken=%s&sellAmount=%s"
const ZEROXURLPRICEFORMATSTR = "https://api.0x.org/swap/v1/quote?buyToken=%s&sellToken=%s&sellAmount=%d"
const ETHPLORERFORMATSTR = "https://api.ethplorer.io/getAddressInfo/%s?apiKey=%s"
const ETHPLORERADDRHIST = "https://api.ethplorer.io/getAddressHistory/%s?apiKey=%s&token=%s&limit=5"
const ETHPLORERTSHIST = "https://api.ethplorer.io/getTxInfo/%s?apiKey=%s"

type APIHandler struct {
}

type ZeroXQuote struct {
	Price                   string      `json:"price"`
	GuaranteedPrice         string      `json:"guaranteedPrice"`
	To                      string      `json:"to"`
	Data                    string      `json:"data"`
	Value                   string      `json:"value"`
	Gas                     string      `json:"gas"`
	EstimatedGas            string      `json:"estimatedGas"`
	GasPrice                string      `json:"gasPrice"`
	ProtocolFee             string      `json:"protocolFee"`
	MinimumProtocolFee      string      `json:"minimumProtocolFee"`
	BuyTokenAddress         string      `json:"buyTokenAddress"`
	SellTokenAddress        string      `json:"sellTokenAddress"`
	BuyAmount               string      `json:"buyAmount"`
	SellAmount              string      `json:"sellAmount"`
	EstimatedGasTokenRefund string      `json:"estimatedGasTokenRefund"`
	Sources                 []SourceArr `json:"sources"`
	Orders                  []OrderArr  `json:"orders"`
	AllowanceTarget         string      `json:"allowanceTarget"`
}

type SourceArr struct {
	Name       string `json:"name"`
	Proportion string `json:"proportion"`
}

type OrderArr struct {
	ChainId               int    `json:"chainId"`
	ExchangeAddress       string `json:"exchangeAddress"`
	MakerAddress          string `json:"makerAddress"`
	TakerAddress          string `json:"takerAddress"`
	FeeRecipientAddress   string `json:"feeRecipientAddress"`
	SenderAddress         string `json:"senderAddress"`
	MakerAssetAmount      string `json:"makerAssetAmount"`
	TakerAssetAmount      string `json:"takerAssetAmount"`
	MakerFee              string `json:"makerFee"`
	TakerFee              string `json:"takerFee"`
	ExpirationTimeSeconds string `json:"expirationTimeSeconds"`
	Salt                  string `json:"salt"`
	MakerAssetData        string `json:"makerAssetData"`
	TakerAssetData        string `json:"takerAssetData"`
	MakerFeeAssetData     string `json:"makerFeeAssetData"`
	TakerFeeAssetData     string `json:"takerFeeAssetData"`
	Signature             string `json:"signature"`
}

type WalletAsset struct {
	Balance        float64
	Decimals       uint64
	Symbol         string
	Address        string
	CurrEthPrice   float64
	CurrUsdPrice   float64
	BoughtEthPrice float64
	PercentChange  string
}

type EthplorerWalletAPI struct {
	Address string `json:"address"`
	ETH     struct {
		Balance float64 `json:"balance"`
		Price   struct {
			Rate            float64 `json:"rate"`
			Diff            float64 `json:"diff"`
			Diff7D          float64 `json:"diff7d"`
			Ts              int     `json:"ts"`
			MarketCapUsd    float64 `json:"marketCapUsd"`
			AvailableSupply float64 `json:"availableSupply"`
			Volume24H       float64 `json:"volume24h"`
			Diff30D         float64 `json:"diff30d"`
			VolDiff1        float64 `json:"volDiff1"`
			VolDiff7        float64 `json:"volDiff7"`
			VolDiff30       float64 `json:"volDiff30"`
		} `json:"price"`
	} `json:"ETH"`
	CountTxs int `json:"countTxs"`
	Tokens   []struct {
		TokenInfo struct {
			Address           string `json:"address"`
			Decimals          string `json:"decimals"`
			Name              string `json:"name"`
			Symbol            string `json:"symbol"`
			TotalSupply       string `json:"totalSupply"`
			LastUpdated       int    `json:"lastUpdated"`
			Owner             string `json:"owner"`
			IssuancesCount    int    `json:"issuancesCount"`
			HoldersCount      int    `json:"holdersCount"`
			EthTransfersCount int    `json:"ethTransfersCount"`
			Price             struct {
				Rate            float64 `json:"rate"`
				Diff            float64 `json:"diff"`
				Diff7D          float64 `json:"diff7d"`
				Ts              int     `json:"ts"`
				MarketCapUsd    float64 `json:"marketCapUsd"`
				AvailableSupply int     `json:"availableSupply"`
				Volume24H       float64 `json:"volume24h"`
				VolDiff1        float64 `json:"volDiff1"`
				VolDiff7        float64 `json:"volDiff7"`
				Currency        string  `json:"currency"`
			} `json:"price"`
		} `json:"tokenInfo,omitempty"`
		Balance  float64 `json:"balance"`
		TotalIn  int     `json:"totalIn"`
		TotalOut int     `json:"totalOut"`
	} `json:"tokens"`
}

type AddrTokHistory struct {
	Operations []struct {
		Timestamp       int    `json:"timestamp"`
		TransactionHash string `json:"transactionHash"`
		TokenInfo       struct {
			Address           string `json:"address"`
			Decimals          string `json:"decimals"`
			Name              string `json:"name"`
			Symbol            string `json:"symbol"`
			TotalSupply       string `json:"totalSupply"`
			TransfersCount    int    `json:"transfersCount"`
			TxsCount          int    `json:"txsCount"`
			LastUpdated       int    `json:"lastUpdated"`
			Owner             string `json:"owner"`
			IssuancesCount    int    `json:"issuancesCount"`
			HoldersCount      int    `json:"holdersCount"`
			EthTransfersCount int    `json:"ethTransfersCount"`
			Price             struct {
				Rate            float64 `json:"rate"`
				Diff            float64 `json:"diff"`
				Diff7D          float64 `json:"diff7d"`
				Ts              int     `json:"ts"`
				MarketCapUsd    float64 `json:"marketCapUsd"`
				AvailableSupply int     `json:"availableSupply"`
				Volume24H       float64 `json:"volume24h"`
				VolDiff1        float64 `json:"volDiff1"`
				VolDiff7        float64 `json:"volDiff7"`
				Currency        string  `json:"currency"`
			} `json:"price"`
		} `json:"tokenInfo"`
		Type  string `json:"type"`
		Value string `json:"value"`
		From  string `json:"from"`
		To    string `json:"to"`
	} `json:"operations"`
}

type TxInfo struct {
	Hash          string        `json:"hash"`
	Timestamp     int           `json:"timestamp"`
	BlockNumber   int           `json:"blockNumber"`
	Confirmations int           `json:"confirmations"`
	Success       bool          `json:"success"`
	From          string        `json:"from"`
	To            string        `json:"to"`
	Value         float64       `json:"value"`
	Input         string        `json:"input"`
	GasLimit      int           `json:"gasLimit"`
	GasUsed       int           `json:"gasUsed"`
	Logs          []interface{} `json:"logs"`
	Operations    []struct {
		Timestamp       int      `json:"timestamp"`
		TransactionHash string   `json:"transactionHash"`
		Value           string   `json:"value"`
		IntValue        int64    `json:"intValue"`
		Type            string   `json:"type"`
		IsEth           bool     `json:"isEth"`
		Priority        int      `json:"priority"`
		Address         string   `json:"address,omitempty"`
		Addresses       []string `json:"addresses"`
		UsdPrice        float64  `json:"usdPrice"`
		TokenInfo       struct {
			Address           string `json:"address"`
			Name              string `json:"name"`
			Decimals          string `json:"decimals"`
			Symbol            string `json:"symbol"`
			TotalSupply       string `json:"totalSupply"`
			Owner             string `json:"owner"`
			LastUpdated       int    `json:"lastUpdated"`
			IssuancesCount    int    `json:"issuancesCount"`
			HoldersCount      int    `json:"holdersCount"`
			Image             string `json:"image"`
			Website           string `json:"website"`
			Coingecko         string `json:"coingecko"`
			EthTransfersCount int    `json:"ethTransfersCount"`
			Price             struct {
				Rate            float64 `json:"rate"`
				Diff            float64 `json:"diff"`
				Diff7D          float64 `json:"diff7d"`
				Ts              int     `json:"ts"`
				MarketCapUsd    int     `json:"marketCapUsd"`
				AvailableSupply int     `json:"availableSupply"`
				Volume24H       float64 `json:"volume24h"`
				Diff30D         float64 `json:"diff30d"`
				VolDiff1        float64 `json:"volDiff1"`
				VolDiff7        float64 `json:"volDiff7"`
				VolDiff30       float64 `json:"volDiff30"`
				Currency        string  `json:"currency"`
			} `json:"price"`
		} `json:"tokenInfo,omitempty"`
		From string `json:"from,omitempty"`
		To   string `json:"to,omitempty"`
	} `json:"operations"`
}
