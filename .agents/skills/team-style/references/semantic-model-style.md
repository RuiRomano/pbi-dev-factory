# Semantic Model Style

## Required rules

- Follow a star schema for semantic model design.
- Create explicit measures for all aggregatable numeric columns and hide the
  corresponding base columns.
- Follow the naming conventions below.

## Naming conventions

- Use plural names for fact tables and singular names for dimension tables, for
  example `Sales`, `Product`, and `Customer`.
- Use readable measure names in UPPERCASE.

## Recommended: About table

When semantic model creation or metadata changes are in scope, prefer including
an `About` table describing the author, version, model, and last refresh. Reuse an
existing table rather than creating a duplicate. This is recommended, not required.

Use the following columns:

- `Key`: Text
- `Value`: Text
- `Order`: Whole number

Use an Import partition with source type `m` and this Power Query template.
Replace `Company X`, `1.0`, and `[Model Description]` with confirmed project
values before creating the table. Ask for missing values rather than inventing
them.

```powerquery
let
    Source = #table({ "Key", "Value" },{
        { "Developed by", "Company X" },
        { "Version", "1.0" },
        { "Description", "[Model Description]" },
        { "Last Refresh", DateTime.ToText(DateTime.LocalNow(), "yyyy-MM-dd HH:mm:ss") }
    }),
    #"Added Index" = Table.AddIndexColumn(Source, "Order", 1, 1),
    #"Changed Type" = Table.TransformColumnTypes(#"Added Index",{{"Key", type text},  {"Value", type text},{"Order", Int64.Type}}),
    #"Reordered Columns" = Table.ReorderColumns(#"Changed Type",{"Key", "Value", "Order"})
in
    #"Reordered Columns"
```
