# Computer hardware simulation game

This is a simple, single web page game, that aims to help students understands the fundamentals of the computer hardware: CPU, Memory, Buses, Motherboard and Storages. The accent is on the processor, and its goal is _not_ to just present how data is processed, but have them **be** some of the parts and take their part into execution of a simple programs.

**IMPORTANT**: Instruction set is based on the concept of _Little Man Computer_ (LMC) as described here: https://en.wikipedia.org/wiki/Little_Man_Computer

## User Interface

The user interface should be _single web page_ with all the parts / components visible at once (with few exceptions), so that a group of students can stand in front of a big screen, each one be assigned a role, and they perform the actual steps (i.e. execution of  simple program in LMC).

### Visualization

All parts listed in the _Terms & Parts_ below should be present on the screen all the time. Few guidelines:

- **The memory (RAM)** to be presented as a short stripe (line) that needs to be swiped in order to reach the required address - it need not occupy a whole height or width of a screen - just 5 of addresses visible is enough - like a tuning wheel. The idea is to make the students understand that memory access is not cheap for the processors.
- Each of the **buses** should visualize (emphasizing) what is the number/address currently being set.
- When a certain **part is expected to act**, it should be highlighted properly and the user (student) have a clear box (or buttons) that she needs to operate. For ALU-operating student - entering directly the expected number in an edit box is OK.

### Operation

The key of operation is to understand the following the **fetch-decode-execute** cycle, which consists of three main steps.

1. **Fetch**: The CPU fetches an instruction from memory.
2. **Decode**: The CPU decodes the instruction, which means it interprets the instruction into a set of low-level operations that the CPU can execute.

3. **Execute**: The CPU executes the instruction, which means it carries out the low-level operations that were specified in the decoded instruction.

The fetch-decode—-execute cycle is repeated for each instruction in a program. The speed of the CPU is largely determined by how quickly and efficiently it can execute this cycle. Executing a single machine language instruction involves a sequence of operations which are performed by the CPU. These operations can be broadly categorized into three main phases: fetch, decode and execute.

**Interrelation between computer parts** - Arithmetic, memory, etc.

The instructions for operating each of the parts and the actual instruction set should be wrapped in a separate file which I'll print and handle to the students

## Terms & Parts

These are all the parts / components that need to be present and properly connected, grouped graphically as they are in these paragraphs:

### CPU

#### Control unit (CU)

The control unit directs the operations of the processor. It is responsible for the _fetch—decode—execute_ cycle, managing all three operations and directing the computer’s memory, ALU and input/output devices to respond appropriately.

#### Arithmetic logic Init (ALU)

This unit is responsible for performing arithmetic and logic operations. These include basic arithmetic operations such as addition, subtraction, multiplication and division, as well as logic operations including AND, OR, XOR and NOT.

#### Instruction register

When an instruction is fetched from memory, it is held in the IR within the CPU. This register holds the instruction that is currently being executed by the CPU.

#### Program counter

The PC holds the address of the next instruction that is to be fetched from memory. Once the instruction has been fetched, the PC updates to point to the next instruction that will be needed.

#### Memory address register

The MAR holds the memory address that is currently being fetched. The content from the PC is copied to the MAR, and the MAR provides this address to the memory unit, so that data and instructions can be read from or copied to that location.

#### Memory data register

This holds the data that has been fetched or is about to be written to the memory address currently in the MAR.

#### Accumulator (AC)

This stores the intermediate arithmetic or logical results produced by the ALU.

### Buses

#### Control bus

The control bus is used to transmit command and control signals from the CPU to other components of the system, and vice versa. Due to the need for signals to be sent and received, this bus is bidirectional. Some of the signals that would be transmitted via the control bus are read / write operations, interrupt requests, clock signals for synchronization and status signals from hardware components.

#### Data bus

The data bus carries the data being processed between the CPU, memory and other peripherals. The width of the data bus is important for determining the amount of data it can transfer at one time. Common data bus widths are 8, 16, 32 and 64 bits. As data needs to be read from and written to memory, data buses are usually bidirectional.

#### Address bus

The address bus is used to transmit the address that is to be read from or written to in memory. The width of this bus determines the memory capacity of the system. For example, a 32-bit address bus can address 2^32 memory locations.

### Primary storage

#### RAM

RAM (random access memory) holds instructions and data for programs that are currently running. For example, when you open an app on your phone or computer, it loads into RAM so that is can be accessed quickly by the CPU. RAM is volatile, meaning that it loses its contents when the power to the computer is turned off. This is why, when playing a game, you lose your progress unless you save the game (which is then stored in secondary memory).



## IMPROVEMENTS

Let's make some simplifications and clarifications:

### Control unit

We can get rid of some buttons:

- Do we need both "Next phase" / "Fetch" and similar, _and_ "Go"?
- "ALU -", "ALU +", can't just be "ALU" because the actual operation is dictated from the instruction?
- "Illegal Halt" and "Halt" are the same, aren't they?

### Accumulator

I don't quite understand the difference between "Latch from MDR" and "Latch from Data bus"? You're allowed one way of accessing "data bus" - through "MDR", aren't you?

What is "N" in the accumulator?

### Decoder

Can't we put it together with IR, which it belongs too, anyways?



In overall:

- You can reorder stuff aiming to group together panels relevant to each other and operated from the same student.
- Feel free to change a bit the sized - the memory block could be a bit smaller than, still a good idea to be bigger.

