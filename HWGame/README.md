# CPU Simulator – Little Man Computer

A classroom game in which students **act as the hardware** of a Little Man Computer (LMC) CPU. Each student owns a component (Control Unit, PC, IR, MAR/MDR, RAM, ALU, ACC, I/O) and performs its micro-steps on a shared big screen. In the default *Guided* mode the app never runs the program itself. It only checks what the students do.

| File | What it is |
| --- | --- |
| `index.html` | The whole simulator: one self-contained file with no network access. |
| `handout.html` | Print-ready A4 student handout: role cards, instruction set, cycle cheat-sheet, sample programs with trace tables, glossary. |
| `tests.html` | Opens the built-in self-tests (same as `index.html#tests`). |

## Opening it

Double-click `index.html` (or open it from a USB stick). It works offline from `file://` in current Chrome, Edge and Firefox. It is designed for a 1920×1080 projector or touch screen and scales down automatically, for example to 1366×768. Press **F** for full screen.

1. Choose a program under **Storage (disk)** at the bottom right and press **Load**. The sample programs fill the INPUT tray with example numbers. Tap a number to remove it, or type one and press **Add**.
2. The active component has a pulsing yellow border, and the top bar says what to do. Only that component's controls work. Anyone else who taps gets "Not your turn – it's the …'s turn".
3. After 2 wrong attempts a **Hint** button appears. After 3, **Show answer** appears for the teacher. Mistakes are counted per role and shown only in the end-of-program summary.

## The screen

Panels are grouped by who operates them:

- **Left column (CPU):** Control Unit, Program Counter, and Instruction Register with its Decoder. These three are one student in the 4-player preset.
- **Right column (CPU), next to the buses:** Accumulator, MAR, MDR, and ALU. ALU input A comes from the ACC and input B from the MDR. MAR/MDR + ACC are one student in the 4- and 6-player presets.
- Then the **address, data and control buses**, the **RAM wheel**, and along the bottom the **INPUT, OUTPUT and Storage** trays.

Some design rules the game follows:

- **The Control Unit has one big Go button.** It starts FETCH, starts EXECUTE after decoding, and authorises transfers (if "Go" is switched on in Settings). The current phase is shown at the top. When the CU has just acted itself, that press already counts, so it never presses Go twice in a row.
- **ALU** is a single CU button, because the instruction (ADD or SUB) already decides the operation.
- **HALT** stops both on `000` and on illegal codes. The Decoder's **ILLEGAL** choice is where students spot an illegal code.
- **MAR and MDR work the same way.** Sending a value to them (PC/IR → MAR, ACC → MDR) shows it in the register at once. Their own button (**Put on address bus** / **Put on data bus**) then drives it onto the bus.
- **Only the MDR touches the data bus.** INP goes INPUT → data bus → MDR → ACC. OUT goes ACC → MDR → data bus → OUTPUT.
- **N** next to the ACC is the **Negative flag**. It lights when a SUB result goes below zero (the ACC then shows the wrapped value, e.g. 995 for −5). LDA, ADD and INP switch it off, and BRZ/BRP read it. Hover over the lamp for the same explanation.

## Teacher controls

**Hold ☰ (top right) for one second** to open the teacher menu. A short tap does nothing, so students can't open it by accident.

- **Mode:** *Guided* (students do every step), *Demo* (the app plays the steps, with ▶/⏸, single step and a speed slider), or *Step-assist* (tick the roles that students play; the app plays the rest).
- **Program:** load a built-in or saved program, open the **Programs editor**, **Reset machine** (keeps the program), **Clear all**.
- **Run:** Undo / Redo (unlimited), Skip to next instruction, Run to HALT.
- **Roles:** presets for 4, 6 or 8 students (merged roles share a badge) and student names for the badges.
- **Settings:** CU "Go" before each transfer, hints, sounds, animation speed (off/1×/2×/4×), fast wheel (wheel clicks not counted), crowd prediction question, Space key shortcut, edit memory, RAM overview (all 100 cells), full screen, print handout, self-tests.

Settings and names are remembered in the browser.

**Keyboard (teacher):** `Space` performs the current step (can be switched off in Settings, e.g. so a student tapping the keyboard can't advance the game) · `Ctrl+Z` / `Ctrl+Y` undo / redo · `↑` / `↓` turn the RAM wheel · `F` full screen · `Esc` closes dialogs.

## Adding programs

Teacher menu → **Programs editor…**

```
[LABEL] MNEMONIC [OPERAND] [// comment]
```

- Mnemonics are case-insensitive: `ADD SUB STA LDA BRA BRZ BRP INP OUT HLT DAT`.
- The operand is an address 0–99 or a label. `DAT` takes an optional value 0–999 (default 0).
- `//` and `;` start comments.
- The listing (address · code · source) updates as you type. Errors are shown with line numbers.
- **Load into RAM** runs it. **Save to Storage** keeps it in this browser (localStorage). **Export / Import .lmc** moves programs between computers as plain text files.

To add a program permanently for everyone, add an entry to `SAMPLES` in the `lmc-core` script inside `index.html`. Use `{ name, builtin: true, inputs: [..], src: \`...\` }`.

## Translating

Every user-facing string is in the `STRINGS` object at the top of the `lmc-core` script in `index.html`. Translate the values and keep the keys and `{placeholders}`.

## How the code is organised (inside `index.html`)

- `<script id="lmc-core">`: `STRINGS` plus the `LMC` module. It holds the machine state, the micro-steps as data (`role`, `prompt`, `action`, `expect`, `check`, `effect`), a pure `act(state, action, payload)` engine that never mutates its input (undo is a stack of snapshots), the two-pass assembler, the sample programs and `runTests()`. It contains no DOM code.
- `<script id="lmc-ui">`: renders everything from the state and sends every change through the engine.

## Tests

- In the browser: open `tests.html`, or teacher menu → **Self-tests**, or run `LMC.runTests()` in the console.
- From a terminal (Node 18+), this extracts the core script and runs the same tests:

```bash
node -e "const s=require('fs').readFileSync('index.html','utf8').match(/<script id=\"lmc-core\">([\s\S]*?)<\/script>/)[1];(0,eval)(s);const r=LMC.runTests();r.filter(x=>!x.ok).forEach(x=>console.log('FAIL',x.name,x.err));console.log(r.filter(x=>x.ok).length+'/'+r.length+' passed')"
```

The tests cover the assembler (all samples, unknown label or mnemonic, duplicates, ranges, length), every opcode including illegal codes, the five sample programs run to HALT, the spec's worked snapshot, and guided-mode validation (wrong turn, wrong values, Go gating, RAM head/MAR/signal gating, wheel clicks, undo snapshots).
