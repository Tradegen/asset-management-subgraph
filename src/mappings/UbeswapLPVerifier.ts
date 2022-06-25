import { Approve } from "../types/UbeswapLPVerifier/UbeswapLPVerifier";
import {
  ApproveUbeswapLP,
  ExecuteTransactionCappedPool,
  ExecuteTransactionPool,
  Pool,
  CappedPool
} from "../types/schema";

export function handleApprove(event: Approve): void {
    let ID = event.transaction.hash.toHexString() + "-approveUbeswapLP";
    let approve = new ApproveUbeswapLP(ID);
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

        executeTransactionPool.approveUbeswapLP = approve.id;
        executeTransactionPool.save();
    }

    let executeTransactionCappedPool = ExecuteTransactionCappedPool.load(event.transaction.hash.toHexString());
    if (executeTransactionCappedPool !== null) {
        approve.executeTransactionCappedPool = executeTransactionCappedPool.id;
        approve.save();

        executeTransactionCappedPool.approveUbeswapLP = approve.id;
        executeTransactionCappedPool.save();
    }
}