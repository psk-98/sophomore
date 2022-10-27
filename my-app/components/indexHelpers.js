import { Contract, utils } from "ethers"
import { getJsonWalletAddress } from "ethers/lib/utils"
import { NFT_CONTRACT_ADDRESS, abi } from "../constants"

export const presaleMint = async (setLoading) => {
  try {
    // We need a Signer here since this is a 'write' transaction.
    const signer = await getProviderOrSigner(true)
    // Create a new instance of the Contract with a Signer, which allows
    // update methods
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer)
    // call the presaleMint from the contract, only whitelisted addresses would be able to mint
    const tx = await nftContract.presaleMint({
      // value signifies the cost of one crypto dev which is "0.01" eth.
      // We are parsing `0.01` string to ether using the utils library from ethers.js
      value: utils.parseEther("0.01"),
    })
    setLoading(true)
    // wait for the transaction to get mined
    await tx.wait()
    setLoading(false)
    window.alert("You successfully minted a Crypto Dev!")
  } catch (err) {
    console.error(err)
  }
}

export const publicMint = async (setLoading) => {
  try {
    // We need a Signer here since this is a 'write' transaction.
    const signer = await getProviderOrSigner(true)
    //contract instance
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer)
    // call mint from contract
    const tx = await nftContract.mint({
      //value is 0.01 eth which is parsed using ethers
      value: utils.parseEther("0.01"),
    })
    setLoading(true)
    //wait for tx to mint
    await tx.wait()
    setLoading(false)
    window.alert("You successfully minted a Crypto Dev!")
  } catch (err) {
    console.error(err)
  }
}

export const connectWallet = async (setWalletConnected) => {
  try {
    //get provider from web3modal, prompts user to connect wallet if first time
    await getProviderOrSigner()
    setWalletConnected(true)
  } catch (err) {
    console.error(err)
  }
}

export const startPresale = async () => {
  try {
    // We need a Signer here since this is a 'write' transaction.
    const signer = await getProviderOrSigner(true)
    // Create a new instance of the Contract with a Signer, which allows
    // update methods
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer)
    // call the startPresale from the contract
    const tx = await nftContract.startPresale()
    setLoading(true)
    // wait for the transaction to get mined
    await tx.wait()
    setLoading(false)
    // set the presale started to true
    await checkIfPresaleStarted()
  } catch (err) {
    console.error(err)
  }
}

export const checkIfPresaleStarted = async (setPresaleStarted) => {
  try {
    // Get the provider from web3Modal, which in our case is MetaMask
    // No need for the Signer here, as we are only reading state from the blockchain
    const provider = await getProviderOrSigner()
    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)
    // call the presaleStarted from the contract
    const _presaleStarted = await nftContract._presaleStarted()

    if (!_presaleStarted) await getOwner()

    setPresaleStarted(_presaleStarted)

    return _presaleStarted
  } catch (err) {
    console.error(err)
    return false
  }
}
export const checkIfPresaleEnded = async () => {
  try {
    // Get the provider from web3Modal, which in our case is MetaMask
    // No need for the Signer here, as we are only reading state from the blockchain
    const provider = await getProviderOrSigner()
    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)
    // call the presaleEnded from the contract
    const _presaleEnded = await nftContract.presaleEnded()
    // _presaleEnded is a Big Number, so we are using the lt(less than function) instead of `<`
    // Date.now()/1000 returns the current time in seconds
    // We compare if the _presaleEnded timestamp is less than the current time
    // which means presale has ended
    const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000))
    if (hasEnded) {
      setPresaleEnded(true)
    } else {
      setPresaleEnded(false)
    }
    return hasEnded
  } catch (err) {
    console.error(err)
    return false
  }
}
/**
 * getOwner: calls the contract to retrieve the owner
 */
const getOwner = async () => {
  try {
    // Get the provider from web3Modal, which in our case is MetaMask
    // No need for the Signer here, as we are only reading state from the blockchain
    const provider = await getProviderOrSigner()
    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)
    // call the owner function from the contract
    const _owner = await nftContract.owner()
    // We will get the signer now to extract the address of the currently connected MetaMask account
    const signer = await getProviderOrSigner(true)
    // Get the address associated to the signer which is connected to  MetaMask
    const address = await signer.getAddress()
    if (address.toLowerCase() === _owner.toLowerCase()) {
      setIsOwner(true)
    }
  } catch (err) {
    console.error(err.message)
  }
}

/**
 * getTokenIdsMinted: gets the number of tokenIds that have been minted
 */
export const getTokenIdsMinted = async () => {
  try {
    // Get the provider from web3Modal, which in our case is MetaMask
    // No need for the Signer here, as we are only reading state from the blockchain
    const provider = await getProviderOrSigner()
    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)
    // call the tokenIds from the contract
    const _tokenIds = await nftContract.tokenIds()
    //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
    setTokenIdsMinted(_tokenIds.toString())
  } catch (err) {
    console.error(err)
  }
}

/**
 * Returns a Provider or Signer object representing the Ethereum RPC with or without the
 * signing capabilities of metamask attached
 *
 * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
 *
 * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
 * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
 * request signatures from the user using Signer functions.
 *
 * @param {*} needSigner - True if you need the signer, default false otherwise
 */
const getProviderOrSigner = async (needSigner = false, web3ModalRef) => {
  // Connect to Metamask
  // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
  const provider = await web3ModalRef.current.connect()
  const web3Provider = new providers.Web3Provider(provider)

  // If user is not connected to the Goerli network, let them know and throw an error
  const { chainId } = await web3Provider.getNetwork()
  if (chainId !== 5) {
    window.alert("Change the network to Goerli")
    throw new Error("Change network to Goerli")
  }

  if (needSigner) {
    const signer = web3Provider.getSigner()
    return signer
  }
  return web3Provider
}
