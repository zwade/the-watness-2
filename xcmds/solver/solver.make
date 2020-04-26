#   File:       solver.make
#   Target:     solver
#   Created:    Saturday, March 14, 2020 12:07:22 PM


MAKEFILE        = solver.make
•MondoBuild•    = {MAKEFILE}  # Make blank to avoid rebuilds when makefile is modified

ObjDir          = :
Includes        = 

Sym-68K         = -sym off

POptions        = {Includes} {Sym-68K} -model near

### Source Files ###

SrcFiles        =  ∂
				  solver.p


### Object Files ###

ObjFiles-68K    =  ∂
				  "{ObjDir}solver.p.o"


### Libraries ###

LibFiles-68K    =  ∂
				  "{Libraries}MacRuntime.o" ∂
				  "{Libraries}IntEnv.o" ∂
				  "{Libraries}ToolLibs.o" ∂
				  "{Libraries}Interface.o" ∂
				  "{Libraries}HyperXLib.o" ∂
				  "{PLibraries}SANELib.o" ∂
				  "{PLibraries}PasLib.o"


### Default Rules ###

.p.o  ƒ  .p  {•MondoBuild•}
	{Pascal} {depDir}{default}.p -o {targDir}{default}.p.o {POptions}


### Build Rules ###

solver  ƒƒ  {ObjFiles-68K} {LibFiles-68K} {•MondoBuild•}
	ILink ∂
		-o :::game ∂
		{ObjFiles-68K} ∂
		{LibFiles-68K} ∂
		{Sym-68K} ∂
		-mf -d ∂
		-m ENTRYPOINT ∂
		-model near ∂
		-rt 'XCMD=65534' ∂
		-state rewrite ∂
		-sg watnesssolver
	If "{Sym-68K}" =~ /-sym ≈[nNuU]≈/
		ILinkToSYM {Targ}.NJ -mf -sym 3.2 -c 'sade'
	End



### Required Dependencies ###

"{ObjDir}solver.p.o"  ƒ  solver.p


### Optional Dependencies ###
### Build this target to generate "include file" dependencies. ###

Dependencies  ƒ  $OutOfDate
	MakeDepend ∂
		-append {MAKEFILE} ∂
		-ignore "{CIncludes}" ∂
		-ignore "{PInterfaces}" ∂
		-objdir "{ObjDir}" ∂
		-objext .o ∂
		{Includes} ∂
		{SrcFiles}


