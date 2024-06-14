const { expect } = require("chai");
const { ethers } = require("hardhat");

const NAME = "TokenMaster";
const SYMBOL = "TM";
const o_name = "Eth in world";
const o_cost = ethers.utils.parseUnits("1", "ether");
const o_maxTicket = 100;
const o_date = "9 jun";
const o_time = "10:00 ist";
const o_location = "Mumbai";
describe("TokenMaster", () => {
  let tokenMaster;
  let deployer, buyer;
  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners();
    const TokenMaster = await ethers.getContractFactory("TokenMaster");
    tokenMaster = await TokenMaster.deploy(NAME, SYMBOL);
    const Occasion = await tokenMaster
      .connect(deployer)
      .list(o_name, o_cost, o_maxTicket, o_date, o_time, o_location);
    await Occasion.wait();
  });
  describe("set the values", () => {
    it("check name", async () => {
      const name = await tokenMaster.name();
      expect(name).to.equal(NAME);
    });
    it("check symbol", async () => {
      const symbol = await tokenMaster.symbol();
      expect(symbol).to.equal(SYMBOL);
    });
  });
  describe("set the ownership", async () => {
    it("owner", async () => {
      const owner = await tokenMaster.owner();
      expect(owner).to.equal(deployer.address);
    });
  });
  describe("set the events", async () => {
    it("update events", async () => {
      const total = await tokenMaster.totalOccasions();
      expect(total).to.equal(1);
    });
    it("check occasion detail", async () => {
      const occasion = await tokenMaster.getOccasion(1);
      expect(occasion.id).to.equal(1);
      expect(occasion.name).to.equal(o_name);
      expect(occasion.cost).to.equal(o_cost);
      expect(occasion.maxTicket).to.equal(o_maxTicket);
      expect(occasion.date).to.equal(o_date);
      expect(occasion.time).to.equal(o_time);
      expect(occasion.location).to.equal(o_location);
    });
  });
  describe("purchase seat", async () => {
    const ID = 1;
    const SEAT = 50;
    const AMOUNT = ethers.utils.parseUnits("1", "ether");
    beforeEach(async () => {
      const transaction = await tokenMaster
        .connect(buyer)
        .mint(ID, SEAT, { value: AMOUNT });
      await transaction.wait();
    });
    it("update ticket counter", async () => {
      const occasion = await tokenMaster.getOccasion(1);
      expect(occasion.tickets).to.equal(99);
    });
    it("update buying status", async () => {
      const status = await tokenMaster.hasBrought(ID, buyer.address);
      expect(status).to.be.equal(true);
    });
    it("Assigned seat", async () => {
      const seat = await tokenMaster.seatTaken(ID, SEAT);
      expect(seat).to.equal(buyer.address);
    });
    it("seat status", async () => {
      const seat = await tokenMaster.getSeatTaken(ID);
      expect(seat.length).to.equal(1);
      expect(seat[0]).to.equal(SEAT);
    });
    it("buying status", async () => {
      const buyed = await ethers.provider.getBalance(tokenMaster.address);
      expect(buyed).to.be.equal(AMOUNT);
    });
  });
  describe("withdraw", async () => {
    const ID = 1;
    const SEAT = 50;
    const AMOUNT = ethers.utils.parseUnits("1", "ether");
    let transBefore;
    beforeEach(async () => {
      transBefore = await ethers.provider.getBalance(deployer.address);
      let transaction = await tokenMaster
        .connect(buyer)
        .mint(ID, SEAT, { value: AMOUNT });
      await transaction.wait();
      const transactionAfter = await tokenMaster.connect(deployer).withdraw();
      transactionAfter.wait();
    });
    it("update the balance", async () => {
      const transactionAfter = await ethers.provider.getBalance(
        deployer.address
      );
      expect(transactionAfter).to.be.greaterThan(transBefore);
    });
    it("update the contract balance", async () => {
      const transactionAfter = await ethers.provider.getBalance(
        tokenMaster.address
      );
      expect(transactionAfter).to.be.equal(0);
    });
  });
});
