import { Approve, Redeem } from "../types/MoolaInterestBearingTokenVerifier/MoolaInterestBearingTokenVerifier";
import {
  ApproveMoolaToken,
  RedeemMoolaToken,
  ExecuteTransactionCappedPool,
  ExecuteTransactionPool,
  Pool,
  CappedPool
} from "../types/schema";

export function handleApprove(event: Approve): void {
    let ID = event.transaction.hash.toHexString() + "-approveMoolaToken";
    let approve = new ApproveMoolaToken(ID);
    approve.timestamp = event.block.timestamp;
    approve.token = event.params.spender.toHexString();
    approve.amount = event.params.amount;

    let pool = Pool.load(event.params.pool.toHexString());
    if (pool !== null) {
        approve.pool = pool.id;
    }

    let cappedPool = CappedPool.load(event.params.pool.toHexString());
    if (cappedPool !== null) {
        approve.cappedPool = cappedPool.id;
    }

    let executeTransactionPool = ExecuteTransactionPool.load(event.transaction.hash.toHexString());
    if (executeTransactionPool !== null) {
        approve.executeTransactionPool = executeTransactionPool.id;
        approve.save();

        executeTransactionPool.approveMoolaToken = approve.id;
        executeTransactionPool.save();
    }

    let executeTransactionCappedPool = ExecuteTransactionCappedPool.load(event.transaction.hash.toHexString());
    if (executeTransactionCappedPool !== null) {
        approve.executeTransactionCappedPool = executeTransactionCappedPool.id;
        approve.save();

        executeTransactionCappedPool.approveMoolaToken = approve.id;
        executeTransactionCappedPool.save();
    }
}

export function handleRedeem(event: Redeem): void {
    let ID = event.transaction.hash.toHexString() + "-redeemMoolaToken";
    let approve = new RedeemMoolaToken(ID);
    approve.timestamp = event.block.timestamp;
    approve.token = event.params.interestBearingToken.toHexString();
    approve.amount = event.params.amount;

    let pool = Pool.load(event.params.pool.toHexString());
    if (pool !== null) {
        approve.pool = pool.id;
    }

    let cappedPool = CappedPool.load(event.params.pool.toHexString());
    if (cappedPool !== null) {
        approve.cappedPool = cappedPool.id;
    }

    let executeTransactionPool = ExecuteTransactionPool.load(event.transaction.hash.toHexString());
    if (executeTransactionPool !== null) {
        approve.executeTransactionPool = executeTransactionPool.id;
        approve.save();

        executeTransactionPool.redeemMoolaToken = approve.id;
        executeTransactionPool.save();
    }

    let executeTransactionCappedPool = ExecuteTransactionCappedPool.load(event.transaction.hash.toHexString());
    if (executeTransactionCappedPool !== null) {
        approve.executeTransactionCappedPool = executeTransactionCappedPool.id;
        approve.save();

        executeTransactionCappedPool.redeemMoolaToken = approve.id;
        executeTransactionCappedPool.save();
    }
}