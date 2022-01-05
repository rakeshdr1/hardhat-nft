//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NFTToken is ERC721 {
    address public artist;
    address public txFeeToken;
    uint256 public txFeeAmount;
    mapping(address => bool) public excludedList;

    constructor(
        address _artist,
        address _txFeeToken,
        uint256 _txFeeAmount
    ) ERC721("NFT Token", "NFT") {
        artist = _artist;
        txFeeToken = _txFeeToken;
        txFeeAmount = _txFeeAmount;
        _mint(_artist, 0);
    }

    function setExcluded(address excluded, bool status) external {
        require(msg.sender == artist, "Only artists");
        excludedList[excluded] = status;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 tokenId
    ) public override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        if (excludedList[_from] == false) {
            _payTaxFee(_from);
        }
        _transfer(_from, _to, tokenId);
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 tokenId
    ) public override {
        if (excludedList[_from] == false) {
            _payTaxFee(_from);
        }
        safeTransferFrom(_from, _to, tokenId, "");
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 tokenId,
        bytes memory _data
    ) public override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        if (excludedList[_from] == false) {
            _payTaxFee(_from);
        }
        _safeTransfer(_from, _to, tokenId, _data);
    }

    function _payTaxFee(address from) internal {
        IERC20 token = IERC20(txFeeToken);
        token.transferFrom(from, artist, txFeeAmount);
    }
}
