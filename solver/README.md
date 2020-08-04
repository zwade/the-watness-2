# Solving The Wantess 2

## Step 1: Running the Code

To begin solving the Watness 2, it is most helpful to be able to run this code. The program is distributed as a StuffIT archive. Upon decompression of the archive, a single file is provided. This file is a Hypercard stack.

In order to run this stack, players must boot up a OS 7-9 VM (probably in sheep shaver) and install Hypercard ~2.4, along with Quicktime >=3. They will also need a StuffIT decompressor.

Once these are installed, they should be able to run it normally, and will be taken immediately into the game. The game itself features the first area of The Witness, including 3 of the initial puzzles, albeit with different constraints (and solutions). Players are tasked with solving all three puzzles to get the flag.

## Step 2: Finding the Real Code

Since Hypercard uses Hypertalk as its primary programming language, and is found in plaintext in the file, players might initially think they have all of the code used by the application. However, upon further examination they will find that they are missing several functions invoked by Hypertalk, including the one that checks the flag. This is because the verification code is attached to the file as an XCMD (similar to a shared object).

However, because of Classic Mac semantics, this file is not embedded *in* the card, but rather is attached to it through a secondary file stream. To pull it out of the stream, you will need a tool like ResEdit, which can let you examine and extract it. After extracting it and pulling it out of the VM, you can begin reversing it

## Step 3: Reversing the Code

The code was originally written in Apple Pascal, and compiled down to Motorola 68k. Reversing is fairly straightforward in IDA or Ghidra, although one has to first handle the slightly strange way that Classic Mac binaries handle method declarations (in my testing, IDA would get confused at the headers, but could be used as-is nonetheless).

I intentionally did not obfuscate function names, so reversing is made easier by the fact that the functions indicate that it is simulating some sort of automaton. Specifically, it's simulating a Conway-esque automaton with 4 states: empty, red, green, and blue. They follow these rules:

 - Empty: Takes the most frequent non-red neighbors color.
 - Red: empty if <2 red neighbors, >3 red neighbors, or no green and blue neighbors
 - Green/Blue: Empty if >4 red neighbors, red if 2 or 3 red neighbors, the the opposing color if more than 4 of that color, or the same as currently.

Furthermore, a move is valid if at the time of the move, the line is adjacent to a red node of the automaton. The automaton steps once after every move.

## Step 4: Solving the Puzzles

Once you understand the rules of the automaton, it's easy to simulate steps forward. From there, you can simply write a BFS to solve the maze by adhering to the aforementioned rules. An example solver for each of the three mazes is found in `index.ts`. If you perform the paths in the game itself, you get the flag `pctf{l1ke_a_lost_ag3_kz7bqxp}` (Note, I no longer have the tools available to easily change the flag. Sorry!)