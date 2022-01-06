const fs=require('fs')

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy();
  
    console.log("Mock Token address:", mockToken.address);

    const NFTToken=await ethers.getContractFactory('NFTToken')

    const nftToken=await NFTToken.deploy(deployer.address,mockToken.address,1)
    console.log(`NFT Token address:${nftToken.address}`)

    const data={
        address:nftToken.address,
        abi:JSON.parse(nftToken.interface.format('json'))
    }

    fs.writeFileSync('data/NFTToken.json',JSON.stringify(data))
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });