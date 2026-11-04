# Market Basket Analysis

**Status:** Approved
**Updated:** 2026-11-04

## Goal
Extend the Sales semantic model so Ana can find products bought together and evaluate cross-sell, bundles and shelf placement. Capture the requirements from issue #39 and the 2026-11-04 working session for approval before implementation.

## Scope
- Change: Add dynamic MBA measures, Product B selection, Product/Subcategory/Category exploration, minimum Support and Lift parameters, and MBA pages in the existing sales-overview report.
- Keep unchanged: Existing sales and customer measures, existing tests, unrelated report pages, HR artifacts, source credentials and the existing Sales refresh schedule. No separate dataset or changes under scripts/.

## Approach
The source of truth is [sales.SemanticModel](../../src/sales.SemanticModel). [Sales.tmdl](../../src/sales.SemanticModel/definition/tables/Sales.tmdl) has line-level Order Number, Line Number, ProductKey, CustomerKey, StoreKey, Order Date and Quantity. [Product.tmdl](../../src/sales.SemanticModel/definition/tables/Product.tmdl) has Product, Subcategory and Category. Calendar, Customer and Store actively filter Sales. Store exposes Country and State, but Customer Segment, Sales Channel, an explicit Region attribute and a return flag are absent. Confirm the missing mappings before implementation; do not infer Channel from StoreKey or invent a segment.

Use Sales[Order Number] as the proposed basket key, matching the issue's Sales Order Number definition. Validate its uniqueness across customers, dates, stores and channels. Include only positive-quantity, non-return lines, using a confirmed return rule. Deduplicate repeated products within each basket. Add a disconnected Product (Basket) copy of the Product attributes for Product B; use TREATAS to apply B keys when building its order set. No relationship is needed with this approach. Build separate qualifying order sets for A and B, removing A's Product filter when evaluating B, then intersect order numbers. Do not try to find A and B on the same sales line.

Put explicit, described UPPERCASE measures in Sales under the Market Basket display folder: TOTAL ORDERS, ORDERS WITH A, ORDERS WITH B, ORDERS WITH A AND B, SUPPORT, CONFIDENCE, LIFT, AVG BASKET SIZE and AVG ITEMS PER ORDER. TOTAL ORDERS clears both product-role filters but preserves Date, Customer, Store and the approved Segment, Region and Channel context. Support is joint orders / total orders; Confidence is joint orders / A orders; Lift is Confidence / (B orders / total orders). Use safe division and return blank for undefined ratios. Suppress identical A/B members at the active grain and do not rank ambiguous multi-member totals as pairs. Retain the same qualifying-line and filter rules in shared basket logic, optionally a DAX UDF if it reduces duplication.

Expose matching Category > Subcategory > Product hierarchies for A and B. Add numeric what-if parameters for minimum Support (default 0.005, displayed as 0.5%) and minimum Lift (default 1.2). A separate eligibility measure hides pairs below either threshold without changing the raw metrics or their denominators. Parameter ranges and steps remain subject to approval. Add business descriptions identifying the A-to-B direction, denominator, grain and exclusions so Copilot and Q&A can interpret the metrics.

Extend [sales-overview.Report](../../src/sales-overview.Report), preserving its existing model binding. Proposed pages: MBA overview with three KPI cards and the top 20 qualifying product pairs by Lift; Product drill with a searchable Product A slicer and an associated-product table showing counts, Support, Confidence and conditionally formatted Lift; Association matrix with Category A × Category B Lift; Pair trend with monthly Support and Lift for a selected pair; and an order-details drillthrough page showing a bounded sample of orders containing both members. Carry both pair roles and current filters into drillthrough, with a back action and a clear sample label. Use the filter pane for Date, Segment, geography, Channel and thresholds, with at most one slicer per page. Confirm the page design with Ana before authoring.

After approval, implement in src/, run local BPA on a Windows host using the existing [bpa.ps1](../../scripts/bpa/bpa.ps1), deploy with [deploy.py](../../scripts/deploy.py), refresh with [refresh.py](../../scripts/refresh.py) and run [test-data.py](../../scripts/test-data.py). Add MBA assertions to Tests.Run in [functions.tmdl](../../src/sales.SemanticModel/definition/functions.tmdl), preserving existing assertions. Preview the report against the development workspace model. Measure full-history visual execution before considering an Order-Product distinct table; add that optimization only if needed and preserve filter/security behavior. Update the existing Sales model/report documentation with approved definitions and validation evidence.

## Team rules
- Applies: [Semantic model rules](../../.agents/skills/team-practices/references/rules/semantic-model-rules.md): preserve the star schema, keep measures on Sales, hide helper/base numeric columns, use readable UPPERCASE measure names and add at least one Tests.Run assertion per new measure, including parameter and eligibility measures.
- Applies: [Report rules](../../.agents/skills/team-practices/references/rules/report-rules.md): apply the Contoso theme and design standards to new pages, use at most one slicer and 20 visuals per page, and review rendered pages. Leave unrelated styling unchanged.
- Deviations: None proposed. TREATAS with a fully disconnected Product B table replaces the proposed inactive relationship; it avoids applying both product roles to one sales line.

## Acceptance checks
- Validate three real, named product pairs against independently calculated distinct qualifying order sets. Record pair keys, filter context, A count, B count, joint count, total orders and expected Support, Confidence and Lift. Do not claim fixtures are known until queried.
- Verify repeated lines count a product once per order; zero/negative quantities and confirmed returns are excluded; no-order and zero-denominator scopes are safe; identical Product, Subcategory and Category pairs are hidden. Reversing A/B preserves Support and Lift but recalculates directional Confidence.
- At each grain, compare unfiltered, monthly and combined Date/Segment/Region/Store/Channel scopes against the independent order-set calculation. B's prevalence and total orders must not inherit A's product filter. Threshold changes affect pair visibility and the top 20, not the underlying metric values.
- After approval of their definitions, validate both basket-average KPIs on orders with repeated product lines and multiple units. Validate parameter defaults, threshold boundaries and one Tests.Run assertion for every new measure; all existing assertions and baseline sales/customer results must remain unchanged.
- The model loads without errors; new measures have descriptions, formats and the Market Basket folder; BPA has no new violations. Test Copilot/Q&A wording against actual product names rather than assuming mountain bikes exist in this catalog.
- Render all new pages against the development model, verify Lift formatting, the top-20 limit, selected-pair monthly trends and drillthrough samples against joint order sets, and record Ana's sign-off. Existing pages still render and retain their filters and measures.
- Record full-history timings for each new visual with representative broad and selective filters, cold and warm runs, targeting under 3 seconds. Verify approved RLS behavior for both product roles, counts and order details. Confirm scheduled Sales refresh updates Product B and MBA results without a second dataset or schedule.

## Open questions
O1 - The issue specifies one Sales Order Number per basket but also asks about customer/day baskets. Confirm Order Number remains the definition for all channels, subject to key validation.

O2 - Which source attributes define Customer Segment, Sales Channel and Region? May Region use Store Country/State, or is a separate mapping required?

O3 - Are all returns represented by non-positive Quantity, or can positive-quantity lines be returns? Supply the authoritative exclusion rule or source field.

O4 - Is regional RLS required? If so, confirm the region mapping, user entitlement source and roles before adding security rules.

O5 - Should AVG BASKET SIZE mean distinct products per qualifying order and AVG ITEMS PER ORDER mean positive units per qualifying order? Confirm threshold ranges/steps and the order-detail sample limit.

Approval authorizes implementation of this scope but does not supply the missing source mappings or return rule. Implementation is blocked on O2 and O3: the Sales source imports 13 columns from RAW-Sales.csv, including Quantity but no Channel or return flag; Customer has no Segment field; Store exposes Country and State but no Region mapping. Provide the authoritative mappings and return rule, or explicitly approve a reduced scope, before model/report changes. O1, O4 and O5 remain open for confirmation.

## Change log
- 2026-11-04: Developer approved the spec and requested implementation in PR comment 6629207325. Rechecked Sales, Customer and Store source definitions and the existing Tests.Run validation path. Recorded approval without treating unresolved business questions as answered. No implementation artifacts were changed or deployed because the source mappings and qualifying-line return rule remain unresolved.
- 2026-11-04: Drafted the MBA model and report scope from issue #39, inspected the local Sales metadata and existing test scripts, and recorded source and business-definition gaps. No model/report changes, deployment, live-data validation or Ana sign-off have occurred. Awaiting developer review and approval.
