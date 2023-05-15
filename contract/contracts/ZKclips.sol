// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ZKclips is ERC20, Ownable {
    using SafeMath for uint256;

    uint256 public initialMintAmount = 100 * 1e18;
    uint256 public initialClipCost = 50 * 1e18;
    uint256 public clipCost;
    uint256 public prizePool;
    uint256 public lastClipUpdate;
    uint256 public clipedCount;

    mapping(address => uint256) public lastMintAmount;
    mapping(address => uint256) public lastMintTime;
    mapping(address => uint256) public lastHalfMintAmount;

    uint256 public mintCost = 5 * 1e14;
    address public clipOwner;

    event MintedClips(address indexed _sender, uint256 _lastTime, uint256 _lastAmount);
    event ClaimedHalfMint(address indexed _sender, uint256 _prizePool);
    event CompetedSpace(address indexed _owner, uint256 _lastUpdateTime, uint256 _clipCost, uint256 _clipCount);
    event ClaimedPrizePool(address indexed _owner, uint256 _clipCost);


    constructor() ERC20("ZKsync CLIPS", "CLIPS") {
        clipOwner = msg.sender;
        clipCost = initialClipCost;
    }

    /// @notice Mints CLIPS token
    function mintClips() external payable {
        require(block.timestamp >= lastMintTime[msg.sender] + 1 days, "You can only mint once every 24 hours");
        require(msg.value >= mintCost, "COST: INSUFFICIENT_VALUE");
        
        if (lastMintAmount[msg.sender] == 0) {
            _mint(msg.sender, initialMintAmount);
            _mint(address(this), initialMintAmount.div(5));
            lastMintAmount[msg.sender] = initialMintAmount;
            prizePool = prizePool.add(initialMintAmount.div(5));
        } else {
			lastMintAmount[msg.sender] = lastMintAmount[msg.sender].div(2);
            lastHalfMintAmount[msg.sender] = lastMintAmount[msg.sender];
        }

		lastMintTime[msg.sender] = block.timestamp;
        emit MintedClips(msg.sender, lastMintTime[msg.sender], lastMintAmount[msg.sender]);
    }

    /// @notice Claims half CLIPS token since second mint
    function claimHalfMint() external {
        require(block.timestamp >= lastMintTime[msg.sender] + 12 hours, "You can only claim CLIPS once every 12 hours since second mint");
        require(lastHalfMintAmount[msg.sender] > 0, "You can't mint zero tokens");

        _mint(msg.sender, lastHalfMintAmount[msg.sender]);
        _mint(address(this), lastHalfMintAmount[msg.sender].div(5));
        prizePool = prizePool.add(lastHalfMintAmount[msg.sender].div(5));
        lastHalfMintAmount[msg.sender] = 0;

        emit ClaimedHalfMint(msg.sender, prizePool);
    }

    /// @notice Competes for advertisment space
    function competeSpace() external {
        require(msg.sender != clipOwner, "You are current clip owner");
        require(balanceOf(msg.sender) >= clipCost, "Insufficient CLIPS to compete for advertisement space");

        _burn(msg.sender, clipCost);
        clipCost = clipCost.mul(2);

        clipedCount = clipedCount.add(1);
        clipOwner = msg.sender;
        lastClipUpdate = block.timestamp;

        emit CompetedSpace(clipOwner, lastClipUpdate, clipCost, clipedCount);
    }

    /// @notice Only competiton winner claims prize pool
    function claimPrizePool() external {
        require(block.timestamp >= lastClipUpdate + 8 hours, "Prize pool can be claimed if 8 hours have passed without any competition");
        require(msg.sender == clipOwner, "Only the current clipOwner can claim the prize pool");
		require(prizePool > 0, "You can't claim zero prize pool");

        _mint(msg.sender, prizePool);
        
        prizePool = 0;
        clipedCount = 0;
        clipCost = initialClipCost;

        emit ClaimedPrizePool(msg.sender, clipCost);
    }

    /// @notice Gets fund of this contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    /// @notice Gets current clip owner account
    function getCurrentClipOwner() public view returns (address) {
        return clipOwner;
    }

    /// @notice Gets current prize pool amount
    function getCurrentPrizePool() public view returns (uint256) {
        return prizePool;
    }

    /// @notice Gets current block.timestamp
    function getCurrentTime() public view returns (uint256) {
        return block.timestamp;
    }

    /// @notice Burns CLIPS token from account
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /// @notice Updates minting cost
    function setMintCost(uint256 _mintCost) public onlyOwner { 
        mintCost = _mintCost;
    }

    /// @notice Withdraws fund of this contract
    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}