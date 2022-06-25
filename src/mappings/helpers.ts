import {
    Address,
    BigDecimal,
    BigInt
  } from "@graphprotocol/graph-ts";
  import {
    PoolPosition,
    NFTPoolPosition,
    User
  } from "../types/schema";
  import { Registry } from "../types/Registry/Registry";
  import { Pool as PoolContract} from "../types/templates/Pool/Pool";
import { CappedPool as CappedPoolContract} from "../types/templates/CappedPool/CappedPool";
import { CappedPoolNFT as CappedPoolNFTContract} from "../types/templates/CappedPoolNFT/CappedPoolNFT";
  
  export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
  export const REGISTRY_ADDRESS = "0x1DB1B73DDDAC81b957E744763d85c81dd638f2eE";
    
  export let ZERO_BI = BigInt.fromI32(0);
  export let ONE_BI = BigInt.fromI32(1);
  export let ZERO_BD = BigDecimal.fromString("0");
  export let ONE_BD = BigDecimal.fromString("1");
  export let BI_18 = BigInt.fromI32(18);
  
  export let registryContract = Registry.bind(
    Address.fromString(REGISTRY_ADDRESS)
  );
  
  export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
    let bd = BigDecimal.fromString("1");
    for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
      bd = bd.times(BigDecimal.fromString("10"));
    }
    return bd;
  }
  
  export function bigDecimalExp18(): BigDecimal {
    return BigDecimal.fromString("1000000000000000000");
  }
  
  export function convertEthToDecimal(eth: BigInt): BigDecimal {
    return eth.toBigDecimal().div(exponentToBigDecimal(new BigInt(18)));
  }
  
  export function convertTokenToDecimal(
    tokenAmount: BigInt,
    exchangeDecimals: BigInt
  ): BigDecimal {
    if (exchangeDecimals == ZERO_BI) {
      return tokenAmount.toBigDecimal();
    }
    return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
  }
  
  export function equalToZero(value: BigDecimal): boolean {
    const formattedVal = parseFloat(value.toString());
    const zero = parseFloat(ZERO_BD.toString());
    if (zero == formattedVal) {
      return true;
    }
    return false;
  }
  
  export function isNullEthValue(value: string): boolean {
    return (
      value ==
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    );
  }

  export function fetchCappedPoolNFTAddress(cappedPoolAddress: Address): string {  
    // Get positions and balances.
    let result = registryContract.try_cappedPoolNFTs(cappedPoolAddress);
    return result.value.toHexString()
  }
  
  export function fetchPositionAddresses(poolAddress: Address): string[] {  
    // Get positions and balances.
    let result = registryContract.try_getPositionsAndTotal(poolAddress);
    let resultValue0 = result.value.toMap().get("value0").toAddressArray();
    let results:string[] = [];
    for (var i = 0; i < resultValue0.length; i++)
    {
      results.push(resultValue0[i].toHexString());
    }
  
    return (results.length > 0) ? results : [ADDRESS_ZERO];
  }
  
  export function fetchPositionBalances(poolAddress: Address): BigInt[] {  
    // Get positions and balances.
    let result = registryContract.try_getPositionsAndTotal(poolAddress);
    let resultValue1:BigInt[]  = result.value.toMap().get("value1").toBigIntArray();
  
    return (resultValue1.length > 0) ? resultValue1 : [ZERO_BI];
  }
  
  export function fetchPoolTokenPrice(poolAddress: Address): BigInt {
    let contract = PoolContract.bind(poolAddress);
  
    let tokenPriceValue = ZERO_BI;
    let tokenPriceResult = contract.try_tokenPrice();
  
    return tokenPriceResult.value ? tokenPriceResult.value : tokenPriceValue;
  }
  
  export function fetchPoolTotalSupply(poolAddress: Address): BigInt {
    let contract = PoolContract.bind(poolAddress);
  
    let totalSupplyValue = ZERO_BI;
    let totalSupplyResult = contract.try_totalSupply();
  
    return totalSupplyResult.value ? totalSupplyResult.value : totalSupplyValue;
  }
  
  export function fetchCappedPoolTokenPrice(CappedPoolAddress: Address): BigInt {
    let contract = CappedPoolContract.bind(CappedPoolAddress);
  
    let tokenPriceValue = ZERO_BI;
    let tokenPriceResult = contract.try_tokenPrice();
  
    return tokenPriceResult.value ? tokenPriceResult.value : tokenPriceValue;
  }
  
  export function fetchCappedPoolTotalSupply(CappedPoolNFTAddress: Address): BigInt {
    let contract = CappedPoolNFTContract.bind(CappedPoolNFTAddress);
  
    let totalSupplyValue = ZERO_BI;
    let totalSupplyResult = contract.try_totalSupply();
  
    return totalSupplyResult.value ? totalSupplyResult.value : totalSupplyValue;
  }