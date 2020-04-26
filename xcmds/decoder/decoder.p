(* Decodes paths from the solver *)


{$S SegmentDecoder }

UNIT Zwad3; 

INTERFACE

USES Types,HyperXCmd;

TYPE
	BitPath = Packed Array[1..50] of Boolean;
	PathStr = String[25];
	KeyStr = String[10];
	AlphaStr = String[32];


PROCEDURE EntryPoint( paramPtr: XCmdPtr);

IMPLEMENTATION

{$R-} 

PROCEDURE Decoder(paramPtr: XCmdPtr); FORWARD;


PROCEDURE EntryPoint(paramPtr: XCmdPtr);
BEGIN
	Decoder(paramPtr);
END;

PROCEDURE CharToBits(alphabet: AlphaStr; character: Char; location: Integer; var bits: BitPath);
VAR
	i: Integer;
	ord: Integer;
	test: Boolean;
BEGIN
	i := 5 mod 2;
	for i := 1 to 32 do
		if alphabet[i] = character then
			ord := i - 1;

	bits[location+4] := ((ord div 1)  mod 2) = 1;
	bits[location+3] := ((ord div 2)  mod 2) = 1;
	bits[location+2] := ((ord div 4)  mod 2) = 1;
	bits[location+1] := ((ord div 8)  mod 2) = 1;
	bits[location+0] := ((ord div 16) mod 2) = 1;
END;

FUNCTION BitToChar(alphabet: AlphaStr; location: Integer; bits: BitPath): Char;
VAR
	res: Integer;
	i: Integer;
	i_val: Integer;
BEGIN
	res := 0;
	for i := 0 to 4 do begin
		res := res * 2;
		i_val := 0;
		if bits[location + i] then i_val := 1;
		res := res + I_val;
	end;
	BitToChar := alphabet[res + 1];
END;

PROCEDURE UnpackPath(path: PathStr; var bits: BitPath);
VAR
	i: Integer;
	c: Char;
	
	b_i: Integer;
BEGIN
	for b_i := 1 to 50 do
		bits[b_i] := false;

	b_i := 1;
	
	for i := 1 to Length(path) do begin;
		c := path[i];
		if c = 'U' then begin
			bits[b_i] := false;
			bits[b_i+1] := false;
		end else if c = 'R' then begin
			bits[b_i] := false;
			bits[b_i+1] := true;
		end else if c = 'D' then begin
			bits[b_i] := true;
			bits[b_i+1] := false;
		end else if c = 'L' then begin
			bits[b_i] := true;
			bits[b_i+1] := true;
		end;
		b_i := b_i + 2;
	end;
END;

PROCEDURE UnpackKey(alphabet: AlphaStr; key: KeyStr; var bits: BitPath);
VAR
	i: Integer;
BEGIN
	for i := 1 to 10 do begin
		CharToBits(alphabet, key[i], 1 + (i-1) * 5, bits);
	end;
END;

PROCEDURE XorBits(bit1: BitPath; bit2: BitPath; var res: BitPath);
VAR i: integer;
BEGIN
	for i := 1 to 50 do
		res[i] := not (bit1[i] = bit2[i]);
END;

PROCEDURE BitsToStr(alphabet: AlphaStr; bits: BitPath; var str: KeyStr);
VAR
	i: Integer;
BEGIN	
	for i := 1 to 10 do
		str[i] := BitToChar(alphabet, 1 + (i-1) * 5, bits);
END;
{ PROCEDURE Unpack }

PROCEDURE Decoder(paramPtr: XCmdPtr);
VAR
	arg1: Str255;
	arg2: Str255;
	
	path: PathStr;
	key: KeyStr;
	
	pathBits: BitPath;
	keyBits: BitPath;
	resBits: BitPath;
	
	result: KeyStr;
	h: Handle;
	alphabet: AlphaStr;
BEGIN
	alphabet := 'abcdefghijklmnopqrstuvwxyz{}_137';
	
	ZeroToPas(paramPtr, paramPtr^.params[1]^, arg1);
	ZeroToPas(paramPtr, paramPtr^.params[2]^, arg2);

	path := arg1;
	key := arg2;
	
	result := 'xxxxxxxxxx';
	
	UnpackPath(path, pathBits);
	UnpackKey(alphabet, key, keyBits);
	
	XorBits(pathBits, keyBits, resBits);
	
	BitsToStr(alphabet, resBits, result);
	
 	h := EvalExpr(paramPtr, Concat('"', result, '"'));
 	paramPtr^.returnValue := h;
END; 

END.