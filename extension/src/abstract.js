import { LocalWallet, SmartWallet } from '@thirdweb-dev/wallets';
import { Mumbai } from '@thirdweb-dev/chains';
import { ThirdwebSDK, Transaction, isContractDeployed } from '@thirdweb-dev/sdk';
import { ACCOUNT_ABI, FACTORY_ABI } from './abi';
const FACTORY_ADDRESS = '0x8d05DE3858a4d3Fdca1aC41b80481339a47a1eba';
const ENDPOINT_ADDRESS = '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789';
const USER = 'testuser';
const PASSWORD = 'testpassword';
// async function thirdWebTest() {
//     const sdk = new ThirdwebSDK(Mumbai, {
//         clientId: '3ff8b4d9deeff837a5923f887357e7ae',
//     });
//     await connectToSmartWallet(sdk, USER, PASSWORD);
//     console.log('Wallet address:', await sdk.wallet.getAddress());
// }
async function getWalletAddressForUser(sdk, username) {
    const factory = await sdk.getContract(FACTORY_ADDRESS, FACTORY_ABI);
    const smartWalletAddress = await factory.call('accountOfUsername', [username]);
    return smartWalletAddress;
}
function createSmartWallet() {
    const config = {
        chain: Mumbai,
        factoryAddress: FACTORY_ADDRESS,
        clientId: '3ff8b4d9deeff837a5923f887357e7ae',
        gasless: true,
    };
    return new SmartWallet(config);
}
async function connectToSmartWallet(sdk, username, pwd) {
    const smartWalletAddress = await getWalletAddressForUser(sdk, username);
    const isDeployed = await isContractDeployed(smartWalletAddress, sdk.getProvider());
    console.log('isDeployed: ', isDeployed);
    const smartWallet = createSmartWallet();
    const personalWallet = new LocalWallet();
    if (isDeployed) {
        const contract = await sdk.getContract(smartWalletAddress);
        const metadata = await contract.metadata.get();
        console.log('Fetching wallet for', metadata.name);
        const encryptedWallet = metadata.encryptedWallet;
        if (!encryptedWallet) {
            throw new Error('No encrypted wallet found');
        }
        await new Promise(resolve => setTimeout(resolve, 300));
        await personalWallet.import({
            encryptedJson: encryptedWallet,
            password: pwd,
        });
        await smartWallet.connect({
            personalWallet,
        });
    }
    else {
        await personalWallet.generate();
        console.log('Personal wallet address: ', await personalWallet.getAddress());
        const encryptedWallet = await personalWallet.export({
            strategy: 'encryptedJson',
            password: pwd,
        });
        await smartWallet.connect({
            personalWallet,
        });
        const encryptedWalletUri = await sdk.storage.upload({
            name: username,
            encryptedWallet,
        });
        const fact = await smartWallet.getFactoryContract();
        console.log(await smartWallet.getAddress());
        console.log(sdk.getProvider());
        await smartWallet.execute(await Transaction.fromContractInfo({
            contractAddress: await smartWallet.getAddress(),
            contractAbi: ACCOUNT_ABI,
            provider: sdk.getProvider(),
            signer: await personalWallet.getSigner(),
            method: 'register',
            args: [username, encryptedWalletUri],
            storage: sdk.storage,
        }));
    }

    return await smartWallet.getAddress();
}
// async function main() {
//     await thirdWebTest();
// }
// ;
// (async () => {
//     try {
//         await main();
//     }
//     catch (e) { }
// })();
//# sourceMappingURL=main.js.map

export default connectToSmartWallet;