import { ACCOUNT_ABI, FACTORY_ABI, ERC20_ABI } from "./abi";
import { LocalWallet, SmartWallet } from "@thirdweb-dev/wallets";
import { Mumbai } from "@thirdweb-dev/chains";
import {
  ThirdwebSDK,
  Transaction,
  isContractDeployed,
} from "@thirdweb-dev/sdk";

const FACTORY_ADDRESS = "0x8d05DE3858a4d3Fdca1aC41b80481339a47a1eba";
const SDK = new ThirdwebSDK(Mumbai, {
  clientId: "3ff8b4d9deeff837a5923f887357e7ae",
});
let sWallet;
let pWallet;

export default function useAbstract() {
  async function getWalletAddressForUser(username) {
    const factory = await SDK.getContract(FACTORY_ADDRESS, FACTORY_ABI);
    const smartWalletAddress = await factory.call("accountOfUsername", [
      username,
    ]);
    return smartWalletAddress;
  }

  function createSmartWallet() {
    const config = {
      chain: Mumbai,
      factoryAddress: FACTORY_ADDRESS,
      clientId: "3ff8b4d9deeff837a5923f887357e7ae",
      gasless: true,
    };
    return new SmartWallet(config);
  }

  async function connectToSmartWallet(username, pwd) {
    const smartWalletAddress = await getWalletAddressForUser(username);
    const isDeployed = await isContractDeployed(
      smartWalletAddress,
      SDK.getProvider(),
    );
    const smartWallet = createSmartWallet();
    sWallet = smartWallet;
    const personalWallet = new LocalWallet();
    pWallet = personalWallet;
    if (isDeployed) {
      const contract = await SDK.getContract(smartWalletAddress);
      const metadata = await contract.metadata.get();
      const encryptedWallet = metadata.encryptedWallet;
      if (!encryptedWallet) {
        throw new Error("No encrypted wallet found");
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
      await personalWallet.import({
        encryptedJson: encryptedWallet,
        password: pwd,
      });
      await smartWallet.connect({
        personalWallet,
      });
    } else {
      await personalWallet.generate();
      const encryptedWallet = await personalWallet.export({
        strategy: "encryptedJson",
        password: pwd,
      });
      await smartWallet.connect({
        personalWallet,
      });
      const encryptedWalletUri = await SDK.storage.upload({
        name: username,
        encryptedWallet,
      });
      await smartWallet.execute(
        await Transaction.fromContractInfo({
          contractAddress: await smartWallet.getAddress(),
          contractAbi: ACCOUNT_ABI,
          provider: SDK.getProvider(),
          signer: await personalWallet.getSigner(),
          method: "register",
          args: [username, encryptedWalletUri],
          storage: SDK.storage,
        }),
      );
    }

    return await smartWallet.getAddress();
  }

  async function executeERC20(contractAddress, method, args) {
    const result = await sWallet.execute(
      await Transaction.fromContractInfo({
        contractAddress,
        ERC20_ABI,
        provider: SDK.getProvider(),
        signer: await pWallet.getSigner(),
        method,
        args,
        storage: SDK.storage,
      }),
    );
    return result;
  }

  async function getBalance(contractAddress) {
    const sdk = new ThirdwebSDK(Mumbai, {
      clientId: "3ff8b4d9deeff837a5923f887357e7ae",
    });
    const contract = await sdk.getContract(contractAddress, ERC20_ABI);
    const balance = await contract.erc20.balanceOf(await sWallet.getAddress());
    return balance;
  }

  async function transfer(contractAddress, to, amount) {
    const result = await sWallet.execute(
      await Transaction.fromContractInfo({
        contractAddress,
        ERC20_ABI,
        provider: SDK.getProvider(),
        signer: await pWallet.getSigner(),
        method: "transfer",
        args: [to, amount],
        storage: SDK.storage,
      }),
    );
    return result;
  }

  return { connectToSmartWallet, executeERC20, getBalance, transfer };
}
