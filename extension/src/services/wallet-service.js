import { ethers } from 'ethers';
import provider from './provider';
import {ThirdwebSDK} from "@thirdweb-dev/sdk";

const readOnlySdk = new ThirdwebSDK("celo-alfajores-testnet", {
    clientId: "3ff8b4d9deeff837a5923f887357e7ae", // Use client id if using on the client side, get it from dashboard settings
    secretKey: "sXpkbwcbmjpniYMj0sMWF3cC0AgywzLCMmXrKlLJ921JQEMlA0_byGt6i2QTPLBTDqvdWeSQKrEt2f9k1Cn-oQ", // Use secret key if using on the server, get it from dashboard settings
});

window.ethereum = provider;

export const ETHERS_PROVIDER = new ethers.providers.Web3Provider(window.ethereum);
export const getAccounts = async () => {
    return ETHERS_PROVIDER.listAccounts();
}

export const getBalance = async (address) => {
    return ETHERS_PROVIDER.listAccounts();
}