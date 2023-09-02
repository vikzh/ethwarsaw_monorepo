import { ethers } from "hardhat";

async function main() {
    const ENTRYPONT_ADDRESS = "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789";
    const credentialAccountFactory = await ethers.deployContract("CredentialAccountFactory",[ENTRYPONT_ADDRESS]);

    await credentialAccountFactory.waitForDeployment();

    console.log(`CredentialAccountFactory deployed: ${ credentialAccountFactory.target}`);
    //CredentialAccountFactory deployed: 0x99E70DF7F03Fb4785fFDB2Ca8db03ececeCB7e19

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
