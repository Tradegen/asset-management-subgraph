import { Staked, Unstaked, ClaimedReward } from "../types/UbeswapFarmVerifier/UbeswapFarmVerifier";
import {
  StakeUbeswapFarm,
  WithdrawUbeswapFarm,
  GetRewardUbeswapFarm,
  ExecuteTransactionCappedPool,
  ExecuteTransactionPool,
  Pool,
  CappedPool
} from "../types/schema";

export function handleStaked(event: Staked): void {
    let ID = event.transaction.hash.toHexString() + "-stakeUbeswapFarm";
    let stake = new StakeUbeswapFarm(ID);
    stake.timestamp = event.block.timestamp;
    stake.farmAddress = event.params.farm.toHexString();
    stake.liquidityPair = event.params.pair.toHexString();
    stake.amount = event.params.numberOfLPTokens;

    let pool = Pool.load(event.params.pool.toHexString());
    if (pool !== null) {
        stake.pool = pool.id;
    }

    let cappedPool = CappedPool.load(event.params.pool.toHexString());
    if (cappedPool !== null) {
        stake.cappedPool = cappedPool.id;
    }

    let executeTransactionPool = ExecuteTransactionPool.load(event.transaction.hash.toHexString());
    if (executeTransactionPool !== null) {
        stake.executeTransactionPool = executeTransactionPool.id;
        stake.save();

        executeTransactionPool.stakeUbeswapFarm = stake.id;
        executeTransactionPool.save();
    }

    let executeTransactionCappedPool = ExecuteTransactionCappedPool.load(event.transaction.hash.toHexString());
    if (executeTransactionCappedPool !== null) {
        stake.executeTransactionCappedPool = executeTransactionCappedPool.id;
        stake.save();

        executeTransactionCappedPool.stakeUbeswapFarm = stake.id;
        executeTransactionCappedPool.save();
    }
}

export function handleUnstaked(event: Unstaked): void {
    let ID = event.transaction.hash.toHexString() + "-withdrawUbeswapFarm";
    let withdraw = new WithdrawUbeswapFarm(ID);
    withdraw.timestamp = event.block.timestamp;
    withdraw.farmAddress = event.params.farm.toHexString();
    withdraw.liquidityPair = event.params.pair.toHexString();
    withdraw.amount = event.params.numberOfLPTokens;

    let pool = Pool.load(event.params.pool.toHexString());
    if (pool !== null) {
        withdraw.pool = pool.id;
    }

    let cappedPool = CappedPool.load(event.params.pool.toHexString());
    if (cappedPool !== null) {
        withdraw.cappedPool = cappedPool.id;
    }

    let executeTransactionPool = ExecuteTransactionPool.load(event.transaction.hash.toHexString());
    if (executeTransactionPool !== null) {
        withdraw.executeTransactionPool = executeTransactionPool.id;
        withdraw.save();

        executeTransactionPool.withdrawUbeswapFarm = withdraw.id;
        executeTransactionPool.save();
    }

    let executeTransactionCappedPool = ExecuteTransactionCappedPool.load(event.transaction.hash.toHexString());
    if (executeTransactionCappedPool !== null) {
        withdraw.executeTransactionCappedPool = executeTransactionCappedPool.id;
        withdraw.save();

        executeTransactionCappedPool.withdrawUbeswapFarm = withdraw.id;
        executeTransactionCappedPool.save();
    }
}

export function handleClaimedReward(event: ClaimedReward): void {
    let ID = event.transaction.hash.toHexString() + "-getRewardUbeswapFarm";
    let getReward = new GetRewardUbeswapFarm(ID);
    getReward.timestamp = event.block.timestamp;
    getReward.farmAddress = event.params.farm.toHexString();
    getReward.rewardToken = event.params.rewardToken.toHexString();
    getReward.amount = event.params.amount;

    let pool = Pool.load(event.params.pool.toHexString());
    if (pool !== null) {
        getReward.pool = pool.id;
    }

    let cappedPool = CappedPool.load(event.params.pool.toHexString());
    if (cappedPool !== null) {
        getReward.cappedPool = cappedPool.id;
    }

    let executeTransactionPool = ExecuteTransactionPool.load(event.transaction.hash.toHexString());
    if (executeTransactionPool !== null) {
        getReward.executeTransactionPool = executeTransactionPool.id;
        getReward.save();

        executeTransactionPool.getRewardUbeswapFarm = getReward.id;
        executeTransactionPool.save();
    }

    let executeTransactionCappedPool = ExecuteTransactionCappedPool.load(event.transaction.hash.toHexString());
    if (executeTransactionCappedPool !== null) {
        getReward.executeTransactionCappedPool = executeTransactionCappedPool.id;
        getReward.save();

        executeTransactionCappedPool.getRewardUbeswapFarm = getReward.id;
        executeTransactionCappedPool.save();
    }
}