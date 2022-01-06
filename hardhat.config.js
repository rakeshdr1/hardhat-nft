require("@nomiclabs/hardhat-waffle");


const InfuraUrl="https://rinkeby.infura.io/v3/548590ac41b7454a905d0a35da37e087"
const privateKey=process.env.PRIVATE_KEY

module.exports = {
  solidity: "0.8.4",
  networks:{
    rinkeby:{
      url:InfuraUrl,
      accounts:[`0x${privateKey}`]
    }
  }
};