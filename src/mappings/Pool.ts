import { BigInt } from "@graphprotocol/graph-ts";
import { Deposit, Withdraw, ExecutedTransaction } from "../types/templates/Pool/Pool";
import {
    Pool,
    Registry,
    User,
    PoolTransaction,
    PoolPosition,
    DepositPool,
    WithdrawPool,
    ExecuteTransactionPool
  } from "../types/schema";
  import {
    REGISTRY_ADDRESS,
    fetchPoolTokenPrice,
    fetchPoolTotalSupply,
    fetchPositionAddresses,
    fetchPositionBalances,
    ZERO_BI,
  } from "./helpers";
import {
    updateRegistryDayData,
    updatePoolDayData,
    updatePoolHourData
 } from "./dayUpdates";

export function handleDeposit(event: Deposit): void {
    let poolAddress = event.address;
    let poolPositionAddresses = fetchPositionAddresses(poolAddress);
    let poolPositionBalances = fetchPositionBalances(poolAddress)
    let tokenPrice = fetchPoolTokenPrice(poolAddress);
    let totalSupply = fetchPoolTotalSupply(poolAddress);

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
    registry.poolTxCount = registry.poolTxCount + 1;
    registry.totalDeposits = registry.totalDeposits.plus(event.params.userUSDValue);
    registry.totalVolume = registry.totalVolume.plus(event.params.userUSDValue);
    registry.totalPoolVolume = registry.totalPoolVolume.plus(event.params.userUSDValue);
    registry.totalValueLocked = registry.totalValueLocked.plus(event.params.userUSDValue);
    registry.poolTotalValueLocked = registry.poolTotalValueLocked.plus(event.params.userUSDValue);
    registry.save();

    let pool = Pool.load(event.address.toHexString());
    pool.tokenPrice = tokenPrice;
    pool.totalSupply = totalSupply;
    pool.totalDeposits = pool.totalDeposits.plus(event.params.userUSDValue);
    pool.totalValueLocked = totalSupply.times(tokenPrice).div(BigInt.fromString("1000000000000000000"));
    pool.save();

    let user = User.load(event.params.user.toHexString());
    if (user === null) {
        user = new User(event.params.user.toHexString());
        user.totalDeposits = ZERO_BI;
        user.totalWithdrawals = ZERO_BI;
        user.poolDeposits = ZERO_BI;
        user.poolWithdrawals = ZERO_BI;
        user.cappedPoolDeposits = ZERO_BI;
        user.cappedPoolWithdrawals = ZERO_BI;
    }
    user.totalDeposits = user.totalDeposits.plus(event.params.userUSDValue);
    user.poolDeposits = user.poolDeposits.plus(event.params.userUSDValue);
    user.save();

    let poolPositionID = pool.id + "-" + user.id;
    let poolPosition = PoolPosition.load(poolPositionID);
    if (poolPosition === null) {
        poolPosition = new PoolPosition(poolPositionID);
        poolPosition.user = user.id;
        poolPosition.pool = pool.id;
        poolPosition.costBasis = ZERO_BI;
        poolPosition.amountWithdrawn = ZERO_BI;
        poolPosition.tokenBalance = ZERO_BI;
    }
    poolPosition.costBasis = poolPosition.costBasis.plus(event.params.userUSDValue);
    poolPosition.tokenBalance = poolPosition.tokenBalance.plus(event.params.amount);
    poolPosition.save();

    let poolTransaction = new PoolTransaction(event.transaction.hash.toHexString());
    poolTransaction.blockNumber = event.block.number;
    poolTransaction.timestamp = event.block.timestamp;
    poolTransaction.pool = pool.id;
    poolTransaction.save();

    let depositPoolID = poolTransaction.id + "-depositPool";
    let depositPool = new DepositPool(depositPoolID);
    depositPool.poolTransaction = poolTransaction.id;
    depositPool.pool = pool.id;
    depositPool.timestamp = event.block.timestamp;
    depositPool.user = user.id;
    depositPool.amountOfDepositAsset = event.params.amount;
    depositPool.amountOfUSD = event.params.userUSDValue;
    depositPool.depositAsset = event.params.depositAsset.toHexString();
    depositPool.numberOfPoolTokensReceived = event.params.tokensDeposited;
    depositPool.save();

    poolTransaction.deposit = depositPool.id;
    poolTransaction.save();

    let registryDayData = updateRegistryDayData(event);
    registryDayData.dailyDeposits = registryDayData.dailyDeposits.plus(event.params.userUSDValue);
    registryDayData.dailyVolume = registryDayData.dailyVolume.plus(event.params.userUSDValue);
    registryDayData.save();

    let poolDayData = updatePoolDayData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolDayData.dailyVolume = poolDayData.dailyVolume.plus(event.params.userUSDValue);
    poolDayData.save();

    let poolHourData = updatePoolHourData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolHourData.hourlyVolume = poolHourData.hourlyVolume.plus(event.params.userUSDValue);
    poolHourData.save();
}

export function handleWithdraw(event: Withdraw): void {
    let poolAddress = event.address;
    let poolPositionAddresses = fetchPositionAddresses(poolAddress);
    let poolPositionBalances = fetchPositionBalances(poolAddress)
    let tokenPrice = fetchPoolTokenPrice(poolAddress);
    let totalSupply = fetchPoolTotalSupply(poolAddress);

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
    registry.poolTxCount = registry.poolTxCount + 1;
    registry.totalWithdrawals = registry.totalWithdrawals.plus(event.params.valueWithdrawn);
    registry.totalVolume = registry.totalVolume.plus(event.params.valueWithdrawn);
    registry.totalPoolVolume = registry.totalPoolVolume.plus(event.params.valueWithdrawn);
    registry.save();

    let pool = Pool.load(event.address.toHexString());
    pool.tokenPrice = tokenPrice;
    pool.totalSupply = totalSupply;
    pool.totalWithdrawals = pool.totalWithdrawals.plus(event.params.valueWithdrawn);
    pool.totalValueLocked = totalSupply.times(tokenPrice).div(BigInt.fromString("1000000000000000000"));
    pool.save();

    let user = User.load(event.params.user.toHexString());
    if (user === null) {
        user = new User(event.params.user.toHexString());
        user.totalDeposits = ZERO_BI;
        user.totalWithdrawals = ZERO_BI;
        user.poolDeposits = ZERO_BI;
        user.poolWithdrawals = ZERO_BI;
        user.cappedPoolDeposits = ZERO_BI;
        user.cappedPoolWithdrawals = ZERO_BI;
    }
    user.totalWithdrawals = user.totalWithdrawals.plus(event.params.valueWithdrawn);
    user.poolWithdrawals = user.poolWithdrawals.plus(event.params.valueWithdrawn);
    user.save();

    let poolPositionID = pool.id + "-" + user.id;
    let poolPosition = PoolPosition.load(poolPositionID);
    if (poolPosition === null) {
        poolPosition = new PoolPosition(poolPositionID);
        poolPosition.user = user.id;
        poolPosition.pool = pool.id;
        poolPosition.costBasis = ZERO_BI;
        poolPosition.amountWithdrawn = ZERO_BI;
        poolPosition.tokenBalance = ZERO_BI;
    }
    poolPosition.amountWithdrawn = poolPosition.amountWithdrawn.plus(event.params.valueWithdrawn);
    poolPosition.tokenBalance = poolPosition.tokenBalance.minus(event.params.numberOfPoolTokens);
    poolPosition.save();

    let poolTransaction = new PoolTransaction(event.transaction.hash.toHexString());
    poolTransaction.blockNumber = event.block.number;
    poolTransaction.timestamp = event.block.timestamp;
    poolTransaction.pool = pool.id;
    poolTransaction.save();

    let withdrawPoolID = poolTransaction.id + "-withdrawPool";
    let withdrawPool = new WithdrawPool(withdrawPoolID);
    withdrawPool.poolTransaction = poolTransaction.id;
    withdrawPool.pool = pool.id;
    withdrawPool.timestamp = event.block.timestamp;
    withdrawPool.user = user.id;
    withdrawPool.amountOfUSD = event.params.valueWithdrawn;
    withdrawPool.numberOfPoolTokensBurned = event.params.numberOfPoolTokens;
    withdrawPool.save();

    poolTransaction.withdraw = withdrawPool.id;
    poolTransaction.save();

    let registryDayData = updateRegistryDayData(event);
    registryDayData.dailyDeposits = registryDayData.dailyWithdrawals.plus(event.params.valueWithdrawn);
    registryDayData.dailyVolume = registryDayData.dailyVolume.plus(event.params.valueWithdrawn);
    registryDayData.save();

    let poolDayData = updatePoolDayData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolDayData.dailyVolume = poolDayData.dailyVolume.plus(event.params.valueWithdrawn);
    poolDayData.save();

    let poolHourData = updatePoolHourData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolHourData.hourlyVolume = poolHourData.hourlyVolume.plus(event.params.valueWithdrawn);
    poolHourData.save();
}

export function handleExecuteTransaction(event: ExecutedTransaction): void {
    let poolAddress = event.address;
    let poolPositionAddresses = fetchPositionAddresses(poolAddress);
    let poolPositionBalances = fetchPositionBalances(poolAddress)
    let tokenPrice = fetchPoolTokenPrice(poolAddress);
    let totalSupply = fetchPoolTotalSupply(poolAddress);

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
    registry.poolTxCount = registry.poolTxCount + 1;
    registry.save();

    let pool = Pool.load(event.address.toHexString());
    pool.tokenPrice = tokenPrice;
    pool.totalSupply = totalSupply;
    pool.totalValueLocked = totalSupply.times(tokenPrice).div(BigInt.fromString("1000000000000000000"));
    pool.save();

    let user = User.load(event.params.manager.toHexString());
    if (user === null) {
        user = new User(event.params.manager.toHexString());
        user.totalDeposits = ZERO_BI;
        user.totalWithdrawals = ZERO_BI;
        user.poolDeposits = ZERO_BI;
        user.poolWithdrawals = ZERO_BI;
        user.cappedPoolDeposits = ZERO_BI;
        user.cappedPoolWithdrawals = ZERO_BI;
    }
    user.save();

    let poolTransaction = new PoolTransaction(event.transaction.hash.toHexString());
    poolTransaction.blockNumber = event.block.number;
    poolTransaction.timestamp = event.block.timestamp;
    poolTransaction.pool = pool.id;
    poolTransaction.save();

    let executeTransactionPoolID = poolTransaction.id + "-executeTransactionPool";
    let executeTransactionPool = new ExecuteTransactionPool(executeTransactionPoolID);
    executeTransactionPool.poolTransaction = poolTransaction.id;
    executeTransactionPool.pool = pool.id;
    executeTransactionPool.timestamp = event.block.timestamp;
    executeTransactionPool.externalContract = event.params.to.toHexString();
    executeTransactionPool.transactionType = event.params.transactionType;
    executeTransactionPool.save();

    poolTransaction.executeTransaction = executeTransactionPool.id;
    poolTransaction.save();

    let registryDayData = updateRegistryDayData(event);
    registryDayData.save();

    let poolDayData = updatePoolDayData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolDayData.save();

    let poolHourData = updatePoolHourData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolHourData.save();
}