// Generates handout.html from the simulator's own strings, steps and assembler.
// Usage: node tools/gen_handout.js [HWGame folder]   (default: the folder above tools/)
const fs = require('fs');
const path = require('path');
const dir = process.argv[2] || path.join(__dirname, '..');
const src = fs.readFileSync(dir + '/index.html', 'utf8').match(/<script id="lmc-core">([\s\S]*?)<\/script>/)[1];
(0, eval)(src + ';globalThis.LMC=LMC;globalThis.STRINGS=STRINGS;');
const S = STRINGS, p2 = LMC.pad2, p3 = LMC.pad3;
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const stepLi = (st, cond) => {
  const go = '';
  const action = typeof st.action === 'function' ? null : st.action;
  const btn = action ? ` <span class="btn">${esc(S.btn[action] || '')}</span>` : '';
  return `<li><b>${esc(S.roles[st.role])}</b>${go} – ${esc(S.prompts[st.id].replace(/^[^:]+:\s*/, ''))}${btn.replace('<span class="btn"></span>', '')}${cond ? ` <i>(${cond})</i>` : ''}</li>`;
};
// Two blocks per table row: WebKit/Safari cannot keep grid items whole across pages, table rows it can.
const pairs = blocks => `<table class="pairs">${blocks.map((b, i) => i % 2 ? '' : `<tr><td>${b}</td><td>${blocks[i + 1] || ''}</td></tr>`).join('')}</table>`;
const execBlock = mn => {
  const list = LMC.EXEC[mn];
  const items = list.map(st => stepLi(st, st.when ? 'only if taken' : '')).join('');
  return `<div class="blk"><h4>${mn}</h4><ol>${items}</ol></div>`;
};

const ISA = [
  ['1xx', 'ADD xx', 'ACC ← ACC + RAM[xx]', 'read'], ['2xx', 'SUB xx', 'ACC ← ACC − RAM[xx]', 'read'],
  ['3xx', 'STA xx', 'RAM[xx] ← ACC', 'write'], ['5xx', 'LDA xx', 'ACC ← RAM[xx]', 'read'],
  ['6xx', 'BRA xx', 'PC ← xx', 'no'], ['7xx', 'BRZ xx', 'if ACC = 0 and N = 0 then PC ← xx', 'no'],
  ['8xx', 'BRP xx', 'if N = 0 then PC ← xx', 'no'], ['901', 'INP', 'ACC ← next number from INPUT', 'no (I/O)'],
  ['902', 'OUT', 'OUTPUT ← ACC', 'no (I/O)'], ['000', 'HLT', 'stop', 'no'], ['–', 'DAT n', 'assembler directive: a data cell holding n', '–'],
];

const ROLECARDS = [
  { r: 'CU', own: 'The Control Unit panel and the CONTROL BUS.',
    watch: 'Your panel lights up yellow – when memory or I/O needs a signal, for ADD/SUB, for a branch decision, and to stop.',
    do: ['Press <b>READ</b> or <b>WRITE</b> for memory, <b>IN</b> / <b>OUT</b> for I/O.', 'For ADD/SUB press <b>ALU</b> – the instruction already says which sum to do.', 'For BRZ/BRP look at the ACC and the N (negative) lamp, then press <b>Branch taken</b> or <b>Not taken</b>.', 'Press <b>HALT</b> for 000 – and also for any code that is not in the table (ILLEGAL).'],
    mistakes: ['Pressing READ when the instruction needs WRITE (STA).', 'Forgetting that BRZ needs ACC = 0 <i>and</i> N off.'],
    ex: 'Warm-up, ADD Y: you press READ (step 3), then ALU (step 8).' },
  { r: 'PC', own: 'The Program Counter – the address of the next instruction.',
    watch: 'The start of every FETCH, the end of every FETCH, and BRA/BRZ/BRP when the branch is taken.',
    do: ['FETCH step 2: press <b>Send to MAR</b> – the PC value appears in the MAR.', 'FETCH step 8: type <b>PC + 1</b> (two digits) and press <b>Set</b>.', 'Branch: the IR puts the target into your box – check it and press <b>Set</b>.'],
    mistakes: ['Typing PC + 1 before the instruction was fetched.', 'Typing the branch target on a branch that is <i>not</i> taken.'],
    ex: 'Warm-up, first fetch: PC = 00 goes to the MAR; at step 8 you type 01.' },
  { r: 'IR', own: 'The Instruction Register and the Decoder.',
    watch: 'FETCH step 7 (instruction arrives in the MDR) and DECODE.',
    do: ['Press <b>Latch from MDR</b> to copy the instruction.', 'DECODE (bottom of your panel): the first digit is the opcode, the last two the operand. Pick the name, type the operand, press <b>Decode ✓</b>. Codes not in the table are <b>ILLEGAL</b>.', 'EXECUTE: press <b>Operand → MAR</b> (memory instructions) or <b>Operand → PC</b> (branches).'],
    mistakes: ['Typing an operand for INP, OUT or HLT (leave it blank).', 'Mixing up 5xx (LDA) and 3xx (STA).'],
    ex: 'Warm-up: 505 → pick LDA, operand 05.' },
  { r: 'MI', own: 'The MAR (address) and MDR (data) – the CPU’s doors to the buses.',
    watch: 'Every time an address or a value has to cross a bus.',
    do: ['MAR: the PC or IR has already put an address in it – press <b>Put on address bus</b> so RAM can see it.', 'MDR: <b>Latch from data bus</b> after RAM (or INPUT) placed a value.', 'STA and OUT: <b>Put on data bus</b> so RAM can store it or OUTPUT can print it.', 'ADD/SUB: <b>Send to ALU B</b>.', 'Remember: the MDR is the <i>only</i> register that touches the data bus.'],
    mistakes: ['Latching the MDR before RAM has placed the value (wait for ACK).'],
    ex: 'Warm-up, ADD Y: MAR = 06, then MDR = 025.' },
  { r: 'RAM', own: 'The RAM wheel – 100 cells, but you can only see 5.',
    watch: 'READ or WRITE lit on the CONTROL BUS.',
    do: ['Turn the wheel one cell at a time (drag, mouse wheel or ▲/▼) until the head window is <b>green</b> (head = MAR).', 'READ: press <b>Place value on data bus</b>.', 'WRITE: press <b>Store value from data bus</b>.', 'Every click counts – memory access is slow!'],
    mistakes: ['Pressing before the head is green (the buttons stay off).', 'Turning past the address and losing count.'],
    ex: 'Warm-up, ADD Y: turn to 06 and place 025 on the data bus.' },
  { r: 'ALU', own: 'The Arithmetic Logic Unit – inputs A and B, the operation, the result.',
    watch: 'ADD and SUB, step 9 – after the CU pressed ALU. The instruction decides + or −.',
    do: ['Work out A + B or A − B.', 'Results wrap around at 1000: 600 + 500 → 100 (overflow).', 'SUB below zero: type 1000 + the result (5 − 10 → 995) and switch <b>N on</b>.', 'Press <b>Compute</b>.'],
    mistakes: ['Forgetting the N flag on a negative result.', 'Leaving N on for a positive result.'],
    ex: 'Warm-up: A = 020, B = 025, + → type 045, N off.' },
  { r: 'ACC', own: 'The Accumulator (ACC) and the N lamp. N = <b>Negative</b> flag: it lights when a SUB result went below zero.',
    watch: 'The end of LDA, ADD, SUB and INP; the start of STA and OUT.',
    do: ['LDA and INP: <b>Latch from MDR</b>. ADD/SUB: <b>Latch ALU result</b>.', 'ADD/SUB: <b>Send to ALU A</b> first.', 'STA and OUT: <b>Send to MDR</b> – the ACC never touches the data bus itself.'],
    mistakes: ['Pressing “Latch ALU result” on LDA/INP (the value is in the MDR), or vice versa.'],
    ex: 'Warm-up: LDA X → ACC = 020; ADD Y → ACC = 045.' },
  { r: 'IO', own: 'The INPUT tray, the OUTPUT tray and Storage (disk).',
    watch: 'IN or OUT lit on the CONTROL BUS.',
    do: ['Before the run: type numbers into INPUT and press <b>Add</b>; load a program from Storage.', 'IN: press <b>Send to data bus</b> – the first number in the tray goes to the MDR.', 'OUT: press <b>Print</b> – the value is added to the OUTPUT tray.'],
    mistakes: ['Forgetting to put enough numbers in the INPUT tray.'],
    ex: 'Warm-up: OUT prints 045.' },
];

const sampleSection = (p, i) => {
  const a = LMC.assemble(p.src);
  const rows = a.listing.map(r => `<tr><td>${p2(r.addr)}</td><td><b>${p3(r.code)}</b></td><td class="src">${esc(r.src)}</td></tr>`).join('');
  const trace = Array.from({ length: i === 4 ? 16 : 12 }, (_, k) => `<tr><td>${k + 1}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`).join('');
  const notes = ['Expected output: 045', 'Try inputs 7 and 5 → 012', 'Try input 3 → 003, 002, 001, 000', 'Try inputs 4 and 9 → 009', 'Try inputs 3 and 4 → 012'][i];
  return `<section class="page prog"><h2>${esc(p.name)}</h2><p class="note">${notes}</p>
  <div class="two"><table class="lst"><tr><th>Addr</th><th>Code</th><th>Source</th></tr>${rows}</table>
  <table class="trace"><tr><th>Step</th><th>PC</th><th>IR</th><th>MAR</th><th>MDR</th><th>ACC</th><th>N</th><th>Output</th></tr>${trace}</table></div></section>`;
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CPU Simulator – Student Handout</title>
<!-- Generated from index.html (STRINGS, micro-steps and assembler) so the wording matches the screen. -->
<style>
  @page { size: A4 portrait; margin: 15mm; }
  * { box-sizing: border-box; }
  body { font: 11pt/1.4 "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #000; background: #fff; margin: 0; }
  .wrap { max-width: 180mm; margin: 0 auto; padding: 10mm 0; }
  h1 { font-size: 26pt; margin: 0 0 4mm; } h2 { font-size: 17pt; margin: 0 0 3mm; border-bottom: 2px solid #000; padding-bottom: 1mm; }
  h3 { font-size: 13pt; margin: 4mm 0 2mm; } h4 { margin: 0 0 1mm; font-size: 11.5pt; }
  .page { break-before: page; } .page:first-child { break-before: auto; }
  table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #000; padding: 1.2mm 2mm; text-align: left; vertical-align: top; }
  th { background: #e6e6e6; } code, .mono, .lst td, .trace td { font-family: Consolas, Menlo, "DejaVu Sans Mono", monospace; }
  .btn { display: inline-block; border: 1px solid #000; border-radius: 3px; padding: 0 1.5mm; font-size: 9.5pt; font-weight: 600; }
  .go { display: inline-block; border: 1px dashed #000; border-radius: 3px; padding: 0 1mm; font-size: 8.5pt; }
  ol { margin: 1mm 0 2mm 5mm; padding-left: 4mm; } li { margin: .5mm 0; }
  .pairs { border-collapse: separate; border-spacing: 4mm 0; margin: 0 -4mm; width: calc(100% + 8mm); }
  .pairs td { border: none; padding: 0 0 4mm; width: 50%; } .pairs tr { break-inside: avoid; page-break-inside: avoid; }
  .blk { border: 1px solid #000; border-radius: 2mm; padding: 2mm 3mm; break-inside: avoid; }
  .blk ol { font-size: 9pt; line-height: 1.3; margin-bottom: 0; } .blk li { margin: .3mm 0; } .blk h4 { margin-bottom: .5mm; }
  .cards { display: block; }
  .card { height: 112mm; font-size: 10pt; line-height: 1.3; border: 1.5px dashed #000; padding: 4mm 6mm; break-inside: avoid; page-break-inside: avoid; margin-bottom: 4mm; position: relative; overflow: hidden; }
  .card:nth-child(2n) { break-after: page; }
  .card h2 { border: none; font-size: 18pt; margin: 0; }
  .card dt { margin-top: 1.2mm !important; }
  .card .tag { position: absolute; right: 6mm; top: 6mm; font-size: 9pt; border: 1px solid #000; padding: 0 2mm; border-radius: 2mm; }
  .card dt { font-weight: 700; margin-top: 2mm; } .card dd { margin: 0 0 0 4mm; } .card ul { margin: 0; padding-left: 5mm; }
  .scissors { font-size: 9pt; color: #555; margin: -4mm 0 1mm; }
  .two { display: grid; grid-template-columns: 62mm 1fr; gap: 5mm; align-items: start; }
  .lst td { font-size: 9.5pt; padding: .6mm 1.5mm; } .lst .src { white-space: pre; }
  .trace td { height: 7.5mm; } .trace th { font-size: 9pt; padding: 1mm; }
  .note { margin: 0 0 3mm; font-style: italic; }
  .gl { font-size: 10pt; } .gi { break-inside: avoid; page-break-inside: avoid; } .gl dt { font-weight: 700; margin-top: 1.6mm; } .gl dd { margin: 0 0 0 5mm; }
  svg text { font-family: inherit; }
  .ex { border-left: 3px solid #000; padding: 1mm 3mm; margin: 2mm 0; }
  .print-btn { position: fixed; right: 10mm; top: 6mm; font-size: 12pt; padding: 2mm 5mm; }
  @media screen { body { background: #ccc; } .wrap { background: #fff; padding: 15mm; margin: 6mm auto; box-shadow: 0 2px 10px #0004; max-width: 210mm; } .page { border-top: 2px dashed #999; padding-top: 10mm; margin-top: 10mm; } }
  @media print { .print-btn { display: none; } .wrap { padding: 0; } }
</style>
</head>
<body>
<button class="print-btn" onclick="print()">Print</button>
<div class="wrap">

<section class="page">
  <h1>You are the computer</h1>
  <p>Today your group <b>is</b> a CPU. A real processor runs billions of tiny steps every second; you will do the very same steps by hand, slowly, on the big screen. Each of you owns one part of the hardware – the Control Unit, the Program Counter, the ALU, the RAM… When your part lights up yellow it is your turn: do exactly one small job, then the next part lights up. Fetch an instruction, decode it, execute it – again and again – until the program says <b>HALT</b>. The app only checks your work; <i>you</i> make it run.</p>
  <h3>The screen</h3>
  <svg viewBox="0 0 640 330" width="100%" role="img" aria-label="Screen layout sketch">
    <rect x="1" y="1" width="638" height="328" fill="none" stroke="#000" stroke-width="2"/>
    <rect x="8" y="8" width="624" height="28" fill="#eee" stroke="#000"/><text x="16" y="27" font-size="12">Program · FETCH → DECODE → EXECUTE · current step · counters · ☰</text>
    <rect x="10" y="44" width="300" height="222" rx="12" fill="none" stroke="#000" stroke-width="2"/><text x="20" y="60" font-size="12" font-weight="700">CPU</text>
    <rect x="20" y="66" width="150" height="56" fill="#f4f4f4" stroke="#000"/><text x="28" y="84" font-size="11">Control Unit</text>
    <rect x="20" y="128" width="150" height="34" fill="#f4f4f4" stroke="#000"/><text x="28" y="148" font-size="11">PC</text>
    <rect x="20" y="168" width="150" height="92" fill="#f4f4f4" stroke="#000"/><text x="28" y="186" font-size="11">IR + Decoder</text>
    <rect x="178" y="66" width="124" height="40" fill="#f4f4f4" stroke="#000"/><text x="186" y="84" font-size="11">ACC + N lamp</text>
    <rect x="178" y="112" width="124" height="30" fill="#f4f4f4" stroke="#000"/><text x="186" y="131" font-size="11">MAR</text>
    <rect x="178" y="148" width="124" height="44" fill="#f4f4f4" stroke="#000"/><text x="186" y="166" font-size="11">MDR</text>
    <rect x="178" y="198" width="124" height="62" fill="#f4f4f4" stroke="#000"/><text x="186" y="216" font-size="11">ALU (A ← ACC, B ← MDR)</text>
    <rect x="320" y="48" width="150" height="56" fill="none" stroke="#000"/><text x="328" y="66" font-size="11">Messages · hints</text>
    <line x1="302" y1="127" x2="490" y2="127" stroke="#000" stroke-width="4"/><text x="320" y="121" font-size="10">ADDRESS BUS →</text>
    <line x1="302" y1="165" x2="490" y2="165" stroke="#000" stroke-width="4" stroke-dasharray="10 4"/><text x="320" y="159" font-size="10">DATA BUS ↔ (only via MDR)</text>
    <line x1="302" y1="200" x2="490" y2="200" stroke="#000" stroke-width="4" stroke-dasharray="3 3"/><text x="320" y="194" font-size="10">CONTROL BUS ↔</text>
    <rect x="490" y="44" width="92" height="222" fill="none" stroke="#000" stroke-width="2"/><text x="496" y="62" font-size="11" font-weight="700">RAM wheel</text>
    <rect x="490" y="112" width="92" height="100" fill="none" stroke="#000" stroke-width="4"/><text x="496" y="160" font-size="11">head (5 cells</text><text x="496" y="174" font-size="11">visible)</text>
    <rect x="588" y="44" width="44" height="222" fill="#f4f4f4" stroke="#000"/><text x="596" y="160" font-size="10">▲▼</text>
    <rect x="10" y="274" width="200" height="48" fill="#f4f4f4" stroke="#000"/><text x="18" y="292" font-size="11">INPUT tray</text>
    <rect x="216" y="274" width="200" height="48" fill="#f4f4f4" stroke="#000"/><text x="224" y="292" font-size="11">OUTPUT tray</text>
    <rect x="422" y="274" width="210" height="48" fill="#f4f4f4" stroke="#000"/><text x="430" y="292" font-size="11">Storage (disk) – programs</text>
  </svg>
  <h3>The fetch–decode–execute loop</h3>
  <svg viewBox="0 0 640 210" width="100%" role="img" aria-label="Fetch decode execute cycle">
    <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z"/></marker></defs>
    <rect x="40" y="70" width="150" height="64" rx="14" fill="#eee" stroke="#000" stroke-width="2"/><text x="115" y="98" text-anchor="middle" font-size="18" font-weight="700">FETCH</text><text x="115" y="118" text-anchor="middle" font-size="11">7 steps: PC → MAR → RAM → MDR → IR</text>
    <rect x="245" y="70" width="150" height="64" rx="14" fill="#eee" stroke="#000" stroke-width="2"/><text x="320" y="98" text-anchor="middle" font-size="18" font-weight="700">DECODE</text><text x="320" y="118" text-anchor="middle" font-size="11">opcode | operand → name</text>
    <rect x="450" y="70" width="150" height="64" rx="14" fill="#eee" stroke="#000" stroke-width="2"/><text x="525" y="98" text-anchor="middle" font-size="18" font-weight="700">EXECUTE</text><text x="525" y="118" text-anchor="middle" font-size="11">different for each instruction</text>
    <line x1="190" y1="102" x2="243" y2="102" stroke="#000" stroke-width="2" marker-end="url(#ar)"/>
    <line x1="395" y1="102" x2="448" y2="102" stroke="#000" stroke-width="2" marker-end="url(#ar)"/>
    <path d="M525 134 C525 190 115 190 115 136" fill="none" stroke="#000" stroke-width="2" marker-end="url(#ar)"/>
    <text x="320" y="196" text-anchor="middle" font-size="12">repeat until HLT</text>
  </svg>
</section>

<section class="page">
  <h2>Instruction set card</h2>
  <p>Every RAM cell holds 3 digits <b>000–999</b>. Read an instruction as <b>opcode</b> (first digit) | <b>operand</b> (last two digits = an address). Arithmetic wraps around at 1000. If SUB goes below 0 the <b>N</b> (negative) flag switches on; LDA, ADD and INP switch it off.</p>
  <table><tr><th>Code</th><th>Mnemonic</th><th>Meaning</th><th>Uses memory?</th></tr>
  ${ISA.map(r => `<tr><td class="mono"><b>${r[0]}</b></td><td class="mono">${r[1]}</td><td>${esc(r[2])}</td><td>${r[3]}</td></tr>`).join('')}</table>
  <p>Opcode 4xx and any other code not in the table is an <b>illegal instruction</b>: the Decoder picks <b>ILLEGAL</b> and the Control Unit presses <b>HALT</b>.</p>
  <h3>Worked examples</h3>
  <div class="ex"><b class="mono">305</b> = 3 | 05 = <b>STA 05</b>: store the ACC in cell 05.</div>
  <div class="ex"><b class="mono">512</b> = 5 | 12 = <b>LDA 12</b>: load the value of cell 12 into the ACC.</div>
  <div class="ex"><b class="mono">804</b> = 8 | 04 = <b>BRP 04</b>: if N is off, jump – the PC becomes 04.</div>
  <div class="ex"><b class="mono">902</b> = <b>OUT</b>: print the ACC (no operand – leave the box blank when decoding).</div>
</section>

<section class="page">
  <h2>Cycle cheat-sheet</h2>
  <p>Exactly one part is active at a time (thick yellow border). The phases follow each other automatically – the current phase is lit at the top of the screen. The text after each role is the same as the prompt on the screen.</p>
  ${pairs([`<div class="blk"><h4>FETCH (every instruction)</h4><ol>${LMC.FETCH.map(st => stepLi(st)).join('')}</ol></div>`,
    `<div class="blk"><h4>DECODE</h4><ol>${LMC.DECODE.map(st => stepLi(st)).join('')}</ol>
      <p style="font-size:9.5pt;margin:1mm 0 0">After EXECUTE the next FETCH starts automatically.</p></div>`])}
  <h3>EXECUTE – per instruction</h3>
  ${pairs(['LDA', 'STA', 'INP', 'OUT'].map(execBlock))}
</section>

<section class="page">
  <h2>Cycle cheat-sheet – EXECUTE (continued)</h2>
  ${pairs(['ADD', 'SUB', 'BRA', 'BRZ', 'BRP', 'HLT'].map(execBlock))}
</section>

<section class="page">
  <h2>Role cards</h2>
  <p class="scissors">✂ Cut along the dashed lines – one card per student (merged roles share cards).</p>
  <div class="cards">
  ${ROLECARDS.map(c => `<div class="card"><span class="tag">Role · ${esc(S.roleShort[c.r])}</span><h2>${esc(S.roles[c.r])}</h2><dl>
    <dt>You own</dt><dd>${c.own}</dd>
    <dt>You watch for</dt><dd>${c.watch}</dd>
    <dt>You do</dt><dd><ul>${c.do.map(d => `<li>${d}</li>`).join('')}</ul></dd>
    <dt>Common mistakes</dt><dd><ul>${c.mistakes.map(d => `<li>${d}</li>`).join('')}</ul></dd>
    <dt>Mini example (warm-up program)</dt><dd>${c.ex}</dd></dl></div>`).join('')}
  </div>
</section>

${LMC.SAMPLES.map(sampleSection).join('\n')}

<section class="page">
  <h2>Glossary</h2>
  <dl class="gl">
    <div class="gi"><dt>CPU (Central Processing Unit)</dt><dd>The chip that fetches, decodes and executes instructions. Here: CU, PC, IR, MAR, MDR, ACC and ALU.</dd></div>
    <div class="gi"><dt>CU (Control Unit)</dt><dd>Directs every step: sends control signals (READ, WRITE, IN, OUT) and decides branches.</dd></div>
    <div class="gi"><dt>ALU (Arithmetic Logic Unit)</dt><dd>Does the calculations (in LMC: + and −). Real ALUs also do MUL, DIV, AND, OR, XOR, NOT.</dd></div>
    <div class="gi"><dt>PC (Program Counter)</dt><dd>Holds the address of the next instruction. Goes up by 1 after each fetch, or jumps on a branch.</dd></div>
    <div class="gi"><dt>IR (Instruction Register)</dt><dd>Holds the instruction being executed, split into opcode and operand.</dd></div>
    <div class="gi"><dt>MAR (Memory Address Register)</dt><dd>Holds the address the CPU wants to use; it drives the address bus.</dd></div>
    <div class="gi"><dt>MDR (Memory Data Register)</dt><dd>Holds the value just read from, or about to be written to, memory; it is connected to the data bus.</dd></div>
    <div class="gi"><dt>ACC (Accumulator)</dt><dd>The working register: results of LDA, ADD, SUB and INP end up here.</dd></div>
    <div class="gi"><dt>N (Negative flag)</dt><dd>A lamp next to the ACC. It lights when a SUB result went below zero (the ACC then shows the wrapped value, e.g. 995 for −5). LDA, ADD and INP switch it off; BRZ and BRP look at it.</dd></div>
    <div class="gi"><dt>Address bus</dt><dd>Carries an address from the CPU to RAM – one way only.</dd></div>
    <div class="gi"><dt>Data bus</dt><dd>Carries values between CPU, RAM and I/O – both ways. Inside the CPU only the MDR is connected to it.</dd></div>
    <div class="gi"><dt>Control bus</dt><dd>Carries signals such as READ, WRITE, IN, OUT, ACK and HALT.</dd></div>
    <div class="gi"><dt>RAM (Random Access Memory)</dt><dd>Main memory: numbered cells holding instructions and data. LMC has 100 cells (00–99).</dd></div>
    <div class="gi"><dt>Volatile</dt><dd>Loses its contents when the power is off. RAM is volatile.</dd></div>
    <div class="gi"><dt>Secondary storage</dt><dd>Non-volatile storage (disk, SSD). Programs live here and are copied into RAM to run.</dd></div>
    <div class="gi"><dt>Clock</dt><dd>Ticks to keep every part in step. Each tick allows one small step – in this game, one micro-step.</dd></div>
    <div class="gi"><dt>Bus width</dt><dd>How many bits a bus carries at once. A 32-bit address bus can address 2<sup>32</sup> cells (about 4 billion); LMC needs only 100 addresses, so 2 decimal digits are enough.</dd></div>
  </dl>
</section>
</div>
</body>
</html>
`;
fs.writeFileSync(dir + '/handout.html', html);
console.log('handout written', html.length);
