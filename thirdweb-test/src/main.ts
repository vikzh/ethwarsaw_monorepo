import 'dotenv/config'
import { LocalWallet, SmartWallet, SmartWalletConfig } from '@thirdweb-dev/wallets'
import { CeloAlfajoresTestnet } from '@thirdweb-dev/chains'
import { ThirdwebSDK } from '@thirdweb-dev/sdk'

async function thirdWebTest() {
  // First, connect the personal wallet, which can be any wallet (metamask, walletconnect, etc.)
  // Here we're just generating a new local wallet which can be saved later
  const personalWallet = new LocalWallet()
  await personalWallet.generate()

  // Setup the Smart Wallet configuration
  const config: SmartWalletConfig = {
    chain: CeloAlfajoresTestnet, // the chain where your smart wallet will be or is deployed
    factoryAddress: '0x701E6319B338bbFf4F08F1e238b893E5c8763080', // your own deployed account factory address
    clientId: '3ff8b4d9deeff837a5923f887357e7ae', // Use client id if using on the client side, get it from dashboard settings
    secretKey: 'sXpkbwcbmjpniYMj0sMWF3cC0AgywzLCMmXrKlLJ921JQEMlA0_byGt6i2QTPLBTDqvdWeSQKrEt2f9k1Cn-oQ', // Use secret key if using on the server, get it from dashboard settings
    gasless: true, // enable or disable gasless transactions
  }

  // Then, connect the Smart wallet
  const wallet = new SmartWallet(config)
  await wallet.connect({
    personalWallet,
  })

  // You can then use this wallet to perform transactions via the SDK
  const sdk = await ThirdwebSDK.fromWallet(wallet, CeloAlfajoresTestnet)
}

async function main() {
  await thirdWebTest()
}

;(async () => {
  try {
    await main()
  } catch (e) {}
})()
