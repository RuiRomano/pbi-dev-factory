# Semantic Model Development Rules

- For new models, ensure aggregatable numeric columns have **explicit measures** created.
- **Avoid dedicated measure tables.** Keep measures in the tables they describe.
- **Apply the naming conventions below.** For existing models, apply these rules only when design changes are in scope. Do not rename unrelated objects.
- **Ensure naming is consistent across the model.** For example, its not consistent to have a measure `Sales Amount Last Year` and another `Cost (LY)`
- **Write DAX Unit Tests**. When creating new measures check if `Tests.Run` DAX function exists, and if yes create new unit tests for the measure. This function is executed for data quality tests.
- **Use the [company-context.md](company-context.md) for tone and business context** when creating/edit descriptions on model objects (specially measures). All model descriptions should be clear and business friendly for consumers at Northwind Retail Group

## Naming Conventions

- Measures should use readable names in UPPERCASE
- Use plural names for fact tables and singular names for dimension tables, for example `Sales`, `Product`, and `Customer`.
- Don't use terms as 'Fact' or 'Dim', use plural names for fact tables and singular names for dimension tables (e.g. `Sales`, `Product`, `Customer`). 
