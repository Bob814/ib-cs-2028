// Generates blank-panel.html: the simulator panel with every block, wire and bus in place but no names or buttons.
// Usage: node tools/gen_blank_panel.js [HWGame folder]   (default: the folder above tools/)
// The geometry is measured from the real index.html in headless Chrome (set CHROME=/path/to/chrome if it is not found).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');
const dir = process.argv[2] || path.join(__dirname, '..');

const chrome = process.env.CHROME || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => fs.existsSync(p));
if (!chrome) throw new Error('Chrome not found – set CHROME=/path/to/chrome');
const pageUrl = pathToFileURL(path.join(__dirname, 'extract-geometry.html')).href + '?' + pathToFileURL(path.join(dir, 'index.html')).href;
const dom = execFileSync(chrome, ['--headless=new', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1920,1080',
  '--virtual-time-budget=6000', '--dump-dom', pageUrl], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
const raw = (dom.match(/<pre id="out">([\s\S]*?)<\/pre>/) || [])[1] || '';
const G = JSON.parse(raw.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
const core = fs.readFileSync(dir + '/index.html', 'utf8').match(/<script id="lmc-core">([\s\S]*?)<\/script>/)[1];
(0, eval)(core);
const S = LMC.STRINGS, B = G.box;
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* Layout changes against the game (for a clearer worksheet):
   - INPUT, OUTPUT and Storage are left out (not part of the CPU), with their bus branches.
   - The right CPU column (ACC, MAR, MDR, ALU), the buses and RAM move right by DX, so the gap between the
     columns holds one lane per internal wire instead of the game's single shared channel.
   - The ALU moves down by DY, so the three wires between MDR and ALU each get their own track.
   - The RAM wheel and its controls are one panel. */
const DX = 180, DY = 36, SPLIT = 575;                    // SPLIT: x between the two CPU columns in the game
const ALU = ['c-alu', 'v-aluA', 'v-aluOp', 'v-aluB', 'v-aluR'];
for (const [id, r] of Object.entries(B)) {
  if (r[0] >= SPLIT) r[0] += DX;
  if (ALU.includes(id)) r[1] += DY;
}
B.chip[2] += DX; B.chip[3] += DY;
G.cells.forEach(c => { c[0] += DX; });
const ctr = id => [B[id][0] + B[id][2] / 2, B[id][1] + B[id][3] / 2];
const right = id => B[id][0] + B[id][2];

const COL = right('c-cu');                               // right edge of the left column
const lane = i => COL + 22 * (i + 1);                    // 8 lanes in the gap, left → right
const PIN = 1010 + DX, BX0 = 1020 + DX, BX1 = B['c-ram'][0], LANE = { addr: 365, data: 455, ctrl: 545 };
const T = { cu: B['c-mdr'][1] + B['c-mdr'][3] + 8, b: 0, r: 0 }; T.b = T.cu + 16; T.r = T.b + 14;   // tracks between MDR and ALU
// a wire from one value window to another through lane L; ds/de shift where it meets each panel so wires sharing a side stay apart
const via = (from, to, L, ds = 0, de = 0) => { const a = ctr(from), b = ctr(to); return [[a[0], a[1] + ds], [lane(L), a[1] + ds], [lane(L), b[1] + de], [b[0], b[1] + de]]; };
// internal wires take the colour of what they carry: addresses (PC, operands) or data values
const wires = [
  ['int addr', via('v-ir', 'in-pc', 0, -14, 6)],         // branch target IR → PC
  ['int data', via('v-mdr', 'v-ir', 2, 10, 0)],
  ['int addr', via('v-pc', 'v-mar', 3, -6, -8)],
  ['int addr', via('v-ir', 'v-mar', 4, 14, 8)],
  ['int data', via('v-mdr', 'v-acc', 5, -10, -14)],
  ['int data', (() => { const r = ctr('v-aluR'), a = ctr('v-acc'); return [r, [r[0], T.r], [lane(6), T.r], [lane(6), a[1]], a]; })()],
  ['int data', via('v-acc', 'v-aluA', 7, 14, 0)],
  ['int data', (() => { const m = ctr('v-mdr'), b = ctr('v-aluB'); return [m, [m[0], T.b], [b[0], T.b], b]; })()],
  ['bus addr', [[right('c-mar'), ctr('v-mar')[1]], [PIN, ctr('v-mar')[1]], [PIN, LANE.addr], [BX1, LANE.addr]]],
  ['bus data', [[right('c-mdr'), LANE.data], [BX1, LANE.data]]],
  ['bus ctrl', [[COL, ctr('cu-dec')[1]], [lane(1), ctr('cu-dec')[1]], [lane(1), T.cu], [PIN, T.cu], [PIN, LANE.ctrl], [BX1, LANE.ctrl]]],
];

const VX = 10, VY = 100, VW = right('c-ram') + 10 - VX, VH = B.chip[1] + B.chip[3] + 10 - VY;   // the top bar is not hardware
const rect = ([x, y, w, h], cls, rx = 14) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
const ans = (x, y, t, o = {}) => `<text class="ans${o.cls ? ' ' + o.cls : ''}" x="${x}" y="${y}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}>${esc(t)}</text>`;

let svg = '';
// CPU chip (under the wires, like on screen)
svg += rect(B.chip, 'chip', 26);
// wires and buses
wires.forEach(([cls, pts]) => { svg += `<polyline class="${cls}" points="${pts.map(p => p.map(Math.round).join(',')).join(' ')}"/>`; });
// panels (opaque – wires end at the panel edge as in the game)
['c-cu', 'c-pc', 'c-ir', 'c-acc', 'c-mar', 'c-mdr', 'c-alu'].forEach(id => { svg += rect(B[id], 'panel'); });
// RAM: one panel, 5 visible cells and the head window across its full width
const ram = B['c-ram'];
svg += `<clipPath id="rclip">${rect(ram, '', 14)}</clipPath>` + rect(ram, 'panel');
svg += `<g clip-path="url(#rclip)">${G.cells.slice(1).map(c => `<line class="cell" x1="${ram[0]}" x2="${ram[0] + ram[2]}" y1="${c[1]}" y2="${c[1]}"/>`).join('')}</g>`;
svg += rect([ram[0] + 3, B.head[1], ram[2] - 6, B.head[3]], 'head', 10);
// value windows, input box and lamp inside the panels
['v-pc', 'v-ir', 'v-acc', 'v-mar', 'v-mdr', 'v-aluA', 'v-aluB', 'v-aluR'].forEach(id => { svg += rect(B[id], 'val', 8); });
svg += rect(B['v-aluOp'], 'op', 6);
svg += rect(B['in-pc'], 'inp', 6);
const n = B['n-lamp']; svg += `<circle class="lamp" cx="${n[0] + n[2] / 2}" cy="${n[1] + n[3] / 2}" r="${n[2] / 2}"/>`;

// answer key (hidden unless "Show answers" is ticked)
let a = '';
const title = (id, t) => { const [x, y] = B[id]; a += ans(x + 14, y + 30, t); };
title('c-cu', S.comps.cu); title('c-pc', S.comps.pc); title('c-ir', S.comps.ir); title('c-acc', S.comps.acc);
title('c-mar', S.comps.mar); title('c-mdr', S.comps.mdr); title('c-alu', S.comps.alu);
a += ans(B['c-ir'][0] + 14, B['c-ir'][1] + 200, S.comps.dec + ' (opcode → instruction name)');
a += ans(B['in-pc'][0] + B['in-pc'][2] / 2, B['in-pc'][1] - 8, 'new PC', { cls: 'sm', anchor: 'middle' });
a += ans(B.chip[0] + 30, B.chip[1] + 8, S.comps.cpu, { cls: 'big' });
a += ans(n[0] + n[2] / 2, n[1] + n[3] / 2 + 9, 'N', { anchor: 'middle' }) + ans(n[0] + n[2] / 2, n[1] + n[3] + 22, 'negative flag', { cls: 'sm', anchor: 'middle' });
const under = (id, t) => { const [x, y, w, h] = B[id]; a += ans(x + w / 2, y + h + 22, t, { cls: 'sm', anchor: 'middle' }); };
under('v-aluA', 'A ← ACC'); under('v-aluB', 'B ← MDR'); under('v-aluOp', '+/−'); under('v-aluR', 'result');
under('v-ir', 'opcode | operand');
a += ans(ram[0] + ram[2] / 2, ram[1] + 40, S.comps.ram + ' (100 cells, 5 visible)', { anchor: 'middle' });
a += ans(ram[0] + ram[2] / 2, B.head[1] + 34, S.headLabel + ' = cell at the MAR address', { cls: 'sm', anchor: 'middle' });
['addr', 'data', 'ctrl'].forEach(b => { a += ans(BX0 + 76, LANE[b] - 16, S.buses[b]); });

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CPU Simulator – Blank Panel</title>
<!-- Generated from index.html (the real panel geometry and STRINGS): same blocks, wires and buses, no names or buttons. -->
<style>
  @page { size: A4 landscape; margin: 10mm; }
  * { box-sizing: border-box; }
  body { font: 11pt/1.4 "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #000; background: #fff; margin: 0; }
  .sheet { max-width: 277mm; margin: 0 auto; }
  header { display: flex; align-items: flex-end; gap: 8mm; margin-bottom: 4mm; }
  h1 { font-size: 16pt; margin: 0; flex: 1; }
  .fill { white-space: nowrap; } .fill span { display: inline-block; width: 50mm; border-bottom: 1px solid #000; }
  .fill span.short { width: 25mm; }
  svg { display: block; width: 100%; height: auto; }
  .chip { fill: #f3f3f3; stroke: #555; stroke-width: 3; }
  polyline { fill: none; stroke-linecap: round; stroke-linejoin: round; }
  .int { stroke-width: 5; }
  .bus { stroke-width: 10; }
  .addr { stroke: ${G.col.addr}; } .data { stroke: ${G.col.data}; } .ctrl { stroke: ${G.col.ctrl}; }
  .panel { fill: #fff; stroke: #333; stroke-width: 3; }
  .cell { stroke: #bbb; stroke-width: 1.5; }
  .head { fill: none; stroke: #333; stroke-width: 6; }
  .val { fill: #eee; stroke: #555; stroke-width: 2; }
  .op { fill: #fff; stroke: #555; stroke-width: 2; }
  .inp { fill: #fff; stroke: #555; stroke-width: 2; stroke-dasharray: 6 4; }
  .lamp { fill: #fff; stroke: #555; stroke-width: 3; }
  .ans { display: none; fill: #c00000; font: 700 22px "Segoe UI", Roboto, Helvetica, Arial, sans-serif; paint-order: stroke; stroke: #fff; stroke-width: 6px; stroke-linejoin: round; }
  .ans.sm { font-size: 16px; } .ans.big { font-size: 26px; letter-spacing: 3px; }
  body.answers .ans { display: inline; }
  .tools { position: fixed; right: 6mm; top: 4mm; display: flex; gap: 4mm; align-items: center; font-size: 11pt; background: #fff; padding: 1mm 2mm; border: 1px solid #999; border-radius: 2mm; }
  .tools button { font-size: 11pt; padding: 1mm 4mm; }
  @media screen { body { background: #ccc; } .sheet { background: #fff; padding: 10mm; margin: 16mm auto 6mm; box-shadow: 0 2px 10px #0004; max-width: 297mm; } }
  @media print { .tools { display: none; } }
</style>
</head>
<body>
<div class="tools"><label><input type="checkbox" id="show-ans" onchange="document.body.classList.toggle('answers', this.checked); document.querySelector('h1').textContent = this.checked ? 'The CPU – answer key' : 'The CPU – label the parts'"> Show answers</label><button onclick="print()">Print</button></div>
<div class="sheet">
  <header><h1>The CPU – label the parts</h1><div class="fill">Name <span></span></div><div class="fill">Class <span class="short"></span></div><div class="fill">Date <span class="short"></span></div></header>
  <svg viewBox="${VX} ${VY} ${VW} ${VH}" role="img" aria-label="Blank diagram of the simulator panel">
${svg}
${a}
  </svg>
</div>
</body>
</html>
`;
fs.writeFileSync(dir + '/blank-panel.html', html);
console.log('blank-panel written', html.length);
