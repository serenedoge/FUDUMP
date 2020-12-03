import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
const fetch = require('/mnt/d/UbuntuHome/projects/FUDUMP/node_modules/node-fetch');

function TextInput(props) {
  return (
    <div>
        <label>
        {props.staticText}
        <input
          className={props.className}
          type="text"
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
        />
        </label>
        <br />
    </div>
  );
}

function NumericInput(props) {
  return (
    <div>
        <label>
        {props.staticText}
        <input
          className={props.className}
          type="number"
          value={props.value}
          onChange={props.onChange}
          min={props.min}
          max={props.max}
        />
        </label>
        <br />
    </div>
  );
}

class MasterForm extends React.Component {
  constructor(props) {
    super(props);
    this.serverUrl = 'http://localhost:1234/';

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      displayKeys: ['walletAddress', 'apiKey'],
      walletAddress: {
        className: "walletAddress",
        type: "text",
        placeholder: "Input Wallet Address",
        value: "",
        staticText: ""
      },
      apiKey: {
        className: "apiKey",
        type: "text",
        placeholder: "Input API Key",
        value: "",
        staticText: ""
      },
      stage: 1,
      clickedSubmit: false
    };
  }

  generateWalletDisplay(walletAssets) {
    alert(walletAssets);
    let newState = {};
    newState['displayKeys'] = [];
    newState['stage'] = 2;
    newState['clickedSubmit'] = false;
    for (let key of Object.keys(walletAssets)) {
      newState[key] = {
        className: String(key),
        type: "number",
        value: walletAssets[key].Balance / Math.pow(10, walletAssets[key].Decimals),
        staticText: String(key) + "(" + walletAssets[key].Symbol + "), CurrEthPrice = " + walletAssets[key].CurrEthPrice + ", BoughtEthPrice = " + walletAssets[key].BoughtEthPrice + ": ",
        min: 0,
        max: walletAssets[key].Balance / Math.pow(10, walletAssets[key].Decimals)
      };
      newState['displayKeys'].push(key);
    }
    this.setState(newState);
  }

  handleChange(event) {
    let currEvent = this.state[event.target.className];
    currEvent.value = event.target.value;
    this.setState({[event.target.className]: currEvent});
  }

  handleSubmit(event) {
    event.preventDefault();
    
    if(this.state.clickedSubmit) {
      return;
    }

    if(this.state.stage === 1) {
      this.setState({clickedSubmit: true});
      fetch(this.serverUrl + '?walletAddress=' + this.state.walletAddress.value + '&apiKey=' + this.state.apiKey.value).then(res => {return res.json()}).then(jsresult => this.generateWalletDisplay(jsresult));
    }
  }

  renderInput(inputObj, idx) {
    let newInput;
    
    if(inputObj.type === "text") {
      newInput = (
      <TextInput key={idx}
      className={inputObj.className}
      placeholder={inputObj.placeholder}
      value={inputObj.value}
      staticText={inputObj.staticText}
      onChange={this.handleChange}
      />);
    } else if(inputObj.type === "number") {
        newInput = (
        <NumericInput key={idx}
        className={inputObj.className}
        value={inputObj.value}
        staticText={inputObj.staticText}
        onChange={this.handleChange}
        min={inputObj.min}
        max={inputObj.max}
        />);
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
      <form onSubmit={this.handleSubmit} key="Form">
          {
            currFields
          }
        <input type="submit" value="Submit"/>
      </form>
    );
  }
}

ReactDOM.render(
  <MasterForm />,
  document.getElementById('root')
);