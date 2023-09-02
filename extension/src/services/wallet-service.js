import { ethers } from 'ethers';
import provider from './provider';
window.ethereum = provider;

const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
export const getAccounts = async () => {
    return ethersProvider.listAccounts();
}

export const getBalance = async (address) => {
    return ethersProvider.listAccounts();
}