import { Staked, Unstaked } from "../types/MobiusFarmVerifier/MobiusFarmVerifier";
import {
  DepositMobiusFarm,
  WithdrawMobiusFarm,
  ExecuteTransactionCappedPool,
  ExecuteTransactionPool,
  Pool,
  CappedPool
} from "../types/schema";

export function handleStaked(event: Staked): void {
    let ID = event.transaction.hash.toHexString() + "-depositMobiusFarm";
    let deposit = new DepositMobiusFarm(ID);
    deposit.timestamp = event.block.timestamp;
    deposit.stakingToken = event.params.stakingToken.toHexString();
    deposit.amount = event.params.numberOfLPTokens;

    let pool = Pool.load(event.params.pool.toHexString());
    if (pool !== null) {
        deposit.pool = pool.id;
    }

    let cappedPool = CappedPool.load(event.params.pool.toHexString());
    if (cappedPool !== null) {
        deposit.cappedPool = cappedPool.id;
    }

    let executeTransactionPool = ExecuteTransactionPool.load(event.transaction.hash.toHexString());
    if (executeTransactionPool !== null) {
        deposit.executeTransactionPool = executeTransactionPool.id;
        deposit.save();

        executeTransactionPool.depositMobiusFarm = deposit.id;
        executeTransactionPool.save();
    }

    let executeTransactionCappedPool = ExecuteTransactionCappedPool.load(event.transaction.hash.toHexString());
    if (executeTransactionCappedPool !== null) {
        deposit.executeTransactionCappedPool = executeTransactionCappedPool.id;
        deposit.save();

        executeTransactionCappedPool.depositMobiusFarm = deposit.id;
        executeTransactionCappedPool.save();
    }
}

export function handleUnstaked(event: Unstaked): void {
    let ID = event.transaction.hash.toHexString() + "-withdrawMobiusFarm";
    let withdraw = new WithdrawMobiusFarm(ID);
    withdraw.timestamp = event.block.timestamp;
    withdraw.stakingToken = event.params.stakingToken.toHexString();
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

        executeTransactionPool.withdrawMobiusFarm = withdraw.id;
        executeTransactionPool.save();
    }

    let executeTransactionCappedPool = ExecuteTransactionCappedPool.load(event.transaction.hash.toHexString());
    if (executeTransactionCappedPool !== null) {
        withdraw.executeTransactionCappedPool = executeTransactionCappedPool.id;
        withdraw.save();

        executeTransactionCappedPool.withdrawMobiusFarm = withdraw.id;
        executeTransactionCappedPool.save();
    }
}