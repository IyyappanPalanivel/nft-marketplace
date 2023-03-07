import './App.css';
import { ethers } from 'ethers';
import { useState } from 'react';
import MarketplaceAddress from '../contractsData/MarketPlace-address.json'
import MarketplaceAbi from '../contractsData/Marketplace.json'
import NFTAddress from '../contractsData/NFT-address.json'
import NFTAbi from '../contractsData/NFT.json'
import Navigation from './Navbar';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MyPurchases from './MyPurchases';
import MyListedItems from './MyListedItems';
import Create from './Create';
import Home from './Home';
import { Spinner } from 'react-bootstrap';

function App() {

  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [marketplace, setMarketplace] = useState(null)
  const [nft, setNFT] = useState(null)

  //MetaMask Login/Connect 
  const web3Handler = async () => {

    if(window.ethereum){
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0])
      // Get provider from Metamask
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      // Set signer
      const signer = provider.getSigner()
  
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      })
  
      window.ethereum.on('accountsChanged', async function (accounts) {
        setAccount(accounts[0])
        await web3Handler()
      })
      loadContracts(signer)
    }else{
      alert('Install MetaMask Wallet')
    }
  }

  const loadContracts = (signer) => {
    // Get deployed copies of contracts
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer)
    setMarketplace(marketplace)
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
    setNFT(nft)
    setLoading(false)
  }

  return (

    <BrowserRouter>
      <div className="App">
        <Navigation web3Handler={web3Handler} account={account} />
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Spinner animation="border" style={{ display: 'flex' }} />
            <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={
              <Home />
            } />
            <Route path="/create" element={
              <Create />
            } />
            <Route path="/my-listed-items" element={
              <MyListedItems />
            } />
            <Route path="/my-purchases" element={
              <MyPurchases />
            } />
          </Routes>
        )}
      </div>
    </BrowserRouter>

  );
}

export default App;
