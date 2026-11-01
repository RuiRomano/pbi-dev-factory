# HR demo report spec

## Report identity
- Report name: `hr`
- Semantic model: `hr`
- Audience: HR team
- Primary purpose: Show a fictional workforce snapshot, trends and exit patterns.
- Delivery target: Local PBIP first; development workspace deployment and refresh after approval, using the repository scripts.

## Semantic model binding
- Entry mode: Local Model (to be created after approval).
- Model name: `hr`
- Binding: `byPath ../hr.SemanticModel`
- Implementation spec: [HR demo model and report](../docs/specs/hr-demo-202610.md), In progress.

## User decisions and constraints
- Scope: New model and new report; leave existing sales and customer-comparison projects alone.
- Data: Synthetic, repeatable, about 1,200 employees over 36 months, six departments and five locations; fictional gender and salary are allowed.
- Page count: Three.
- Interactivity: One fiscal-year slicer per page; department, location and other dimensions in the filter pane; native page tabs; ordinary cross-filtering. No bookmarks or drillthrough in the first build.
- Design direction: Contoso theme and design standards, accessible contrast, no more than 20 visuals per page.
- Publishing: Development workspace only after approval; do not publish to production.
- Tooling: Local PBIP/TMDL authoring; Power BI Desktop screenshot review if available. Service preview also requires a resolved workspace GUID; report blocked preview rather than claiming rendering was reviewed.
- Accessibility: Alt text on charts, readable labels, color not the sole carrier of meaning.
- Data caveats: All values are illustrative. Rates, fiscal calendar, salary-cost calculation and static organizational assignments are demo definitions, not verified HR policy.

## Narrative
- Core story: How many employees are there, how is the workforce changing, and where are exits concentrated?
- Audience promise: HR colleagues can compare time periods and segments without seeing real employee data.
- Key questions answered: Current headcount and FTE, hires and exits, 12-month attrition, department and location mix, and exits by reason and tenure.

## Design identity
- Tone: Calm, clear HR briefing using the Contoso palette.
- Signature: A compact KPI strip followed by a prominent trend and two balanced breakdowns.

## Page plan
1. Workforce size and movement over time
   - Archetype: Executive Summary, variant A: KPIs and trends precede segmentation.
   - Visuals: Five compact KPI cards, headcount trend, headcount by department, hires versus exits by month, attrition trend.
2. Where employee exits occur
   - Archetype: Analytical Canvas, variant B: Trend first, then reasons, departments and tenure.
   - Visuals: Three compact KPI cards, attrition trend, exits by reason, exits by department, exits by tenure-at-exit band.
3. Workforce mix across locations and roles
   - Archetype: Analytical Canvas, variant C: Geographic and role composition share the page.
   - Visuals: Three compact KPI cards, headcount by location, level, gender and department.

## Design system summary
- Theme: [Contoso](../.agents/skills/team-practices/references/rules/contoso-theme.json), indigo `#536CE5`, mint `#9CCDC6`, lilac `#C8BCF4`, ink `#20283F`, off-white `#F6F7FB`.
- Color semantics: Headcount and FTE indigo, hires mint, exits and attrition lilac; same measure uses the same color on every page.
- Typography: Segoe UI Semibold titles and Segoe UI body, per theme.
- Layout: 1280 x 720; 12-column grid, 24-pixel margins and 16-pixel gutters. The 2026-11-01 BPA correction supersedes the original FHD sizing.
- Accessibility: Alt text, text labels on categorical charts, WCAG AA text contrast.

## Model requirements
- New tables: `Employee`, `Department`, `Location`, `Calendar`, `Headcount`, `Movements`.
- New measures: `Headcount[HEADCOUNT]`, `Headcount[FTE]`, `Headcount[AVERAGE HEADCOUNT]`, `Headcount[SALARY COST]`, `Headcount[HEADCOUNT LY]`, `Movements[HIRES]`, `Movements[EXITS]`, `Movements[ATTRITION RATE]`, `Movements[ATTRITION RATE LY]`.
- Relationship and sort requirements: Single-direction dimensions to facts, daily Calendar to month-end Headcount and event-date Movements, month labels sorted chronologically, key and aggregatable base columns hidden.
- New calculated columns: Tenure-at-exit band on `Movements` if needed for grouping; use a fixed as-of event date rather than today's date.
- Tests: At least one `Tests.Run` assertion for each new measure, plus headcount reconciliation and previous-year checks.

## Canonical design contract

```yaml
Design Brief:
  generated_by: powerbi-report-cli
  contract_version: 1
  mode: greenfield
  design_identity:
    tone: Calm, clear HR briefing with Contoso colors and generous legibility
    signature: Compact KPI strip above a prominent trend and balanced breakdowns
  archetype: Executive Summary and Analytical Canvas
  navigation_model: none
  color_map:
    - { measure: "Headcount[HEADCOUNT]", color: "#536CE5", tint: "#E6EAFC" }
    - { measure: "Headcount[FTE]", color: "#536CE5", tint: "#E6EAFC" }
    - { measure: "Headcount[SALARY COST]", color: "#20283F", tint: "#F6F7FB" }
    - { measure: "Movements[HIRES]", color: "#9CCDC6", theme_color_id: 4 }
    - { measure: "Movements[EXITS]", color: "#C8BCF4", theme_color_id: 3 }
    - { measure: "Movements[ATTRITION RATE]", color: "#C8BCF4", theme_color_id: 3 }
  pages:
    - name: Workforce size and movement over time
      role: landing
      archetype: Executive
      layout_variant: A
      variant_rationale: Trend and mix explain the compact headline metrics.
      page_background: "#F6F7FB"
      layout_summary: KPI strip, paired trend and department chart, and two lower time series.
      layout_contract:
        canvas: { width: 1280, height: 720, margin: 24, gutter: 16, snap: 8 }
        grid:
          columns: 12
          rows: 12
          regions:
            header: [1, 1, 9, 3]
            filters: [9, 1, 13, 3]
            kpis: [1, 3, 13, 5]
            trend: [1, 5, 8, 9]
            department: [8, 5, 13, 9]
            movement: [1, 9, 7, 13]
            attrition: [7, 9, 13, 13]
        placements:
          - { id: page_title, region: header, kind: textbox, text: "Workforce size and movement over time" }
          - { id: fiscal_year, region: filters, kind: slicer, field_bindings: "Calendar[Fiscal Year]", slicer_type: dropdown }
          - { id: headcount, region: kpis, kind: cardVisual, purpose: "How many employees are active?", field_bindings: "Headcount[HEADCOUNT]", color_strategy: measure_match, slot: 1, of: 5 }
          - { id: fte, region: kpis, kind: cardVisual, purpose: "What is the full-time equivalent?", field_bindings: "Headcount[FTE]", color_strategy: measure_match, slot: 2, of: 5 }
          - { id: hires, region: kpis, kind: cardVisual, purpose: "How many hires occurred?", field_bindings: "Movements[HIRES]", color_strategy: measure_match, slot: 3, of: 5 }
          - { id: exits, region: kpis, kind: cardVisual, purpose: "How many exits occurred?", field_bindings: "Movements[EXITS]", color_strategy: measure_match, slot: 4, of: 5 }
          - { id: attrition_rate, region: kpis, kind: cardVisual, purpose: "What is the trailing attrition rate?", field_bindings: "Movements[ATTRITION RATE]", color_strategy: measure_match, slot: 5, of: 5 }
          - { id: headcount_trend, region: trend, kind: lineChart, purpose: "How did headcount change by month?", field_bindings: { Category: "Calendar[Month End]", Y: "Headcount[HEADCOUNT]" }, color_strategy: measure_match }
          - { id: by_department, region: department, kind: barChart, purpose: "Which departments have the most employees?", field_bindings: { Category: "Department[Department]", Y: "Headcount[HEADCOUNT]" }, sort_policy: value_desc, color_strategy: measure_match }
          - { id: hires_exits_trend, region: movement, kind: lineChart, purpose: "How do hires and exits compare over time?", field_bindings: { Category: "Calendar[Month End]", Y: ["Movements[HIRES]", "Movements[EXITS]"] }, color_strategy: semantic }
          - { id: attrition_trend, region: attrition, kind: lineChart, purpose: "How has trailing attrition changed?", field_bindings: { Category: "Calendar[Month End]", Y: "Movements[ATTRITION RATE]" }, color_strategy: measure_match }
        space_audit:
          content_cell_count: 120
          placed_cell_count: 120
          empty_cell_pct: 0
          unplaced_regions: []
          largest_region: { name: trend, pct_of_content: 23.3 }
          balance_rationale: "The trend has room for 36 months; department and lower comparisons remain readable."
    - name: Where employee exits occur
      role: detail
      archetype: Analytical
      layout_variant: B
      variant_rationale: Puts the time pattern before the exit segments.
      page_background: "#F6F7FB"
      layout_summary: KPI strip, trailing attrition trend, reason ranking, department and tenure comparisons.
      layout_contract:
        canvas: { width: 1280, height: 720, margin: 24, gutter: 16, snap: 8 }
        grid:
          columns: 12
          rows: 12
          regions:
            header: [1, 1, 9, 3]
            filters: [9, 1, 13, 3]
            kpis: [1, 3, 13, 5]
            trend: [1, 5, 8, 9]
            reason: [8, 5, 13, 9]
            department: [1, 9, 7, 13]
            tenure: [7, 9, 13, 13]
        placements:
          - { id: page_title, region: header, kind: textbox, text: "Where employee exits occur" }
          - { id: fiscal_year, region: filters, kind: slicer, field_bindings: "Calendar[Fiscal Year]", slicer_type: dropdown }
          - { id: exits, region: kpis, kind: cardVisual, purpose: "How many employees exited?", field_bindings: "Movements[EXITS]", color_strategy: measure_match, slot: 1, of: 3 }
          - { id: attrition_rate, region: kpis, kind: cardVisual, purpose: "What is the trailing attrition rate?", field_bindings: "Movements[ATTRITION RATE]", color_strategy: measure_match, slot: 2, of: 3 }
          - { id: attrition_rate_ly, region: kpis, kind: cardVisual, purpose: "What was the rate a year earlier?", field_bindings: "Movements[ATTRITION RATE LY]", color_strategy: measure_match, slot: 3, of: 3 }
          - { id: attrition_trend, region: trend, kind: lineChart, purpose: "How has trailing attrition changed?", field_bindings: { Category: "Calendar[Month End]", Y: "Movements[ATTRITION RATE]" }, color_strategy: measure_match }
          - { id: exits_by_reason, region: reason, kind: barChart, purpose: "Which reasons account for exits?", field_bindings: { Category: "Movements[Exit Reason]", Y: "Movements[EXITS]" }, sort_policy: value_desc, color_strategy: measure_match }
          - { id: exits_by_department, region: department, kind: barChart, purpose: "Which departments have the most exits?", field_bindings: { Category: "Department[Department]", Y: "Movements[EXITS]" }, sort_policy: value_desc, color_strategy: measure_match }
          - { id: exits_by_tenure, region: tenure, kind: barChart, purpose: "At what tenure do exits occur?", field_bindings: { Category: "Movements[Tenure Band]", Y: "Movements[EXITS]" }, sort_policy: natural_order, color_strategy: measure_match }
        space_audit:
          content_cell_count: 120
          placed_cell_count: 120
          empty_cell_pct: 0
          unplaced_regions: []
          largest_region: { name: trend, pct_of_content: 23.3 }
          balance_rationale: "The rate trend leads; reasons, department and tenure have substantial balanced chart space."
    - name: Workforce mix across locations and roles
      role: detail
      archetype: Analytical
      layout_variant: C
      variant_rationale: Geographic and demographic views share balanced chart areas.
      page_background: "#F6F7FB"
      layout_summary: KPI strip with location, level, gender and department headcount comparisons.
      layout_contract:
        canvas: { width: 1280, height: 720, margin: 24, gutter: 16, snap: 8 }
        grid:
          columns: 12
          rows: 12
          regions:
            header: [1, 1, 9, 3]
            filters: [9, 1, 13, 3]
            kpis: [1, 3, 13, 5]
            location: [1, 5, 8, 9]
            level: [8, 5, 13, 9]
            gender: [1, 9, 7, 13]
            department: [7, 9, 13, 13]
        placements:
          - { id: page_title, region: header, kind: textbox, text: "Workforce mix across locations and roles" }
          - { id: fiscal_year, region: filters, kind: slicer, field_bindings: "Calendar[Fiscal Year]", slicer_type: dropdown }
          - { id: headcount, region: kpis, kind: cardVisual, purpose: "How many employees are active?", field_bindings: "Headcount[HEADCOUNT]", color_strategy: measure_match, slot: 1, of: 3 }
          - { id: fte, region: kpis, kind: cardVisual, purpose: "What is the full-time equivalent?", field_bindings: "Headcount[FTE]", color_strategy: measure_match, slot: 2, of: 3 }
          - { id: salary_cost, region: kpis, kind: cardVisual, purpose: "What is the estimated monthly salary cost?", field_bindings: "Headcount[SALARY COST]", color_strategy: measure_match, slot: 3, of: 3 }
          - { id: by_location, region: location, kind: barChart, purpose: "Which locations have the largest workforce?", field_bindings: { Category: "Location[City]", Y: "Headcount[HEADCOUNT]" }, sort_policy: value_desc, color_strategy: measure_match }
          - { id: by_level, region: level, kind: barChart, purpose: "How is headcount distributed by level?", field_bindings: { Category: "Employee[Level]", Y: "Headcount[HEADCOUNT]" }, sort_policy: natural_order, color_strategy: measure_match }
          - { id: by_gender, region: gender, kind: barChart, purpose: "How is headcount distributed by gender?", field_bindings: { Category: "Employee[Gender]", Y: "Headcount[HEADCOUNT]" }, sort_policy: value_desc, color_strategy: measure_match }
          - { id: by_department, region: department, kind: barChart, purpose: "How is headcount distributed by department?", field_bindings: { Category: "Department[Department]", Y: "Headcount[HEADCOUNT]" }, sort_policy: value_desc, color_strategy: measure_match }
        space_audit:
          content_cell_count: 120
          placed_cell_count: 120
          empty_cell_pct: 0
          unplaced_regions: []
          largest_region: { name: location, pct_of_content: 23.3 }
          balance_rationale: "The large location comparison leads while level, gender and department each retain readable space."
  interaction_pattern:
    drill_targets: []
    cross_filter_rules: "Charts filter other charts on the same page; use the filter pane for department and location."
  accessibility:
    alt_text_strategy: "State the measure, category and time period or sorting for every chart."
    contrast_notes: "Use ink on white or off-white for labels and titles; never rely on pastel fills alone."
  theme:
    base: ".agents/skills/team-practices/references/rules/contoso-theme.json"
    user_overrides: "Keep Contoso palette, fonts and visual styling."
```

## Implementation notes
- Model changes: Build the new local TMDL project from generated, repeatable Power Query data and test every measure against the generated fixtures.
- PBIR/report authoring: Bind by path to `hr.SemanticModel`; implement the canonical design contract above and filter pane settings.
- Validation: Local BPA, refresh, `Tests.Run`, measure checks, JSON/PBIR validation and screenshots when preview is available.
- Publishing boundary: After approval, deploy only to the configured Fabric development workspace with the repository script.
- Risks: Demo rates and demographic figures must be labeled illustrative; Desktop preview and Fabric access have not yet been verified.
