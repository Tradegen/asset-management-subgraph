import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  Pool,
  PoolDayData,
  CappedPool,
  CappedPoolDayData,
  RegistryDayData,
  Registry,
  PoolHourData,
  CappedPoolHourData
} from "../types/schema";
import {
  REGISTRY_ADDRESS,
  ZERO_BI
} from "./helpers";

export function updateRegistryDayData(event: ethereum.Event): RegistryDayData {
  let registry = Registry.load(REGISTRY_ADDRESS);
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let registryDayData = RegistryDayData.load(dayID.toString());
  if (registryDayData === null) {
    registryDayData = new RegistryDayData(dayID.toString());
    registryDayData.date = dayStartTimestamp;
    registryDayData.txCount = 0;
    registryDayData.dailyDeposits = ZERO_BI;
    registryDayData.dailyWithdrawals = ZERO_BI;
    registryDayData.totalDeposits = ZERO_BI;
    registryDayData.totalWithdrawals = ZERO_BI;
    registryDayData.dailyPoolsCreated = 0;
    registryDayData.dailyCappedPoolsCreated = 0;
    registryDayData.totalValueLocked = ZERO_BI;
  }

  registryDayData.totalVolume = registry.totalVolume;
  registryDayData.totalValueLocked = registry.totalValueLocked;
  registryDayData.totalDeposits = registry.totalDeposits;
  registryDayData.totalWithdrawals = registry.totalWithdrawals;
  registryDayData.txCount = registry.txCount;
  registryDayData.save();

  return registryDayData as RegistryDayData;
}

export function updatePoolDayData(event: ethereum.Event, totalSupply: BigInt, positions: string[], balances: BigInt[]): PoolDayData {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let dayPoolID = event.address
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(dayID).toString());
  let pool = Pool.load(event.address.toHexString());
  let poolDayData = PoolDayData.load(dayPoolID);
  if (poolDayData === null) {
    poolDayData = new PoolDayData(dayPoolID);
    poolDayData.date = dayStartTimestamp;
    poolDayData.pool = event.address.toHexString();
    poolDayData.dailyVolume = ZERO_BI;
    poolDayData.dailyTxns = ZERO_BI;
  }

  poolDayData.totalSupply = totalSupply;
  poolDayData.positionAddresses = positions;
  poolDayData.positionBalances = balances;
  poolDayData.totalValueLocked = pool.totalValueLocked;
  poolDayData.tokenPrice = pool.tokenPrice;
  poolDayData.dailyTxns = poolDayData.dailyTxns + 1;
  poolDayData.save();

  return poolDayData as PoolDayData;
}

export function updatePoolHourData(event: ethereum.Event, totalSupply: BigInt, positions: string[], balances: BigInt[]): PoolHourData {
  let timestamp = event.block.timestamp.toI32();
  // Get unique hour within unix history.
  let hourIndex = timestamp / 3600;
  // Want the rounded effect.
  let hourStartUnix = hourIndex * 3600;
  let hourPoolID = event.address
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(hourIndex).toString());
  let pool = Pool.load(event.address.toHexString());
  let poolHourData = PoolHourData.load(hourPoolID);
  if (poolHourData === null) {
    poolHourData = new PoolHourData(hourPoolID);
    poolHourData.hourStartUnix = hourStartUnix;
    poolHourData.pool = event.address.toHexString();
    poolHourData.hourlyVolume = ZERO_BI;
    poolHourData.hourlyTxns = ZERO_BI;

    // Random line to make a redeploy happen.
    poolHourData.totalSupply = ZERO_BI;
  }

  poolHourData.totalSupply = totalSupply;
  poolHourData.positionAddresses = positions;
  poolHourData.positionBalances = balances;
  poolHourData.totalValueLocked = pool.totalValueLocked;
  poolHourData.tokenPrice = pool.tokenPrice;

  poolHourData.hourlyTxns = poolHourData.hourlyTxns + 1;
  poolHourData.save();

  return poolHourData as PoolHourData;
}

export function updateCappedPoolDayData(event: ethereum.Event, totalSupply: BigInt, positions: string[], balances: BigInt[]): CappedPoolDayData {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let dayPoolID = event.address
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(dayID).toString());
  let pool = CappedPool.load(event.address.toHexString());
  let poolDayData = CappedPoolDayData.load(dayPoolID);
  if (poolDayData === null) {
    poolDayData = new CappedPoolDayData(dayPoolID);
    poolDayData.date = dayStartTimestamp;
    poolDayData.cappedPool = event.address.toHexString();
    poolDayData.dailyVolume = ZERO_BI;
    poolDayData.dailyTxns = ZERO_BI;
  }

  poolDayData.totalSupply = totalSupply;
  poolDayData.positionAddresses = positions;
  poolDayData.positionBalances = balances;
  poolDayData.totalValueLocked = pool.totalValueLocked;
  poolDayData.tokenPrice = pool.tokenPrice;
  poolDayData.dailyTxns = poolDayData.dailyTxns + 1;
  poolDayData.save();

  return poolDayData as CappedPoolDayData;
}

export function updateCappedPoolHourData(event: ethereum.Event, totalSupply: BigInt, positions: string[], balances: BigInt[]): CappedPoolHourData {
  let timestamp = event.block.timestamp.toI32();
  // Get unique hour within unix history.
  let hourIndex = timestamp / 3600;
  // Want the rounded effect.
  let hourStartUnix = hourIndex * 3600;
  let hourPoolID = event.address
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(hourIndex).toString());
  let pool = CappedPool.load(event.address.toHexString());
  let poolHourData = CappedPoolHourData.load(hourPoolID);
  if (poolHourData === null) {
    poolHourData = new CappedPoolHourData(hourPoolID);
    poolHourData.hourStartUnix = hourStartUnix;
    poolHourData.cappedPool = event.address.toHexString();
    poolHourData.hourlyVolume = ZERO_BI;
    poolHourData.hourlyTxns = ZERO_BI;

    // Random line to make a redeploy happen.
    poolHourData.totalSupply = ZERO_BI;
  }

  poolHourData.totalSupply = totalSupply;
  poolHourData.positionAddresses = positions;
  poolHourData.positionBalances = balances;
  poolHourData.totalValueLocked = pool.totalValueLocked;
  poolHourData.tokenPrice = pool.tokenPrice;

  poolHourData.hourlyTxns = poolHourData.hourlyTxns + 1;
  poolHourData.save();

  return poolHourData as CappedPoolHourData;
}