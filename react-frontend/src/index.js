import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {APIKEY} from './data.js'
import { Loader, Flex, Text} from 'rimble-ui';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import Box from '@material-ui/core/Box';
import { styled } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import NativeSelect from '@material-ui/core/NativeSelect';
/*import { ERC20TokenContract } from '@0x/contract-wrappers';
import { BigNumber } from '@0x/utils';*/


const fetch = require('/mnt/d/UbuntuHome/projects/FUDUMP/node_modules/node-fetch');
const Web3 = require("web3");
const MyTypography = styled (Typography)({
  background: 'rgb(34,193,195)',
  border: 0,
  borderRadius: 3,
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  height: 24,
  padding: '0 30px',
  width: '50%',
});

function waitForWallet(idx) {
  return ((
    <div key={idx}>
    <Loader size={"3em"} mr={[0, 3]} mb={[2, 0]} />
    <Flex flexDirection="column" alignItems={["center", "flex-start"]}>
      <Text fontWeight={4}>Waiting for connection confirmation...</Text>
      <Text fontWeight={2}>This won’t cost you any Ether</Text>
    </Flex>
    </div>));
}

function walletAsset(idx, inputObj, cb) {
  return (
  <div key={idx}>
    <MyTypography>{inputObj.tokenSymbol}</MyTypography>
    <MyTypography>{inputObj.percentChange + "%"}</MyTypography>
    <MyTypography>{String((inputObj.value/100) * inputObj.balance)}</MyTypography>
    <Box  width="50%">
    <Slider
    value={inputObj.value}
    valueLabelDisplay="off"
    step={5}
    min={0}
    max={100}
    marks
    onChange={(e, val) => cb(inputObj.name, e, val)}/>
    </Box>
  </div>
  );
}

function selectDUMP(idx, newValue, cb) {
  return(
    <div key={idx}>
    <FormControl>
        <InputLabel htmlFor="select-coin">Select Coin</InputLabel>
        <NativeSelect
          id="select-coin"
          value={newValue}
          onChange={cb}
        >
          <option aria-label="None" value="" />
          <option value='USDC'>USD Coin</option>
          <option value='DAI'>Dai</option>
          <option value='TUSD'>TrueUSD</option>
        </NativeSelect>
    </FormControl>
    <br/>
    </div>
  );
}

class MasterForm extends React.Component {
  constructor(props) {
    super(props);
    this.walletUrl = 'http://localhost:1234/GETWALLET/';
    this.stableUrl = 'http://localhost:1234/GETQUOTE/';
    this.apiKey = APIKEY;

    this.handleSliderChange = this.handleSliderChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.connectMetaMask = this.connectMetaMask.bind(this);
    this.generateWalletDisplay = this.generateWalletDisplay.bind(this);

    this.state = {
      displayKeys: ['waitLoading'],
      waitLoading: {
        type: "MetaMaskWait"
      },
      walletAddress: ''
    };
    this.connectMetaMask();
  }

  async connectMetaMask() {
    window.web3 = new Web3(window.web3.currentProvider);
    await window.ethereum.enable();
    fetch(this.walletUrl + '?walletAddress=' + window.web3.currentProvider.selectedAddress + '&apiKey=' + this.apiKey).then(res => {return res.json()}).then(jsresult => this.generateWalletDisplay(jsresult));
    this.setState({walletAddress: window.web3.currentProvider.selectedAddress});
  }

  generateWalletDisplay(walletAssets) {
    let newState = {};
    let currBalance;
    newState['displayKeys'] = [];
    for (let key of Object.keys(walletAssets)) {
      currBalance = walletAssets[key].Balance / Math.pow(10, walletAssets[key].Decimals);
      newState[key] = {
        type: "WalletAsset",
        name: String(key),
        balance: currBalance,
        value: 100,
        originalBalance: walletAssets[key].Balance,
        tokenName: String(key),
        tokenSymbol: walletAssets[key].Symbol,
        tokenAddress: walletAssets[key].Address,
        percentChange: walletAssets[key].PercentChange
      };
      newState['displayKeys'].push(key);
    }
    newState['displayKeys'].push('Select');
    newState['displayKeys'].push('Button');
    newState['Button'] = {
      type: 'Button'
    };
    newState['Select'] = {
      type: 'Select',
      value: ''
    };
    this.setState(newState);
  }

  handleSliderChange(name, _, value) {
    if(value == null) {
      return;
    }
    let currEvent = this.state[name];
    currEvent.value = value;
    this.setState({[name]: currEvent});
  }

  handleSelectChange(event) {
    if(event.target.value == null) {
      return;
    }
    let currEvent = this.state['Select'];
    currEvent.value = event.target.value;
    this.setState({Select: currEvent});
  }

  handleSubmit(event) {
    event.preventDefault();
    let promises = [];
    //let contract, approvalTxData;
    for (let key of this.state.displayKeys) {
      if(this.state[key].type === "WalletAsset") {
        if(this.state[key].value !== 0) {
          promises.push(fetch(this.stableUrl + '?buyToken=' + this.state.Select.value + '&sellToken=' + this.state[key].tokenAddress + '&sellAmount=' + (this.state[key].originalBalance * this.state[key].value / 100)).then(res => {return res.json()}));
        }
      }
    }
    Promise.all(promises).then((values) => {
      for(let transaction of values) {
        /*contract = new ERC20TokenContract(transaction.sellTokenAddress, window.web3.eth.currentProvider);
        approvalTxData = contract.approve(transaction.allowanceTarget, new BigNumber(transaction.sellAmount)).getABIEncodedTransactionData();
        await window.web3.eth.sendTransaction(approvalTxData);
        await window.web3.eth.sendTransaction(transaction);*/
        console.log(transaction);
      }
    });
  }

  renderInput(inputObj, idx) {
    let newInput;
    if(inputObj.type === "MetaMaskWait") {
      newInput = waitForWallet(idx);
    } else if(inputObj.type === "WalletAsset") {
      newInput = walletAsset(idx, inputObj, this.handleSliderChange);
    } else if(inputObj.type === "Button") {
      newInput = (<Button key={idx} variant="contained" color="secondary" onClick={this.handleSubmit}>
      Submit Transactions
      </Button>);
    } else if(inputObj.type === "Select") {
      newInput = selectDUMP(idx, inputObj.value, this.handleSelectChange);
    }
    return newInput;
  }

  render() {
    let currFields = [];
    let ct = 0;
    this.state.displayKeys.forEach( key => {
      currFields.push(this.renderInput(this.state[key], ct++));
    });
    return (
            currFields
    );
  }
}

ReactDOM.render(
  <MasterForm />,
  document.getElementById('root')
);