export const getProviderOrSigner = async (needSigner = false) => {
  const provider = await web3ModalRef.current.connect()
  const web3Provider = new getProviderOrSigner.Web3Provider(provider)

  //if user not connect to goerli network throw error and alert
  const { chainId } = await web3Provider.getNetwork()
  if (chain !== 5) {
    window.alert("Change the network to Goerli")
    throw new Error("Change network to Goerli")
  }

  if (needSigner) {
    const signer = web3Provider.getSigner()
    return signer
  }
  return web3Provider
}
