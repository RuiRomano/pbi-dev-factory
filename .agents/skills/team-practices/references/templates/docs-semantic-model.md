# <Semantic Model Name>

## Overview
<What the model represents, the business processes it supports, its intended audience, and its principal subject areas.>

| Property | Value |
|---|---|
| Source | `<repository path>` |
| Storage mode(s) | <mode> |
| Tables | <count> |
| Measures | <count> |
| Relationships | <count> |

## Model Structure
```mermaid
erDiagram
    <TABLE_A> ||--o{ <TABLE_B> : "<relationship>"
```
<Explain the table roles, relationship directions, cardinalities, inactive relationships, and important modeling implications.>

## Tables and Columns
### <Table Name>
<Purpose and grain of the table.>

| Column | Data type | Visibility | Description |
|---|---|---|---|
| <column> | <type> | Visible / Hidden | <business meaning> |

## Measures
### <Measure Name>
<Business explanation of what the measure calculates, how filters affect it, and any time, currency, ratio, or exception logic.>

```dax
<measure expression>
```

## Security
<RLS/OLS roles and filter behavior, or state that none were found. Do not expose role membership or sensitive identities.>

## Data Sources and Refresh
<Source systems, partitions, storage modes, shared expressions, and refresh considerations that can be established from metadata.>
