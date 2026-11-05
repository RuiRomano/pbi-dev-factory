# HR demo semantic model

## Overview

The `hr` semantic model supports a fictional workforce briefing for the HR team. It uses deterministic sample records and does not contain real employee data. Salary and gender are invented; neither the rates nor salary totals should be interpreted as company HR figures.

| Property | Value |
|---|---|
| Source | [`src/hr.SemanticModel`](../../src/hr.SemanticModel) |
| Storage | Import, generated in Power Query without an external source |
| Tables | 6 |
| Columns | 37 |
| Measures | 9 |
| Relationships | 8 |
| Previously validated DEV model | `hr` in `RR - PBI Factory {dev}`; current local changes are not deployed |

## Model structure

```mermaid
erDiagram
    Employee ||--o{ Headcount : "Employee Key"
    Employee ||--o{ Movements : "Employee Key"
    Department ||--o{ Headcount : "Department Key"
    Department ||--o{ Movements : "Department Key"
    Location ||--o{ Headcount : "Location Key"
    Location ||--o{ Movements : "Location Key"
    Calendar ||--o{ Headcount : "Snapshot Date"
    Calendar ||--o{ Movements : "Event Date"
```

All relationships filter one way from a dimension to a fact. `Employee` has 1,200 fictional profiles with static department and location assignments. `Department` has six rows; `Location` has five. `Calendar` contains every day from 2019-01-01 to 2025-12-31 and a February to January fiscal year. `Headcount` contains one row per employed employee at each month end from January 2023 through December 2025. `Movements` contains one row per hire or exit, including older events used to explain employee tenure. Fact foreign keys and aggregation-only numeric columns are hidden.

The local model marks the Employee, Department and Location keys as primary keys. Location City and Country have geographic categories. `Employee[Manager Flag]` is text: `Yes` for level L4 and `No` for other levels. `Headcount[FTE Value]` uses fixed decimal, with generated weights of 0.8 or 1.0. The unused hidden Fiscal Month column and its generating step have been removed; fiscal year behavior is unchanged.

## Measures

| Home table | Measure | Meaning |
|---|---|---|
| Headcount | `HEADCOUNT` | Distinct employees at the latest available snapshot within selected dates. A period total is the closing snapshot, not the sum of months. |
| Headcount | `FTE` | Sum of full-time equivalent weights at that closing snapshot. |
| Headcount | `AVERAGE HEADCOUNT` | Mean of available month-end headcounts in the selected months. |
| Headcount | `SALARY COST` | Illustrative monthly base-salary cost: annual base salary times FTE divided by 12 at the closing snapshot. Benefits and taxes are excluded. Values are synthetic currency units. |
| Headcount | `HEADCOUNT LY` | Headcount at the corresponding month end one year earlier. |
| Movements | `HIRES` | Count of hire events in selected dates. |
| Movements | `EXITS` | Count of exit events in selected dates. Exit reason and tenure band apply only to exits. |
| Movements | `ATTRITION RATE` | Exits over the trailing 12 complete months divided by average monthly headcount in those same months; blank without 12 snapshots or positive headcount. |
| Movements | `ATTRITION RATE LY` | The trailing attrition rate as of the corresponding month end one year earlier. |

The synthetic demo definitions are specified in the [HR demo spec](../specs/hr-demo-202610.md). These are not verified HR policy. Gender, fictional names and salary are not protected by a role; do not replace this sample with actual employee data without a security design.

FTE, average headcount and salary cost display with thousands separators and one decimal place. Salary cost previously displayed two decimal places; its DAX definition is unchanged. Attrition measures display percentages with one decimal place for positive, negative and zero values.

## Data sources, refresh and validation

`EmployeeRows` is a deterministic Power Query expression. The Import partitions use that roster to generate the snapshot and movement rows without network access. During the original implementation, the model was deployed to DEV via the Power BI model authoring tool, then fully refreshed through XMLA. All 14 live `Tests.Run` assertions returned boolean true. Those historical checks found 1,200 employees, six departments, five locations, 2,557 calendar dates, 26,123 snapshot rows, 1,509 events, 36 distinct snapshot months and no duplicate dimension keys. There were no unmatched employee foreign keys. At 2025-12-31, headcount was 891 and trailing attrition was approximately 5.02%. The monthly headcount reconciliation passed for all 35 transitions. These results have not been rerun against the current local changes.

### Local BPA remediation, 2026-11-05

The [approved remediation](../specs/bpa-remediation-202611.md) resolved all 48 HR model findings. The local definition loads successfully with six tables, 37 columns, nine measures and eight relationships. Running `& .\scripts\bpa\bpa.ps1 -src @('.\src')` reported no model violations. The HR report passed all 23 evaluated BPA results.

Added descriptions to all 21 previously undocumented visible columns. Complete before/after metadata comparisons confirmed that all nine measure expressions, test functions, relationships, roles, lineage tags and unrelated metadata were preserved.

The developer selected local-only delivery after deployment configuration was found to be missing. No deployment, Fabric refresh or live data tests were run. Fresh rendered review remains pending. The existing [HR report documentation](hr.report.md) contains the earlier Desktop screenshots.
