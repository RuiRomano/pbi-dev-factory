-- Read-only independent reference, captured from lakehouse_sample SQL endpoint
-- on 2026-11-01. Integer totals compare exactly; dollars within absolute 0.01.
SELECT
    COUNT_BIG(*) AS Sales,
    COUNT(DISTINCT SaleKey) AS DistinctSaleKeys,
    COUNT(DISTINCT WWIInvoiceID) AS DistinctInvoices,
    SUM(CAST(Quantity AS bigint)) AS Quantity,
    SUM(TotalExcludingTax) AS ExcludingTax,
    SUM(TaxAmount) AS Tax,
    SUM(TotalIncludingTax) AS IncludingTax,
    SUM(Profit) AS Profit,
    SUM(CAST(TotalDryItems AS bigint)) AS Dry,
    SUM(CAST(TotalChillerItems AS bigint)) AS Chiller,
    MAX(ABS(TotalIncludingTax - TotalExcludingTax - TaxAmount)) AS MaxRowResidual
FROM dbo.fact_sale;

WITH Fixtures AS (
    SELECT 'Purchasing key 0' AS Fixture, f.*
    FROM dbo.fact_sale AS f WHERE CustomerKey = 0
    UNION ALL
    SELECT 'Billing key 66', f.*
    FROM dbo.fact_sale AS f WHERE BillToCustomerKey = 66
    UNION ALL
    SELECT 'Both customer roles', f.*
    FROM dbo.fact_sale AS f WHERE CustomerKey = 0 AND BillToCustomerKey = 66
    UNION ALL
    SELECT 'Invoice 2025-07-14', f.*
    FROM dbo.fact_sale AS f WHERE InvoiceDateKey = '2025-07-14'
    UNION ALL
    SELECT 'Delivery 2025-07-15', f.*
    FROM dbo.fact_sale AS f WHERE DeliveryDateKey = '2025-07-15'
    UNION ALL
    SELECT 'Both date roles', f.*
    FROM dbo.fact_sale AS f
    WHERE InvoiceDateKey = '2025-07-14' AND DeliveryDateKey = '2025-07-15'
    UNION ALL
    SELECT 'All four roles', f.*
    FROM dbo.fact_sale AS f
    WHERE CustomerKey = 0 AND BillToCustomerKey = 66
      AND InvoiceDateKey = '2025-07-14' AND DeliveryDateKey = '2025-07-15'
)
SELECT Fixture,
    COUNT_BIG(*) AS Sales,
    SUM(CAST(Quantity AS bigint)) AS Quantity,
    SUM(TotalExcludingTax) AS ExcludingTax,
    SUM(TaxAmount) AS Tax,
    SUM(TotalIncludingTax) AS IncludingTax,
    SUM(Profit) AS Profit,
    SUM(CAST(TotalDryItems AS bigint)) AS Dry,
    SUM(CAST(TotalChillerItems AS bigint)) AS Chiller
FROM Fixtures
GROUP BY Fixture
ORDER BY Fixture;

SELECT 'City' AS Dimension, COUNT_BIG(*) AS Rows, COUNT(DISTINCT CityKey) AS Keys,
    SUM(CASE WHEN CityKey IS NULL THEN 1 ELSE 0 END) AS NullKeys FROM dbo.dimension_city
UNION ALL
SELECT 'Customer', COUNT_BIG(*), COUNT(DISTINCT CustomerKey),
    SUM(CASE WHEN CustomerKey IS NULL THEN 1 ELSE 0 END) FROM dbo.dimension_customer
UNION ALL
SELECT 'Employee', COUNT_BIG(*), COUNT(DISTINCT EmployeeKey),
    SUM(CASE WHEN EmployeeKey IS NULL THEN 1 ELSE 0 END) FROM dbo.dimension_employee
UNION ALL
SELECT 'Product', COUNT_BIG(*), COUNT(DISTINCT StockItemKey),
    SUM(CASE WHEN StockItemKey IS NULL THEN 1 ELSE 0 END) FROM dbo.dimension_stock_item
UNION ALL
SELECT 'Calendar', COUNT_BIG(*), COUNT(DISTINCT [Date]),
    SUM(CASE WHEN [Date] IS NULL THEN 1 ELSE 0 END) FROM dbo.dimension_date;

SELECT 'City' AS Relationship, COUNT_BIG(*) AS MissingRows
FROM dbo.fact_sale f LEFT JOIN dbo.dimension_city d ON f.CityKey = d.CityKey
WHERE d.CityKey IS NULL
UNION ALL
SELECT 'Customer', COUNT_BIG(*)
FROM dbo.fact_sale f LEFT JOIN dbo.dimension_customer d ON f.CustomerKey = d.CustomerKey
WHERE d.CustomerKey IS NULL
UNION ALL
SELECT 'Bill To Customer', COUNT_BIG(*)
FROM dbo.fact_sale f LEFT JOIN dbo.dimension_customer d ON f.BillToCustomerKey = d.CustomerKey
WHERE d.CustomerKey IS NULL
UNION ALL
SELECT 'Product', COUNT_BIG(*)
FROM dbo.fact_sale f LEFT JOIN dbo.dimension_stock_item d ON f.StockItemKey = d.StockItemKey
WHERE d.StockItemKey IS NULL
UNION ALL
SELECT 'Employee', COUNT_BIG(*)
FROM dbo.fact_sale f LEFT JOIN dbo.dimension_employee d ON f.SalespersonKey = d.EmployeeKey
WHERE d.EmployeeKey IS NULL
UNION ALL
SELECT 'Calendar', COUNT_BIG(*)
FROM dbo.fact_sale f LEFT JOIN dbo.dimension_date d ON f.InvoiceDateKey = d.[Date]
WHERE d.[Date] IS NULL
UNION ALL
SELECT 'Delivery Calendar', COUNT_BIG(*)
FROM dbo.fact_sale f LEFT JOIN dbo.dimension_date d ON f.DeliveryDateKey = d.[Date]
WHERE d.[Date] IS NULL;

SELECT CalendarYear, COUNT_BIG(*) AS Rows, MIN([Date]) AS FirstDate, MAX([Date]) AS LastDate
FROM dbo.dimension_date GROUP BY CalendarYear ORDER BY CalendarYear;

SELECT DeliveryDateKey, COUNT_BIG(*) AS MissingRows
FROM dbo.fact_sale f LEFT JOIN dbo.dimension_date d ON f.DeliveryDateKey = d.[Date]
WHERE d.[Date] IS NULL GROUP BY DeliveryDateKey ORDER BY DeliveryDateKey;
