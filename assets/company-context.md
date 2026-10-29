## Company context — Northwind Retail Group

> Shared reference document for analytics, BI, and data teams. Use this as general background when building reports, writing descriptions, or documenting any data model at Northwind Retail Group. Not for external distribution.

### Who we are

Northwind Retail Group (NRG) is a multi-brand retailer founded in 1998, headquartered in Amsterdam, with regional hubs in Toronto, Austin, and Singapore. We design, source, and sell products across four house brands — **Contoso Home**, **Fabrikam Apparel**, **Litware Electronics**, and **Northwind Kids** — through a network of physical stores and our direct-to-consumer online platform, **NRG Shop**.

We operate in 14 countries across North America, Europe, and Asia-Pacific, with the deepest footprint in the United States, Canada, Germany, France, and the United Kingdom. Our fiscal year runs February–January to align with post-holiday retail cycles, so fiscal-year reporting doesn't line up with the calendar year.

### Business lines

- **Retail stores** — roughly 480 stores worldwide, ranging from small mall kiosks (under 100 m²) to full-format flagship stores (over 1,500 m²).
- **NRG Shop (e-commerce)** — our online storefront, launched in 2015, now representing roughly 30% of total revenue and growing faster than physical retail.
- **Wholesale** — a smaller B2B channel supplying department stores with Contoso Home and Litware Electronics products.

### Product portfolio

Products are organized by manufacturer and brand. Key brand lines:

- **Contoso Home** — furniture, kitchenware, and home décor. Our highest-margin brand, popular with the 35–55 age demographic.
- **Fabrikam Apparel** — clothing and footwear for adults and teens, heavily seasonal (spring/summer and fall/winter collections).
- **Litware Electronics** — small appliances, audio equipment, and smart home devices. Fastest-growing category online.
- **Northwind Kids** — children's clothing and toys, a newer line launched three years ago to diversify the portfolio.

Manufacturers are a mix of in-house design (for our own brands) and third-party licensed partners for select electronics lines.

### Customers

We serve both loyalty program members and guest checkouts. We run a tiered loyalty program — **Bronze, Silver, Gold, and Platinum** — where higher tiers get early access to seasonal drops and free shipping. Roughly 60% of NRG Shop revenue comes from loyalty members, who also have a noticeably higher average basket size than guest shoppers.

We segment customers by:
- **Geography** (country/state/region)
- **Channel preference** (in-store only, online only, omni-channel)
- **Lifecycle stage** (new, active, lapsing, churned — lapsing is defined internally as no purchase in 180 days)

### Sales & seasonality

Key seasonal patterns the business cares about:

- **Back-to-school** (August) drives Fabrikam Apparel and Northwind Kids sales.
- **Holiday season** (November–December) is our single largest revenue period, especially for Litware Electronics gift sets.
- **January clearance** drives high unit volume but low margin — finance often asks for "units sold" alongside "revenue" for this period so margin dips aren't misread as demand problems.
- **Spring refresh** (March–April) is the peak period for Contoso Home.

Store performance is commonly analyzed as **Sales per Square Meter**, a metric leadership reviews monthly to compare store formats and justify footprint decisions.

### Reporting conventions & terminology

When writing measure names, descriptions, or report labels, keep these conventions consistent:

- "Revenue" always refers to **net sales** (after returns and discounts), not gross sales — call out gross sales explicitly if used.
- "Units" refers to individual product units sold, not transactions or baskets.
- Countries should use full names (e.g., "United States", not "US" or "USA").
- Fiscal periods should be labeled "FY24", "FY25", etc., not calendar years, since our fiscal year starts in February.
- Regional leadership pays close attention to **Canada** and **United States** as our two most mature markets, and local managers typically only need visibility into their own country's data.

### Data & analytics team notes

- Data models should be treated as the source of truth for company-wide revenue and store performance reporting; avoid duplicating business logic in report-level calculations.
- Access is typically restricted per country for regional managers — always consider row-level security when designing new data models or reports.
- The team is currently rolling out clearer, business-friendly descriptions on all measures and columns so that self-service users in merchandising and store operations can understand the data without asking BI for help — this is a good area for AI-assisted documentation.
- Sustainability metrics (packaging waste, supplier carbon scores) are tracked separately and are generally out of scope for sales and store performance models.