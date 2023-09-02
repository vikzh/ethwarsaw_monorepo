import { Injectable } from '@nestjs/common';
import { Transaction } from './types';
import { ethers } from 'ethers';

@Injectable()
export class AppService {
  walletFactoryAbi = [];
  entryPointAbi = [];
  provider: ethers.JsonRpcProvider;
  signer: Promise<ethers.JsonRpcSigner>;
  bundlerWallet: ethers.Wallet;
  walletFactory: ethers.Contract;
  entryPoint: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider('http://localhost:8545');
    this.signer = this.provider.getSigner();
    this.bundlerWallet = new ethers.Wallet(
      '0x' + process.env.BUNDLER_PRIVATE_KEY,
      this.provider,
    );
    this.walletFactory = new ethers.Contract(
      process.env.WALLET_FACTORY_ADDRESS,
      this.walletFactoryAbi,
      this.bundlerWallet,
    );
    this.entryPoint = new ethers.Contract(
      process.env.ENTRY_POINT_ADDRESS,
      this.entryPointAbi,
      this.bundlerWallet,
    );
  }
  sendTransaction(transaction: Transaction): string {
    throw new Error('Method not implemented.');
  }

  registerUser(user: RegisterUserPayload): string {
    this.walletFactory;
  }
}
