import {
    AddedDepositAsset,
    RemovedDepositAsset,
    AddedAvailableAsset,
    RemovedAvailableAsset,
    UpdatedPerformanceFee,
} from "../types/templates/PoolManagerLogic/PoolManagerLogic";
import {
  PoolManagerLogic
} from "../types/schema";

export function handleAddedDepositAsset(event: AddedDepositAsset): void {
    let poolManagerLogic = PoolManagerLogic.load(event.address.toHexString());
    let depositAssets = (poolManagerLogic as PoolManagerLogic).depositAssets;
    depositAssets.push(event.params.asset.toHexString());
    poolManagerLogic.depositAssets = depositAssets;
    poolManagerLogic.save();
}

export function handleAddedAvailableAsset(event: AddedAvailableAsset): void {
    let poolManagerLogic = PoolManagerLogic.load(event.address.toHexString());
    let availableAssets = (poolManagerLogic as PoolManagerLogic).availableAssets;
    availableAssets.push(event.params.asset.toHexString());
    poolManagerLogic.availableAssets = availableAssets;
    poolManagerLogic.save();
}

export function handleRemovedAvailableAsset(event: RemovedAvailableAsset): void {
    let poolManagerLogic = PoolManagerLogic.load(event.address.toHexString());
    let availableAssets = (poolManagerLogic as PoolManagerLogic).availableAssets;
    let depositAssets = (poolManagerLogic as PoolManagerLogic).depositAssets;
    let target = event.params.asset.toHexString();
    let newAvailableAssets: string[] = [];
    let newDepositAssets: string[] = [];

    for (let i = 0; i < availableAssets.length; i++) {
        if (availableAssets[i] != target) {
            newAvailableAssets.push(availableAssets[i] as string);
        }
    }

    for (let i = 0; i < depositAssets.length; i++) {
        if (depositAssets[i] != target) {
            newDepositAssets.push(depositAssets[i] as string);
        }
    }

    poolManagerLogic.availableAssets = newAvailableAssets;
    poolManagerLogic.depositAssets = newDepositAssets;
    poolManagerLogic.save();
}

export function handleRemovedDepositAsset(event: RemovedDepositAsset): void {
    let poolManagerLogic = PoolManagerLogic.load(event.address.toHexString());
    let depositAssets = (poolManagerLogic as PoolManagerLogic).depositAssets;
    let target = event.params.asset.toHexString();
    let newDepositAssets: string[] = [];

    for (let i = 0; i < depositAssets.length; i++) {
        if (depositAssets[i] != target) {
            newDepositAssets.push(depositAssets[i] as string);
        }
    }

    poolManagerLogic.depositAssets = newDepositAssets;
    poolManagerLogic.save();
}

export function handleUpdatedPerformanceFee(event: UpdatedPerformanceFee): void {
    let poolManagerLogic = PoolManagerLogic.load(event.address.toHexString());
    poolManagerLogic.lastFeeUpdate = event.block.timestamp;
    poolManagerLogic.performanceFee = event.params.newFee;
    poolManagerLogic.save();
}