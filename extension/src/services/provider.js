import * as provider from 'eth-provider';
const ethProvider = provider('https://alfajores-forno.celo-testnet.org');

const funkcja = ethProvider.doSend;

const username = 'username very nice';
const DAO_FACTORY_ADDRESS = 'username very nice';
const DAO_FACTORY_ADDRESS_ABI = [
    '<abi>',
];

ethProvider.doSend = function (rawPayload, rawParams = [], targetChain = ethProvider.manualChainId, waitForConnection = true) {
    console.log('doSend bro', rawPayload);
    // needed for getSigners
    if (rawPayload === 'eth_accounts') {
        console.log('calling eth accounts');
        return ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'];
    }
    if (rawPayload === 'eth_requestAccounts') {
        console.log('wolam eth request accounts');
        return ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']
        // const contract = ethers.Contract('DAO_FACTORY_ADDRESS', DAO_FACTORY_ADDRESS_ABI, ethProvider.getSigner());
    }
    console.log('chain id ', ethProvider.manualChainId);
    return funkcja(rawPayload, rawParams, targetChain, waitForConnection);
}
console.log('zaldowalny');
export default ethProvider;