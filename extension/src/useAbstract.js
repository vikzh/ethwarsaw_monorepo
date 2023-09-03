import { ACCOUNT_ABI, FACTORY_ABI, ERC20_ABI } from "./abi";
import { LocalWallet, SmartWallet } from "@thirdweb-dev/wallets";
import { Mumbai } from "@thirdweb-dev/chains";
import { useState } from "react";
import {
  ThirdwebSDK,
  Transaction,
  isContractDeployed,
} from "@thirdweb-dev/sdk";

const FACTORY_ADDRESS = "0x8d05DE3858a4d3Fdca1aC41b80481339a47a1eba";

export default function useAbstract() {
  const [SDK, setSDK] = useState(null);
  const [sWallet, setSWallet] = useState(null);
  const [pWallet, setPWallet] = useState(null);

  async function getWalletAddressForUser(sdk, username) {
    const factory = await sdk.getContract(FACTORY_ADDRESS, FACTORY_ABI);
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
    const sdk = new ThirdwebSDK(Mumbai, {
      clientId: "3ff8b4d9deeff837a5923f887357e7ae",
    });
    setSDK(sdk);
    const smartWalletAddress = await getWalletAddressForUser(sdk, username);
    const isDeployed = await isContractDeployed(
      smartWalletAddress,
      sdk.getProvider(),
    );
    const smartWallet = createSmartWallet();
    setSWallet(smartWallet);
    const personalWallet = new LocalWallet();
    setPWallet(personalWallet);
    if (isDeployed) {
      const contract = await sdk.getContract(smartWalletAddress);
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
      const encryptedWalletUri = await sdk.storage.upload({
        name: username,
        encryptedWallet,
      });
      await smartWallet.execute(
        await Transaction.fromContractInfo({
          contractAddress: await smartWallet.getAddress(),
          contractAbi: ACCOUNT_ABI,
          provider: sdk.getProvider(),
          signer: await personalWallet.getSigner(),
          method: "register",
          args: [username, encryptedWalletUri],
          storage: sdk.storage,
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
    const balance = await contract.balanceOf(sWallet.getAddress());
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
