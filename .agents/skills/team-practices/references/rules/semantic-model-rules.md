# Semantic Model Development Rules

- Follow a star schema.
- Create explicit measures for all aggregatable numeric columns and hide the corresponding base columns.
- Keep measures in the tables they describe. Avoid dedicated measure tables.
- Ensure names are consistent across the model. For example, its not consistent to have a measure `Sales Amount Last Year` and another `Cost (LY)`
- Apply the naming conventions below. For existing models, apply these rules only when design changes are in scope. Do not rename unrelated objects.
- When creating measures also add at least one test in the DAX function `Tests.Run` in the model. This function is executed for data quality tests.

## Naming Conventions

- Use plural names for fact tables and singular names for dimension tables, for example `Sales`, `Product`, and `Customer`.
- Don't use terms as 'Fact' or 'Dim', use plural names for fact tables and singular names for dimension tables (e.g. `Sales`, `Product`, `Customer`). 
- Measures should use readable names in UPPERCASE