# The Watness 2

This problem was originally a 450 point reversing problem for PlaidCTF 2020. It was solved by 24 teams, with the first solve taking roughly 10 hours (if memory serves).

## Public Description

The following is an excerpt from the [PlaidCTF story](https://docs.google.com/document/d/15NtrJPTbBXqXce_T1z-7nHMPR2eE109fycaviSTnq30/preview). Since this contains minor clues for the problem, I've reproduced it here.

-----------------------------------

You think you’ve found everything in the back of the library, so you head back to the front, and find yourself in a section far more traditional than the one in which you started. You’re not really sure where to begin, so you just pull a random book off the shelf to see if there’s any useful information inside.

Flipping to the first page, you’re not greeted with words, but what you can only describe as a window to another location entirely. It looks like some kind of garden? You’re not completely certain, but for some reason you feel compelled to place your palm to the image.

At one moment, you’re in the library, holding a book. The next, you’re in a dark tunnel, with no books in sight. Confused, you wander towards the light, only to find the garden you were looking at only seconds ago.

A few steps away, you see an older man dressed in plain robes running his finger against a panel. He seems troubled by something. Curious, you approach him.

“Hi there”, you say.

“Hello my friend”, he responds. He doesn’t look at you; he’s completely engrossed in what he’s doing.

The card in front of him has a grid on it, and he seems to be drawing paths along the edges to connect certain points. It looks like he’s almost done, but then he shakes his head and backtracks almost all the way to the start. There must be some rules you’re not getting here. But, you feel certain that if you can figure those rules out, a flag will be yours.

-----------------------------------

(The download would be linked to here. No files other than [bin/watness_2.sit](file://./bin/watness_2.sit) are provided)

## Secret Challenge Specification

The design information can be found in `./specification/`

## Solution

The solution information (and solver) can be found in `./solver/`

## This Repo

Additionally, this repo contains most of the source code for The Watness 2.

 - `bin/watness_2.sit`: A stuffit archive of the binary released during PCTF 2020
 - `hypertalk/stack.ht`: The main hypertalk code that lived directly on the Watness stack. It generated nearly all of the other code used in the game
 - `image-preparation/`: A script that would take images from the witness and convert them into `.pict` files, suitable for import into hypercard
 - `puzzle-generator/`: This script generated the puzzles that were used in the final release
 - `xcmds`
   - `solver`: This is the source code for the xcmd that verified whether an input path was correct
   - `decoder` This xcmd took a path and an encrypted flag component, and used the path to decrypt the flag