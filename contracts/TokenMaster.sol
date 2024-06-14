// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
contract TokenMaster is ERC721 {
    address public owner;
    uint256 public totalOccasions;
    uint256 public totalSupply;
    //create user define data type
    struct Occasions {
        uint256 id;
        string name;
        uint256 cost;
        uint256 tickets;
        uint256 maxTicket;
        string date;
        string time;
        string location;
    }
    // mapping here to store data in key value pairs in blockchain memory
    mapping(uint256 => Occasions) occasions;
    mapping(uint256 => mapping(address => bool)) public hasBrought; //<-- it stores events id with users address with bool values
    mapping(uint256 => mapping(uint256 => address)) public seatTaken; //<-- it stores event id with seat no and the buyer address
    mapping(uint256 => uint256[]) seatsTaken;

    //this is to only one time assign the owner permenantly
    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        owner = msg.sender;
    }
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    // this funct should be accessible to owner only so that's why we need to create modifier so only owner can create tickets and take money
    function list(
        string memory _name,
        uint256 _cost,
        uint256 _maxTicket,
        string memory _date,
        string memory _time,
        string memory _location
    ) public onlyOwner {
        totalOccasions++;
        //(id,ticket name,ticket cost,ticket gone,max tickets, ticket event date,event time ,event location)
        occasions[totalOccasions] = Occasions(
            totalOccasions,
            _name,
            _cost,
            _maxTicket,
            _maxTicket,
            _date,
            _time,
            _location
        );
    }
    // this funct mint the nft and it uses particular event id for unique identity
    function mint(uint256 _id, uint256 _seats) public payable {
        require(_id != 0);
        require(_id <= totalOccasions);
        require(seatTaken[_id][_seats] == address(0));
        require(msg.value >= occasions[_id].cost);
        require(_seats <= occasions[_id].maxTicket);
        occasions[_id].tickets--; // <-- Update ticket count with the help of event id
        hasBrought[_id][msg.sender] = true; // <-- Update buying status with the help of event id and buyer address
        seatsTaken[_id].push(_seats); // <-- Assign seat with the event id it push the seat nos
        seatTaken[_id][_seats] = msg.sender; // <-- Update seats currently taken by event id and the buyer address

        totalSupply++;
        _safeMint(msg.sender, totalSupply);
    }
    // above funct is to write the funct whereas the below funct is to read and display the above written functs data by returning
    function getOccasion(uint256 _id) public view returns (Occasions memory) {
        return occasions[_id];
    }
    function getSeatTaken(uint256 _id) public view returns (uint256[] memory) {
        return seatsTaken[_id]; //<-- it retrieves array
    }
    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success); //^ this call uses to trasnfer money to the person from contract
    }
}
