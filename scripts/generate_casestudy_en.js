// scripts/generate_casestudy_en.js
import {
  AlignmentType, BorderStyle, Document, Footer, Header,
  Packer, PageBreak, PageNumber, Paragraph, ShadingType,
  Table, TableCell, TableRow, TextRun, WidthType,
} from 'docx'
import { writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Colors ─────────────────────────────────────────────────
const C = {
  BLUE:         '1F4E79',
  ACCENT:       '2E75B6',
  GRAY:         '595959',
  LIGHT_GRAY:   'F2F2F2',
  GREEN:        '1E7145',
  LIGHT_GREEN:  'E2EFDA',
  ORANGE:       'C55A11',
  LIGHT_ORANGE: 'FCE4D6',
  LIGHT_BLUE:   'D6E4F0',
  WHITE:        'FFFFFF',
  BLACK:        '000000',
}

// ── Layout ─────────────────────────────────────────────────
const FONT       = 'Arial'
const PAGE_W     = 11906   // A4 width  in DXA
const PAGE_H     = 16838   // A4 height in DXA
const MARGIN     = 1440    // 1 inch
const CONTENT_W  = PAGE_W - MARGIN * 2  // 9026 DXA

// ── Helpers ────────────────────────────────────────────────
function sp(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ text: '' }))
}

function run(text, opts = {}) {
  return new TextRun({
    text,
    font:    FONT,
    size:    opts.size   ?? 22,
    bold:    opts.bold   ?? false,
    italic:  opts.italic ?? false,
    color:   opts.color  ?? C.BLACK,
  })
}

function h1(text) {
  return new Paragraph({
    children: [run(text, { size: 32, bold: true, color: C.BLUE })],
    spacing:  { before: 320, after: 160 },
    border:   { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.BLUE, space: 4 } },
  })
}

function h2(text) {
  return new Paragraph({
    children: [run(text, { size: 26, bold: true, color: C.ACCENT })],
    spacing:  { before: 220, after: 100 },
  })
}

function body(text, opts = {}) {
  return new Paragraph({
    children: [run(text, { color: opts.gray ? C.GRAY : C.BLACK, italic: opts.italic ?? false })],
    spacing:  { before: 60, after: 60 },
  })
}

function bullet(text) {
  return new Paragraph({
    children: [run(`• ${text}`)],
    indent:   { left: 360 },
    spacing:  { before: 40, after: 40 },
  })
}

// Colored left-border callout box
function callout(title, text, borderColor, bgColor) {
  const cellChildren = []
  if (title) {
    cellChildren.push(new Paragraph({
      children: [run(title, { bold: true, color: borderColor })],
      spacing:  { before: 40, after: 80 },
    }))
  }
  cellChildren.push(new Paragraph({
    children: [run(text, { italic: !title })],
    spacing:  { before: 0, after: 40 },
  }))

  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    borders: {
      top:     { style: BorderStyle.NONE, size: 0, color: 'auto' },
      bottom:  { style: BorderStyle.NONE, size: 0, color: 'auto' },
      left:    { style: BorderStyle.NONE, size: 0, color: 'auto' },
      right:   { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideH: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideV: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width:   { size: CONTENT_W, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: bgColor },
            borders: {
              top:    { style: BorderStyle.NONE,  size: 0,  color: 'auto' },
              bottom: { style: BorderStyle.NONE,  size: 0,  color: 'auto' },
              right:  { style: BorderStyle.NONE,  size: 0,  color: 'auto' },
              left:   { style: BorderStyle.THICK, size: 24, color: borderColor },
            },
            margins: { top: 120, bottom: 120, left: 240, right: 240 },
            children: cellChildren,
          }),
        ],
      }),
    ],
  })
}

// Two-column key-value table (alternating rows)
function kvTable(rows) {
  const COL1 = Math.round(CONTENT_W * 0.32)
  const COL2 = CONTENT_W - COL1

  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    borders: {
      top:     { style: BorderStyle.NONE, size: 0, color: 'auto' },
      bottom:  { style: BorderStyle.NONE, size: 0, color: 'auto' },
      left:    { style: BorderStyle.NONE, size: 0, color: 'auto' },
      right:   { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideV: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideH: { style: BorderStyle.SINGLE, size: 2, color: 'DDDDDD' },
    },
    rows: rows.map((row, i) => {
      const bg = i % 2 === 0 ? C.LIGHT_GRAY : C.WHITE
      return new TableRow({
        children: [
          new TableCell({
            width:   { size: COL1, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: bg },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            margins: { top: 80, bottom: 80, left: 160, right: 160 },
            children: [new Paragraph({ children: [run(row[0], { bold: true, color: C.BLUE })] })],
          }),
          new TableCell({
            width:   { size: COL2, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: bg },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            margins: { top: 80, bottom: 80, left: 160, right: 160 },
            children: [new Paragraph({ children: [run(row[1])] })],
          }),
        ],
      })
    }),
  })
}

// Two-column header + data table (alternating rows)
function dataTable(headers, rows) {
  const colW = Math.round(CONTENT_W / headers.length)

  const headerRow = new TableRow({
    children: headers.map(h =>
      new TableCell({
        width:   { size: colW, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: C.ACCENT },
        margins: { top: 80, bottom: 80, left: 160, right: 160 },
        children: [new Paragraph({ children: [run(h, { bold: true, color: C.WHITE })] })],
      })
    ),
  })

  const dataRows = rows.map((row, i) => {
    const bg = i % 2 === 0 ? C.LIGHT_GRAY : C.WHITE
    return new TableRow({
      children: row.map(cell =>
        new TableCell({
          width:   { size: colW, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, color: 'auto', fill: bg },
          margins: { top: 80, bottom: 80, left: 160, right: 160 },
          children: [new Paragraph({ children: [run(cell)] })],
        })
      ),
    })
  })

  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    rows:  [headerRow, ...dataRows],
  })
}

// ── Document content ───────────────────────────────────────
const children = []

// ── COVER ─────────────────────────────────────────────────
children.push(
  ...sp(5),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children:  [run('CASE STUDY', { size: 40, bold: true, color: C.GRAY })],
    spacing:   { after: 200 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children:  [run('RestaurantOS', { size: 72, bold: true, color: C.ACCENT })],
    spacing:   { after: 200 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children:  [run('Restaurant Management Dashboard', { size: 32, italic: true, color: C.GRAY })],
    spacing:   { after: 600 },
  }),
  ...sp(2),
  kvTable([
    ['Project type', 'Portfolio Project / Client Demo'],
    ['Tech stack',   'React 18 + Vite + Tailwind CSS + Firebase'],
    ['Build time',   '~55 hours / 2 weeks'],
    ['Status',       'Live on Firebase Hosting'],
    ['Live demo',    'https://restaurantos-dev-42314.web.app'],
    ['GitHub',       'https://github.com/tudorsorinoltean/restaurantos'],
  ]),
  new Paragraph({ children: [new PageBreak()] }),
)

// ── 1. Project Context ─────────────────────────────────────
children.push(
  h1('1. Project Context'),
  body('RestaurantOS is a full-stack restaurant management dashboard built as a portfolio project. It simulates a real solution for daily restaurant management — reservations, digital menu, and analytics in a single modern interface.'),
  ...sp(1),
  callout(
    'WHY RESTAURANTS?',
    'Restaurants have clear digitalization needs — many SMEs in hospitality still manage reservations with Excel or paper. This translates into a direct market for ready-to-deploy SaaS solutions.',
    C.ACCENT, C.LIGHT_BLUE,
  ),
  ...sp(1),
)

// ── 2. The Problem ─────────────────────────────────────────
children.push(
  h1('2. The Problem'),
  body('Restaurants still struggle with:'),
  bullet('Manual reservations (phone + notebook) — risk of duplicates and errors'),
  bullet('Difficult menu updates — costly PDF reprints'),
  bullet('Zero data visibility — no insight into busy days or peak hours'),
  bullet('Inefficient staff communication'),
  ...sp(1),
  callout(
    null,
    '"We lose 3–4 reservations every weekend because we can\'t find the notes. That\'s $150–200 lost per weekend." — Hypothetical restaurant owner',
    C.ORANGE, C.LIGHT_ORANGE,
  ),
  ...sp(1),
)

// ── 3. The Solution ────────────────────────────────────────
children.push(
  h1('3. The Solution'),
  body('RestaurantOS addresses these pain points through 4 integrated modules:'),
  ...sp(1),
  h2('3.1 Main Dashboard'),
  bullet('KPI cards: reservations today, pending, confirmed, cancelled'),
  bullet('Recent reservations table with status badges'),
  bullet('Fully responsive — desktop table + mobile card layout'),
  ...sp(1),
  h2('3.2 Reservations Management'),
  bullet('Search by name, phone, or date'),
  bullet('Filter by status (All / Pending / Confirmed / Arrived / Cancelled / No-show)'),
  bullet('Inline status change directly in the table'),
  bullet('Add reservation modal with full validation'),
  bullet('CSV export with translated column headers'),
  bullet('Mobile card view for each reservation'),
  ...sp(1),
  h2('3.3 Digital Menu'),
  bullet('CRUD for categories and products'),
  bullet('Availability toggle (show/hide product without deleting)'),
  bullet('Inline editing via modal'),
  bullet('Product count per category'),
  ...sp(1),
  h2('3.4 Reports & Analytics'),
  bullet('Bar chart: reservations over the last 14 days'),
  bullet('Pie chart: distribution by status'),
  bullet('Hourly bar chart: peak reservation hours'),
  bullet('4 stat cards: total, this month, total persons, average persons'),
  ...sp(1),
)

// ── 4. Tech Stack & Architecture ───────────────────────────
children.push(
  h1('4. Tech Stack & Architecture'),
  ...sp(1),
  dataTable(
    ['Category', 'Technology'],
    [
      ['Frontend',       'React 18 + Vite'],
      ['Styling',        'Tailwind CSS v3'],
      ['Backend & DB',   'Firebase Firestore — real-time NoSQL, serverless'],
      ['Authentication', 'Firebase Auth — Email/Password, PrivateRoute pattern'],
      ['Charts',         'Recharts'],
      ['Routing',        'React Router v6'],
      ['Forms',          'React Hook Form'],
      ['i18n',           'Custom useLanguage hook — RO/EN switch without external libraries'],
      ['Hosting',        'Firebase Hosting — global CDN, automatic SSL, free tier'],
      ['Demo Data',      'Faker.js seed script — 40 reservations + 6 categories + 17 products'],
    ],
  ),
  ...sp(1),
  h2('Architectural Patterns'),
  bullet('Services layer — Firestore logic isolated in services/ folder'),
  bullet('Custom hooks — useAuth.js, useLanguage.js'),
  bullet('Real-time listeners — onSnapshot for instant sync'),
  bullet('PrivateRoute pattern — unauthenticated users redirected to /login'),
  bullet('Environment variables in .env, excluded from Git'),
  ...sp(1),
)

// ── 5. Key Technical Features ──────────────────────────────
children.push(
  h1('5. Key Technical Features'),
  ...sp(1),
  callout(
    'BILINGUAL RO/EN',
    'Language switch in the header. Lightweight custom store with listeners — no external i18n library. Translations cover the entire UI including CSV export, filename, and chart labels.',
    C.GREEN, C.LIGHT_GREEN,
  ),
  ...sp(1),
  callout(
    'REAL-TIME SYNC',
    'All data uses Firestore onSnapshot. Changes appear instantly for all logged-in users without a page refresh. Unsubscribe functions are properly cleaned up in useEffect.',
    C.ACCENT, C.LIGHT_BLUE,
  ),
  ...sp(1),
  callout(
    'FULLY RESPONSIVE',
    'Fixed sidebar on desktop, overlay drawer on mobile. Tables transform into card layouts for small screens. Tested on iPhone 14 Pro Max and Samsung Galaxy S20.',
    C.ORANGE, C.LIGHT_ORANGE,
  ),
  ...sp(1),
)

// ── 6. Results & Metrics ───────────────────────────────────
children.push(
  h1('6. Results & Metrics'),
  ...sp(1),
  dataTable(
    ['Metric', 'Value'],
    [
      ['Total build time',        '~55 hours over 2 weeks'],
      ['Lines of code',           '~2,000 lines'],
      ['React components',        '15+ reusable components'],
      ['Firestore collections',   '3 main collections'],
      ['Demo data',               '40 reservations + 17 products across 6 categories'],
      ['Deploy time',             '< 2 minutes with Firebase CLI'],
      ['Hosting cost',            '$0 — Firebase free tier'],
    ],
  ),
  ...sp(1),
)

// ── 7. Challenges & Lessons Learned ───────────────────────
children.push(
  h1('7. Challenges & Lessons Learned'),
  ...sp(1),
  h2('Technical Challenges'),
  bullet('Tailwind v4 vs v3 — initial setup used v4 beta; fix: explicit pin to v3 in package.json'),
  bullet('i18n without libraries — implemented lightweight micro-store with listeners'),
  bullet('Responsive tables — dual-render pattern (desktop table + mobile cards side by side)'),
  bullet('Firebase onSnapshot cleanup — unsubscribe functions returned from useEffect'),
  ...sp(1),
  h2('Architecture Decisions'),
  bullet('Services layer instead of direct Firestore calls from components'),
  bullet('Faker.js for realistic demo data with weighted random status distribution'),
  bullet('Claude Code for i18n — AI agent updated 5 files simultaneously in a single session'),
  ...sp(1),
)

// ── 8. Business Value ──────────────────────────────────────
children.push(
  h1('8. Business Value for a Real Client'),
  ...sp(1),
  dataTable(
    ['Delivery Type', 'Description & Price'],
    [
      ['MVP (2 weeks)',      'Dashboard + Reservations + Menu + Deploy — $3,800–5,500'],
      ['Full version',       '+ Email notifications, calendar, advanced reports — $6,500–9,000'],
      ['Monthly retainer',   'Maintenance + features + support — $550–1,300/month'],
      ['SaaS multi-tenant',  'Platform for multiple restaurants — $85–160/month per restaurant'],
    ],
  ),
  ...sp(1),
  callout(
    'MY COMPETITIVE ADVANTAGE',
    'I understand the hospitality industry from the inside. Domain knowledge directly shapes the UX decisions in this app — from the mobile card layout to the weighted random seed data distribution.',
    C.ACCENT, C.LIGHT_BLUE,
  ),
  ...sp(1),
)

// ── 9. Roadmap ─────────────────────────────────────────────
children.push(
  h1('9. Roadmap — What\'s Next'),
  bullet('Email notifications on new reservation (Resend.com)'),
  bullet('Visual calendar with weekly reservation view'),
  bullet('QR code for digital menu'),
  bullet('Multi-tenant architecture (multiple restaurants on one platform)'),
  bullet('POS system integrations (Square, iZettle)'),
  bullet('Push notification system for staff'),
  ...sp(1),
)

// ── Contact & Links ────────────────────────────────────────
children.push(
  h1('Contact & Links'),
  ...sp(1),
  kvTable([
    ['Author',    'Tudor Sorin Oltean'],
    ['Email',     'tudorsorinoltean@gmail.com'],
    ['Live demo', 'https://restaurantos-dev-42314.web.app'],
    ['GitHub',    'https://github.com/tudorsorinoltean/restaurantos'],
    ['Stack',     'React 18 + Vite + Tailwind CSS + Firebase'],
  ]),
  ...sp(1),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children:  [run('Available for freelance projects — one-shot builds and monthly retainers', { italic: true, color: C.GRAY })],
    spacing:   { before: 200, after: 200 },
  }),
)

// ── Assemble document ──────────────────────────────────────
const doc = new Document({
  sections: [{
    properties: {
      page: {
        size:   { width: PAGE_W, height: PAGE_H },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
      },
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children:  [run('RestaurantOS — Case Study  |  Tudor Sorin Oltean', { size: 18, color: C.ACCENT })],
            border:    { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.ACCENT, space: 4 } },
            spacing:   { after: 120 },
          }),
        ],
      }),
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              run('tudorsorinoltean@gmail.com  •  Page ', { size: 18, color: C.GRAY }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: C.GRAY }),
              run(' of ', { size: 18, color: C.GRAY }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 18, color: C.GRAY }),
            ],
            border:  { top: { style: BorderStyle.SINGLE, size: 6, color: C.ACCENT, space: 4 } },
            spacing: { before: 120 },
          }),
        ],
      }),
    },
    children,
  }],
})

// ── Write output ───────────────────────────────────────────
const buffer = await Packer.toBuffer(doc)
const output = join(__dirname, '..', 'RestaurantOS_CaseStudy_EN.docx')
writeFileSync(output, buffer)
console.log('✅ Generated: RestaurantOS_CaseStudy_EN.docx')
