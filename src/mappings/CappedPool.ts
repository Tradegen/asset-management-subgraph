import { Deposit, Withdraw, ExecutedTransaction, MarkedPoolAsEligible, TakeSnapshot } from "../types/templates/CappedPool/CappedPool";
import {
    CappedPool,
    Registry,
    User,
    CappedPoolTransaction,
    CappedPoolPosition,
    DepositCappedPool,
    WithdrawCappedPool,
    ExecuteTransactionCappedPool,
    MarkAsEligibleCappedPool,
    TakeSnapshotCappedPool,
  } from "../types/schema";
  import {
    REGISTRY_ADDRESS,
    fetchCappedPoolTokenPrice,
    fetchCappedPoolTotalSupply,
    fetchPositionAddresses,
    fetchPositionBalances,
    ZERO_BI,
  } from "./helpers";
import {
    updateRegistryDayData,
    updateCappedPoolDayData,
    updateCappedPoolHourData
 } from "./dayUpdates";

export function handleDeposit(event: Deposit): void {
    let poolAddress = event.address;
    let poolPositionAddresses = fetchPositionAddresses(poolAddress);
    let poolPositionBalances = fetchPositionBalances(poolAddress)
    let tokenPrice = fetchCappedPoolTokenPrice(poolAddress);
    let totalSupply = fetchCappedPoolTotalSupply(poolAddress);

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
    registry.cappedPoolTxCount = registry.cappedPoolTxCount + 1;
    registry.totalDeposits = registry.totalDeposits.plus(event.params.amountOfUSD);
    registry.totalVolume = registry.totalVolume.plus(event.params.amountOfUSD);
    registry.totalCappedPoolVolume = registry.totalCappedPoolVolume.plus(event.params.amountOfUSD);
    registry.totalValueLocked = registry.totalValueLocked.plus(event.params.amountOfUSD);
    registry.cappedPoolTotalValueLocked = registry.cappedPoolTotalValueLocked.plus(event.params.amountOfUSD);
    registry.save();

    let pool = CappedPool.load(event.address.toHexString());
    pool.tokenPrice = tokenPrice;
    pool.totalSupply = totalSupply;
    pool.totalDeposits = pool.totalDeposits.plus(event.params.amountOfUSD);
    pool.totalValueLocked = totalSupply.times(tokenPrice);
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
    user.totalDeposits = user.totalDeposits.plus(event.params.amountOfUSD);
    user.cappedPoolDeposits = user.cappedPoolDeposits.plus(event.params.amountOfUSD);
    user.save();

    let poolPositionID = pool.id + "-" + user.id;
    let poolPosition = CappedPoolPosition.load(poolPositionID);
    if (poolPosition === null) {
        poolPosition = new CappedPoolPosition(poolPositionID);
        poolPosition.user = user.id;
        poolPosition.cappedPool = pool.id;
        poolPosition.costBasis = ZERO_BI;
        poolPosition.amountWithdrawn = ZERO_BI;
        poolPosition.tokenBalance = ZERO_BI;
    }
    poolPosition.costBasis = poolPosition.costBasis.plus(event.params.amountOfUSD);
    poolPosition.tokenBalance = poolPosition.tokenBalance.plus(event.params.numberOfPoolTokens);
    poolPosition.save();

    let poolTransaction = new CappedPoolTransaction(event.transaction.hash.toHexString());
    poolTransaction.blockNumber = event.block.number;
    poolTransaction.timestamp = event.block.timestamp;
    poolTransaction.cappedPool = pool.id;
    poolTransaction.save();

    let depositPoolID = poolTransaction.id + "-depositCappedPool";
    let depositPool = new DepositCappedPool(depositPoolID);
    depositPool.cappedPoolTransaction = poolTransaction.id;
    depositPool.cappedPool = pool.id;
    depositPool.timestamp = event.block.timestamp;
    depositPool.user = user.id;
    depositPool.amountOfDepositAsset = event.params.tokensDeposited;
    depositPool.amountOfUSD = event.params.amountOfUSD;
    depositPool.depositAsset = event.params.depositAsset.toHexString();
    depositPool.numberOfPoolTokensReceived = event.params.tokensDeposited;
    depositPool.save();

    poolTransaction.deposit = depositPool.id;
    poolTransaction.save();

    let registryDayData = updateRegistryDayData(event);
    registryDayData.dailyDeposits = registryDayData.dailyDeposits.plus(event.params.amountOfUSD);
    registryDayData.dailyVolume = registryDayData.dailyVolume.plus(event.params.amountOfUSD);
    registryDayData.save();

    let poolDayData = updateCappedPoolDayData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolDayData.dailyVolume = poolDayData.dailyVolume.plus(event.params.amountOfUSD);
    poolDayData.save();

    let poolHourData = updateCappedPoolHourData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolHourData.hourlyVolume = poolHourData.hourlyVolume.plus(event.params.amountOfUSD);
    poolHourData.save();
}

export function handleWithdraw(event: Withdraw): void {
    let poolAddress = event.address;
    let poolPositionAddresses = fetchPositionAddresses(poolAddress);
    let poolPositionBalances = fetchPositionBalances(poolAddress)
    let tokenPrice = fetchCappedPoolTokenPrice(poolAddress);
    let totalSupply = fetchCappedPoolTotalSupply(poolAddress);

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
    registry.cappedPoolTxCount = registry.cappedPoolTxCount + 1;
    registry.totalWithdrawals = registry.totalWithdrawals.plus(event.params.valueWithdrawn);
    registry.totalVolume = registry.totalVolume.plus(event.params.valueWithdrawn);
    registry.totalCappedPoolVolume = registry.totalCappedPoolVolume.plus(event.params.valueWithdrawn);
    registry.save();

    let pool = CappedPool.load(event.address.toHexString());
    pool.tokenPrice = tokenPrice;
    pool.totalSupply = totalSupply;
    pool.totalWithdrawals = pool.totalWithdrawals.plus(event.params.valueWithdrawn);
    pool.totalValueLocked = totalSupply.times(tokenPrice);
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
    user.cappedPoolWithdrawals = user.cappedPoolWithdrawals.plus(event.params.valueWithdrawn);
    user.save();

    let poolPositionID = pool.id + "-" + user.id;
    let poolPosition = CappedPoolPosition.load(poolPositionID);
    if (poolPosition === null) {
        poolPosition = new CappedPoolPosition(poolPositionID);
        poolPosition.user = user.id;
        poolPosition.cappedPool = pool.id;
        poolPosition.costBasis = ZERO_BI;
        poolPosition.amountWithdrawn = ZERO_BI;
        poolPosition.tokenBalance = ZERO_BI;
    }
    poolPosition.amountWithdrawn = poolPosition.amountWithdrawn.plus(event.params.valueWithdrawn);
    poolPosition.tokenBalance = poolPosition.tokenBalance.minus(event.params.numberOfPoolTokens);
    poolPosition.save();

    let poolTransaction = new CappedPoolTransaction(event.transaction.hash.toHexString());
    poolTransaction.blockNumber = event.block.number;
    poolTransaction.timestamp = event.block.timestamp;
    poolTransaction.cappedPool = pool.id;
    poolTransaction.save();

    let withdrawPoolID = poolTransaction.id + "-withdrawCappedPool";
    let withdrawPool = new WithdrawCappedPool(withdrawPoolID);
    withdrawPool.cappedPoolTransaction = poolTransaction.id;
    withdrawPool.cappedPool = pool.id;
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

    let poolDayData = updateCappedPoolDayData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolDayData.dailyVolume = poolDayData.dailyVolume.plus(event.params.valueWithdrawn);
    poolDayData.save();

    let poolHourData = updateCappedPoolHourData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolHourData.hourlyVolume = poolHourData.hourlyVolume.plus(event.params.valueWithdrawn);
    poolHourData.save();
}

export function handleExecuteTransaction(event: ExecutedTransaction): void {
    let poolAddress = event.address;
    let poolPositionAddresses = fetchPositionAddresses(poolAddress);
    let poolPositionBalances = fetchPositionBalances(poolAddress)
    let tokenPrice = fetchCappedPoolTokenPrice(poolAddress);
    let totalSupply = fetchCappedPoolTotalSupply(poolAddress);

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
    registry.cappedPoolTxCount = registry.cappedPoolTxCount + 1;
    registry.save();

    let pool = CappedPool.load(event.address.toHexString());
    pool.tokenPrice = tokenPrice;
    pool.totalSupply = totalSupply;
    pool.totalValueLocked = totalSupply.times(tokenPrice);
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

    let poolTransaction = new CappedPoolTransaction(event.transaction.hash.toHexString());
    poolTransaction.blockNumber = event.block.number;
    poolTransaction.timestamp = event.block.timestamp;
    poolTransaction.cappedPool = pool.id;
    poolTransaction.save();

    let executeTransactionPoolID = poolTransaction.id + "-executeTransactionCappedPool";
    let executeTransactionPool = new ExecuteTransactionCappedPool(executeTransactionPoolID);
    executeTransactionPool.cappedPoolTransaction = poolTransaction.id;
    executeTransactionPool.cappedPool = pool.id;
    executeTransactionPool.timestamp = event.block.timestamp;
    executeTransactionPool.externalContract = event.params.to.toHexString();
    executeTransactionPool.transactionType = event.params.transactionType;
    executeTransactionPool.save();

    poolTransaction.executeTransaction = executeTransactionPool.id;
    poolTransaction.save();

    let registryDayData = updateRegistryDayData(event);
    registryDayData.save();

    let poolDayData = updateCappedPoolDayData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolDayData.save();

    let poolHourData = updateCappedPoolHourData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolHourData.save();
}

export function handleTakeSnapshot(event: TakeSnapshot): void {
    let poolAddress = event.address;
    let poolPositionAddresses = fetchPositionAddresses(poolAddress);
    let poolPositionBalances = fetchPositionBalances(poolAddress)
    let tokenPrice = fetchCappedPoolTokenPrice(poolAddress);
    let totalSupply = fetchCappedPoolTotalSupply(poolAddress);

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
    registry.cappedPoolTxCount = registry.cappedPoolTxCount + 1;
    registry.save();

    let pool = CappedPool.load(event.address.toHexString());
    pool.tokenPrice = tokenPrice;
    pool.totalSupply = totalSupply;
    pool.totalValueLocked = totalSupply.times(tokenPrice);
    pool.save();

    let poolTransaction = new CappedPoolTransaction(event.transaction.hash.toHexString());
    poolTransaction.blockNumber = event.block.number;
    poolTransaction.timestamp = event.block.timestamp;
    poolTransaction.cappedPool = pool.id;
    poolTransaction.save();

    let takeSnapshotPoolID = poolTransaction.id + "-takeSnapshotCappedPool";
    let takeSnapshotPool = new TakeSnapshotCappedPool(takeSnapshotPoolID);
    takeSnapshotPool.cappedPoolTransaction = poolTransaction.id;
    takeSnapshotPool.cappedPool = pool.id;
    takeSnapshotPool.timestamp = event.block.timestamp;
    takeSnapshotPool.unrealizedProfits = event.params.unrealizedProfits;
    takeSnapshotPool.save();

    poolTransaction.takeSnapshot = takeSnapshotPool.id;
    poolTransaction.save();

    let registryDayData = updateRegistryDayData(event);
    registryDayData.save();

    let poolDayData = updateCappedPoolDayData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolDayData.save();

    let poolHourData = updateCappedPoolHourData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolHourData.save();
}

export function handleMarkedPoolAsEligible(event: MarkedPoolAsEligible): void {
    let poolAddress = event.address;
    let poolPositionAddresses = fetchPositionAddresses(poolAddress);
    let poolPositionBalances = fetchPositionBalances(poolAddress)
    let tokenPrice = fetchCappedPoolTokenPrice(poolAddress);
    let totalSupply = fetchCappedPoolTotalSupply(poolAddress);

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
    registry.cappedPoolTxCount = registry.cappedPoolTxCount + 1;
    registry.save();

    let pool = CappedPool.load(event.address.toHexString());
    pool.tokenPrice = tokenPrice;
    pool.totalSupply = totalSupply;
    pool.totalValueLocked = totalSupply.times(tokenPrice);
    pool.save();

    let poolTransaction = new CappedPoolTransaction(event.transaction.hash.toHexString());
    poolTransaction.blockNumber = event.block.number;
    poolTransaction.timestamp = event.block.timestamp;
    poolTransaction.cappedPool = pool.id;
    poolTransaction.save();

    let markedID = poolTransaction.id + "-markedAsEligibleCappedPool";
    let marked = new MarkAsEligibleCappedPool(markedID);
    marked.cappedPoolTransaction = poolTransaction.id;
    marked.cappedPool = pool.id;
    marked.timestamp = event.block.timestamp;
    marked.save();

    poolTransaction.markAsEligible = marked.id;
    poolTransaction.save();

    let registryDayData = updateRegistryDayData(event);
    registryDayData.save();

    let poolDayData = updateCappedPoolDayData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolDayData.save();

    let poolHourData = updateCappedPoolHourData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolHourData.save();
}