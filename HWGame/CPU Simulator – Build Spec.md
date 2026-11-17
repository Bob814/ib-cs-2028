# CPU Simulator – Build Spec

Oct 25, 2026 · @Ivan Gueorguiev

## 1. Purpose, deliverables, constraints

Build a single-page classroom simulator of a Little Man Computer (LMC) CPU in which students **act as the hardware**: each student owns a component and performs its micro-steps on a shared big screen until a small program runs to completion. The app does not execute the program by itself in the default mode; it only validates what students do.

**Audience:** high-school / first-year students, groups of 5–9, one projector or large touch screen, a teacher nearby.

**Deliverables**

1. `index.html` – the whole simulator in one self-contained file (inline CSS and JS, no external requests, works offline from `file://`).
2. `handout.html` – a print-ready (A4, portrait) student handout: role cards, instruction set, cycle cheat-sheet, sample programs (section 9).
3. `README.md` – how to open, teacher controls, how to add programs.

**Technical constraints**

- Vanilla HTML/CSS/JavaScript (ES2020). No frameworks, no build step, no CDN.
- Target screen 1920×1080 at 100% zoom, everything visible without scrolling; must still work at 1366×768 (scaled).
- Mouse, touch and keyboard input. Touch targets ≥ 56 px.
- Readable from 5 m: register values ≥ 40 px monospace, labels ≥ 20 px, high contrast.
- Code structure: one `machine` state object, a pure `step` engine (section 6), and a renderer that redraws from state. All state changes go through the engine so undo is a simple history stack.
- UI language: English; keep all user-facing strings in one `STRINGS` object so they can be translated (e.g. to Bulgarian) later.

## 2. Machine model and instruction set (LMC)

The machine follows the [Little Man Computer](https://en.wikipedia.org/wiki/Little_Man_Computer) exactly; all values are decimal.

- **RAM:** 100 cells, addresses `00`–`99`, each holding a 3-digit value `000`–`999`.
- **Registers:** PC (2 digits), IR (3 digits, shown as opcode digit + 2-digit operand), MAR (2 digits), MDR (3 digits), ACC (3 digits), plus a **Negative flag** (N).
- **I/O:** an INPUT tray (queue of numbers typed by a student) and an OUTPUT tray (list of printed numbers).
- **Arithmetic:** results are taken modulo 1000. If SUB goes below 0, N = 1 and ACC shows the wrapped value; any LDA, ADD, or INP that produces a value ≥ 0 clears N. ADD overflow above 999 wraps and shows an “overflow” badge (no flag).

| Code | Mnemonic | Meaning | Uses memory? |
| --- | --- | --- | --- |
| 1xx | ADD xx | ACC ← ACC + RAM\[xx\] | read |
| 2xx | SUB xx | ACC ← ACC − RAM\[xx\] | read |
| 3xx | STA xx | RAM\[xx\] ← ACC | write |
| 5xx | LDA xx | ACC ← RAM\[xx\] | read |
| 6xx | BRA xx | PC ← xx | no |
| 7xx | BRZ xx | if ACC = 0 and N = 0 then PC ← xx | no |
| 8xx | BRP xx | if N = 0 then PC ← xx | no |
| 901 | INP | ACC ← next number from INPUT | no (I/O) |
| 902 | OUT | OUTPUT ← ACC | no (I/O) |
| 000 | HLT | stop | no |
| – | DAT n | assembler directive: a data cell holding n | – |

Opcode `4xx` and any other undefined value is an **illegal instruction**: the CU student must press “Illegal – halt”, and the machine stops with a message.

The ALU panel may list the wider set of operations from the course (MUL, DIV, AND, OR, XOR, NOT) greyed out with the tooltip “not in LMC”, so the concept is visible without changing the instruction set.

## 3. Screen layout and components

The whole screen is a stylised **motherboard** (dark green PCB background, faint traces). On it sit four zones, all visible at all times: the **CPU** chip (left, \~45% width), the **bus lane** (centre, three horizontal buses), **RAM** (right), and **I/O + Storage** (bottom strip). A top bar holds the program name, phase indicator and teacher menu.

&#91;embedded content: screen layout · CPU, 3 buses, RAM wheel, I/O and storage\]

The diagram shows the screen mid-execution (the worked snapshot below): every register, bus and the RAM wheel carry live values. The address bus runs one way from MAR to the RAM head; the data and control buses run both ways, and the data bus also branches down to the I/O trays.

**Top bar:** program name · phase pills FETCH → DECODE → EXECUTE (current one lit) · current micro-step text in large type (e.g. “Control Unit: put READ on the control bus”) · counters: instructions executed, micro-steps, memory wheel clicks · teacher menu button (☰).

**Inside the CPU** (a rounded chip outline labelled “CPU”):

| Component | Shows | Students’ controls when active |
| --- | --- | --- |
| Control Unit (CU) | current phase, decoded instruction name, the next micro-step | buttons: “READ”, “WRITE”, “Next phase”, “Branch taken / not taken”, “HALT” |
| Program Counter (PC) | 2-digit value | “Send to address bus”; number box to type PC+1 or the branch target |
| Instruction Register (IR) | 3 digits, split visually into opcode \[1\] + operand \[2\] | “Latch from MDR”; decode picker (section 6) |
| Memory Address Register (MAR) | 2-digit value; wired to the address bus | “Latch address” |
| Memory Data Register (MDR) | 3-digit value; wired to the data bus | “Latch from data bus”, “Send to …” |
| Accumulator (ACC) | 3-digit value + N flag lamp | “Latch result”, “Send to MDR / ALU / OUTPUT” |
| ALU | two input slots A and B, operation symbol, result box | number input for the result + “Compute”; N flag toggle |

Internal CPU paths (thin lines inside the chip) connect PC→MAR, MDR↔IR, MDR↔ACC, ACC→ALU-A, MDR→ALU-B, ALU→ACC, IR(operand)→MAR and IR(operand)→PC. A value moving along a path is animated as a small labelled token.

### Live values (always shown)

Every register, bus, flag and the ALU **always display their current value**, updated by the engine after each micro-step. Nothing is ever blank except a bus that is not driven (“––”) or a register before the first program load (“000” / “00”). Students must be able to read the full machine state from the screen at any moment, so the class can predict the next step.

- **Format:** fixed width with leading zeros – PC and MAR 2 digits (`02`), IR, MDR, ACC 3 digits (`106`).
- **IR** shows the raw code split as opcode | operand (`1 | 06`) and, after DECODE, the mnemonic under it (`ADD 06`). Before decode the mnemonic line shows “?”.
- **CU** shows phase, decoded instruction and the current micro-step number of the total (`EXECUTE · ADD 06 · step 9/10`).
- **ALU** shows its live inputs and operation even before the result is typed (`020 + 025 = ?`); the result appears when the ALU student confirms.
- **ACC** shows the value plus the N lamp (on/off).
- **Change cue:** a value that changed in the last micro-step flashes yellow and shows the previous value faded underneath for 2 s (`was 01`). This makes “PC ← PC+1” or “ACC ← result” visible.
- **Buses** show the value last placed on them; the control bus shows the active signal word.
- **RAM** shows address and value for all 5 visible cells; the head cell is enlarged.

**Worked snapshot** (warm-up program, executing the 2nd instruction `ADD Y` at address 01, just before the ALU computes). The diagram above shows this same state.

| Element | Value | Why |
| --- | --- | --- |
| PC | 02 | incremented during fetch of address 01 |
| IR | 1 \| 06 → ADD 06 | fetched from RAM\[01\] = 106 |
| MAR | 06 | operand of ADD, address of Y |
| MDR | 025 | RAM\[06\] just read |
| ACC / N | 020 / off | loaded by LDA X in the previous instruction |
| ALU | 020 + 025 = ? | waiting for the ALU student |
| Address bus | 06 | last address sent |
| Data bus | 025 | value read from RAM |
| Control bus | ACK | RAM confirmed the READ |
| RAM head | 06 · 025 | wheel at address 06 |
| CU | EXECUTE · ADD 06 · step 9/10 |  |

**Bottom strip:** INPUT tray (queue of numbers, with an entry box and “Add”), OUTPUT tray (printed values, newest on the right), and **Storage (disk)** – a drive icon listing saved programs. Loading a program from disk animates its cells flowing into RAM, to make the point that programs live in secondary storage and are copied into RAM to run.

**Active highlighting:** exactly one component is “active” per micro-step. It gets a thick pulsing yellow border and its role label badge; its buttons are enabled. All other components dim to 60% and their controls are disabled. The relevant bus or path is highlighted too.

**Role badges:** each component shows a small editable badge with the student’s name (e.g. “ALU – Maria”), set from the teacher menu.

## 4. RAM wheel, buses and animation

### RAM – the “tuning wheel”

RAM is a vertical strip showing **exactly 5 cells**: two above, the selected cell in the centre, two below. The centre cell sits behind a fixed “read/write head” window that is aligned with the end of the address bus and the data bus. Each cell shows its address (small, grey) and its value (large).

- Moving the wheel: drag/swipe vertically, mouse wheel, or ▲/▼ buttons (hold to repeat). Each move is **one cell at a time**, animated (\~120 ms per cell) with a click sound (mutable). No jump-to-address control in student mode.
- The wheel does not wrap from 99 to 00 (hard stop with a bump animation).
- Each one-cell move increments the **“memory wheel clicks”** counter, shown under the RAM, so students feel the cost of memory access.
- When the head address ≠ MAR, the head window is red; when equal, it turns green. The RAM student’s action buttons (“Place value on data bus” for READ, “Store value from data bus” for WRITE) are enabled only when green **and** the control bus carries the matching signal.
- A cell that was just written flashes; cells holding the current instruction (PC-1) get a small “▶” marker.
- Teacher mode only: a “RAM overview” popup showing all 100 cells (read-only by default, editable when the teacher toggles “Edit memory”).

### Buses

Three parallel horizontal lanes between the CPU and RAM, each a thick line with a name tag and a large value display in the middle of the lane:

| Bus | Colour | Direction | Carries | Endpoints |
| --- | --- | --- | --- | --- |
| Address bus | blue | CPU → RAM only | 2-digit address | MAR → RAM head |
| Data bus | orange | both ways | 3-digit value | MDR ↔ RAM head; also branches to INPUT/OUTPUT |
| Control bus | red | both ways | signal: READ, WRITE, IN, OUT, ACK, HALT | CU ↔ RAM, CU ↔ I/O |

- When a value is put on a bus, a token with the value slides along it (\~600 ms), then the lane keeps showing the value with a glow until the bus is next driven or cleared.
- Empty bus shows “––”. An arrowhead at the end of the lane shows the current direction.
- Control signals light the matching word on the control bus (all words printed faintly, the active one bright).
- RAM sends **ACK** on the control bus after completing a read or write; the CU cannot advance until ACK arrives.

### Animation rules

- All animations can be sped up (1×, 2×, 4×) or turned off in the teacher menu.
- Input is ignored while an animation runs (buttons show a spinner).
- Use CSS transforms only; no canvas required. Respect `prefers-reduced-motion`.

## 5. Student roles

Eight roles are defined; the teacher menu lets roles be merged for smaller groups (presets for 4, 6 and 8 students). Merged roles share one name badge.

| # | Role | Owns | Typical actions |
| --- | --- | --- | --- |
| 1 | Control Unit | CU, control bus | announces each step, sends READ/WRITE/IN/OUT, decides branches, advances phases |
| 2 | Program Counter | PC | sends PC to address bus path, types PC+1, loads branch target |
| 3 | Instruction Register / Decoder | IR | latches instruction, splits opcode/operand, picks the instruction name |
| 4 | Memory Interface | MAR + MDR | latches addresses and data, drives address and data buses |
| 5 | RAM | RAM wheel | turns the wheel to the address, reads or writes the cell, sends ACK |
| 6 | ALU | ALU | types the result of ADD/SUB, sets N flag when negative |
| 7 | Accumulator | ACC | latches results and loaded values, sends ACC where needed |
| 8 | I/O | INPUT, OUTPUT, Storage | supplies input numbers on request, “prints” output, loads programs from disk |

Merge presets: **6 students** = PC+IR together, MAR/MDR+ACC together. **4 students** = CU+PC+IR, Memory Interface+ACC, RAM+I/O, ALU.

Optional “crowd” role: the rest of the class predicts the next value (displayed as a question in the top bar, answer revealed after the step).

## 6. Micro-step engine: fetch, decode, execute

Every instruction is executed as a fixed list of **micro-steps**. Each micro-step defines: `role` (who is active), `prompt` (text shown in the top bar and on the active component), `action` (which button / input is expected), `expected` (value the engine computes), and `effect` (state change + animation). Implement them as data, e.g. `{ role:'PC', prompt:'Send PC to MAR', action:'click:pc.toAddress', effect: s => s.mar = s.pc }`.

The CU student must press **“Go”** on the CU before each micro-step that starts a new bus transfer, mirroring the CU directing the cycle. (Teacher can disable this in settings to speed up play.)

### Fetch (same for every instruction)

1. **CU:** announces FETCH (phase pill lights).
2. **PC:** “Send to address bus” → PC value travels to MAR, then onto the address bus.
3. **Memory Interface:** “Latch address” → MAR = PC.
4. **CU:** presses **READ** → control bus shows READ.
5. **RAM:** turns wheel until head = MAR (green), presses “Place value on data bus” → data bus shows RAM\[MAR\]; RAM sends ACK.
6. **Memory Interface:** “Latch from data bus” → MDR = value.
7. **IR:** “Latch from MDR” → IR = MDR.
8. **PC:** types the new PC value (PC+1) and confirms. Validate exact value.

### Decode

9. **IR / Decoder:** the IR digits are split visually; the student picks the instruction from a button grid (ADD, SUB, STA, LDA, BRA, BRZ, BRP, INP, OUT, HLT, ILLEGAL) **and** types the operand (2 digits; blank for INP/OUT/HLT). Validate both.
10. **CU:** shows the decoded name large in the CU panel; presses “Next phase” → EXECUTE.

### Execute (per instruction)

**LDA xx**

1. IR: send operand to MAR (path IR→MAR). 2. Memory Interface: latch address. 3. CU: READ. 4. RAM: turn to xx, place value on data bus, ACK. 5. Memory Interface: latch into MDR. 6. ACC: “Latch from MDR” → ACC = MDR, N = 0.

**STA xx**

1. IR: operand → MAR. 2. Memory Interface: latch address. 3. ACC: “Send to MDR” → MDR = ACC. 4. Memory Interface: put MDR on data bus. 5. CU: WRITE. 6. RAM: turn to xx, “Store value from data bus”, ACK.

**ADD xx / SUB xx** 1–5. As LDA steps 1–5 (value ends in MDR). 6. ACC: “Send to ALU A”. 7. Memory Interface: “Send MDR to ALU B”. 8. CU: selects operation (+ or −) on the ALU. 9. **ALU:** types the result (0–999) and, for SUB below zero, types the wrapped value and switches N on. Validate value and flag. 10. ACC: “Latch result”.

**INP**

1. CU: sends IN on control bus. 2. I/O: takes the first number in the INPUT tray (or types one if empty; must be 0–999) and presses “Send” → data bus. 3. ACC: latch from data bus (via MDR shown as pass-through), N = 0.

**OUT**

1. CU: sends OUT on control bus. 2. ACC: “Send to OUTPUT” → value on data bus. 3. I/O: “Print” → value appended to OUTPUT tray.

**BRA xx**

1. IR: “Send operand to PC”. 2. PC: types/confirms xx.

**BRZ xx / BRP xx**

1. CU: looks at ACC and N lamp, presses “Branch taken” or “Not taken”. Validate against the rule in section 2. 2. If taken: as BRA. If not: nothing changes (PC already points to next).

**HLT** – CU presses HALT; the screen shows “Program finished” with the stats summary. **ILLEGAL** – CU presses “Illegal – halt”; machine stops with an explanation.

After every execute sequence, the CU presses “Next instruction” and the cycle returns to FETCH. The instruction counter increments.

## 7. Validation, hints, modes, teacher controls

### Validation and feedback

- Only the active component’s controls work. Clicking a control on an inactive component makes that component shake briefly and shows “Not your turn – it’s the *ALU*’s turn”.
- A wrong value (e.g. ALU types 54 instead of 45) → red shake, error counter +1, the box keeps the input so the class can discuss. After **2 wrong attempts** a “Hint” button appears (e.g. “A = 020, B = 025, operation = +”). After 3, the teacher can press “Show answer”.
- A correct action → short green tick, animation, then the next micro-step activates.
- Errors are counted per role and shown in the final summary (not during play, to avoid shaming).

### Modes

| Mode | Who drives | Use |
| --- | --- | --- |
| Guided (default) | students do every micro-step | the classroom game |
| Demo | the app performs micro-steps automatically, with speed slider and pause | teacher introduction |
| Step-assist | the app performs all micro-steps except the roles the teacher marks as “played” | small groups, or focus on one part (e.g. only ALU and RAM) |

### Teacher menu (☰, top right)

- Load program (from built-in list or the Storage panel), reset machine (keep program), clear all.
- **Undo** last micro-step (unlimited history) and **Redo**.
- Skip to next instruction / run to HALT (uses Demo engine).
- Assign student names to roles; choose role preset (4/6/8).
- Toggle: CU “Go” gating, hints, sounds, animation speed (off/1×/2×/4×), RAM overview, edit memory, fast wheel (ignore click cost).
- Show/hide the “crowd prediction” question.
- Full-screen button.
- The menu is protected by a long-press (1 s) so students cannot open it by accident.

### Keyboard shortcuts (teacher)

`Space` = perform current step (demo), `Ctrl+Z` / `Ctrl+Y` undo/redo, `↑`/`↓` move RAM wheel, `F` full screen, `Esc` close dialogs.

## 8. Programs: editor, assembler, samples

### Editor and assembler (teacher menu → “Programs”)

- Two-pane dialog: left a textarea for LMC assembly, right the assembled listing (address · code · source line).
- Syntax per line: `[LABEL] MNEMONIC [OPERAND] [// comment]`. Mnemonics case-insensitive; operand is a number 0–99 or a label; `DAT` takes an optional value 0–999 (default 0). `;` also starts a comment.
- Two-pass assembler; errors shown inline with line numbers (unknown mnemonic, unknown label, duplicate label, operand out of range, program > 100 cells).
- Buttons: Assemble, Load into RAM (animated via Storage), Save to Storage (stored in `localStorage`, wrapped in try/catch; built-in samples always present), Export `.lmc` file, Import `.lmc` file.

### Built-in sample programs (ordered by difficulty)

**1. Warm-up – add two constants** (no I/O; 5 instructions)

```
      LDA X
      ADD Y
      STA Z
      OUT
      HLT
X     DAT 20
Y     DAT 25
Z     DAT
```

**2. Add two input numbers**

```
      INP
      STA FIRST
      INP
      ADD FIRST
      OUT
      HLT
FIRST DAT
```

**3. Countdown** (introduces loops and BRP)

```
      INP
LOOP  OUT
      SUB ONE
      BRP LOOP
      HLT
ONE   DAT 1
```

**4. Bigger of two numbers** (introduces SUB as comparison)

```
      INP
      STA A
      INP
      STA B
      SUB A
      BRP SHOWB
      LDA A
      OUT
      HLT
SHOWB LDA B
      OUT
      HLT
A     DAT
B     DAT
```

**5. Multiply by repeated addition** (use small inputs, e.g. 3 × 4)

```
      INP
      STA A
      INP
      STA B
LOOP  LDA B
      BRZ DONE
      SUB ONE
      STA B
      LDA RES
      ADD A
      STA RES
      BRA LOOP
DONE  LDA RES
      OUT
      HLT
A     DAT
B     DAT
RES   DAT 0
ONE   DAT 1
```

## 9. Printable student handout (`handout.html`)

A separate static page, styled for print (`@media print`, A4, 15 mm margins, black on white, page breaks between sections). It must use the same wording as the on-screen prompts. Contents, in order:

1. **Cover page** – title, one-paragraph story (“You are the computer”), a labelled sketch of the screen layout, and the fetch–decode–execute loop as a simple diagram.
2. **Instruction set card** – the table from section 2, plus three worked examples (e.g. `305` = “STA 05: store ACC in cell 05”).
3. **Cycle cheat-sheet** – the fetch and decode steps (section 6) as a numbered checklist, then one compact block per instruction showing who acts in which order.
4. **Role cards** – one half-page card per role (8 cards, cut-out lines): role name, “You own”, “You watch for” (the signal that means it’s your turn), “You do” (buttons and what to type), “Common mistakes”, and a mini example from the warm-up program.
5. **Sample programs** – the five programs from section 8, each with the assembled machine-code listing (address · code) and an empty trace table (columns: step, PC, IR, MAR, MDR, ACC, N, output) for students to fill in by hand.
6. **Glossary** – CPU, CU, ALU, PC, IR, MAR, MDR, ACC, address/data/control bus, RAM, volatile, secondary storage, clock, bus width (e.g. 32-bit address bus addresses 2^32 cells; LMC needs only 100).

A “Print handout” link in the teacher menu opens `handout.html`.

## 10. Acceptance criteria

- [ ] `index.html` opens offline from disk in current Chrome, Edge and Firefox with no console errors.
- [ ] At 1920×1080 every component in section 3 is visible at once with no scrolling; RAM shows exactly 5 cells.
- [ ] Demo mode runs all five sample programs to HALT with correct output: (1) 45; (2) sum of inputs; (3) for input 3: 3, 2, 1, 0; (4) the larger input; (5) for 3 and 4: 12.
- [ ] In Guided mode, a full run of the warm-up program is possible using only student controls, following exactly the micro-steps in section 6.
- [ ] Controls on inactive components never change state; wrong values are rejected and counted.
- [ ] RAM read/write is impossible unless the wheel head equals MAR and the control bus carries the matching signal; wheel clicks are counted.
- [ ] Each bus shows its current value and direction; control bus shows the active signal.
- [ ] SUB below zero sets N; BRZ/BRP decisions are validated per section 2.
- [ ] Undo/redo restores the exact previous state, including bus values and RAM wheel position.
- [ ] Assembler accepts all sample programs and reports a line-numbered error for an unknown label.
- [ ] Unit tests (a `tests.html` page or a test block runnable from the console) cover the assembler and the engine for every opcode.
- [ ] `handout.html` prints cleanly to A4 with role cards not split across pages.
