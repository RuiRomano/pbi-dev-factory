import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const report = path.join(root, 'src/hr.Report');
const definition = path.join(report, 'definition');
const pagesDir = path.join(definition, 'pages');
const read = (file) => JSON.parse(readFileSync(file, 'utf8'));
const write = (file, value) => {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const id = (value) => createHash('sha256').update(`hr-demo:${value}`).digest('hex').slice(0, 20);
const schema = 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.9.0/schema.json';
const literal = (value) => ({ expr: { Literal: { Value: value } } });
const text = (value) => literal(`'${value.replaceAll("'", "''")}'`);
const fill = (colorId) => ({ solid: { color: { expr: { ThemeDataColor: { ColorId: colorId, Percent: 0 } } } } });
const object = (properties, selector) => [{ properties, ...(selector ? { selector } : {}) }];
const field = (reference) => {
  const [, table, property] = /^([^\[]+)\[([^\]]+)\]$/.exec(reference);
  const kind = ['Calendar', 'Department', 'Employee', 'Location'].includes(table)
    || ['Exit Reason', 'Tenure Band'].includes(property) ? 'Column' : 'Measure';
  return {
    field: { [kind]: { Expression: { SourceRef: { Entity: table } }, Property: property } },
    queryRef: `${table}.${property}`,
    nativeQueryRef: property,
  };
};
const colors = {
  'Headcount.HEADCOUNT': 2,
  'Headcount.FTE': 2,
  'Headcount.SALARY COST': 6,
  'Movements.HIRES': 4,
  'Movements.EXITS': 3,
  'Movements.ATTRITION RATE': 3,
  'Movements.ATTRITION RATE LY': 3,
};

const template = read(path.join(pagesDir, read(path.join(pagesDir, 'pages.json')).activePageName, 'page.json'));
const firstPage = template.name;
const pageIndex = read(path.join(pagesDir, 'pages.json'));
const visual = (name, position, visualType, query, objects = {}, label, colorKeys = []) => {
  const v = { visualType, ...(query ? { query: { queryState: query } } : {}), objects };
  if (label) {
    v.visualContainerObjects = {
      title: object({ show: literal('true'), text: text(label) }),
      general: object({ altText: text(label) }),
    };
  }
  if (colorKeys.length === 1) {
    v.objects.dataPoint = object({ defaultColor: fill(colors[colorKeys[0]]) });
  } else if (colorKeys.length > 1) {
    v.objects.dataPoint = colorKeys.map((key) => ({
      properties: { fill: fill(colors[key]) },
      selector: { metadata: key },
    }));
  }
  return { $schema: schema, name: id(name), position, visual: v };
};
const projection = (references) => ({ projections: references.map(field) });
const title = (name, pos, caption) => {
  const v = visual(name, pos, 'textbox', null, {
    general: object({ paragraphs: [
    { textRuns: [{ value: caption, textStyle: { fontFamily: 'Segoe UI Semibold', fontSize: '26px', color: '#20283F' } }] },
    { textRuns: [{ value: 'CONTOSO / FICTIONAL HR DEMO | Workforce: latest snapshot | Events: selected dates | Attrition: trailing 12 months', textStyle: { fontFamily: 'Segoe UI', fontSize: '14px', color: '#20283F' } }] },
    ] }),
  });
  v.visual.visualContainerObjects = {
    background: object({ show: literal('false') }),
    padding: object({ top: literal('0D'), bottom: literal('0D'), left: literal('0D'), right: literal('0D') }),
  };
  return v;
};
const slicer = (name, pos) => visual(name, pos, 'slicer', { Values: projection(['Calendar[Fiscal Year]']) }, {
  data: object({ mode: text('Dropdown') }),
  header: object({ show: literal('true'), text: text('Fiscal year') }),
});
const cards = (name, pos, measures) => {
  const v = visual(name, pos, 'cardVisual', { Data: projection(measures) }, {
    value: object({ fontSize: literal('20D') }, { id: 'default' }),
    label: object({ fontSize: literal('11D') }, { id: 'default' }),
    padding: object({ paddingUniform: literal('8D') }, { id: 'default' }),
  }, 'Key workforce indicators');
  v.visual.visualContainerObjects.title = object({ show: literal('false') });
  v.visual.visualContainerObjects.padding = object({
    top: literal('8D'), bottom: literal('8D'), left: literal('8D'), right: literal('8D'),
  });
  return v;
};
const chart = (name, pos, kind, category, measures, label, sort = 'Ascending') => {
  const categoryField = field(category).field;
  const v = visual(name, pos, kind, {
    Category: projection([category]),
    Y: projection(measures),
  }, {}, label, measures.map((m) => field(m).queryRef));
  v.visual.query.sortDefinition = {
    sort: [{ field: sort === 'Descending' ? field(measures[0]).field : categoryField, direction: sort }],
    isDefaultSort: true,
  };
  return v;
};
const canvas = { width: 1280, height: 720, margin: 24, gutter: 16 };
const slot = (region, index = 0, count = 1) => {
  const [col1, row1, col2, row2] = region;
  const cellW = (canvas.width - 2 * canvas.margin) / 12;
  const cellH = (canvas.height - 2 * canvas.margin) / 12;
  const x = canvas.margin + (col1 - 1) * cellW;
  const y = canvas.margin + (row1 - 1) * cellH;
  const w = (col2 - col1) * cellW;
  const h = (row2 - row1) * cellH;
  const snap = (n) => Math.round(n / 8) * 8;
  return {
    x: snap(x + w * index / count),
    y: snap(y),
    width: snap(w * (index + 1) / count) - snap(w * index / count) - canvas.gutter,
    height: snap(h) - canvas.gutter,
  };
};
const top = { header: [1, 1, 9, 3], filters: [9, 1, 13, 3], kpis: [1, 3, 13, 5] };
const pageConfigs = [
  {
    name: 'Workforce size and movement over time',
    regions: { ...top, trend: [1, 5, 8, 9], department: [8, 5, 13, 9], movement: [1, 9, 7, 13], attrition: [7, 9, 13, 13] },
    metrics: ['Headcount[HEADCOUNT]', 'Headcount[FTE]', 'Movements[HIRES]', 'Movements[EXITS]', 'Movements[ATTRITION RATE]'],
    charts: [
      ['trend', 'lineChart', 'Calendar[Month End]', ['Headcount[HEADCOUNT]'], 'Month-end headcount over time', 'Ascending'],
      ['department', 'barChart', 'Department[Department]', ['Headcount[HEADCOUNT]'], 'Headcount by department', 'Descending'],
      ['movement', 'lineChart', 'Calendar[Month End]', ['Movements[HIRES]', 'Movements[EXITS]'], 'Hires and exits by month', 'Ascending'],
      ['attrition', 'lineChart', 'Calendar[Month End]', ['Movements[ATTRITION RATE]'], 'Trailing twelve-month attrition rate', 'Ascending'],
    ],
  },
  {
    name: 'Where employee exits occur',
    regions: { ...top, trend: [1, 5, 8, 9], reason: [8, 5, 13, 9], department: [1, 9, 7, 13], tenure: [7, 9, 13, 13] },
    metrics: ['Movements[EXITS]', 'Movements[ATTRITION RATE]', 'Movements[ATTRITION RATE LY]'],
    charts: [
      ['trend', 'lineChart', 'Calendar[Month End]', ['Movements[ATTRITION RATE]'], 'Trailing twelve-month attrition rate', 'Ascending'],
      ['reason', 'barChart', 'Movements[Exit Reason]', ['Movements[EXITS]'], 'Exits by reason', 'Descending'],
      ['department', 'barChart', 'Department[Department]', ['Movements[EXITS]'], 'Exits by department', 'Descending'],
      ['tenure', 'barChart', 'Movements[Tenure Band]', ['Movements[EXITS]'], 'Exits by tenure at departure', 'Ascending'],
    ],
  },
  {
    name: 'Workforce mix across locations and roles',
    regions: { ...top, location: [1, 5, 8, 9], level: [8, 5, 13, 9], gender: [1, 9, 7, 13], department: [7, 9, 13, 13] },
    metrics: ['Headcount[HEADCOUNT]', 'Headcount[FTE]', 'Headcount[SALARY COST]'],
    charts: [
      ['location', 'barChart', 'Location[City]', ['Headcount[HEADCOUNT]'], 'Headcount by location', 'Descending'],
      ['level', 'barChart', 'Employee[Level]', ['Headcount[HEADCOUNT]'], 'Headcount by job level', 'Ascending'],
      ['gender', 'barChart', 'Employee[Gender]', ['Headcount[HEADCOUNT]'], 'Headcount by gender', 'Descending'],
      ['department', 'barChart', 'Department[Department]', ['Headcount[HEADCOUNT]'], 'Headcount by department', 'Descending'],
    ],
  },
];

const reportJson = read(path.join(definition, 'report.json'));
const themeSource = path.join(root, '.agents/skills/team-practices/references/rules/contoso-theme.json');
const themeName = 'Contoso.json';
const themeTarget = path.join(report, 'StaticResources/RegisteredResources', themeName);
mkdirSync(path.dirname(themeTarget), { recursive: true });
const theme = read(themeSource);
theme.name = themeName;
write(themeTarget, theme);
const versions = reportJson.themeCollection.baseTheme.reportVersionAtImport;
reportJson.themeCollection.customTheme = { name: themeName, reportVersionAtImport: versions, type: 'RegisteredResources' };
reportJson.resourcePackages = reportJson.resourcePackages.filter((item) => item.name !== 'RegisteredResources');
reportJson.resourcePackages.unshift({
  name: 'RegisteredResources', type: 'RegisteredResources',
  items: [{ name: themeName, path: themeName, type: 'CustomTheme' }],
});
write(path.join(definition, 'report.json'), reportJson);

for (const [pageNumber, config] of pageConfigs.entries()) {
  const pageId = pageNumber === 0 ? firstPage : id(`page:${config.name}`);
  const page = { ...template, name: pageId, displayName: config.name, width: canvas.width, height: canvas.height };
  page.filterConfig = { filters: ['Department[Department]', 'Location[City]'].map((reference) => ({
    name: `Filter${id(`${pageId}:${reference}`)}`,
    field: field(reference).field,
    type: 'Categorical',
    howCreated: 'User',
  })) };
  write(path.join(pagesDir, pageId, 'page.json'), page);
  const header = { ...slot(config.regions.header), height: 80 };
  const filters = { ...slot(config.regions.filters), height: 80 };
  const parts = [
    title(`${pageId}:title`, header, config.name),
    slicer(`${pageId}:fiscal`, filters),
    cards(`${pageId}:cards`, slot(config.regions.kpis), config.metrics),
    ...config.charts.map(([region, kind, category, measures, label, sort]) =>
      chart(`${pageId}:${region}`, slot(config.regions[region]), kind, category, measures, label, sort)),
  ];
  for (const [index, item] of parts.entries()) {
    item.position.z = index * 1000;
    item.position.tabOrder = index * 1000;
    write(path.join(pagesDir, pageId, 'visuals', item.name, 'visual.json'), item);
  }
  pageIndex.pageOrder[pageNumber] = pageId;
}
write(path.join(pagesDir, 'pages.json'), pageIndex);
