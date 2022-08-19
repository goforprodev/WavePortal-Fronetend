import React,{useState,useEffect} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"
import Loader from "./Loader.jsx"

export default function App() {

  const [currentAcc,setCurrentAcc] = useState("")
  const [isLoading,setIsLoading] = useState(false)
  const [waveCount,setCount] = useState(0)
  const [isDisabled,setDisabled] = useState(false)
  const [loadText,setLoadText] = useState("")
  const [allWaves,setAllWaves]= useState([])
  const [message,setMessage]= useState("")
  
  const contractAddress ="0x63d43a74367C1258F6c8dF7f67Da29e2F74eBcC4"
  const contractABI = abi.abi 

  // get all waves function
  const getAllWaves = async() => {
    try {
      const {ethereum} = window

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress,contractABI,signer)

        // get all waves
        let waves = await wavePortalContract.getAllWaves()
        let count = await wavePortalContract.getTotalWaves()

        setCount(count.toNumber())
        //cleanup waves
        
        let waveCleaned = []
        waves.forEach(wave => {
          waveCleaned.push({
            address:wave.from,
            timestamp:new Date(wave.timestamp * 1000),
            message:wave.message
          })
        })

        setAllWaves(waveCleaned)
      }else{
        console.log("Ethereum object does not exist")
      }
    } catch (error) {
      console.log(error.message)
    }
  }
  // check if wallet is connected
  const checkIfWalletIsConnected = async () => {
    try{
      const {ethereum} = window

      if(!ethereum){
        console.log("make sure you have metamask!")
      }else{
        console.log("Here is the ethereum object :)",ethereum)
      }  

      const accounts = await ethereum.request({ method: "eth_accounts" })
      if(accounts.length > 0){
        const account = accounts[0]
        console.log(accounts)
        setCurrentAcc(account)
        
        getAllWaves()
        
      }else{
        console.log("Auth failed")
      }
      
    }catch(err){
      console.log(err.message)
    }
    }
  //connect wallet function
  const connectWallet = async () => {
    try{
      
      const {ethereum} = window
      if(!ethereum){
        alert("Download Metamask")
        return
      }

      const accounts = await ethereum.request({method:"eth_requestAccounts"})
      console.log("connected 😊",accounts[0])
      setCurrentAcc(accounts[0])
    }catch(err){
      console.log(err.message)
    }
  }
  // wave function
  const wave = async () => {
    try {
      const {ethereum} = window
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalAddress = new ethers.Contract(contractAddress, contractABI, signer)
        let count = await wavePortalAddress.getTotalWaves()
        
        // console.log("Total waves :",count.toNumber())

        // Connecting the actual wave
        let waveTxn;
        if(message !== ""){
        setDisabled(true)
        setIsLoading(true)
        setMessage("")
         waveTxn = await wavePortalAddress.wave(message)
        }else{
          alert("Send A Message 🤗")
          return;
        }
        //since we are running a function/transaction here we wait for git to mine
        console.log("Minnig...",waveTxn.hash)
        setLoadText("Mining...")

        await waveTxn.wait()
        console.log("Mined...",waveTxn.hash)
        setIsLoading(false)
        setLoadText("Mined...")
        
        

        count = await wavePortalAddress.getTotalWaves()
        console.log("Total waves recieved",count.toNumber())
        setCount(count.toNumber())
        setDisabled(false)
        getAllWaves()
  
      }else{
        Alert("Connect to your metamask first!")
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()

  },[])
  return (
    <div className="mainContainer">
     {isLoading && <Loader text={loadText} />}
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am Promise and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>

      <div className="dataContainer" style={{marginTop:"1em"}}>
        <label for="message">Enter Message *</label>
        <textarea name="message" placeholder="Send me a message..." rows="5" value={message} onChange={(e) => setMessage(e.target.value)} important />
      </div>

        <button className="waveButton" disabled={isDisabled} onClick={wave}>
          Wave at Me
        </button>
        {!currentAcc && <button className="waveButton" onClick={connectWallet}>Connect Wallet</button>}

        <div className="aside">
        <div className="total__waves">👋{waveCount}</div>
        {currentAcc && <div className="address">{currentAcc}</div>}  
        
        </div>

        <div className="scrollabe__container">
           {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
        </div>
        
      </div>
    </div>
  );
}
