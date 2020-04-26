
{$S Solver }

UNIT Zwad3; 

INTERFACE

USES Types,HyperXCmd;


PROCEDURE EntryPoint( paramPtr: XCmdPtr);

IMPLEMENTATION

{$R-}    

TYPE
	Board = Array[0..6, 0..6] of Integer;
	HorizontalPath = Array[0..6, 0..7] of Integer;
	VerticalPath = Array[0..7, 0..6] of Integer;
	NodeGrid = Array[0..7, 0..7] of Boolean;
	Str49 = String[49];

PROCEDURE Solver(paramPtr: XCmdPtr); FORWARD;

{--------------EntryPoint----------------}
PROCEDURE EntryPoint(paramPtr: XCmdPtr);
 BEGIN
 Solver(paramPtr);
 END;

PROCEDURE BuildAutomaton(desc: Str255; var automaton: Board);
VAR
	i: Integer;
	y: Integer;
	x: Integer;
BEGIN
	i := 1;
	for y := 0 to 6 do
		for x := 0 to 6 do
			begin
				if desc[i] = ' ' then
					automaton[y,x] := 0
				else
				if desc[i] = 'r' then
					automaton[y,x] := 1
				else
				if desc[i] = 'g' then
					automaton[y,x] := 2
				else
				if desc[i] = 'b' then
					automaton[y,x] := 3;
				
				i := i+1;
			end
END;

FUNCTION GetNeighbors(current: Board; x: Integer; y: Integer; color: Integer): Integer;
VAR
	count: Integer;
	dx: Integer;
	dy: Integer;
BEGIN
	count := 0;
	for dx := -1 to 1 do
		for dy := -1 to 1 do
			begin
				if ((dx <> 0) or (dy <> 0))
					and (x + dx >= 0)
					and (x + dx < 7)
					and (y + dy >= 0)
					and (y + dy < 7)
					and (current[y+dy,x+dx] = color) then
					count := count + 1;
			end;
	GetNeighbors := count
END;

FUNCTION ChooseEmpty(nr: Integer; ng: Integer; nb: Integer): Integer;
BEGIN
	if (ng = 0) and (nb = 0) then
		ChooseEmpty := 0
	else if (nb >= ng) then
		ChooseEmpty := 3
	else
		ChooseEmpty := 2;
END;

FUNCTION ChooseRed(nr: Integer; ng: Integer; nb: Integer): Integer;
BEGIN
	if (nr <> 2) and (nr <> 3) then
		ChooseRed := 0
	else if (nb = 0) or (ng = 0) then
		ChooseRed := 0
	else
		ChooseRed := 1;
END;

FUNCTION ChooseGreen(nr: Integer; ng: Integer; nb: Integer): Integer;
BEGIN
	if nr > 4 then
		ChooseGreen := 0
	else if nb > 4 then
		ChooseGreen := 3
	else if (nr = 2) or (nr = 3) then
		ChooseGreen := 1
	else
		ChooseGreen := 2;
END;

FUNCTION ChooseBlue(nr: Integer; ng: Integer; nb: Integer): Integer;
BEGIN
	if nr > 4 then
		ChooseBlue := 0
	else if ng > 4 then
		ChooseBlue := 2
	else if (nr = 2) or (nr = 3) then
		ChooseBlue := 1
	else
		ChooseBlue := 3;
END;

PROCEDURE StepAutomaton(current: Board; var next: Board);
VAR
	y: integer;
	x: integer;
	nred: integer;
	ngreen: integer;
	nblue: integer;
BEGIN
	for y := 0 to 6 do
		for x := 0 to 6 do
			begin
				nred := GetNeighbors(current, x, y, 1);
				ngreen := GetNeighbors(current, x, y, 2);
				nblue := GetNeighbors(current, x, y, 3);
				
				if current[y,x] = 0 then
					next[y,x] := ChooseEmpty(nred, ngreen, nblue)
				else if current[y,x] = 1 then
					next[y,x] := ChooseRed(nred, ngreen, nblue)
				else if current[y,x] = 2 then
					next[y,x] := ChooseGreen(nred, ngreen, nblue)
				else if current[y,x] = 3 then
					next[y,x] := ChooseBlue(nred, ngreen, nblue);
			end;
END;
	
PROCEDURE DescribeBoard(current: Board; var output: Str49);
VAR
	y: Integer;
	x: Integer;
	i: Integer;
BEGIN
	i := 1;
	for y := 0 to 6 do
		for x := 0 to 6 do
			begin
				if current[y,x] = 0 then
					output[i] := ' '
				else if current[y,x] = 1 then
					output[i] := 'r'
				else if current[y,x] = 2 then
					output[i] := 'g'
				else if current[y,x] = 3 then
					output[i] := 'b';
				i := i + 1
			end;
END;

FUNCTION IsRed(x: Integer; y: Integer; board: Board): Boolean;
BEGIN
	if (x < 0)
		or (y < 0)
		or (x > 6)
		or (y > 6)
	then
		IsRed := false
	else
		IsRed := board[y,x] = 1;
END;

PROCEDURE InitializeNodes(var nodes: NodeGrid);
VAR
	x: Integer;
	y: Integer;
BEGIN
	for x := 0 to 7 do
		for y := 0 to 7 do
			nodes[y, x] := false;
			
	nodes[0, 0] := true;
END;

FUNCTION PerformMove(move: Char; var x: Integer; var y: Integer; var current: Board; var nodes: NodeGrid): Integer;
VAR
	i: Integer;
	valid: Integer;
	is_red: Boolean;
	
	n_x: Integer;
	n_y: Integer;
	
	min_x: Integer;
	min_y: Integer;
	
	i_x: Integer;
	i_y: Integer;
	
	next: Board;
BEGIN
	valid := 0;
	n_x := x;
	n_y := y;
	
	if move = 'L' then
		n_x := x - 1
	else if move = 'R' then
		n_x := x + 1
	else if move = 'U' then
		n_y := y - 1
	else if move = 'D' then
		n_y := y + 1
	else
		valid := 1;
	
	 
	if n_x < x then 
		min_x := n_x 
	else 
		min_x := x;
		
	if n_y < y then
		min_y := n_y
	else
		min_y := y;
		
	if valid = 0 then
		if (n_x < 0)
			or (n_y < 0)
			or (n_x > 7)
			or (n_y > 7)
			or nodes[n_y,n_x]
		then
			valid := 2
		else
			nodes[n_y,n_x] := true;
	
	if valid = 0 then begin
		{ we moved in the x direction }
		if y = n_y then
			is_red := IsRed(min_x, y - 1, current) or IsRed(min_x, y, current) 
		{ we moved in the y direction }
		else if x = n_x then
			is_red := IsRed(x - 1, min_y, current) or IsRed(x, min_y, current)
		else
			is_red := false;
			
		if is_red = false then
			valid := 3;
	end;
			
	if valid = 0 then begin
		StepAutomaton(current, next);
		current := next;
		
		x := n_x;
		y := n_y;
	end;
	
	PerformMove := valid
END;

PROCEDURE Solver(paramPtr: XCmdPtr);
VAR
 i : Integer;
 str_len: Integer;
 
 h : Handle;
 puzzle: Str255;
 solution: Str255;
 
 automaton: Board;
 next_automaton: Board;
 nodes: NodeGrid;
 
 x: Integer;
 y: Integer;
 success: Boolean;
 error: Integer;
 broken: boolean;
 
 x_str: Str255;
 y_str: Str255;
 e_str: Str255;
 x_lng: LongInt;
 y_lng: LongInt;
 e_lng: LongInt;
 
 result: Str255;
 r2: Str49;
 
 BEGIN
 	ZeroToPas(paramPtr, paramPtr^.params[1]^, puzzle);
	ZeroToPas(paramPtr, paramPtr^.params[2]^, solution);
	
	BuildAutomaton(puzzle, automaton);
	x := 0;
	y := 0;
	
	InitializeNodes(nodes);

	str_len := Length(solution);
	
	broken := false;
	result := '';

	for i := 1 to str_len do
		if broken = false then begin
			error := PerformMove(solution[i], x, y, automaton, nodes);
			if (error <> 0) then begin
				success := false;
				broken := true;
			end;
			if (x = 7) and (y = 7) then begin
				success := true;
				broken := true;
			end;
		end;
	
	if success then
		result := 'true'
	else 
		result := 'false';
	
 	h := EvalExpr(paramPtr, Concat('"', result, '"'));
 	paramPtr^.returnValue := h;
 END; 

END.