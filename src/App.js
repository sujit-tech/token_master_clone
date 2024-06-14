import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Sort from './components/Sort'
import Card from './components/Card'
import SeatChart from './components/SeatChart'

// ABIs
import TokenMaster from './abis/TokenMaster.json'

// Config
import config from './config.json'

function App() {
  const [account,setAccount] = useState(null)
  const [provider,setProvider] = useState(null)
  const [tokenMaster,setTokenMaster] = useState(null)
  const [occasions,setOccasions] = useState([])
  const [occasion,setOccasion] = useState([])
  const [toggle,setToggle] = useState(false)


  const loadBlockchainData  =async()=>{
    const provider = new ethers.providers.Web3Provider(window.ethereum) // <-- it set the provider to set the connection your app with the blockchain
    setProvider(provider)
    const network = await provider.getNetwork()
    const address = config[network.chainId].TokenMaster.address
    const tokenMaster = new ethers.Contract(address,TokenMaster,provider) // <-- load the contract to intect with the web app
    setTokenMaster(tokenMaster)
    const totalOccastion = await tokenMaster.totalOccasions()
    const occasions = []
    for(var i = 1; i<=totalOccastion;i++){
      let occasion = await tokenMaster.getOccasion(i)
      occasions.push(occasion)
    }    
    setOccasions(occasions)
    window.ethereum.on('accountsChanged',async()=>{
      const accounts = await window.ethereum.request({method :'eth_requestAccounts'}) // <-- it gets the account from the metamask
      const account =  ethers.utils.getAddress(accounts[0])
      setAccount(account)
    })
  }
  useEffect(()=>{
    loadBlockchainData()
  },[])
  return (
    <div>
      <header>
        <Navigation account={account} setAccount={setAccount} />
        <h2 className="header__title"><strong>Event </strong>Tickets</h2>
      </header>
      <Sort />
      <div className='cards'>
        {occasions.map((occasion,index) =>(
          <Card occasion={occasion} id={index+1} tokenMaster={tokenMaster} provider={provider}
           account={account} toggle={toggle} setToggle={setToggle} setOccasion={setOccasion} key={index}/>
        ))}
      </div>
      {toggle && (<SeatChart 
      occasion={occasion} tokenMaster={tokenMaster} provider={provider} setToggle={setToggle}/>
      )}
    </div>
  );
}

export default App;