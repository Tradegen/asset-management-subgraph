# Asset Management V2 Subgraph

This subgraph dynamically tracks the pools and transactions in the [Tradegen asset management platform](https://github.com/Tradegen/protocol-v2).

- aggregated data across pools,
- data on individual pools,
- data on individual transactions,
- data on each user's positions and aggregated performance,
- data on each position in a pool,
- historical data on each pool and position

## Running Locally

Make sure to update package.json settings to point to your own graph account.

## Queries

Below are a few ways to show how to query the [asset-management subgraph](https://thegraph.com/hosted-service/subgraph/tradegen/asset-management) for data. The queries show most of the information that is queryable, but there are many other filtering options that can be used, just check out the [querying api](https://thegraph.com/docs/graphql-api). These queries can be used locally or in The Graph Explorer playground.

## Key Entity Overviews

#### Registry

Contains aggregated data across all pools. This entity tracks the number of pools, total deposits, total withdrawals, total volume, and the total value locked.

#### Pool

Contains data on a specific pool. Tracks the pool's performance fee, token price, total supply, transactions, positions, and cost basis.

#### CappedPool

Contains data on a specific capped pool. Similar to the Pool entity, but also tracks seed price and max supply.

#### PoolManagerLogic

Tracks a pool's available assets, deposit assets, and performance fee. 

#### User

Represents a unique wallet address. This entity tracks a user's deposits, withdrawals, positions, and managed pools.

## Example Queries

### Querying Aggregated Data

This query fetches aggredated data from all pools, to give a view into how much activity is happening within the protocol.

```graphql
{
  registries(first: 1) {
    poolCount
    cappedPoolCount
    totalVolume
    totalValueLocked
  }
}
```
