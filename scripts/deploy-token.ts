import { ethers } from "hardhat";

async function main() {
  const TestToken = await ethers.getContractFactory("TestToken");
  const testToken = await TestToken.deploy();

  await testToken.deployed();

  console.log("TestToken deployed to:", testToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
