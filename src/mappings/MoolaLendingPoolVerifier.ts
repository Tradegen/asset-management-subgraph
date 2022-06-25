import { Deposit, Borrow, Repay } from "../types/MoolaLendingPoolVerifier/MoolaLendingPoolVerifier";
import {
  DepositMoolaLendingPool,
  BorrowMoolaLendingPool,
  RepayMoolaLendingPool,
  ExecuteTransactionCappedPool,
  ExecuteTransactionPool,
  Pool,
  CappedPool
} from "../types/schema";

export function handleDeposit(event: Deposit): void {
    let ID = event.transaction.hash.toHexString() + "-depositMoolaLendingPool";
    let deposit = new DepositMoolaLendingPool(ID);
    deposit.timestamp = event.block.timestamp;
    deposit.lendingPool = event.params.lendingPool.toHexString();
    deposit.reserveAsset = event.params.reserveAsset.toHexString();
    deposit.amount = event.params.amount;

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

        executeTransactionPool.depositMoolaLendingPool = deposit.id;
        executeTransactionPool.save();
    }

    let executeTransactionCappedPool = ExecuteTransactionCappedPool.load(event.transaction.hash.toHexString());
    if (executeTransactionCappedPool !== null) {
        deposit.executeTransactionCappedPool = executeTransactionCappedPool.id;
        deposit.save();

        executeTransactionCappedPool.depositMoolaLendingPool = deposit.id;
        executeTransactionCappedPool.save();
    }
}

export function handleBorrow(event: Borrow): void {
    let ID = event.transaction.hash.toHexString() + "-borrowMoolaLendingPool";
    let borrow = new BorrowMoolaLendingPool(ID);
    borrow.timestamp = event.block.timestamp;
    borrow.lendingPool = event.params.lendingPool.toHexString();
    borrow.reserveAsset = event.params.reserveAsset.toHexString();
    borrow.amount = event.params.amount;

    let pool = Pool.load(event.params.pool.toHexString());
    if (pool !== null) {
        borrow.pool = pool.id;
    }

    let cappedPool = CappedPool.load(event.params.pool.toHexString());
    if (cappedPool !== null) {
        borrow.cappedPool = cappedPool.id;
    }

    let executeTransactionPool = ExecuteTransactionPool.load(event.transaction.hash.toHexString());
    if (executeTransactionPool !== null) {
        borrow.executeTransactionPool = executeTransactionPool.id;
        borrow.save();

        executeTransactionPool.borrowMoolaLendingPool = borrow.id;
        executeTransactionPool.save();
    }

    let executeTransactionCappedPool = ExecuteTransactionCappedPool.load(event.transaction.hash.toHexString());
    if (executeTransactionCappedPool !== null) {
        borrow.executeTransactionCappedPool = executeTransactionCappedPool.id;
        borrow.save();

        executeTransactionCappedPool.borrowMoolaLendingPool = borrow.id;
        executeTransactionCappedPool.save();
    }
}

export function handleRepay(event: Repay): void {
    let ID = event.transaction.hash.toHexString() + "-repayMoolaLendingPool";
    let repay = new RepayMoolaLendingPool(ID);
    repay.timestamp = event.block.timestamp;
    repay.lendingPool = event.params.lendingPool.toHexString();
    repay.reserveAsset = event.params.reserveAsset.toHexString();
    repay.amount = event.params.amount;

    let pool = Pool.load(event.params.pool.toHexString());
    if (pool !== null) {
        repay.pool = pool.id;
    }

    let cappedPool = CappedPool.load(event.params.pool.toHexString());
    if (cappedPool !== null) {
        repay.cappedPool = cappedPool.id;
    }

    let executeTransactionPool = ExecuteTransactionPool.load(event.transaction.hash.toHexString());
    if (executeTransactionPool !== null) {
        repay.executeTransactionPool = executeTransactionPool.id;
        repay.save();

        executeTransactionPool.repayMoolaLendingPool = repay.id;
        executeTransactionPool.save();
    }

    let executeTransactionCappedPool = ExecuteTransactionCappedPool.load(event.transaction.hash.toHexString());
    if (executeTransactionCappedPool !== null) {
        repay.executeTransactionCappedPool = executeTransactionCappedPool.id;
        repay.save();

        executeTransactionCappedPool.repayMoolaLendingPool = repay.id;
        executeTransactionCappedPool.save();
    }
}