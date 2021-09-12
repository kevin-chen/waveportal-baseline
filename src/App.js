import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

export default function App() {

  const [currAccount, setCurrentAccount] = React.useState("");
  const contractAddress = "0xf71aCcaBCFb53A90562b0329f2B4B7efa0Ff328D"
  const contractABI = abi.abi;
  const [joke, setJoke] = React.useState("");
  const [waves, setWaves] = React.useState(0);
  const [allWaves, setAllWaves] = React.useState([]);

  async function getAllWaves() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let waves = await waveportalContract.getAllWaves();
    console.log(waves);

    let wavesCleaned = [];
    waves.forEach(wave => {
      wavesCleaned.push({
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message
      })
    });
    setAllWaves(wavesCleaned);
  }

  const checkIfWalletIsConnected = () => { 
    const { ethereum } = window; 
    if (!ethereum) {
      console.log("Make sure you have metamask!")
      return
    } 
    else {
      console.log("We have the ethereum object", ethereum)
      getAllWaves();
    }

    ethereum.request({ method: 'eth_accounts' })
    .then(accounts => {
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account: ", account)
        setCurrentAccount(account)
      }
      else {
        console.log("No authorized account found")
      }
    })
  }

  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Get metamask!")
    }

    ethereum.request({ method: 'eth_requestAccounts' })
    .then(accounts => {
      console.log("Connected", accounts[0])
      setCurrentAccount(accounts[0])
    })
    .catch(err => console.log(err));
  }

  React.useEffect(() => {
    checkIfWalletIsConnected();
    getTotalWaves();
  }, [])

  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer); // ABI = application binary interface

    let count = await waveportalContract.getTotalWaves()
    console.log("Retrieved total wave count...", count.toNumber())

    const waveTxn = await waveportalContract.wave(joke)
    console.log("Mining...", waveTxn.hash)
    await waveTxn.wait()
    console.log("Mined -- ", waveTxn.hash)

    count = await waveportalContract.getTotalWaves()
    setWaves(count.toNumber());
    console.log("Retreived total wave count...", waves)
  }

  const getTotalWaves = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer); // ABI = application binary interface


    let count = await waveportalContract.getTotalWaves()
    setWaves(count.toNumber());
    console.log("Retreived total wave count...", waves)
  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there! We got {waves} waves
        </div>

        <div className="bio">
        Hi there! Connect your Ethereum wallet and wave at me! Send your favorite deez nuts joke
        </div>

        <input id="joke" name="joke" type="text" value={joke} onChange={(event) => {
          setJoke(event.target.value);
        }}/>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        { currAccount ? null : (
          <button className="waveButton" onClick={connectWallet}> Connect Wallet </button>
        )}

        { allWaves.map((wave, index) => {
          return (
            <div style={{backgroundColor: "OldLace", marginTop: "16px", padding: "8px"}}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
