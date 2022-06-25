import { Swap, AddedLiquidity, RemovedLiquidity } from "../types/UbeswapRouterVerifier/UbeswapRouterVerifier";
import {
  SwapUbeswapRouter,
  AddLiquidityUbeswapRouter,
  RemoveLiquidityUbeswapRouter,
  ExecuteTransactionCappedPool,
  ExecuteTransactionPool,
  Pool,
  CappedPool
} from "../types/schema";

export function handleSwap(event: Swap): void {
    let ID = event.transaction.hash.toHexString() + "-swapUbeswapRouter";
    let swap = new SwapUbeswapRouter(ID);
    swap.timestamp = event.block.timestamp;
    swap.sourceAsset = event.params.srcAsset.toHexString();
    swap.destinationAsset = event.params.dstAsset.toHexString();
    swap.amount = event.params.srcAmount;

    let pool = Pool.load(event.params.pool.toHexString());
    if (pool !== null) {
        swap.pool = pool.id;
    }

    let cappedPool = CappedPool.load(event.params.pool.toHexString());
    if (cappedPool !== null) {
        swap.cappedPool = cappedPool.id;
    }

    let executeTransactionPool = ExecuteTransactionPool.load(event.transaction.hash.toHexString());
    if (executeTransactionPool !== null) {
        swap.executeTransactionPool = executeTransactionPool.id;
        swap.save();

        executeTransactionPool.swapUbeswapRouter = swap.id;
        executeTransactionPool.save();
    }

    let executeTransactionCappedPool = ExecuteTransactionCappedPool.load(event.transaction.hash.toHexString());
    if (executeTransactionCappedPool !== null) {
        swap.executeTransactionCappedPool = executeTransactionCappedPool.id;
        swap.save();

        executeTransactionCappedPool.swapUbeswapRouter = swap.id;
        executeTransactionCappedPool.save();
    }
}

export function handleAddedLiquidity(event: AddedLiquidity): void {
    let ID = event.transaction.hash.toHexString() + "-addLiquidityUbeswapRouter";
    let add = new AddLiquidityUbeswapRouter(ID);
    add.timestamp = event.block.timestamp;
    add.tokenA = event.params.params.tokenA.toHexString();
    add.tokenB = event.params.params.tokenB.toHexString();
    add.pair = event.params.params.pair.toHexString();
    add.amountA = event.params.params.amountA;
    add.amountB = event.params.params.amountB;

    let pool = Pool.load(event.params.params.pool.toHexString());
    if (pool !== null) {
        add.pool = pool.id;
    }

    let cappedPool = CappedPool.load(event.params.params.pool.toHexString());
    if (cappedPool !== null) {
        add.cappedPool = cappedPool.id;
    }

    let executeTransactionPool = ExecuteTransactionPool.load(event.transaction.hash.toHexString());
    if (executeTransactionPool !== null) {
        add.executeTransactionPool = executeTransactionPool.id;
        add.save();

        executeTransactionPool.addLiquidityUbeswapRouter = add.id;
        executeTransactionPool.save();
    }

    let executeTransactionCappedPool = ExecuteTransactionCappedPool.load(event.transaction.hash.toHexString());
    if (executeTransactionCappedPool !== null) {
        add.executeTransactionCappedPool = executeTransactionCappedPool.id;
        add.save();

        executeTransactionCappedPool.addLiquidityUbeswapRouter = add.id;
        executeTransactionCappedPool.save();
    }
}

export function handleRemomvedLiquidity(event: RemovedLiquidity): void {
    let ID = event.transaction.hash.toHexString() + "-removeLiquidityUbeswapRouter";
    let remove = new RemoveLiquidityUbeswapRouter(ID);
    remove.timestamp = event.block.timestamp;
    remove.tokenA = event.params.params.tokenA.toHexString();
    remove.tokenB = event.params.params.tokenB.toHexString();
    remove.pair = event.params.params.pair.toHexString();
    remove.numberOfLPTokens = event.params.params.amountA;

    let pool = Pool.load(event.params.params.pool.toHexString());
    if (pool !== null) {
        remove.pool = pool.id;
    }

    let cappedPool = CappedPool.load(event.params.params.pool.toHexString());
    if (cappedPool !== null) {
        remove.cappedPool = cappedPool.id;
    }

    let executeTransactionPool = ExecuteTransactionPool.load(event.transaction.hash.toHexString());
    if (executeTransactionPool !== null) {
        remove.executeTransactionPool = executeTransactionPool.id;
        remove.save();

        executeTransactionPool.removeLiquidityUbeswapRouter = remove.id;
        executeTransactionPool.save();
    }

    let executeTransactionCappedPool = ExecuteTransactionCappedPool.load(event.transaction.hash.toHexString());
    if (executeTransactionCappedPool !== null) {
        remove.executeTransactionCappedPool = executeTransactionCappedPool.id;
        remove.save();

        executeTransactionCappedPool.removeLiquidityUbeswapRouter = remove.id;
        executeTransactionCappedPool.save();
    }
}