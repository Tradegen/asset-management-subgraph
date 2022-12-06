import { BigInt } from "@graphprotocol/graph-ts";
import { TransferSingle } from "../types/templates/CappedPoolNFT/CappedPoolNFT";
import {
    CappedPool,
    Registry,
    User,
    CappedPoolTransaction,
    CappedPoolPosition,
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

export function handleTransferSingle(event: TransferSingle): void {
    let poolAddress = event.address;
    let poolPositionAddresses = fetchPositionAddresses(poolAddress);
    let poolPositionBalances = fetchPositionBalances(poolAddress)
    let tokenPrice = fetchCappedPoolTokenPrice(poolAddress);
    let totalSupply = fetchCappedPoolTotalSupply(poolAddress);

    let pool = CappedPool.load(event.address.toHexString());
    pool.tokenPrice = tokenPrice;
    pool.totalSupply = totalSupply;
    pool.totalValueLocked = totalSupply.times(tokenPrice);
    pool.save();

    let amountOfUSD = event.params.value.times(tokenPrice);

    let userFrom = User.load(event.params.from.toHexString());
    if (userFrom === null) {
        userFrom = new User(event.params.from.toHexString());
        userFrom.totalDeposits = ZERO_BI;
        userFrom.totalWithdrawals = ZERO_BI;
        userFrom.poolDeposits = ZERO_BI;
        userFrom.poolWithdrawals = ZERO_BI;
        userFrom.cappedPoolDeposits = ZERO_BI;
        userFrom.cappedPoolWithdrawals = ZERO_BI;
    }
    userFrom.totalWithdrawals = userFrom.totalWithdrawals.plus(amountOfUSD);
    userFrom.cappedPoolWithdrawals = userFrom.cappedPoolWithdrawals.plus(amountOfUSD);
    userFrom.save();

    let userTo = User.load(event.params.to.toHexString());
    if (userTo === null) {
        userTo = new User(event.params.to.toHexString());
        userTo.totalDeposits = ZERO_BI;
        userTo.totalWithdrawals = ZERO_BI;
        userTo.poolDeposits = ZERO_BI;
        userTo.poolWithdrawals = ZERO_BI;
        userTo.cappedPoolDeposits = ZERO_BI;
        userTo.cappedPoolWithdrawals = ZERO_BI;
    }
    userTo.totalDeposits = userFrom.totalDeposits.plus(amountOfUSD);
    userTo.cappedPoolDeposits = userFrom.cappedPoolDeposits.plus(amountOfUSD);
    userTo.save();

    let poolPositionID = pool.id + "-" + userFrom.id;
    let poolPosition = CappedPoolPosition.load(poolPositionID);
    if (poolPosition === null) {
        poolPosition = new CappedPoolPosition(poolPositionID);
        poolPosition.user = userFrom.id;
        poolPosition.cappedPool = pool.id;
        poolPosition.costBasis = ZERO_BI;
        poolPosition.amountWithdrawn = ZERO_BI;
        poolPosition.tokenBalance = ZERO_BI;
    }
    poolPosition.amountWithdrawn = poolPosition.amountWithdrawn.plus(amountOfUSD);
    poolPosition.tokenBalance = poolPosition.tokenBalance.minus(event.params.value);
    poolPosition.save();

    let poolPositionID2 = pool.id + "-" + userTo.id;
    let poolPosition2 = CappedPoolPosition.load(poolPositionID2);
    if (poolPosition2 === null) {
        poolPosition2 = new CappedPoolPosition(poolPositionID2);
        poolPosition2.user = userTo.id;
        poolPosition2.cappedPool = pool.id;
        poolPosition2.costBasis = ZERO_BI;
        poolPosition2.amountWithdrawn = ZERO_BI;
        poolPosition2.tokenBalance = ZERO_BI;
    }
    poolPosition2.costBasis = poolPosition2.costBasis.plus(amountOfUSD);
    poolPosition2.tokenBalance = poolPosition2.tokenBalance.plus(event.params.value);
    poolPosition2.save();

    let registryDayData = updateRegistryDayData(event);
    registryDayData.dailyVolume = registryDayData.dailyVolume.plus(amountOfUSD);
    registryDayData.save();

    let poolDayData = updateCappedPoolDayData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolDayData.dailyVolume = poolDayData.dailyVolume.plus(amountOfUSD);
    poolDayData.save();

    let poolHourData = updateCappedPoolHourData(event, totalSupply, poolPositionAddresses, poolPositionBalances);
    poolHourData.hourlyVolume = poolHourData.hourlyVolume.plus(amountOfUSD);
    poolHourData.save();
}