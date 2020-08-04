# The Watness 2 Design

(This is taken almost wholesale from [https://dttw.tech/posts/S1BDZOmt8](https://dttw.tech/posts/S1BDZOmt8))

The majority of the design is documented in [this video](https://www.youtube.com/watch?v=bK0Dk_cv2ZY)

The rest is documented here.

## Inspiration

In addition to [The Witness](http://the-witness.net) itself, my main source of inspiration was [this](https://arstechnica.com/gaming/2020/02/an-extended-interview-with-atrus-himself-myst-creator-rand-miller/) interview from Ars Technica.

## Code

All of my code can be found on [Github](https://github.com/zwade/the-watness-2).

## Tools

Nearly all of the development of The Watness was done inside of OS 9. Here are the tools I used for that

 - [SheepShaver](https://sheepshaver.cebix.net/): SheepShaver is a PowerPC emulator designed specifically for running classic versions of Macintosh OS.
 - `Macintosh OS 9`: Although Myst was likely developed on System 6/7, I went ahead and used OS 9 because it was easier. Nearly everything that I've used here will work on System 7 if you choose, but you may need older versions of them.
 - [Hypercard 2.4](https://macintoshgarden.org/apps/hypercard-241): Hypercard is the tool that The Watness is built in. You will need a copy of Hypercard to both play and edit any files associated with the game.
 - [QuickTime 4](https://macintoshgarden.org/apps/quicktime-4): Hypercard comes with QuickTime 3, but I was unable to get it to display JPEGs without crashing. Upgrading to QuickTime 4 solved this problem.
 - [Macintosh Programmer's Workstation](https://macintoshgarden.org/apps/macintosh-programmers-workshop): MPW is an IDE (ish) for writing native code in OS 9. I used the Gold Master edition, but any "recent" version should work. If you install GM, however, you will also need to separately install [Apple Pascal](https://macintoshgarden.org/apps/mpw-pascal-3).
 - [ResEdit](https://macintoshgarden.org/apps/resedit): ResEdit allows you to view the resource forks of files. This isn't needed to make the challenge, but is helpful in understanding how it all works.
 - [Stuffit Deluxe](https://macintoshgarden.org/apps/stuffit-deluxe): Stuffit is a suite of compression/archival utilities for Macintosh systems that properly handles binary data and resource forks.

In addition to the OS 9 utilities, I also used [typescript](https://www.typescriptlang.org/) for all of my offline scripts.

## References

The vast majority of my time was spent trying to piece together an understsanding of how everything works from the limited documentation I could find. Here is a list of what I used, annotated with what I took away from it.

 - [XCMD Cookboox](http://preserve.mactech.com/articles/mactech/Vol.04/04.06/XCMDCookBook/index.html): This is an interesting introduction to how XCMDs work. It has a lot of useful information, but *do not use any of the code*. I got sucked down a rabbit hole of trying to make this code work, only to find out many hours later that the framework referenced therein had been since superceded by a built-in library called `HyperXCMD`.
 - [All MPW Pascal Interfaces](https://mirrors.apple2.org.za/ftp.apple.asimov.net/documentation/macintosh/Mac%20MPW%20Interfaces%201991%20PASCAL.pdf): I stumbled across this while trying to make the previous code work. It contains the only documentation I could find of the `HyperXCMD` library. There are a few things to note,
     - If you're using the `HyperXCMD` library, you will almost certainly also want the `Types` library. A lot of the code I saw used `MemTypes` instead, but I did not have this installed. `Types` however contained all of the structures that I actually needed.
     - `EvalExpr` is not eval in the modern sense of the term. Instead, it parses the input as though it were a `Hypertalk` statement, but *does not run it*. To execute the resulting `handle`, use `RunHandler`.
     - There are 3 types of strings referenced. `Str`/`Pas`, `Zero`, and (sometimes) `Handle`. A `handle` is a Hypertalk string, and a `Pas` is a pascal style string. `Zero` took me some time to figure out, but it's a C-style string (null or "zero" terminated).
 - [Hypertalk Script Language Guide](http://www.apple-iigs.info/doc/fichiers/HypertalkScriptLanguageGuide2.pdf): An excerpt from an early book on programming for Hypertalk.
 - [The Apple Pascal Docs](https://archive.org/details/Apple_Pascal_Language_Reference_Manual_with_Addendum/page/n9/mode/2up/search/modulus): A somewhat helpful guide to writing Apple Pascal. It was missing a lot of useful information, but it gave me enough so that I could piece the rest together.
 - [The HCSC Color Tools Guide](http://www.hyperactivesw.com/hypercard/hypercard_aolconf.html#coto): A hypercard stack that goes into minimal detail about how to use Color Tools.
