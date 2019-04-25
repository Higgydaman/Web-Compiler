'use strict'

class Scanner {

        constructor() {
                this.lexeme = null;
                this.program_state = null;
        }

        markError(message) {
                messanger.message = message;
                messanger.line = this.current.line;
                messanger.putError();
                if(this.recover()) return true;
                return false;
        }

        // Scans the input text and creates an extremely low-level lexeme list.
        scanCode(code) {
                // Declare the pre-init stuff
                this.code = code;
                this.eof = this.code.length - 1;
                this.index = -1;
                this.line_number = 0;
                this.tokens = [];
                this.current = null;
                this.letters = /^[A-Za-z]+$/;
                this.numbers = /^[0-9]/;
                this.parenthesis = /["]/;

                var EOF = false;
                var EOF = this.incrimentIndex("SCANNER"); 
                while(!EOF) {               
                        EOF = this.getLexeme();
                        EOF = this.incrimentIndex("SCANNER");
                        if(this.lexeme != null) {
                                this.tokens.push(this.lexeme);
                        }
                }

                // Pass FALSE for no error
                return false;
        }

        // Standard function to incriment the index
        incrimentIndex(caller) {
                
                switch(caller) {

                        case "SCANNER":
                        if((this.index) == (this.eof)) return true;
                        this.index++;
                        this.current = this.code[this.index].toUpperCase();
                        if((this.index + 1) >= (this.eof)) {
                                this.next = null;
                                return false;
                        }
                        this.next = this.code[this.index + 1].toUpperCase();
                        return false;

                        case "BUILDER":
                        if(this.index == 0) return true; 
                        this.index--;
                        this.current = this.tokens[this.index];
                        if(this.index != 0) this.next = this.tokens[this.index - 1];
                        else this.next = {"type" : "EOF", "value" : "EOF"};
                        return false;

                        default:
                        // TODO
                        return true;
                }
        }

        // Reads until a string is built
        getString() {
                this.key = null;
                var result =  this.current;

                if(this.next == null) {
                        this.key = result;
                        return;   
                }

                while(this.next.match(/^[a-zA-Z0-9_]+$/)) {
                        result = result + this.next;
                        if(this.incrimentIndex("SCANNER") || this.next == null) {
                                this.key = result;
                                return;
                        }   
                }
                this.key = result;
                return;
        }

        // Reads until a number is built
        getNumber() {
                this.number = null;
                this.isfloat = false;
                var result =  this.current;
                while(this.next.match(/^[0-9.]+$/)) {
                        if(this.next == '.') {
                                this.isfloat = true;
                                result = result + this.next;
                                if(this.incrimentIndex("SCANNER")) {
                                        this.number = result;
                                        return;
                                }
                                while(this.next.match(/^[0-9]+$/)) {
                                        result = result + this.next;
                                        if(this.incrimentIndex("SCANNER")) {
                                                this.number = result;
                                                return;
                                        } 
                                }
                                break;
                        }
                        result = result + this.next;
                        if(this.incrimentIndex("SCANNER")) {
                                this.number = result;
                                return;
                        }      
                }
                if(this.isfloat) {
                        this.number = parseFloat(result);
                }
                else {
                        this.number = parseInt(result);
                }
                return;
        }

        // Skips normal and bulk comments
        skipComment() {
                switch(this.current) {
                        case '/':
                        while(this.current != '\n') {
                                if(this.incrimentIndex("SCANNER")) return true;
                        }
                        this.line_number++;
                        break;

                        case '*':
                        if(this.incrimentIndex("SCANNER")) return true;
                        var completed = false;
                        var comment_count = 1;
                        while( completed == false ) {	                                        // While pacman hasn't eaten the entire comment
				switch( this.current ) {	                                // Switch on the input character
				case '*' :					                // Maybe all the ghosts are gone?
                                        if( this.next == '/' ) {	                        // Sweet, ghost insight
						comment_count--;				// Eat that ghost
						if( comment_count == 0 ) {		        // Any ghosts left?
							completed = true;			// Fuck no!
                                                }
                                                if(this.incrimentIndex("SCANNER")) return true;
                                                if(this.incrimentIndex("SCANNER")) return true;          // Incriment the index by one
                                                break;
					}
                                        if(this.incrimentIndex("SCANNER")) return true;					
				break;
                                case '/' :						        // Maybe another ghost
                                        if(this.next == '*') {			                // look ahead
                                                comment_count++;
                                                if(this.incrimentIndex("SCANNER")) return true;
                                                if(this.incrimentIndex("SCANNER")) return true;          // Incriment the index by one
                                                break;
                                        }					
                                        if(this.incrimentIndex("SCANNER")) return true;
                                break;
                                case "\n":
                                        this.line_number++;
                                        if(this.incrimentIndex("SCANNER")) return true;
                                break;
                                default:
                                if(this.incrimentIndex("SCANNER")) return true;
                                }
                        }
                        break;
                        default:
                }
        }

        // Reads until a LEXEME is found
        getLexeme() {
                this.lexeme = null;
                switch(this.current) {
                        
                        // Edge cases
                        case '\n':                              // Next line case
                        this.line_number++;
                        if(this.incrimentIndex("SCANNER")) return true;
                        return this.getLexeme();   

                        // BRKT
                        case '(':                               // BRKT case
                        case ')':                               // BRKT case
                        case '[':                               // BRKT case
                        case ']':                               // BRKT case
                        case '{':                               // BRKT case
                        case '}':                               // BRKT case
                        this.type = "BRKT";
                        this.value = this.current;        
                        break;
                        
                        // AROP
                        case '/':                               // Possible comment
                        if((this.next == '/') || (this.next == '*')) {
                                if(this.incrimentIndex("SCANNER")) return true;
                                if(this.skipComment()) return true;
                                if(this.incrimentIndex("SCANNER")) return true;
                                return this.getLexeme();
                        }
                        case '-':                               // AROP case
                        case '+':                               // AROP case
                        case '*':                               // AROP case
                        this.type = "AROP";
                        this.value = this.current;
                        break;

                        // ENDP 
                        case '.':
                        this.type = "ENDP";
                        this.value = this.current;
                        break;

                        // ENDL 
                        case ';':
                        this.type = "ENDL";
                        this.value = this.current;
                        break;

                        // EXOP
                        case '&':
                        case '|':
                        this.type = "EXOP";
                        this.value = this.current;
                        break;

                        // NEXT
                        case ',':
                        case ':':
                        this.type = "NEXT";
                        this.value = this.current;
                        break;

                        // RLOP < | <= | > | >= | =< | => | != | =! | ! | == | =
                        case '<':
                        if(this.next == '=') {
                                this.type = "RLOP";
                                this.value = "<=";
                                if(this.incrimentIndex("SCANNER")) {
                                        this.lexeme = {"type" : this.type, "value" : this.value, "line" : this.line_number};
                                        return true;
                                } else break;  
                        }
                        this.type = "RLOP";
                        this.value = "<";
                        break;

                        case '>':
                        if(this.next == '=') {
                                this.type = "RLOP";
                                this.value = ">=";
                                if(this.incrimentIndex("SCANNER")) {
                                        this.lexeme = {"type" : this.type, "value" : this.value, "line" : this.line_number};
                                        return true;
                                } else break;   
                        }
                        this.type = "RLOP";
                        this.value = ">";
                        break;

                        case '!':
                        if(this.next == '=') {
                                this.type = "RLOP";
                                this.value = "!=";
                                if(this.incrimentIndex("SCANNER")) {
                                        this.lexeme = {"type" : this.type, "value" : this.value, "line" : this.line_number};
                                        return true;
                                } else break;   
                        }
                        this.type = "EXOP";
                        this.value = "!";
                        break;

                        case '=':
                        switch(this.next) {
                                case '=':
                                this.type = "RLOP";
                                this.value = "==";
                                if(this.incrimentIndex("SCANNER")) {
                                        this.lexeme = {"type" : this.type, "value" : this.value, "line" : this.line_number};
                                        return true;
                                } else break;
                                case '>':
                                this.type = "RLOP";
                                this.value = ">=";
                                if(this.incrimentIndex("SCANNER")) {
                                        this.lexeme = {"type" : this.type, "value" : this.value, "line" : this.line_number};
                                        return true;
                                } else break;
                                case '<':
                                this.type = "RLOP";
                                this.value = "<=";
                                if(this.incrimentIndex("SCANNER")) {
                                        this.lexeme = {"type" : type, "value" : value, "line" : this.line_number};
                                        return true;
                                } else break;
                                case '!':
                                this.type = "RLOP";
                                this.value = "!=";
                                if(this.incrimentIndex("SCANNER")) {
                                        this.lexeme = {"type" : type, "value" : value, "line" : this.line_number};
                                        return true;
                                } else break;
                                default:
                                this.type = "RLOP";
                                this.value = this.current;
                                break;
                        }
                        break;
 
                        default:
                        if(this.current.match(this.letters)) {
                                this.getString();
                                switch(this.key) {
                                        // BOOL
                                        case "TRUE":
                                        this.type = "INTEGER";
                                        this.value = 1;
                                        break;

                                        case "FALSE":
                                        this.type = "INTEGER";
                                        this.value = 0;
                                        break;
                                        
                                        // END
                                        case "NOT":
                                        this.type = "NOT";
                                        this.value = "!";
                                        break;

                                        // END
                                        case "END":
                                        this.type = "END";
                                        this.value = this.key;
                                        break;
                                        
                                        // BEGIN
                                        case "BEGIN":
                                        case "THEN":
                                        this.type = "STRT";
                                        this.value = this.key;
                                        break;

                                        // PROGRAM
                                        case "PROGRAM":
                                        this.type = "PRGM";
                                        this.value = this.key;
                                        break;

                                        // IS
                                        case "IS":
                                        this.type = "IS";
                                        this.value = this.key;
                                        break;

                                        // COND
                                        case "IF":
                                        case "ELSE":
                                        this.type = "COND";
                                        this.value = this.key;
                                        break;

                                        // GOTO
                                        case "RETURN":
                                        this.type = "GOTO";
                                        this.value = this.key;
                                        break;

                                        // LOOP
                                        case "FOR":
                                        this.type = "LOOP";
                                        this.value = this.key;
                                        break;

                                        // DECN
                                        case "GLOBAL":
                                        case "TYPE":
                                        case "VARIABLE":
                                        case "PROCEDURE":
                                        this.type = "DECN";
                                        this.value = this.key;
                                        break;

                                        // MARK
                                        case "INTEGER":
                                        case "FLOAT":
                                        case "STRING":
                                        case "BOOL":
                                        case "ENUM":
                                        this.type = "MARK";
                                        this.value = this.key;
                                        break;

                                        default:
                                        this.type = "IDEN";
                                        this.value = this.key;
                                }
                        } 
                        else if(this.current.match(this.numbers)) {
                                this.getNumber();
                                if(this.isfloat) this.type = "FLOAT";
                                else this.type = "INTEGER";
                                this.value = this.number;
                        }
                        else if(this.current.match(this.parenthesis)) {
                                // PRTH
                                this.getStringToken()        
                                this.type = "STRG";
                                this.value = this.string;        
                        }
                        else if(this.current == " " || this.current == "\t" || this.current == "\b" || this.current == "\f" || this.current == "\n" || this.current == "\r" 
                                || this.current == "\v" || this.current == "\0" || this.current == "\b"){
                                if(this.incrimentIndex("SCANNER")) return true;
                                return this.getLexeme(); 
                        }
                        else {
                                messanger.flag = true;
                                messanger.message = "Invalid character " + this.current;
                                messanger.line = this.line_number;
                                messanger.putError();
                                if(this.incrimentIndex("SCANNER")) return true;
                                return this.getLexeme();
                        }
                }

                // Update the token
                this.lexeme = {"type" : this.type, "value" : this.value, "line" : this.line_number}; 
                return false; 
        }

        // Grabs a string token
        getStringToken() {
                this.string = null;
                var result = "";
                if((this.incrimentIndex("SCANNER")) | (this.current == null)) {
                        this.string = result;
                        return;
                }
                while(!this.current.match(this.parenthesis)) {
                        result = result + this.current;
                        if((this.incrimentIndex("SCANNER")) | (this.current == null)) {
                                this.string = result;
                                return;
                        }  
                }
                this.string = result;
                return;
        }
}
var scanner = new Scanner();

var Operation = {
        Types : {
                "start"         : 1,
                "procedure"     : 2,
                "assignment"    : 3,
                "loop"          : 4,
                "NA"            : 5,
                "IF"            : 6,
                "end_program"   : 7,
                "end_if"        : 8,
                "ELSE"          : 9,
                "end_for"       : 10,
                "end_procedure" : 11,
                "return"        : 12
        }
};

var States = { // Used to drive the parse path
        "start"         : 1,
        "declaration"   : 2,
        "statement"     : 3,
        "end"           : 4,
        Procedure : {
                "declaration"   : 5,
                "statement"     : 6
        }
};

class Parser {
        constructor(tokens) {
                //#region -> Input verification
                this.intialized = true;                                 // True until it is not
                if(typeof tokens != 'undefined') this.tokens = tokens;  // IF tokens is NOT undefined, grab them
                else this.intialized = false;                           // ELSE throw initialized false
                //#endregion

                //#region -> Local scope declarations
                if(!this.intialized) return;            // IF we are npot initialized, just return
                this.tokens_length = tokens.length;     // Get the length of the array
                this.tokens = tokens;                   // Save off the tokens
                this.program = {                        // This is the main output for the entirety of parseTokens()
                        "name"          : null,
                        "operations"    : [] 
                }
                this.next = this.tokens.shift();
                this.errors = [];
                this.state = States.start;
                this.symbol_table = new Object();
                this.enum_count = 0;
                this.procedure_table = new Object();
                //#endregion                
        
                this.updateBuiltin();
        }

        //#region -> Public calls that will be made
        parseTokens() {
                //#region -> Make sure we are initialized, then set some globals
                if(!this.intialized) return true;               // Return TRUE for failure
                //#endregion
                
                //#region -> Get an operation
                if(this.getOperation("program")) return true;   // Call the operation function
                if(this.operation.type == Operation.Types.start) {
                        this.program.name = this.operation.value;
                }
                this.program.operations.push(this.operation);   // Update the program
                if(this.state == States.end_program) return false;
                //#endregion
                
                //#region -> Save off that operation
                //#endregion

                //#region -> End evaluation and continue
                return this.parseTokens();
                //#endregion
        }
        //#endregion

        //#region -> Operation management
        getOperation(scope){  
                //#region -> Gather operation
                this.operation = {
                        "type"       : null,
                        "value"      : null,
                        "expression" : null,
                        "operations" : [] 
                }
                switch(this.state) {
                        case States.start:
                        if(this.getStart()) return true;          // P&D TODO ERROR RECOVERY
                        this.state = States.declaration;     // Switch state
                        break;
                        case States.declaration:
                        if(this.getDeclaration(scope)) return true;// P&D TODO ERROR RECOVERY
                        if(this.state == States.statement)  return this.getOperation(scope);
                        if(this.operation.type == Operation.Types.procedure) return false; // Go store that
                        break;
                        case States.statement:
                        if(this.getStatement(scope))  return true;
                        break;
                        default:
                        this.postError("Internal error.");
                        return true;
                }
              //#endregion
              
              //#region -> End evaluation and continue
              return false;
              //#endregion
        };
        //#endregion

        //#region -> Parsing utilities
        getStart() {
                // Standard start
                if(this.getToken()) return true;
                this.operation.type = Operation.Types.start;

                // Check syntax
                if(this.current.value == "PROGRAM") {
                        if(this.getToken()) return true;
                        if(this.current.type == "IDEN" && this.next.value == "IS") { 
                                this.operation.value = this.current.value;
                                if(this.getToken()) return true;
                                return false;
                        }
                        else {
                                this.postError("Expected a program name and then keyword IS.");
                                return true;
                        }
                }
                else {
                        this.postError("Expected PROGRAM keyword.");
                        return true;
                }

        };
        getDeclaration(scope) {
                if(this.getToken()) return true; //"STRT""END"
               
                switch(this.current.type) {
                        //#region -> DECLARATION
                        case "DECN":
                        
                        // Check if global scope 
                        let global = false;
                        if(this.current.value == "GLOBAL") {
                                global = true;
                                if(this.getToken()) return true; 
                        }
                        // IF we are in the right place
                        if(this.current.value == "VARIABLE") {
                                
                                // Store the variable
                                if(this.postSymbol(scope, global)) return true;

                                // Check if it is the end
                                if(this.next.value == ";") {
                                        // Sweet we made it yo
                                        if(this.getToken()) return true; 
                                        return this.getDeclaration(scope);
                                }
                                else {
                                        this.postError("Way to not finish your sentence."); 
                                        return true;
                                }

                        }
                        else if(this.current.value == "PROCEDURE") {
                                if(this.next.type != "IDEN") {
                                        this.postError("Unable to parse procedure without a name.");
                                        return true;
                                } 

                                // Declare the procedure operation
                                let temp_operation = {
                                        "type"       : Operation.Types.procedure,
                                        "value"      : this.next.value,
                                        "parameters" : [],
                                        "expression" : [],
                                        "operations" : [] 
                                }

                                let temp_state = null;
                                temp_state = this.state;

                                // Ok, lets post the item in the symbol table
                                if(this.postSymbol(scope, global)) return true;

                                // Resolve the scope
                                let temp_scope = scope;
                                if(this.existsGlobally(temp_operation.value)) temp_scope = "global";
                                this.symbol_table[temp_scope][temp_operation.value].value = true;
                                if(this.getToken()) return true;

                                // Ok, now for the parameters
                                if(this.current.value != "(") {
                                        this.postError("Expexted brackets ([parameters]) after type mark for procedure.");
                                        return true;
                                }
                                if(this.getToken()) return true;
                                let gathering = true;
                                let temp_parameter = {
                                        "key" : null,
                                        "type": null,
                                }
                                while(gathering) {
                                        switch(this.current.value) {
                                                case ")":
                                                gathering = false;
                                                break;
                                                case ",":
                                                break;
                                                case "VARIABLE":
                                                if(this.next.type != "IDEN") {
                                                        this.postError("Expected an identifier for procedure parameter declaration.");
                                                        return true;
                                                }
                                                temp_parameter.key = this.next.value;
                                                if(this.postSymbol(temp_operation.value, false)) return true;
                                                temp_parameter.type = this.symbol_table[temp_operation.value][temp_parameter.key].type;
                                                this.symbol_table[temp_operation.value][temp_parameter.key].value = true;
                                                temp_operation.parameters.push(temp_parameter);
                                                temp_parameter = {
                                                        "key" : null,
                                                        "type": null
                                                }
                                                break;
                                                default:
                                                this.postError("Unexpected input " + this.current.value + " within variable parameter declaration.");
                                                return true;
                                        }
                                        if(this.getToken()) return true;
                                }

                                // We also need to add the procedure to it's own scope for recursive calling
                                // this.symbol_table[temp_scope][symbol.value] = new_symbol;

                                // Ensure we now have a new scope 
                                if(typeof this.symbol_table[temp_operation.value] == 'undefined' || this.symbol_table[temp_operation.value] == null ) {
                                        this.symbol_table[[temp_operation.value]] = {
                                                [temp_operation.value] : this.symbol_table["program"][temp_operation.value]
                                        }
                                }
                                else {
                                        this.symbol_table[temp_operation.value][temp_operation.value] = this.symbol_table["program"][temp_operation.value];
                                }
                                
                        
                                // Set the current state
                                this.state = States.Procedure.declaration;
                                gathering = true;
                                // We need to back up for future calls
                                this.tokens.unshift(this.next);
                                this.tokens.unshift(this.current);
                                this.next = this.current;
                                this.tokens.shift();
                                this.procedure_table[temp_operation.value] = temp_operation; // Store a temp for now
                                // Build the procedure
                                while(gathering) {
                                        switch(this.state) {
                                                case States.Procedure.declaration:
                                                this.operation = {
                                                        "type"       : null,
                                                        "value"      : null,
                                                        "parameters" : [],
                                                        "expression" : [],
                                                        "operations" : [] 
                                                }
                                                if(this.getDeclaration(temp_operation.value)) return true;
                                                if(this.operation.type == Operation.Types.procedure) {
                                                        temp_operation.operations.push(this.operation);
                                                        this.procedure_table[temp_operation.value] = temp_operation; // Store a temp for now
                                                        this.operation = {
                                                                "type"       : null,
                                                                "value"      : null,
                                                                "parameters" : [],
                                                                "expression" : [],
                                                                "operations" : [] 
                                                        }
                                                }
                                                else if(this.state == States.Procedure.statement) break;
                                                else {
                                                        this.postError("Internal error.");
                                                        return true;
                                                }
                                                break;
                                                case States.Procedure.statement:
                                                this.operation = {
                                                        "type"       : null,
                                                        "value"      : null,
                                                        "parameters" : [],
                                                        "expression" : [],
                                                        "operations" : [] 
                                                }
                                                if(this.getStatement(temp_operation.value)) return true;
                                                if(this.operation.type == Operation.Types.end_procedure) gathering = false;
                                                else if(this.operation == Operation.Types.end_program) {
                                                        this.postError("Expected the END PROCEDURE keywords while parsing procedure.");
                                                        return true;
                                                }
                                                temp_operation.operations.push(this.operation);
                                                this.procedure_table[temp_operation.value] = temp_operation; // Store a temp for now
                                                this.operation = {
                                                        "type"       : null,
                                                        "value"      : null,
                                                        "parameters" : [],
                                                        "expression" : [],
                                                        "operations" : [] 
                                                }
                                                break;
                                                default:
                                                this.postError("Unexpected input within procedure declaration.");
                                                return true;
                                        }
                                }

                                // Add the procedure to the table                
                                this.procedure_table[temp_operation.value] = temp_operation;

                                // Reset the operation
                                this.operation = {
                                        "type"       : null,
                                        "value"      : null,
                                        "parameters" : [],
                                        "expression" : [],
                                        "operations" : [] 
                                }
                                // Reset the state
                                this.operation = temp_operation;

                                // Just in case this has switched
                                this.state = temp_state;
                                return false;
                        }
                        else {
                                this.postError("Expected keyword VARIABLE for declaration.");
                                return true; 
                        }

                        //#endregion
                        
                        //#region -> START
                        case "STRT":
                        if(this.current.value == "BEGIN") {
                                if(this.state == States.Procedure.declaration) {
                                        this.state = States.Procedure.statement;
                                        return false;
                                }
                                this.state = States.statement;
                                return false;
                        }
                        else {
                                this.postError("Unexpected THEN keyword.");
                                return true;
                        }
                        //#endregion

                        //#region -> DEFAULT
                        default:
                        this.postError("Unexpected input for declaration section.");
                        return true;
                        //#endregion
                }
        };
        getStatement(scope) {

                if(this.getToken()) return true;

                switch(this.current.type) {

                        //#region -> GOTO
                        case "GOTO":
                        if(this.current.value != "RETURN") {
                                this.postError("Internal error.");
                                return true;
                        }

                        if(this.state != States.Procedure.statement) {
                                this.postError("Unexpected return statement from main program.");
                                return true;
                        }

                        if(this.postExpression(scope)) return true;

                        this.operation.type = Operation.Types.return;
                        this.operation.expression = this.expression_result;

                        if(this.current.value != ";") {
                                this.postError("Expected end of line character.");
                                return true;
                        }

                        let symbol = this.symbol_table[scope][scope];
                
                        // Check the return type on the procedure & the bound
                        let type_a = symbol.type;
                        let type_b = null;
                        let temp_index = -1;
                        for(let index in this.operation.expression) {
                                type_b = this.operation.expression[index].type
                                if(type_b == "BOOL" || type_b == "INTREGER" || type_b == "FLOAT" || type_b == "STRING") {
                                        if(this.typeCheck(type_a,type_b)) return true;
                                }
                                if(this.operation.expression[index].value == "PROCEDURE") {
                                        if(this.checkBounds(symbol, this.operation.expression[index].expressions, temp_index)) return true;
                                }
                        }

                        // Bound check the whole thing
                        if(this.checkBounds(symbol, this.operation.expression, temp_index)) return true;

                        return false;
                        //#endregion

                        //#region -> LOOP
                        case "LOOP":
                        // Make sure we are at the start
                        if(this.current.value == "FOR") {
                                if(this.postFor(scope)) return true; 
                                if(this.next.value != ";") {
                                        this.postError("Expected end of line character ; .");
                                        return true;   
                                }
                                if(this.getToken()) return true;
                                return false;
                        }
                        else {
                                this.postError("Unexpected argument " + this.current.value + ".");
                                return true;    // P&D for now 
                        }
                        //#endregion

                        //#region -> CONDITION
                        case "COND":
                        // Make sure we are at the start
                        if(this.current.value == "IF") {
                                if(this.postIf(scope)) return true; 
                                if(this.next.value != ";") {
                                        this.postError("Expected end of line character ; .");
                                        return true;   
                                }
                                if(this.getToken()) return true;
                                return false;
                        }
                        else {
                                this.postError("Unexpected argument " + this.current.value + ".");
                                return true;    // P&D for now 
                        }
                        //#endregion

                        //#region -> IDENTIFIER
                        case "IDEN":
                                // Set the global variable false for now
                                this.current_identifier = this.current.value;  // This is used for table entrys
                                this.current_index = 0;
                                let index = false;

                                // Scopeing
                                let temp_scope = scope; 
                                if(this.existsGlobally(this.current_identifier)) temp_scope = "global";

                                // Skipping this for now
                                if(this.next.value == "[") {
                                        if(this.getToken()) return true;
                                        switch(this.next.type) {
                                                case "INTEGER":
                                                index = true;
                                                if(this.getToken()) return true;
                                                this.current_index = this.current.value;
                                                if(this.symbol_table[temp_scope][this.current_identifier].bound < this.current_index) {
                                                        this.postError("Variable array index is out of bounds.");
                                                        return true;
                                                }
                                                if(this.next.value != "]") {
                                                        this.postError("Expected ending bracket ] to end bounds declaration.");
                                                        return true;
                                                        
                                                }
                                                if(this.getToken()) return true;
                                                break;
                                                default:
                                                this.postError("Unexpected input " + this.current.value + " within bounds assignment.");
                                                return true;
                                        } 
                                }

                                if(this.getToken()) return true;

                                // This is the main test for assignment statement
                                if(this.current.value != ":") {
                                        this.postError("Expected : .");
                                        return true;
                                }
                                // Advance the token, we know where we are
                                if(this.getToken()) return true;

                                // next token expected
                                if(this.current.value != "=") {
                                        this.postError("Expected = .");
                                        return true;    // P&D for now
                                }  

                                // We do expect it to exist
                                if(!(this.existsGlobally(this.current_identifier) || this.existsLocally(scope, this.current_identifier))) {
                                        this.postError("Variable has not been declared locally or globally.");
                                        return true;    // P&D for now
                                }

                                if(this.postExpression(scope)) return true;

                                this.operation.type = Operation.Types.assignment;
                                this.operation.expression = this.expression_result;

                                if(this.expression_result.length == 0) {
                                        this.postError("Expected an expression to assign to variable " + this.current_identifier +".");
                                        return true;
                                }

                                // scoping
                                temp_scope = scope;
                                if(this.existsGlobally(this.current_identifier)) temp_scope = "global";

                                // IF we are NOT in global scope, AND we are in a procedure
                                if(!(this.state == States.Procedure.statement && temp_scope == "global")) {
                                        this.symbol_table[temp_scope][this.current_identifier].value = true;
                                }

                                // Do some type checking
                                let x_type = this.symbol_table[temp_scope][this.current_identifier].type;       // The result
                                let y_type = this.expression_result[this.expression_result.length - 1].type;    // Litterally just grab one

                                // Type check
                                if(this.typeCheck(x_type,y_type)) return true;

                                // We expect the end line character
                                if(this.current.value != ";") { 
                                        this.postError("Expected end of line character ; .");
                                        return true;
                                }

                                // Build an argument for the assignemnt 
                                // See if this is a complete array assignment
                                if(!index && this.symbol_table[temp_scope][this.current_identifier].bound > 0) {
                                        this.current_index = -1;       
                                }

                                let argument = {
                                        "key"   : this.current_identifier,
                                        "type"  : this.symbol_table[temp_scope][this.current_identifier].type,
                                        "value" : "IDEN",
                                        "index" : this.current_index,
                                        "bound" : this.symbol_table[temp_scope][this.current_identifier].bound
                                }

                                // Check the bounds if they assign two array to eachother                                
                                if(this.checkBounds(this.symbol_table[temp_scope][this.current_identifier],this.expression_result, this.current_index)) return true;

                                // Store that shit
                                this.operation.expression = this.expression_result;
                                this.operation.value = argument;
                                return false;
                        //#endregion
                        
                        //#region -> END
                        case "END":
                        if(this.next.value == "PROGRAM") {
                                if(this.getToken()) return true;
                                if(this.next.value == ".") {
                                        if(this.getToken()) return true;
                                        this.state = States.end_program;
                                        this.operation.type = Operation.Types.end_program;
                                        return false;
                                }
                                else {
                                        this.postError("Expected period to end the program.");
                                        return true;
                                }
                        }
                        else if(this.next.value == "IF") {
                                if(this.getToken()) return true;
                                this.operation.type = Operation.Types.end_if;
                                return false;
                        }
                        else if(this.next.value == "FOR") {
                                if(this.getToken()) return true;
                                this.operation.type = Operation.Types.end_for;
                                return false;
                        }
                        else if(this.next.value == "PROCEDURE") {
                                if(this.getToken()) return true;
                                this.operation.type = Operation.Types.end_procedure;
                                if(this.next.value != ";") {
                                        this.postError("expected an end of line character ; to end procedure. ");
                                        return true;
                                }
                                if(this.getToken()) return true;
                                return false;
                        }
                        else {
                                this.postError("Unexpected keyword END.");
                                return true;
                        }
                        //#endregion

                        //#region -> DEFAULT
                        default:
                        this.postError("Unexpected input in statement section.");
                        return true;
                        //#endregion
                }
        };
        postFor(scope) {
                if(this.getToken()) return true;

                // Lets get the assignment
                if(this.current.value != "(") {
                        this.postError("Expected parenthesis for the LOOP statement.");
                        return true;
                }
                this.operation = {
                        "type"       : null,
                        "value"      : null,
                        "expression" : null,
                        "operations" : [] 
                }
                let temp_operation = {
                        "type"       : null,
                        "value"      : null,
                        "expression" : null,
                        "operations" : [] 
                }
                if(this.getStatement(scope)) return true;       // Grab a statement
                if(this.operation.type != Operation.Types.assignment) {
                        this.postError("Expected assignment statement to start FOR loop.");
                        return true;
                }
                temp_operation.value = this.operation;          // Store that

                this.tokens.unshift(this.next);
                let temp_token = {
                        "type" : "BRKT",
                        "value": '('
                }
                this.tokens.unshift(temp_token);
                this.next = temp_token;
                this.tokens.shift();

                // Get the expression
                if(this.postExpression(scope)) return true;

                if(this.expression_result.length == 0) {
                        this.postError("Expected an expression for IF statement.");
                        return true;
                }
                // Store the resolved expression
                else temp_operation.expression = this.expression_result;

                // Loop until we see either the "ELSE" keyword or the "END" keyword
                while(1) {
                        this.operation = {
                                "type"       : null,
                                "value"      : null,
                                "expression" : null,
                                "operations" : [] 
                        }
                        if(this.getStatement(scope)) return true;
                        if(this.operation.type == Operation.Types.end_program) {
                                this.postError("Expected END IF to end IF statements. ");
                                return true;
                        }
                        temp_operation.operations.push(this.operation);
                        if(this.operation.type == Operation.Types.end_for) break;
                }

                this.operation = temp_operation;
                this.operation.type = Operation.Types.loop;
                return false;
        };
        postIf(scope) {

                // Save off the current operation to be saved upon later
                let temp_operation = {
                        "type"       : null,
                        "value"      : null,
                        "expression" : null,
                        "operations" : [] 
                }

                this.operation = {
                        "type"       : null,
                        "value"      : null,
                        "expression" : null,
                        "operations" : [] 
                }

                // Get the expression
                if(this.postExpression(scope)) return true;

                if(this.expression_result.length == 0) {
                        this.postError("Expected an expression for IF statement.");
                        return true;
                }
                // Store the resolved expression
                else temp_operation.expression = this.expression_result;

                if(this.current.value != "THEN") {
                        this.postError("Expected THEN keyword.");
                        return true;
                }

                // Loop until we see either the "ELSE" keyword or the "END" keyword
                while(1) {
                        this.operation = {
                                "type"       : null,
                                "value"      : null,
                                "expression" : null,
                                "operations" : [] 
                        }
                        if(this.next.value == "ELSE") {
                                this.operation.type = Operation.Types.ELSE;
                                if(this.getToken()) return true;
                        }
                        else {
                                if(this.getStatement(scope)) return true;
                                if(this.operation.type == Operation.Types.end_program) {
                                        this.postError("Expected END IF to end IF statements. ");
                                        return true;
                                }
                        }
                        temp_operation.operations.push(this.operation);
                        if(this.operation.type == Operation.Types.end_if) break;
                }

                // Shweet we made it
                if(temp_operation.operations.length == 1) {
                        this.postError("You just wrote a pointless IF statement. congrats.");
                        return true;
                }


                this.operation = temp_operation;
                this.operation.type = Operation.Types.IF;
                return false;
        };
        postExpression(scope) {
                // Some things we need to keep track of
                this.return_type = null;        // Used for the caller to check upon assignment
                this.expression_result = [];     // Used for the caller to assign wherever
                let gathering = true;           // Used for token gathering
                let argument = {
                        "key"   : null,
                        "type"  : null,
                        "value" : null,
                        "index" : 0,
                        "bound" : 0,
                        "expressions" : []
                }
                let argument_list = [];         // Token list generated for the expression
                let negative = false;

                // Gether all the applicable tokens first
                while(gathering) {
                        if(this.getToken()) return true;
                        switch(this.current.type) {
                                //#region -> BRACKET
                                case "BRKT":
                                if(this.current.value == "(") {
                                        argument = {
                                                "type"  : "BRKT",
                                                "value" : "("
                                        }
                                        argument_list.push(argument);
                                        break;
                                }
                                else if(this.current.value == ")") {
                                        argument = {
                                                "type"  : "BRKT",
                                                "value" : ")"
                                        }
                                        argument_list.push(argument);
                                        break;
                                }
                                else {
                                        this.postError("Unexpected bracket type " + this.current.value + ".");
                                        return true;
                                }
                                //#endregion -> BRACKET

                                //#region -> AROP
                                case "AROP":
                                switch(this.current.value) {
                                        case "+":
                                        argument = {
                                                "type"  : "AROP",
                                                "value" : "+"
                                        }
                                        argument_list.push(argument);
                                        break;
                                        case "-":
                                        // We gotta handle negative number man
                                        if((argument_list.length == 0)) {
                                                if(this.next.type == "INTEGER" || this.next.type == "FLOAT") {
                                                        negative = true;
                                                        break;
                                                }
                                                else {
                                                        this.postError("Unexpected negative sign within assignment.");
                                                        return true;
                                                }
                                        }
                                        else if(this.next.type == "INTEGER" || this.next.type == "FLOAT") {
                                                if(argument_list[0].type == "FLOAT" || argument_list[0].type == "INTEGER") {
                                                        argument = {
                                                                "type"  : "AROP",
                                                                "value" : "-"
                                                        }
                                                        argument_list.push(argument);
                                                        break;
                                                }
                                                else {
                                                        negative = true;
                                                        break;
                                                }
                                        }
                                        else {
                                                argument = {
                                                        "type"  : "AROP",
                                                        "value" : "-"
                                                }
                                                argument_list.push(argument);
                                                break;
                                        }
                                        case "*":
                                        argument = {
                                                "type"  : "FACTOR",
                                                "value" : "*"
                                        }
                                        argument_list.push(argument);
                                        break;
                                        case "/":
                                        argument = {
                                                "type"  : "FACTOR",
                                                "value" : "/"
                                        }
                                        argument_list.push(argument);
                                        break;
                                        default:
                                        this.postError("Unexpected arithmatic operator " + lexer.current.value + ".");
                                        gathering = false;
                                }
                                break;
                                //#endregion -> AROP
                                
                                //#region -> INDETIFIER
                                case "IDEN":
                                if(this.next.value == ":") {
                                        // Holy fuck back up bro
                                        this.tokens.unshift(this.next);
                                        this.tokens.unshift(this.current);
                                        this.next = this.current;
                                        this.tokens.shift();
                                        gathering = false;
                                        break;
                                }

                                if(this.existsGlobally(this.current.value) || this.existsLocally(scope, this.current.value)) {
                                        
                                        // So first off, lets see if it has been assigned a value
                                        let temp_scope = scope;
                                        if(this.existsGlobally(this.current.value)) temp_scope = "global";
                                        
                                        // If the caller wants to check if the value has been set yet
                                        if(!(this.state == States.Procedure.statement && temp_scope == "global")) {
                                                if(this.symbol_table[temp_scope][this.current.value].value == false) {
                                                        this.postError("Variable has not been set yet.");
                                                        return true;
                                                }
                                        }

                                        // Initial argument
                                        argument = {
                                                "key"   : this.current.value,
                                                "type"  : this.symbol_table[temp_scope][this.current.value].type,
                                                "value" : "IDEN",
                                                "index" : 0,
                                                "bound" : this.symbol_table[temp_scope][this.current.value].bound,
                                                "expressions" : []
                                        }

                                        // Check if there exists a procedure with that identifier
                                        if(typeof this.procedure_table[this.current.value] == 'undefined' 
                                        || this.procedure_table[this.current.value] == 'undefined' 
                                        || this.procedure_table[this.current.value] == null) {
                                                
                                                let index = false;
                                                // See if an index is being used
                                                if(this.next.value == "[") {
                                                        if(this.getToken()) return true;
                                                        switch(this.next.type) {
                                                                case "INTEGER":
                                                                index = true;
                                                                if(this.getToken()) return true;
                                                                argument.index = this.current.value;
                                                                if(argument.bound < argument.index) {
                                                                        this.postError("Variable array index is out of bounds.");
                                                                        return true;
                                                                }
                                                                if(this.next.value != "]") {
                                                                        this.postError("Expected ending bracket ] to end bounds declaration.");
                                                                        return true;
                                                                        
                                                                }
                                                                if(this.getToken()) return true;
                                                                break;
                                                                default:
                                                                this.postError("Unexpected input " + this.current.value + " within bounds assignment.");
                                                                return true;
                                                        }
                                                }

                                                // Check if it is an assignment to ALL values within an array
                                                if((argument.bound > 0) && !index) {
                                                        argument.index = -1;
                                                }
                                                argument_list.push(argument);
                                                break;
                                        }
                                        else {
                                                // This section is for procedure calls
                                                let procedure = this.procedure_table[this.current.value];
                                                
                                                // Update the argument
                                                argument.value = "PROCEDURE";

                                                // Yes, we need parenthesis
                                                if(this.next.value != "(") {
                                                        this.postError("Procedure call requires parameter specification.");
                                                        return true;
                                                }

                                                // incriment
                                                if(this.getToken());

                                                let count = 1;          // Count for paranethesis
                                                let gathering = true;   // Helps to .... gather
                                                let temp_list = [];     // List to call postExpression with again

                                                while(gathering) {
                                                        
                                                        switch(this.next.value) {
                                                                case ")":       // Ending
                                                                count = count - 1;
                                                                if(count == 0) {
                                                                        if(this.getToken()) return true;
                                                                        gathering = false;
                                                                        break;
                                                                }
                                                                if(this.getToken()) return true;
                                                                temp_list.unshift(this.current);
                                                                break;
                                                                case "(":
                                                                count = count + 1;
                                                                if(this.getToken()) return true;
                                                                temp_list.unshift(this.current);
                                                                break;
                                                                case ";":       
                                                                this.postError("Unbalanced parenthesis on " + procedure.value + ".");
                                                                return true;
                                                                default:
                                                                if(this.getToken()) return true;
                                                                temp_list.unshift(this.current);
                                                        }     
                                                }

                                                // If the procedure call requires parameters
                                                if(temp_list.length == 0 && procedure.parameters.length != 0) {
                                                        this.postError("Arguments were expected within the procedure call.");
                                                        return true;
                                                }

                                                // If the list length is zero, lets just break
                                                if(temp_list.length == 0) {
                                                        argument_list.push(argument);
                                                        break;
                                                }

                                                // Build an expression list for each parameter in the procedure
                                                let temp_result = this.expression_result;       // Need to do this in case the procedure has anything 
                                                this.expression_result = [];
                                                if(this.postProcedure(scope, temp_list)) return true;
                                                this.expression_result = temp_result;
                                                argument.expressions = this.expressions;        // Assign the output from posrProcedure
                                                this.next = this.current;                       // I did some goofy stuff with the tokens in that call
                                                this.expressions = null;

                                                // Check the lengths of parameters and expressions
                                                if(argument.expressions.length != procedure.parameters.length) {
                                                        this.postError("Expected equal arguments as what was declared for the procedure.");
                                                        return true;
                                                }

                                                // Ok, now we need to check them types and bounds
                                                let type_a = null;
                                                let type_b = null;
                                                let symbol = null;
                                                let expression = null;
                                                let index = -1;
                                                for(let index in argument.expressions) {
                                                        
                                                        // Bounds check
                                                        expression = argument.expressions[index];
                                                        symbol = this.symbol_table[procedure.value][procedure.parameters[index].key]
                                                        if(this.checkBounds(symbol, expression, index)) return true;
                                                        
                                                        // Type check
                                                        for(let item in argument.expressions[index]) {
                                                                type_a = procedure.parameters[index].type;
                                                                type_b = argument.expressions[index][item].type;
                                                                
                                                                // Type check
                                                                if(type_b == "INTEGER" || type_b == "FLOAT" || type_b == "BOOL" || type_b == "STRING") {
                                                                        if(this.typeCheck(type_a,type_b)) return true;        
                                                                }
                                                                
                                                        }
                                                }

                                                // If we pass all of that
                                                argument_list.push(argument);
                                                break;
                                        }
                                }
                                else {
                                        this.postError("Variable or procedure does not exist locally or globally.");
                                        return true;
                                }
                                break;
                                //#endregion -> INDETIFIER
                                
                                //#region -> STRING
                                case "STRG":
                                argument = {
                                        "type"  : "STRING",
                                        "value" : this.current.value
                                }
                                argument_list.push(argument);
                                break;
                                //#endregion -> STRING
                                
                                //#region -> INTEGER
                                case "INTEGER":
                                if(negative) {
                                        argument = {
                                                "type"  : "INTEGER",
                                                "value" : this.current.value * -1
                                        } 
                                        negative = false;
                                }
                                else {
                                        argument = {
                                                "type"  : "INTEGER",
                                                "value" : this.current.value
                                        }
                                }
                                argument_list.push(argument);
                                break;
                                //#endregion -> INTEGER

                                //#region -> FLOAT
                                case "FLOAT":
                                if(negative) {
                                        argument = {
                                                "type"  : "FLOAT",
                                                "value" : this.current.value * -1
                                        } 
                                        negative = false;
                                }
                                else {
                                        argument = {
                                                "type"  : "FLOAT",
                                                "value" : this.current.value
                                        }
                                }
                                argument_list.push(argument);
                                break;
                                //#endregion -> FLOAT

                                //#region -> RLOP && EXOP
                                case "RLOP":
                                case "EXOP":
                                if(this.current.value == "=") {
                                        this.postError("Unexpected equals sign within expression.");
                                        return true;
                                }
                                if(this.current.value == "<") {
                                        argument = {
                                                "type"  : this.current.type,
                                                "value" : ">"
                                        }
                                }
                                else if(this.current.value == ">") {
                                        argument = {
                                                "type"  : this.current.type,
                                                "value" : "<"
                                        }
                                }
                                else if(this.current.value == "<=") {
                                        argument = {
                                                "type"  : this.current.type,
                                                "value" : ">="
                                        }
                                }
                                else if(this.current.value == ">=") {
                                        argument = {
                                                "type"  : this.current.type,
                                                "value" : "<="
                                        }
                                }
                                else {
                                        argument = {
                                                "type"  : this.current.type,
                                                "value" : this.current.value
                                        }
                                }
                                argument_list.push(argument);
                                break;
                                //#endregion -> RLOP && EXOP

                                //#region -> DEFAULT
                                default:
                                if(this.current.value == ";" || this.current.value == "THEN") {
                                        gathering = false;        
                                }
                                else {
                                        this.postError("Unexpected input within assignment expression.");
                                        return true;
                                }
                                //#endregion -> DEFAULT
                        }
                        if(gathering == false) break;
                }

                // Start the expression 
                if(argument_list.length != 0) {
                        // Some stuff for the getExpression call
                        if(this.getExpression(scope, argument_list)) return true;

                        // We really need to do a check on the build expression
                        return false;
                }
                else return false;
        };
        postProcedure(scope, list) {
                
                // OK, now call postExpression() for every built list
                this.expression_result = [];
                let temp_expression = [];
                this.expressions = [];
                let temp_array = [];
                if(this.next.value != ";") {
                        this.postError("Expected end of line character.");
                        return true;
                }
                for(let item in list) {
                        if(list[item].value == ",") {
                                if(temp_array.length == 0) {
                                        this.postError("Expected an expression before the , symbol.");
                                        return true;
                                }
                                this.reverseTokens(temp_array);
                                if(this.postExpression(scope)) return true;
                                this.tokens.unshift(this.next);
                                temp_expression.push(this.expression_result);
                                // argument.expression.push(this.expression_result);
                                temp_array = [];
                        }
                        else {
                                temp_array.push(list[item]);
                        }
                }
                if(temp_array.length == 0) {
                        this.postError("Expected an expression.");
                        return true;
                }
                this.reverseTokens(temp_array);
                if(this.postExpression(scope)) return true;
                this.tokens.unshift(this.next);
                temp_expression.push(this.expression_result);
                this.expressions = temp_expression;
                return false;
   
        };
        // Reverses a list of tokens for an expression call
        reverseTokens(list) {
                // Restore the current NEXT token
                let temp_token = {
                        "type" : "ENDL",
                        "value": ";",
                        "line" : this.current.line
                }
                this.tokens.unshift(temp_token);
                
                for(let item in list) {
                        this.tokens.unshift(list[item]);
                }
                this.next = this.tokens.shift();
        };
        getExpression(scope, argument_list) {

                if(argument_list.length == 1) {
                        this.expression_result.unshift(argument_list[0]);
                        return false;
                }

                // Ok lets save the current and previous types
                // Alright lets build the expression list
                // Do all the 
                // Do everything in parenthesis first
                let temp_array = [];
                var x = null;
                var y = null;
                var temp = null;
                let bracket_count = 0;
                while(1) {
                        // Grab the next value
                        temp = argument_list.shift();
                        
                        // Check if it is time to quit
                        if(temp == "undefined" || typeof temp === 'undefined' || temp == null) break;
                        
                        // See if we have found a parenthesis
                        if(temp.value == "(") {
                                bracket_count = bracket_count + 1;
                                let x_array = [];
                                temp = argument_list.shift();
                                while(1) {
                                        if(temp == "undefined" || typeof temp === 'undefined' || temp == null) break;
                                        if(temp.value == "(") bracket_count = bracket_count + 1;
                                        if(temp.value == ")") {
                                                bracket_count = bracket_count - 1;
                                                if(bracket_count == 0) break;
                                        }
                                        x_array.push(temp);
                                        temp = argument_list.shift();
                                }

                                if(temp == "undefined" || typeof temp === 'undefined' || temp == null) {
                                        this.postError("Unbalanced parenthesis.");
                                        return true;
                                }

                                if(x_array.length != 0) {
                                        if(this.getExpression(scope,x_array)) return true;
                                        // Snap the old shit back onto the end
                                        while(1) {
                                                temp = temp_array.pop();
                                                if(temp == "undefined" || typeof temp === 'undefined' || temp == null) break;
                                                this.expression_result.unshift(temp);
                                        }
                                }
                        }
                        else {
                                // Else push the temp
                                temp_array.push(temp);
                        }
                }

                // Ok, next up is expressional operators
                if(temp_array.length == 0) return false;
                argument_list = temp_array;
                temp_array = [];
                x = null;
                y = null;
                temp = null;
                while(1) {
                        // Grab the next value
                        temp = argument_list.shift();
                        
                        // Check if it is time to quit
                        if(temp == "undefined" || typeof temp === 'undefined' || temp == null) break;
                        
                        // See if we have found a parenthesis
                        if(temp.value == "&" || temp.value == "|") {
                                let x_array = [];
                                let exop = temp;
                                temp = temp_array.pop();

                                while(1) {
                                        if(temp == "undefined" || typeof temp === 'undefined' || temp == null) break;
                                        x_array.push(temp);
                                        temp = temp_array.pop();
                                }

                                if(x_array.length != 0) {
                                        if(this.getExpression(scope,x_array)) return true;
                                        this.expression_result.unshift(exop);
                                        // Snap the old shit back onto the end
                                }
                                else {
                                        if(this.expression_result.length == 0) {
                                                this.postError("Expected an expression after operator.");
                                                return true;
                                        }
                                        this.expression_result.unshift(exop);
                                }

                                x_array = [];
                                temp = argument_list.shift();

                                while(1) {
                                        if(temp == "undefined" || typeof temp === 'undefined' || temp == null) break;
                                        x_array.push(temp);
                                        temp = argument_list.shift();
                                }

                                if(x_array.length != 0) {
                                        if(this.getExpression(scope,x_array)) return true;
                                        // Snap the old shit back onto the end
                                }
                                else {
                                        this.postError("Expected an expression after operator.");
                                        return true;
                                }
                        }
                        else {
                                // Else push the temp
                                temp_array.push(temp);
                        }
                }

                // Ok, next up is relational operators
                if(temp_array.length == 0) return false;
                argument_list = temp_array;
                temp_array = [];
                x = null;
                y = null;
                temp = null;
                while(1) {
                        // Grab the next value
                        temp = argument_list.shift();
                        
                        // Check if it is time to quit
                        if(temp == "undefined" || typeof temp === 'undefined' || temp == null) break;
                        
                        // See if we have found a parenthesis
                        if(temp.type == "RLOP") {
                                let x_array = [];
                                let rlop = temp;
                                temp = temp_array.pop();

                                while(1) {
                                        if(temp == "undefined" || typeof temp === 'undefined' || temp == null) break;
                                        x_array.push(temp);
                                        temp = temp_array.pop();
                                }

                                if(x_array.length != 0) {
                                        if(this.getExpression(scope,x_array)) return true;
                                        this.expression_result.unshift(rlop);
                                        // Snap the old shit back onto the end
                                }
                                else {
                                        if(this.expression_result.length == 0) {
                                                this.postError("Expected an expression after operator.");
                                                return true;
                                        }
                                        this.expression_result.unshift(rlop);
                                }

                                x_array = [];
                                temp = argument_list.shift();

                                while(1) {
                                        if(temp == "undefined" || typeof temp === 'undefined' || temp == null) break;
                                        x_array.push(temp);
                                        temp = argument_list.shift();
                                }

                                if(x_array.length != 0) {
                                        if(this.getExpression(scope,x_array)) return true;
                                        // Snap the old shit back onto the end
                                }
                                else {
                                        this.postError("Expected an expression after operator.");
                                        return true;
                                }
                        }
                        else {
                                // Else push the temp
                                temp_array.push(temp);
                        }
                }

                // Before arithmatic and factors, ensure the array is warm enough for them
                if(temp_array.length == 0) return false;
                argument_list = temp_array;

                if(this.expression_result.length == 0) {
                        this.expression_result[0] = argument_list.shift();
                }

                // Do the factors
                temp_array = [];
                var x = null;
                var y = null;
                var temp = null;
                let first = true;
                while(1) {
                        // Grab the next value
                        temp = argument_list.shift();
                        
                        // Check if it is time to quit
                        if(temp == "undefined" || typeof temp === 'undefined' || temp == null) break;
                        
                        // See if we have found a FACTOR
                        if(temp.type == "FACTOR") {
                                // Grab a new x value
                                if(!first) {
                                        x = this.expression_result[0];
                                }
                                else {
                                        x = this.expression_result[this.expression_result.length - 1];
                                }


                                y = argument_list.shift();
                                if(y.type == "STRING" || x.type == "STRING") {
                                        this.postError("String is unsupported with arithmatic operations.");
                                        return true 
                                }
                                if(x == "undefined" || typeof x === 'undefined' || x == null) {
                                        this.postError("Unbalanced expression statement.");
                                        return true;
                                }
                                //Grab a new y value
                                if(y == "undefined" || typeof y === 'undefined' || y == null) {
                                        this.postError("Unbalanced expression statement.");
                                        return true;
                                }

                                // Check if it is two array AROP
                                if(x.value == "IDEN" && y.value == "IDEN") {
                                        if(x.index == -1 && y.index == -1) {
                                                if(x.bound != y.bound) {
                                                        this.postError("Cannot assignment array size " + x.bound + " to array size " + y_bound + ".");
                                                        return true;
                                                }
                                        }
                                }

                                // Check if either are undefined
                                if((x == "undefined" || typeof x == 'undefined' || x == null) || 
                                (y == "undefined" || typeof y == 'undefined' || y == null)) {
                                        this.postError("Invalid variable type on operation " + temp.value + ".");
                                        return true;
                                }

                                // Type check
                                if(this.typeCheck(x.type,y.type)) return true;
                                if(first) first = false;
                                this.expression_result.push(temp);
                                this.expression_result.push(y);
                        }
                        else {
                                // Else push the temp
                                temp_array.push(temp);
                        }
                }

                // Before arithmatic and factors, ensure the array is warm enough for them
                if(temp_array.length == 0) return false;
                argument_list = temp_array;

                if(this.expression_result.length == 0) {
                        this.expression_result[0] = argument_list.shift();
                }

                // Do the last arithmatic operators
                argument_list = temp_array;
                temp_array = [];
                var x = null;
                var y = null;
                var temp = null;
                first = true;
                while(1) {
                        // Grab the next value
                        temp = argument_list.shift();

                        // Check if it is time to quit
                        if(temp == "undefined" || typeof temp === 'undefined' || temp == null) break;
                        
                        // See if we have found a FACTOR
                        if(temp.type == "AROP") {
                                // Grab a new x value
                                if(!first) {
                                        x = this.expression_result[0];
                                }
                                else {
                                        x = this.expression_result[this.expression_result.length - 1];
                                }

                                y = argument_list.shift();

                                if(x == "undefined" || typeof x === 'undefined' || x == null) {
                                        this.postError("Unbalanced expression statement.");
                                        return true;
                                }
                                //Grab a new y value
                                if(y == "undefined" || typeof y === 'undefined' || y == null) {
                                        this.postError("Unbalanced expression statement.");
                                        return true;
                                }

                                // Check if it is two array AROP
                                if(x.value == "IDEN" && y.value == "IDEN") {
                                        if(x.index == -1 && y.index == -1) {
                                                if(x.bound != y.bound) {
                                                        this.postError("Cannot assignment array size " + x.bound + " to array size " + y_bound + ".");
                                                        return true;
                                                }
                                        }
                                }

                                // Check if either are undefined
                                if((x == "undefined" || typeof x == 'undefined' || x == null) || 
                                (y == "undefined" || typeof y == 'undefined' || y == null)) {
                                        this.postError("Invalid variable type on operation " + temp.value + ".");
                                        return true;
                                }

                                // Type check
                                if(this.typeCheck(x.type,y.type)) return true;
                                if(first) first = false;
                                this.expression_result.unshift(temp);
                                this.expression_result.unshift(y);
                                
                        }
                        else {
                                // Else push the temp
                                this.expression_result.unshift(temp);
                        }
                }

                // Make the next call if it is needed
                if(argument_list.length != 0) {
                        return this.getExpression(scope, temp_array);
                }
                return false;
        };
        postError(message) {
                messanger.flag = true;
                messanger.message = message;
                messanger.line = this.current.line + 1;
                messanger.putError();

                console.log("DUMP");
                console.log(this.symbol_table);
                console.log(this.current);
                console.log(this.next);
                console.log(this.state);
        };
        postSymbol(scope, is_global) {

                if(this.getToken()) return true;
                // If it is global then too bad for local
                let temp_scope = scope;
                if(is_global) temp_scope = "global";
                if(this.current.type != "IDEN") {
                        this.postError("Expected identifier within assignment statement.");
                        return true;
                }

                // Store the new identifier
                let symbol = this.current;

                if(this.existsGlobally(symbol.value)) {
                        this.postError("Exists already globally.");
                        return true;
                }
                
                if(this.existsLocally(scope, symbol.value)) {
                        this.postError("Exists already localy.");
                        return true;
                }

                // Sweet we can finally store it .. or at least tease it
                let new_symbol = {
                        "type"          : null,
                        "bound"         : 0,
                        "value"         : false
                }
                
                try {
                        this.symbol_table[temp_scope][symbol.value] = new_symbol;
                }
                catch(TypeError) {
                        let key = symbol.value
                        this.symbol_table[[temp_scope]] = {
                                [key] : new_symbol
                        }
                }

                // Is the stupid ":" thing there?
                if(this.next.value != ":") {
                        this.postError("You forgot the pointless : before the type mark.");
                        return true;
                }

                // Party on Wayne
                if(this.getToken()) return true;

                if(this.next.type != "MARK") {
                        this.postError("Assign the variable to something good. I recommend a bool.");
                        return true;
                }

                // Go an store the type mark
                if(this.postTypemark(temp_scope, symbol.value)) return true;
                this.operation.type = Operation.Types.NA;
                // Party on Garth
                return false;
        };
        postTypemark(scope, name) {

                if(this.getToken()) return true;
                
                switch(this.current.type) {
                        // Really the only one we want
                        case  "MARK":
                        // Store the mark
                        if((this.existsGlobally(name) || this.existsLocally(scope, name))) {
                                this.symbol_table[scope][name].type = this.current.value;
                                // Oh great, fucking ENUMS
                                if(this.current.value == "ENUM") {
                                        if(this.postEnum(scope, name)) return true;
                                }
                                // Check for a bound
                                if(this.next.value == "[") {
                                        if(this.getToken()) return true;
                                        if(this.postBound(scope, name)) return true;
                                }
                                return false;
                        }
                        else {
                                this.postError("Variable " + name + " does not exist.");
                                return true;
                        }
                        
                        // I feel like something special should happen here.
                        case "IDEN": 
                        this.symbol_table[scope][name].type = this.current.value;
                        break;
                        // The best case, you failing
                        default:
                        this.postError("Expected type mark.");
                        return true;
                }
        };
        existsGlobally(name) {
                try {
                        if(typeof this.symbol_table["global"][name] != 'undefined') {
                                return true;
                        }
                        return false;
                }
                catch(TypeError) {
                        return false;
                }
        };
        existsLocally(scope, name) {
                try {
                        if(typeof this.symbol_table[scope][name] === 'undefined' || this.symbol_table[scope][name] == null || typeof this.symbol_table[scope][name] == null) {
                                return false;
                        }
                        return true;
                        
                }
                catch(TypeError) {
                        return false;
                }
        };
        postBound(scope, name) {
                // Get the current token
                if(this.getToken()) return true;

                switch(this.current.type) {
                        case "INTEGER":
                        this.symbol_table[scope][name].bound = this.current.value;
                        if(this.next.value == "]") {
                                if(this.getToken()) return true;
                                return false;
                        }
                        this.postError("Expected ending bracket ] to end bounds declaration.");
                        return true;
                        default:
                        this.postError("Unexpected input " + this.current.value + " within bounds assignment.");
                        return true;
                }

        };
        typeCheck(type1,type2) {
                if(type1 == "INTEGER") {
                        if(type2 == "INTEGER" || type2 == "BOOL" || type2 == "FLOAT") {
                                return false;
                        }
                        else {
                                this.postError("Incompatible type " + type1 + " and " + type2);
                                return true;
                        }
                }
                else if(type1 == "BOOL") {
                        if(type2 == "INTEGER" || type2 == "BOOL") {
                                return false;
                        }
                        else {
                                this.postError("Incompatible type " + type1 + " and " + type2);
                                return true;
                        }
                }
                else if(type1 == "FLOAT") {
                        if(type2 == "INTEGER" || type2 == "FLOAT") {
                                return false;
                        }
                        else {
                                this.postError("Incompatible type " + type1 + " and " + type2);
                                return true;
                        }
                }
                else {
                        this.postError("Incompatible type " + type1 + " and " + type2);
                        return true;
                }
                
                return false;
        };
        checkBounds(symbol, expression, index) {
                for(let i in expression) {
                        if(expression[i].value == "IDEN") {
                                if(expression[i].index == -1) {
                                        
                                        if(symbol.bound != expression[i].bound) {
                                                this.postError("Array bounds must match for assignment.");
                                                return true;
                                        }

                                        if(index != -1) {
                                                this.postError("Single array value cannot contain entire other array.");
                                                return true;
                                        }
                                }
                        }
                }
                return false;
        };
        updateBuiltin() {
                // This function just updates the build in functions to the procedure and global symbol table.

                //#region -> getBool() : bool value
                // Update the symbol table
                let new_symbol = {
                        "type"          : "BOOL",
                        "bound"         : 0,
                        "value"         : true
                }
                this.symbol_table["global"] = {
                ['GETBOOL'] : new_symbol }
                // Update the procedure table
                this.procedure_table["GETBOOL"] = {
                        "expression"    : [],
                        "operators"     : [],
                        "parameters"    : [],
                        "type"          : Operation.Types.procedure,
                        "value"         : "GETBOOL" 
                }
                new_symbol = null;
                //#endregion

                //#region -> getInteger() : integer value
                // Update the symbol table
                new_symbol = {
                        "type"          : "INTEGER",
                        "bound"         : 0,
                        "value"         : true
                }
                this.symbol_table["global"]["GETINTEGER"] = new_symbol;
                // Update the procedure table
                this.procedure_table["GETINTEGER"] = {
                        "expression"    : [],
                        "operators"     : [],
                        "parameters"    : [],
                        "type"          : Operation.Types.procedure,
                        "value"         : "GETINTEGER" 
                }
                //#endregion

                //#region -> getFloat() : float value
                // Update the symbol table
                new_symbol = {
                        "type"          : "FLOAT",
                        "bound"         : 0,
                        "value"         : true
                }
                this.symbol_table["global"]["GETFLOAT"] = new_symbol;
                // Update the procedure table
                this.procedure_table["GETFLOAT"] = {
                        "expression"    : [],
                        "operators"     : [],
                        "parameters"    : [],
                        "type"          : Operation.Types.procedure,
                        "value"         : "GETFLOAT" 
                }
                //#endregion
        
                //#region -> getString() : string value
                // Update the symbol table
                new_symbol = {
                        "type"          : "FLOAT",
                        "bound"         : 0,
                        "value"         : true
                }
                this.symbol_table["global"]["GETSTRING"] = new_symbol;
                // Update the procedure table
                this.procedure_table["GETSTRING"] = {
                        "expression"    : [],
                        "operators"     : [],
                        "parameters"    : [],
                        "type"          : Operation.Types.procedure,
                        "value"         : "GETSTRING" 
                }
                //#endregion

                //#region -> putBool(bool value) : bool
                // Update the symbol table
                new_symbol = {
                        "type"          : "BOOL",
                        "bound"         : 0,
                        "value"         : true
                }
                this.symbol_table["global"]["PUTBOOL"] = new_symbol;
                // Update the procedure table
                this.procedure_table["PUTBOOL"] = {
                        "expression"    : [],
                        "operators"     : [],
                        "parameters"    : [],
                        "type"          : Operation.Types.procedure,
                        "value"         : "PUTBOOL" 
                }
                this.procedure_table["PUTBOOL"].parameters["BL"] = {
                        "type"          : "BOOL",
                        "bound"         : 0,
                        "value"         : true
                }
                new_symbol = {
                        "type"          : "BOOL",
                        "bound"         : 0,
                        "value"         : true
                }
                this.symbol_table["PUTBOOL"] = {
                        ["BL"]         : new_symbol
                }
                //#endregion

                //#region -> putInteger(integer value) : bool
                // Update the symbol table
                new_symbol = {
                        "type"          : "BOOL",
                        "bound"         : 0,
                        "value"         : true
                }
                this.symbol_table["global"]["PUTINTEGER"] = new_symbol;
                this.procedure_table["PUTINTEGER"] = {
                        "expression"    : [],
                        "operators"     : [],
                        "parameters"    : [],
                        "type"          : Operation.Types.procedure,
                        "value"         : "PUTINTEGER" 
                }
                this.procedure_table["PUTINTEGER"].parameters.push({
                        "key"           : "INT",
                        "type"          : "INTEGER",
                        "bound"         : 0,
                        "value"         : true
                });
                new_symbol = {
                        "type"          : "INTEGER",
                        "bound"         : 0,
                        "value"         : true
                }
                this.symbol_table["PUTINTEGER"] = {
                        ["INT"]         : new_symbol
                }
                //#endregion

                //#region -> putFloat(float value) : bool
                // Update the symbol table
                new_symbol = {
                        "type"          : "BOOL",
                        "bound"         : 0,
                        "value"         : true
                }
                this.symbol_table["global"]["PUTFLOAT"] = new_symbol;
                // Update the procedure table
                this.procedure_table["PUTFLOAT"] = {
                        "expression"    : [],
                        "operators"     : [],
                        "parameters"    : [],
                        "type"          : Operation.Types.procedure,
                        "value"         : "PUTFLOAT" 
                }
                this.procedure_table["PUTFLOAT"].parameters["FLT"] = {
                        "type"          : "FLOAT",
                        "bound"         : 0,
                        "value"         : true
                }
                new_symbol = {
                        "type"          : "FLOAT",
                        "bound"         : 0,
                        "value"         : true
                }
                this.symbol_table["PUTBOOL"] = {
                        ["FLT"]         : new_symbol
                }
                //#endregion

                //#region -> putString(string value) : bool
                // Update the symbol table
                new_symbol = {
                        "type"          : "BOOL",
                        "bound"         : 0,
                        "value"         : true
                }
                this.symbol_table["global"]["PUTSTRING"] = new_symbol;
                // Update the procedure table
                this.procedure_table["PUTSTRING"] = {
                        "expression"    : [],
                        "operators"     : [],
                        "parameters"    : [],
                        "type"          : Operation.Types.procedure,
                        "value"         : "PUTSTRING" 
                }
                this.procedure_table["PUTSTRING"].parameters["STR"] = {
                        "type"          : "STRING",
                        "bound"         : 0,
                        "value"         : true
                }
                new_symbol = {
                        "type"          : "STRING",
                        "bound"         : 0,
                        "value"         : true
                }
                this.symbol_table["PUTSTRING"] = {
                        ["STR"]         : new_symbol
                }
                //#endregion
                
                //#region -> sqrt (integer value) : float
                // Update the symbol table
                new_symbol = {
                        "type"          : "FLOAT",
                        "bound"         : 0,
                        "value"         : true
                }
                this.symbol_table["global"]["SQRT"] = new_symbol;
                // Update the procedure table
                this.procedure_table["SQRT"] = {
                        "expression"    : [],
                        "operators"     : [],
                        "parameters"    : [],
                        "type"          : Operation.Types.procedure,
                        "value"         : "SQRT" 
                }
                this.procedure_table["SQRT"].parameters.push({
                        "key"           : "INT",
                        "type"          : "INTEGER",
                        "bound"         : 0,
                        "value"         : true
                });
                new_symbol = {
                        "type"          : "INTEGER",
                        "bound"         : 0,
                        "value"         : true
                }
                this.symbol_table["SQRT"] = {
                        ["INT"]         : new_symbol
                }
                //#endregion

        };
        //#endregion

        //#region -> Token management
        getToken() {
                //#region -> Get the items in the tokens array
                let temp        = this.next;
                this.next       = this.tokens.shift();
                this.current    = temp;
                //#endregion
                
                //#region -> Check for end of tokens array
                if(typeof this.next == 'undefined' || this.current.type == "EOF") {
                        if(typeof this.current != 'undefined') {
                                this.eof = this.current.line;
                                this.next = {
                                        "type" : "EOF",
                                        "value": "EOF",
                                        "line" : this.eof
                                }
                        }
                        else {
                                this.next = {
                                        "type" : "EOF",
                                        "value": "EOF",
                                        "line" : this.eof
                                }
                                this.current = {
                                        "type" : "EOF",
                                        "value": "EOF",
                                        "line" : this.eof
                                }
                                return true;
                        }
                }
                return false;
                //#endregion
        }
        //#endregion       
        
}
class Code {
        constructor(program, symbols, procedures) {
                this.flag = false;
                this.code = [];
                if(messanger.flag) {
                        this.flag = true;
                        this.code.push("Errors Exist");
                }
        }

        generateCode() {
                if(this.flag) return true;

                // Write the beggining stuff that is needed, like fileio and what not



                return false;
        }
}

class Message {
        constructor() {
                // list of errors
                this.error_list = [];
                this.parser_list = [];
                this.message    = null;
                this.line       = null;
                this.flag       = false;
                this.token_list = null;

                // The entire program
                this.program    = {
                        "name"          : "El Stupido",
                        "variables"     : null,
                        "parser_ops"    : [],
                        "code"          : [],
                        "statements"    : null
                }

                // Something to contain everything.
                this.data = {
                        "error"         : null,
                        "list"          : null,
                        "program"       : null,
                        "tokens"        : null
                }
        }

        clearProgram() {
                // list of errors
                this.error_list = [];
                this.message    = null;
                this.line       = null;
                this.flag       = false;

                // The entire program
                this.program    = {
                        "name"          : "El Stupido",
                        "variables"     : null,
                        "parser_ops"    : [],
                        "code"          : [],
                        "statements"    : null
                }

                // Something to contain everything.
                this.data = {
                        "error"         : null,
                        "list"          : null,
                        "program"       : null,
                        "tokens"        : null
                }  
        }

        clear() {
                // list of errors
                this.programs   = [];
                this.error_list = [];
                this.message    = null;
                this.line       = null;
                this.flag       = false;

                // The entire program
                this.program    = {
                        "name"          : "El Stupido",
                        "variables"     : null,
                        "parser_ops"    : [],
                        "code"          : [],
                        "statements"    : null
                }

                // Something to contain everything.
                this.data = {
                        "error"         : null,
                        "list"          : null,
                        "program"       : null,
                        "tokens"        : null
                }  
        }

        // Updates the data
        updateData() {
                this.data.error = this.flag;
                this.data.list  = this.error_list;
                this.data.program = this.program;
                this.data.tokens = this.token_list;
        }

        // Modifies this.error_list with an error object
        putError() {
                this.flag = true;
                this.error_list.push({"msg" : this.message, "line" : this.line});
                return;
        }
}
var messanger = new Message();
/* Front expects:
        .data = the editor text
*/
onmessage = function(message) {
        // Just call the main
        main(message.data); 
}

function main(data) {
        //#region -> STEP 1: Clear the messanger 
        messanger.clear();
        //#endregion

        //#region -> STEP 2: Scan the input text 
        scanner.scanCode(data.value);    // Call the scanner to generate the tokens array.
        messanger.token_list = scanner.tokens;          // Update the messanger token list
        //#endregion

        //#region -> STEP 3: Parse the tokens
        let parser = new Parser(scanner.tokens.slice());// Initialize the parser
        parser.parseTokens();           // Parse the tokens
        messanger.program.name = parser.program.name;   
        messanger.program.parser_ops = parser.program;
        //#endregion

        //#region -> STEP 4: Generate code
        var generator = new Code(parser.program, parser.symbol_table, parser.procedure_table);
        generator.generateCode();                       // Generate the code
        messanger.program.code = generator.code;
        //#endregion

        //#region -> STEP 5: Make call to server for output

        //#endregion

        //#region -> STEP 6: Update the message and pass it back
        messanger.updateData();
        postMessage(messanger.data);
        //#endregion
        
        //parser.buildProgram();

        //messanger.updateData();
        return;
}




