const {expect}=require('chai');

describe('NFTToken',()=>{
    let _admin,artist,owner1,owner2;
    const txFee=ethers.utils.parseUnits('1','ether')
    let token,nftToken;

    beforeEach(async()=>{
        [_admin,artist,owner1,owner2]=await ethers.getSigners()
        const Token=await ethers.getContractFactory('MockToken')

        token=await Token.deploy()
        await token.deployed()

        await token.transfer(owner1.address,
            ethers.utils.parseUnits('500','ether')
        )

        await token.transfer(owner2.address,
            ethers.utils.parseUnits('500','ether')
                )
        
        const NFTToken=await ethers.getContractFactory('NFTToken')
        nftToken=await NFTToken.deploy(artist.address,token.address,txFee)
        await nftToken.deployed();
    })

    it('Should transfer NFT and pay royalties',async()=>{
        let ownerNft,balanceSender,balanceArtist;

        nftToken=await nftToken.connect(artist);

        await nftToken.transferFrom(artist.address,owner1.address,0)
        ownerNft=await nftToken.ownerOf(0)

        expect(ownerNft).to.equal(owner1.address)

        await token.connect(owner1).approve(nftToken.address,txFee);
        await nftToken.connect(owner1).transferFrom(owner1.address,owner2.address,0)

        ownerNft=await nftToken.ownerOf(0)

        balanceSender=await token.balanceOf(owner1.address)
        balanceArtist=await token.balanceOf(artist.address)

        expect(ownerNft).to.equal(owner2.address)
        expect(balanceSender.toString()).to.equal(ethers.utils.parseUnits('499','ether'))
        expect(balanceArtist.toString()).to.equal(ethers.utils.parseUnits('1','ether'))
    })

    it('Excluder should not pay royalties',async()=>{
        let ownerNft,balanceSender,balanceArtist;

        nftToken=await nftToken.connect(artist);

        await nftToken.transferFrom(artist.address,owner1.address,0)
        ownerNft=await nftToken.ownerOf(0)
        
        await nftToken.setExcluded(owner1.address,true);
        await token.connect(owner1).approve(nftToken.address,txFee);
        await nftToken.connect(owner1).transferFrom(owner1.address,owner2.address,0)

        ownerNft=await nftToken.ownerOf(0)

        balanceSender=await token.balanceOf(owner1.address)
        balanceArtist=await token.balanceOf(artist.address)

        expect(ownerNft).to.equal(owner2.address)
        expect(balanceSender.toString()).to.equal(ethers.utils.parseUnits('500','ether'))
        expect(balanceArtist.toString()).to.equal(ethers.utils.parseUnits('0','ether'))
    })

    it('Should not transfer royalty if not enough tokens paid',async()=>{
        nftToken=await nftToken.connect(artist);

        await nftToken.transferFrom(artist.address,owner1.address,0)
        ownerNft=await nftToken.ownerOf(0)

        token=await token.connect(owner1)
        await token.transfer(owner2.address,
            ethers.utils.parseUnits('500','ether')
        )

        await token.connect(owner1).approve(nftToken.address,txFee);
        nftToken=await nftToken.connect(owner1)

       await expect(nftToken.transferFrom(owner1.address,owner2.address,0)).to.be.revertedWith('ERC20: transfer amount exceeds balance')
    })
})