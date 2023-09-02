import 'dotenv/config'
import { LocalWallet, SmartWallet, SmartWalletConfig } from '@thirdweb-dev/wallets'
import { CeloAlfajoresTestnet } from '@thirdweb-dev/chains'
import { ThirdwebSDK, Transaction, isContractDeployed } from '@thirdweb-dev/sdk'
import { ACCOUNT_ABI, FACTORY_ABI } from './abi'

const FACTORY_ADDRESS = '0x701E6319B338bbFf4F08F1e238b893E5c8763080'
const USER = 'testuser'
const PASSWORD = 'testpassword'

async function thirdWebTest() {
  const sdk = new ThirdwebSDK(CeloAlfajoresTestnet, {
    clientId: '3ff8b4d9deeff837a5923f887357e7ae',
  })
  await connectToSmartWallet(sdk, USER, PASSWORD)
  // You can then use this wallet to perform transactions via the SD
  console.log('Wallet address:', await sdk.wallet.getAddress())
}

async function getWalletAddressForUser(sdk: ThirdwebSDK, username: string): Promise<string> {
  const factory = await sdk.getContract(FACTORY_ADDRESS, FACTORY_ABI)
  const smartWalletAddress: string = await factory.call('accountOfUsername', [username])
  return smartWalletAddress
}
function createSmartWallet(): SmartWallet {
  const config: SmartWalletConfig = {
    chain: CeloAlfajoresTestnet, // the chain where your smart wallet will be or is deployed
    factoryAddress: FACTORY_ADDRESS, // your own deployed account factory address
    clientId: '3ff8b4d9deeff837a5923f887357e7ae', // Use client id if using on the client side, get it from dashboard settings
    secretKey: 'sXpkbwcbmjpniYMj0sMWF3cC0AgywzLCMmXrKlLJ921JQEMlA0_byGt6i2QTPLBTDqvdWeSQKrEt2f9k1Cn-oQ', // Use secret key if using on the server, get it from dashboard settings
    gasless: true, // enable or disable gasless transactions
  }

  // Then, connect the Smart wallet
  return new SmartWallet(config)
}

async function connectToSmartWallet(sdk: ThirdwebSDK, username: string, pwd: string) {
  const smartWalletAddress = await getWalletAddressForUser(sdk, username)
  const isDeployed = await isContractDeployed(smartWalletAddress, sdk.getProvider())

  const smartWallet = createSmartWallet()
  const personalWallet = new LocalWallet()

  if (isDeployed) {
    // CASE 2 - existing wallet - fetch metadata, decrypt, load local wallet, connect
    // download encrypted wallet from IPFS
    const contract = await sdk.getContract(smartWalletAddress)
    const metadata = await contract.metadata.get()
    console.log('Fetching wallet for', metadata.name)
    const encryptedWallet = metadata.encryptedWallet
    if (!encryptedWallet) {
      throw new Error('No encrypted wallet found')
    }
    await new Promise(resolve => setTimeout(resolve, 300))
    await personalWallet.import({
      encryptedJson: encryptedWallet,
      password: pwd,
    })
    await smartWallet.connect({
      personalWallet,
    })
  } else {
    // CASE 1 - fresh start - create local wallet, encrypt, connect, call register on account with username + metadata
    // generate local wallet
    await personalWallet.generate()
    // encrypt it
    const encryptedWallet = await personalWallet.export({
      strategy: 'encryptedJson',
      password: pwd,
    })

    await smartWallet.connect({
      personalWallet,
    })

    // register account
    // upload encrypted wallet to IPFS
    const encryptedWalletUri = await sdk.storage.upload({
      name: username,
      encryptedWallet,
    })

    // this will deploy the smart wallet and register the username
    await smartWallet.execute(
      await Transaction.fromContractInfo({
        contractAddress: await smartWallet.getAddress(),
        contractAbi: ACCOUNT_ABI,
        provider: sdk.getProvider(),
        signer: await personalWallet.getSigner(),
        method: 'register',
        args: [username, encryptedWalletUri],
        storage: sdk.storage,
      }),
    )
  }
}

async function main() {
  await thirdWebTest()
}

;(async () => {
  try {
    await main()
  } catch (e) {}
})()
