# Semantic Model Development Rules

- Follow a star schema.
- Create explicit measures for all aggregatable numeric columns and hide the corresponding base columns.
- Keep measures in the tables they describe. Avoid dedicated measure tables.
- Keep table, measure, and column names consistent within each object type.  Use consistent casing, word separators, and business terms.  To detect inconsistencies, compare names across the model: `Product Name` alongside `customer_name` mixes column naming styles; `TOTAL SALES` alongside `Total Cost` breaks the measure casing rule. Report existing inconsistencies rather than renaming unrelated objects.
- Use plural names for fact tables and singular names for dimension tables, for example `Sales`, `Product`, and `Customer`.

