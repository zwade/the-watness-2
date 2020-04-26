## The Watness 2

This repo contains most of the source code for The Watness 2.

 - `bin/watness_2.sit`: A stuffit archive of the binary released during PCTF 2020
 - `hypertalk/stack.ht`: The main hypertalk code that lived directly on the Watness stack. It generated nearly all of the other code used in the game
 - `image-preparation/`: A script that would take images from the witness and convert them into `.pict` files, suitable for import into hypercard
 - `puzzle-generator/`: This script generated the puzzles that were used in the final release
 - `xcmds`
   - `solver`: This is the source code for the xcmd that verified whether an input path was correct
   - `decoder` This xcmd took a path and an encrypted flag component, and used the path to decrypt the flag