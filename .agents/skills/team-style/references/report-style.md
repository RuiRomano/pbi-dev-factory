# Report Style

## Design guidance for new reports

When authoring a new report, inspect and follow the
[Contoso design standards](./contoso-design-standards.png). Use the palette,
typography, spacing, and brand treatment below throughout the report. The image
is a brand reference, not a report page template.

For existing reports, apply this guidance only when design changes are in scope.
Do not restyle unrelated pages or visuals.

## Power BI theme

Start new reports with the [Contoso theme](./contoso-theme.json).

Agents should use `powerbi-report-cli` in authoring mode and its available tools
to apply the theme to the target report. Follow the skill's theme registration,
validation, preview, and screenshot-review workflow. Keep changes within the
requested scope and do not publish unless explicitly requested.

If tools are unavailable or applying or validating the theme fails, explain the
problem and what remains unverified. Follow the skill's failure and unsaved-change
safety rules; do not bypass them or claim the theme was applied successfully.
Offer manual import in Power BI Desktop as the fallback: select
**View > Themes > Browse for themes** and import the JSON file.

The theme sets the brand data palette, Cloud canvas, white visual surfaces,
Midnight text, Segoe UI typography, rounded borders, padding, and filter pane
defaults. Cornflower is the first data color; Cloud is reserved for surfaces.
Text box backgrounds are disabled so the page background shows through.
Sentiment colors retain Power BI defaults so brand pastels do not imply
positive or negative business meaning.

Power BI theme font sizes use points. The theme maps 48 px display text to
36 pt callouts, 16 px body text to 12 pt, and 14 px supporting text to 10.5 pt
(rounded to 11 pt for filter settings that require integers).
Author page headlines at 36 pt and section headings at 24 pt (32 px) separately;
visual titles stay at 12 pt so chart and axis titles do not become page headings.

Themes provide defaults, not enforcement. Existing page and visual formatting
can override them, and custom visuals may not honor every setting. Sentence
case, page layout, whitespace between visuals, 1.5 body line height, logo
placement, and white text on manually added dark or Cornflower surfaces still
require explicit authoring and rendered review. The theme has not been applied
to existing reports automatically.

## Color

Let neutrals lead. Use Cornflower for focus and keep pastels quiet and supporting.

| Color | Hex | Role |
|-------|-----|------|
| Midnight | `#20283F` | Primary text and dark surfaces |
| Cloud | `#F6F7FB` | Default page canvas |
| Cornflower | `#536CE5` | Brand emphasis and primary actions |
| Lilac | `#C8BCF4` | Soft highlights and brand detail |
| Sea glass | `#9CCDC6` | Secondary surfaces |
| Petal | `#EAC9C8` | Warm editorial accents |

Use Midnight text on pastel surfaces and white text on Cornflower or Midnight.
Check readability and contrast in the rendered report.

## Typography and layout

- Use Segoe UI. For surfaces that support a font stack, use `"Segoe UI", Arial, sans-serif`.
- Use Light 300 for display text, Regular 400 for body text, and Semibold 600
  for emphasis where supported.
- Use the brand's size hierarchy as guidance: 48/32 px for headlines and section
  titles, 16/14 px for body and supporting text, and 1.5 body line height.
  Adapt these to supported Power BI settings and the report canvas while
  preserving hierarchy and readability.
- Use sentence case, left-aligned text, generous whitespace, and minimal bold.
  Report labels do not change the UPPERCASE naming rule for semantic model measures.
- Use restrained rounded surfaces and subtle borders as shown in the reference.
  Keep spacing and alignment consistent across pages.

## Brand signature

When a logo is included, use the approved Fold mark with the lowercase Contoso
wordmark. Use the two-tone version on light surfaces or all-white on Midnight.

- Keep at least half a mark of clear space around it.
- Keep the icon at least 24 px.
- Do not stretch, rotate, add shadows, or apply gradients to the logo.
- Do not substitute the full design standards image for a logo or page background.
  If a suitable logo asset is unavailable, ask for it rather than recreating it.

## Review

Before handing off a new report, check the rendered pages against the reference
for palette, typography, whitespace, alignment, and any logo usage. Keep the report
skill's validation workflow and disclose checks that could not be completed.
