import {Contract, ethers, Wallet} from 'ethers';
import provider from './provider';
import {isContractDeployed, ThirdwebSDK, Transaction} from "@thirdweb-dev/sdk";
import {CELO_CHAIN, FACTORY_ADDRESS} from "./constants";
import {LocalWallet, SmartWallet} from "@thirdweb-dev/wallets";
import { ACCOUNT_ABI, FACTORY_ABI } from './abi'
window.Buffer = window.Buffer || require("buffer").Buffer;

const pimlicoEndpoint = `https://api.pimlico.io/v1/celo-alfajores-testnet/rpc?apikey=53ae92ce-73fa-4793-9f5c-42a411571df5`

const sdk = new ThirdwebSDK(CELO_CHAIN, {
    clientId: "3ff8b4d9deeff837a5923f887357e7ae", // Use client id if using on the client side, get it from dashboard settings
    // readonlySettings: {
    //     rpcUrl: pimlicoEndpoint,
    // }
});

//todo it must be done in onload
window.ethereum = provider;

export const ETHERS_PROVIDER = new ethers.providers.Web3Provider(window.ethereum);

function createSmartWallet() {
    ETHERS_PROVIDER.getBlockNumber().then((blockNumber) => {
        console.log('blockNumber', blockNumber);
    });
    const config = {
        chain: CELO_CHAIN, // the chain where your smart wallet will be or is deployed
        factoryAddress: FACTORY_ADDRESS, // your own deployed account factory address
        clientId: '3ff8b4d9deeff837a5923f887357e7ae', // Use client id if using on the client side, get it from dashboard settings
        // secretKey: 'sXpkbwcbmjpniYMj0sMWF3cC0AgywzLCMmXrKlLJ921JQEMlA0_byGt6i2QTPLBTDqvdWeSQKrEt2f9k1Cn-oQ', // Use secret key if using on the server, get it from dashboard settings
        gasless: false, // enable or disable gasless transactions
    }

    // Then, connect the Smart wallet
    return new SmartWallet(config)
}
async function getWalletAddressForUser(username) {
    const factory = await sdk.getContract(FACTORY_ADDRESS, FACTORY_ABI)
    return await factory.call('accountOfUsername', [username])
}

let flaga = false;
export async function connectToSmartWallet(username, pwd) {
    if (!flaga) {
        flaga = true;
        // todo it should work later
        // const smartWalletAddress = await getWalletAddressForUser(sdk, username)
        // const isDeployed = await isContractDeployed(smartWalletAddress, sdk.getProvider())
        const smartWalletAddress= localStorage.getItem(username);
        const smartWallet = createSmartWallet()
        const personalWallet = new LocalWallet()
        // if (isDeployed) {
        if (smartWalletAddress) {
            // download encrypted wallet from IPFS
            // const contract = await sdk.getContract(smartWalletAddress)
            // const metadata = await contract.metadata.get()
            // console.log('Fetching wallet for', metadata)
            // const encryptedWallet = metadata.encryptedWallet
            // if (!encryptedWallet) {
            //     throw new Error('No encrypted wallet found')
            // }
            // await new Promise(resolve => setTimeout(resolve, 300))
            const encryptedWallet = localStorage.getItem(`${username}_wallet`);
            await personalWallet.import({
                encryptedJson: encryptedWallet,
                password: pwd,
            })
            await smartWallet.connect({
                personalWallet,
            })
            console.log('read it bro old');
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
            console.log('encrypted wallet uri', encryptedWalletUri);

            // this will deploy the smart wallet and register the username
            const signer = new Wallet('ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', ETHERS_PROVIDER);
            const abi = [
                'function createAccount(address, bytes calldata) returns (address)',
                'function getAccountsOfSigner(address) view returns (address[] memory accounts)',
                'function register(string calldata,string calldata)',
            ]
            const cfactoryContract = new Contract(FACTORY_ADDRESS, abi, signer);
            const address = await personalWallet.getAddress();
            const tx = await cfactoryContract.createAccount(address, ethers.utils.toUtf8Bytes("asdf"));
            await tx.wait();
            //sleep for 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));
            const value =  await cfactoryContract.getAccountsOfSigner(address);
            console.log('CREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEATED ACCOUNT', value[0]);
            // console.log('address of username', value[0], encryptedWalletUri);
            // console.log('did it bro new');
            localStorage.setItem(username, value[0]);
            localStorage.setItem(`${username}_wallet`, encryptedWallet);
        }
    }
}

export const getBalance = async (address) => {
    return ETHERS_PROVIDER.listAccounts();
}