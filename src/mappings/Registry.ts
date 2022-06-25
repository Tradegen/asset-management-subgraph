import { BigInt, Address } from "@graphprotocol/graph-ts";
import { CreatedCappedPool, CreatedPool } from "../types/Registry/Registry";
import { CappedPool as CappedPoolTemplate } from "../types/templates";
import { CappedPoolNFT as CappedPoolNFTTemplate } from "../types/templates";
import { PoolManagerLogic as PoolManagerLogicTemplate } from "../types/templates";
import { Pool as PoolTemplate } from "../types/templates";
import {
    CappedPool,
    Pool,
    Registry,
    CappedPoolLookup,
    CappedPoolNFTLookup,
    PoolLookup,
    User,
    ManagedInvestment,
    CappedPoolTransaction,
    CreateCappedPool,
    PoolTransaction,
    CreatePool,
    PoolManagerLogic
  } from "../types/schema";
  import {
    REGISTRY_ADDRESS,
    fetchCappedPoolNFTAddress,
    ZERO_BI,
  } from "./helpers";
import { updateRegistryDayData } from "./dayUpdates";

export function handleCreatedPool(event: CreatedPool): void {
    let registry = Registry.load(REGISTRY_ADDRESS);
    if (registry === null) {
        registry = new Registry(REGISTRY_ADDRESS);
        registry.poolCount = 0;
        registry.cappedPoolCount = 0;
        registry.txCount = 0;
        registry.poolTxCount = 0;
        registry.cappedPoolTxCount = 0;
        registry.totalDeposits = ZERO_BI;
        registry.totalWithdrawals = ZERO_BI;
        registry.totalVolume = ZERO_BI;
        registry.totalPoolVolume = ZERO_BI;
        registry.totalCappedPoolVolume = ZERO_BI;
        registry.totalValueLocked = ZERO_BI;
        registry.poolTotalValueLocked = ZERO_BI;
        registry.cappedPoolTotalValueLocked = ZERO_BI;
    }
    registry.txCount = registry.txCount + 1;
    registry.poolCount = registry.poolCount + 1;
    registry.poolTxCount = registry.poolTxCount + 1;
    registry.save();

    let user = User.load(event.params.manager.toHexString());
    if (user === null) {
        user = new User(event.params.manager.toHexString());
        user.totalDeposits = ZERO_BI;
        user.totalWithdrawals = ZERO_BI;
        user.poolDeposits = ZERO_BI;
        user.poolWithdrawals = ZERO_BI;
        user.cappedPoolDeposits = ZERO_BI;
        user.cappedPoolWithdrawals = ZERO_BI;
        user.save();
    }

    let pool = new Pool(event.params.poolAddress.toHexString());
    pool.createdOn = event.block.timestamp;
    pool.manager = user.id;
    pool.name = event.params.name;
    pool.performanceFee = event.params.performanceFee;
    pool.tokenPrice = BigInt.fromString("1000000000000000000"); // 1e18.
    pool.totalSupply = ZERO_BI;
    pool.totalDeposits = ZERO_BI;
    pool.totalWithdrawals = ZERO_BI;
    pool.totalValueLocked = ZERO_BI;
    pool.save();

    let managedInvestmentID = event.params.poolAddress.toHexString() + "-investment";
    let managedInvestment = new ManagedInvestment(managedInvestmentID);
    managedInvestment.pool = pool.id;
    managedInvestment.manager = user.id;
    managedInvestment.save();

    let poolLookupID = pool.id + "-lookup";
    let poolLookup = new PoolLookup(poolLookupID);
    poolLookup.pool = pool.id;
    poolLookup.name = pool.name;
    poolLookup.save();

    let poolManagerLogic = new PoolManagerLogic(event.params.poolManagerLogicAddress.toHexString());
    poolManagerLogic.pool = pool.id;
    poolManagerLogic.depositAssets = [];
    poolManagerLogic.availableAssets = [];
    poolManagerLogic.lastFeeUpdate = ZERO_BI;
    poolManagerLogic.performanceFee = event.params.performanceFee;
    poolManagerLogic.save();

    let poolTransaction = new PoolTransaction(event.transaction.hash.toHexString());
    poolTransaction.blockNumber = event.block.number;
    poolTransaction.timestamp = event.block.timestamp;
    poolTransaction.pool = pool.id;
    poolTransaction.save();

    let createID = event.transaction.hash.toHexString() + "-createPool";
    let createPool = new CreatePool(createID);
    createPool.poolTransaction = poolTransaction.id;
    createPool.timestamp = event.block.timestamp;
    createPool.pool = pool.id;
    createPool.poolManagerLogic = poolManagerLogic.id;
    createPool.manager = user.id;
    createPool.name = pool.name;
    createPool.performanceFee = pool.performanceFee;
    createPool.save();

    let registryDayData = updateRegistryDayData(event);
    registryDayData.dailyPoolsCreated = registryDayData.dailyPoolsCreated + 1;
    registryDayData.save();

    // Create the tracked contract based on the template.
    PoolManagerLogicTemplate.create(event.params.poolManagerLogicAddress);

    // Create the tracked contract based on the template.
    PoolTemplate.create(event.params.poolAddress);
}

export function handleCreatedCappedPool(event: CreatedCappedPool): void {
  let registry = Registry.load(REGISTRY_ADDRESS);
  if (registry === null) {
      registry = new Registry(REGISTRY_ADDRESS);
      registry.poolCount = 0;
      registry.cappedPoolCount = 0;
      registry.txCount = 0;
      registry.poolTxCount = 0;
      registry.cappedPoolTxCount = 0;
      registry.totalDeposits = ZERO_BI;
      registry.totalWithdrawals = ZERO_BI;
      registry.totalVolume = ZERO_BI;
      registry.totalPoolVolume = ZERO_BI;
      registry.totalCappedPoolVolume = ZERO_BI;
      registry.totalValueLocked = ZERO_BI;
      registry.poolTotalValueLocked = ZERO_BI;
      registry.cappedPoolTotalValueLocked = ZERO_BI;
  }
  registry.txCount = registry.txCount + 1;
  registry.cappedPoolCount = registry.cappedPoolCount + 1;
  registry.cappedPoolTxCount = registry.cappedPoolTxCount + 1;
  registry.save();

  let user = User.load(event.params.manager.toHexString());
  if (user === null) {
      user = new User(event.params.manager.toHexString());
      user.totalDeposits = ZERO_BI;
      user.totalWithdrawals = ZERO_BI;
      user.poolDeposits = ZERO_BI;
      user.poolWithdrawals = ZERO_BI;
      user.cappedPoolDeposits = ZERO_BI;
      user.cappedPoolWithdrawals = ZERO_BI;
      user.save();
  }

  let cappedPool = new CappedPool(event.params.poolAddress.toHexString());
  cappedPool.createdOn = event.block.timestamp;
  cappedPool.manager = user.id;
  cappedPool.name = event.params.name;
  cappedPool.performanceFee = event.params.performanceFee;
  cappedPool.tokenPrice = event.params.seedprice;
  cappedPool.totalSupply = ZERO_BI;
  cappedPool.totalDeposits = ZERO_BI;
  cappedPool.totalValueLocked = ZERO_BI;
  cappedPool.maxSupply = event.params.supplyCap;
  cappedPool.seedPrice = event.params.seedprice;
  cappedPool.save();

  let managedInvestmentID = event.params.poolAddress.toHexString() + "-investment";
  let managedInvestment = new ManagedInvestment(managedInvestmentID);
  managedInvestment.cappedPool = cappedPool.id;
  managedInvestment.manager = user.id;
  managedInvestment.save();

  let cappedPoolNFTAddress = fetchCappedPoolNFTAddress(event.params.poolAddress);

  let cappedPoolLookupID = cappedPool.id + "-lookup";
  let cappedPoolLookup = new CappedPoolLookup(cappedPoolLookupID);
  cappedPoolLookup.cappedPool = cappedPool.id;
  cappedPoolLookup.cappedPoolNFT = cappedPoolNFTAddress;
  cappedPoolLookup.name = cappedPool.name;
  cappedPoolLookup.save();

  let cappedPoolNFTLookupID = cappedPoolNFTAddress + "-lookup";
  let cappedPoolNFTLookup = new CappedPoolNFTLookup(cappedPoolNFTLookupID);
  cappedPoolNFTLookup.cappedPool = cappedPool.id;
  cappedPoolNFTLookup.save();

  let poolManagerLogic = new PoolManagerLogic(event.params.poolManagerLogicAddress.toHexString());
  poolManagerLogic.cappedPool = cappedPool.id;
  poolManagerLogic.depositAssets = [];
  poolManagerLogic.availableAssets = [];
  poolManagerLogic.lastFeeUpdate = ZERO_BI;
  poolManagerLogic.performanceFee = event.params.performanceFee;
  poolManagerLogic.save();

  let cappedPoolTransaction = new CappedPoolTransaction(event.transaction.hash.toHexString());
  cappedPoolTransaction.blockNumber = event.block.number;
  cappedPoolTransaction.timestamp = event.block.timestamp;
  cappedPoolTransaction.cappedPool = cappedPool.id;
  cappedPoolTransaction.save();

  let createID = event.transaction.hash.toHexString() + "-createCappedPool";
  let createCappedPool = new CreateCappedPool(createID);
  createCappedPool.cappedPoolTransaction = cappedPoolTransaction.id;
  createCappedPool.timestamp = event.block.timestamp;
  createCappedPool.cappedPool = cappedPool.id;
  createCappedPool.poolManagerLogic = poolManagerLogic.id;
  createCappedPool.manager = user.id;
  createCappedPool.name = cappedPool.name;
  createCappedPool.performanceFee = cappedPool.performanceFee;
  createCappedPool.seedPrice = cappedPool.seedPrice;
  createCappedPool.maxSupply = cappedPool.maxSupply;
  createCappedPool.save();

  let registryDayData = updateRegistryDayData(event);
  registryDayData.dailyCappedPoolsCreated = registryDayData.dailyCappedPoolsCreated + 1;
  registryDayData.save();

  // Create the tracked contract based on the template.
  PoolManagerLogicTemplate.create(event.params.poolManagerLogicAddress);

  // Create the tracked contract based on the template.
  CappedPoolTemplate.create(event.params.poolAddress);

  // Create the tracked contract based on the template.
  CappedPoolNFTTemplate.create(cappedPoolNFTAddress as unknown as Address);
}