# Semantic model data sources

This inventory describes the source expressions in the checked-in TMDL definitions. It covers both semantic models in `src`; it does not establish the live service's credentials, gateways, refresh schedule or current data availability.

## Sales

The `sales` model has five Import partitions. Four read CSV files from the configured `HttpSource` base URL, and the calendar is generated in Power Query.

| Table | Input | Definition |
|---|---|---|
| Sales | [RAW-Sales.csv](https://raw.githubusercontent.com/RuiRomano/workshop-fabcon-26-bcn/main/resources/sample-data/RAW-Sales.csv) | [Sales.tmdl](../../src/sales.SemanticModel/definition/tables/Sales.tmdl) |
| Product | [RAW-Product.csv](https://raw.githubusercontent.com/RuiRomano/workshop-fabcon-26-bcn/main/resources/sample-data/RAW-Product.csv) | [Product.tmdl](../../src/sales.SemanticModel/definition/tables/Product.tmdl) |
| Customer | [RAW-Customer.csv](https://raw.githubusercontent.com/RuiRomano/workshop-fabcon-26-bcn/main/resources/sample-data/RAW-Customer.csv) | [Customer.tmdl](../../src/sales.SemanticModel/definition/tables/Customer.tmdl) |
| Store | [RAW-Store.csv](https://raw.githubusercontent.com/RuiRomano/workshop-fabcon-26-bcn/main/resources/sample-data/RAW-Store.csv) | [Store.tmdl](../../src/sales.SemanticModel/definition/tables/Store.tmdl) |
| Calendar | Generated date list from 2017-01-01 through 2021-12-31 | [Calendar.tmdl](../../src/sales.SemanticModel/definition/tables/Calendar.tmdl) |

The shared Power Query parameters are defined in [expressions.tmdl](../../src/sales.SemanticModel/definition/expressions.tmdl). `HttpSource` currently points to `https://raw.githubusercontent.com/RuiRomano/workshop-fabcon-26-bcn/main/resources/sample-data/`. `Environment` is `DEV` and is added to Sales as a label; it does not switch the URL. `Randomizer` is `0.6` and controls changes to sales quantity and net price. Sales also generates a random time during refresh, so these query results can change between refreshes even when the CSV files do not.

## HR

The `hr` model has six Import partitions, all defined with Power Query M. It has no external data source.

| Table | Input | Definition |
|---|---|---|
| Employee | Selected columns from the shared `EmployeeRows` expression | [Employee.tmdl](../../src/hr.SemanticModel/definition/tables/Employee.tmdl) |
| Headcount | Monthly snapshots generated from `EmployeeRows` | [Headcount.tmdl](../../src/hr.SemanticModel/definition/tables/Headcount.tmdl) |
| Movements | Hire and exit events generated from `EmployeeRows` | [Movements.tmdl](../../src/hr.SemanticModel/definition/tables/Movements.tmdl) |
| Department | Six rows defined inline in the partition | [Department.tmdl](../../src/hr.SemanticModel/definition/tables/Department.tmdl) |
| Location | Five rows defined inline in the partition | [Location.tmdl](../../src/hr.SemanticModel/definition/tables/Location.tmdl) |
| Calendar | Generated date list from 2019-01-01 through 2025-12-31 | [Calendar.tmdl](../../src/hr.SemanticModel/definition/tables/Calendar.tmdl) |

The shared `EmployeeRows` expression is defined in [expressions.tmdl](../../src/hr.SemanticModel/definition/expressions.tmdl). It creates 1,200 fictional employee records from a fixed numeric seed. The roster, snapshots, events, reference tables and calendar are generated locally by the model queries; no network source is referenced.

## Refresh and validation notes

Both models use Import storage and Power Query M partitions. The local metadata inspection confirmed five partitions for `sales` and six for `hr`. The source expressions were reviewed in the checked-in TMDL; this does not verify that remote files are currently reachable or that either model has refreshed successfully in a service. Credential, gateway and schedule settings are not established by these source definitions.
