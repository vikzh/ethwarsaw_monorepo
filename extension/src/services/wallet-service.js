import { ethers } from 'ethers';
import provider from './provider';
window.ethereum = provider;

export const ETHERS_PROVIDER = new ethers.providers.Web3Provider(window.ethereum);
export const getAccounts = async () => {
    return ETHERS_PROVIDER.listAccounts();
}

export const getBalance = async (address) => {
    return ETHERS_PROVIDER.listAccounts();
}