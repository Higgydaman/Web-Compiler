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
                        else {
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

class Lexer {

        constructor () {
                this.token_current = null;
                this.token_next    = null;
                this.current       = null;
        }

        getToken() {
                // Increase the index
                this.index += 1;
                if((this.index + 1) >= scanner.tokens.length) {
                        this.next = {
                                "type" : "EOF",
                                "value": "EOF",
                                "line" : scanner.tokens[scanner.tokens.length - 1].line
                        }
                        if((this.index) >= scanner.tokens.length) {
                                this.current = {
                                        "type" : "EOF",
                                        "value": "EOF",
                                        "line" : scanner.tokens[scanner.tokens.length - 1].line
                                } 
                                return true;
                        }
                }
                else {
                        this.next    = scanner.tokens[this.index + 1];
                        this.current = scanner.tokens[this.index];
                        return false;
                }
        }

        markError(message) {
                
        }

        incrimentIndex() {
                if(this.index >= scanner.tokens.length - 1) {
                        return true;
                }
                else {
                        this.index++;
                        this.current = scanner.tokens[this.index];
                        if(this.index >= scanner.tokens.length - 1) {
                                this.next = {
                                        "type" : "EOF"
                                }
                        }
                        else {
                                this.next = scanner.tokens[this.index + 1]
                        }
                        return false;
                }
        }
}
var lexer = new Lexer();

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
                this.state = this.States.start;
                this.symbol_table = null;
                this.symbol_table = new Object();
                this.enum_count = 0;
                //#endregion                
        }

        //#region -> Public calls that will be made
        parseTokens() {
                //#region -> Make sure we are initialized, then set some globals
                if(!this.intialized) return true;       // Return TRUE for failure
                //#endregion
                
                //#region -> Get an operation
                if(this.getOperation("program")) return true;   // Call the operation function
                this.program.operations.push(this.operation);   // Update the program
                if(this.state == this.States.end) return false;
                //#endregion
                
                //#region -> Save off that operation
                //#endregion

                //#region -> End evaluation and continue
                return this.parseTokens();
                //#endregion
        
        }
        //#endregion

        //#region -> Operation management
        Operation = {
                Types : {
                        "start"         : 1,
                        "procedure"     : 2,
                        "assignment"    : 3,
                        "loop"          : 4,
                        "NA"            : 5,
                        "end"           : 6
                }
        }
        States = { // Used to drive the parse path
                "start"         : 1,
                "declaration"   : 2,
                "statement"     : 3,
                "end"           : 4
        }
        getOperation(scope){  
              //#region -> Gather operation
                this.operation = {
                        "type"       : null,
                        "key"        : null,
                        "value"      : null,
                        "name"       : null,
                        "expression" : null,
                        "operations" : [] 
                }
                switch(this.state) {
                        case this.States.start:
                        if(this.getStart()) return true;          // P&D TODO ERROR RECOVERY
                        this.program.name = this.operation.key;   // For the message back
                        this.state = this.States.declaration;     // Switch state
                        break;
                        case this.States.declaration:
                        if(this.getDeclaration(scope)) return true;// P&D TODO ERROR RECOVERY
                        if(this.state = this.States.statement) return this.getOperation(scope);
                        break;
                        case this.States.statement:
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
        }
        //#endregion

        //#region -> Parsing utilities
        getStart() {
                // Standard start
                if(this.getToken()) return true;
                this.operation.type = "start";

                // Check syntax
                if(this.current.value == "PROGRAM") {
                        if(this.getToken()) return true;
                        if(this.current.type == "IDEN" && this.next.value == "IS") { 
                                this.operation.key = this.current.value;
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

        }
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
                        else {
                                this.postError("Expected keyword VARIABLE for declaration.");
                                return true; 
                        }

                        //#endregion
                        
                        //#region -> START
                        case "STRT":
                                if(this.current.value == "BEGIN") {
                                        this.state = this.States.statement;
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
        }
        // parseStatements
        getStatement(scope) {
                
                if(this.getToken()) return true;

                switch(this.current.type) {
                        //#region -> CONDITION
                        case "COND":
                                // Make sure we are at the start
                                if(lexer.current.value == "IF") {
                                        if(this.parseIf(scope)) return true; 
                                        if(lexer.next.value != ";") {
                                                lexer.markError("Expected end of line character ; .");
                                                return true;   
                                        }
                                        if(lexer.getToken()) return true;
                                }
                                else {
                                        lexer.markError("Unexpected argument " + lexer.current.value + ".");
                                        return true;    // P&D for now 
                                }

                        // Beat it
                        break;
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
                                if(this.current.value == ":") {

                                        // Advance the token, we know where we are
                                        if(this.getToken()) return true;

                                        // next token expected
                                        if(this.current.value == "=") {

                                                if(this.existsGlobally(this.current_identifier) || this.existsLocally(scope, this.current_identifier)) {
                                                        if(this.postExpression(scope)) return true;
                                                        this.operation.type = "assignment";
                                                        this.operation.expression = this.expression_result;
                                                        if(this.expression_result.length != 0) {
                                                                // scoping
                                                                let temp_scope = scope;
                                                                if(this.existsGlobally(this.current_identifier)) temp_scope = "global";
                                                                this.symbol_table[temp_scope][this.current_identifier].value = true;
                                                                
                                                                // Do some type checking
                                                                let x_type = this.symbol_table[temp_scope][this.current_identifier].type;
                                                                let y_type = this.expression_result[this.expression_result.length - 1].type;
                                                                if((x_type == y_type) || ((x_type == "FLOAT" || x_type == "INTEGER" || x_type == "BOOL") && 
                                                                (y_type == "FLOAT" || y_type == "INTEGER" || y_type == "BOOL"))) {
                                                                        if(this.current.value == ";") {
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
                                                                                for(let i in this.expression_result) {
                                                                                        if(this.expression_result[i].value == "IDEN") {
                                                                                                 if(this.expression_result[i].index == -1) {
                                                                                                         if(this.symbol_table[temp_scope][this.current_identifier].bound != this.expression_result[i].bound) {
                                                                                                                 this.postError("Array bounds must match for assignment.");
                                                                                                                 return true;
                                                                                                         }
                                                                                                         if(this.current_index != -1) {
                                                                                                                this.postError("Single array value cannot contain entire other array.");
                                                                                                                return true;
                                                                                                         }
                                                                                                 }
                                                                                        }
                                                                                }
                                                                                this.operation.expression = this.expression_result;
                                                                                this.operation.value = argument;
                                                                                return false;
                                                                        }
                                                                        else {
                                                                                this.postError("Expected end of line character ; .");
                                                                                return true;
                                                                        }
                                                                }
                                                                else {
                                                                        this.postError("Unable to assign type " + y_type + " to type " + x_type + ".");
                                                                        return true;
                                                                }
                                                        }
                                                        else {
                                                                this.postError("Expected an expression to assign to variable " + this.current_identifier +".");
                                                                return true;
                                                        }
                                                }
                                                else {
                                                        this.postError("Variable has not been declared locally or globally.");
                                                        return true;    // P&D for now  
                                                }
                                        }
                                        else {
                                                this.postError("Expected = .");
                                                return true;    // P&D for now  
                                        }
                                }
                                else {
                                        this.postError("Expected := .");
                                        return true;    // P&D for now
                                }
                        //#endregion
                        
                        //#region -> END
                        case "END":
                        if(this.next.value == "PROGRAM") {
                                if(this.getToken()) return true;
                                if(this.next.value == ".") {
                                        if(this.getToken()) return true;
                                        this.state = this.States.end;
                                        this.operation.type = "end program";
                                        return false;
                                }
                                else {
                                        this.postError("Expected period to end the program.");
                                        return true;
                                }
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
        }
        postExpression(scope) {
                // Some things we need to keep track of
                this.return_type = null;        // Used for the caller to check upon assignment
                this.expression_result = [];     // Used for the caller to assign wherever
                let gathering = true;           // Used for token gathering
                let argument_list = [];         // Token list generated for the expression

                // Gether all the applicable tokens first
                while(gathering) {
                        if(this.getToken()) return true;
                        let argument = null;
                        switch(this.current.type) {
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
                                        gathering = false;
                                }
                                break;
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
                                        argument = {
                                                "type"  : "AROP",
                                                "value" : "-"
                                        }
                                        argument_list.push(argument);
                                        break;
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
                                case "IDEN":
                                if(this.existsGlobally(this.current.value) || this.existsLocally(scope, this.current.value)) {
                                        // So first off, lets see if it has been assigned a value
                                        let temp_scope = scope;
                                        if(this.existsGlobally(this.current.value)) temp_scope = "global";
                                        if(this.symbol_table[temp_scope][this.current.value].value != false) {
                                                argument = {
                                                        "key"   : this.current.value,
                                                        "type"  : this.symbol_table[temp_scope][this.current.value].type,
                                                        "value" : "IDEN",
                                                        "index" : 0,
                                                        "bound" : this.symbol_table[temp_scope][this.current.value].bound
                                                }
                                                let index = false;
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
                                        }
                                        else {
                                                this.postError("Variable does not have an assigned value.");
                                                return true;
                                        }
                                }
                                else {
                                        this.postError("Variable does not exist locally or globally.");
                                        return true;
                                }
                                break;
                                case "STRG":
                                argument = {
                                        "type"  : "STRING",
                                        "value" : this.current.value
                                }
                                argument_list.push(argument);
                                break;
                                case "INTEGER":
                                argument = {
                                        "type"  : "INTEGER",
                                        "value" : this.current.value
                                }
                                argument_list.push(argument);
                                break;
                                case "FLOAT":
                                argument = {
                                        "type"  : "FLOAT",
                                        "value" : this.current.value
                                }
                                argument_list.push(argument);
                                break;
                                case "RLOP":
                                case "EXOP":
                                argument = {
                                        "type"  : this.current.type,
                                        "value" : this.current.value
                                }
                                argument_list.push(argument);
                                break;
                                // TODO Include another expression call and a procedure call
                                default:
                                // End of expression gathering
                                gathering = false;
                                break;
                        }
                }

                // Start the expression 
                if(argument_list.length != 0) {
                        if(argument_list.length == 0) return false; // Return
                        // Some stuff for the getExpression call
                        if(this.getExpression(scope, argument_list)) return true;
                        return false;
                }
                else return false;

        }
        getExpression(scope, argument_list) {
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
                                if(!(x.type == "INTEGER" || x.type == "BOOL" || x.type == "FLOAT") 
                                || !(y.type == "INTEGER" || y.type == "BOOL" || y.type == "FLOAT")) {
                                        this.postError("Invalid variable type on operation " + temp.value + ".");
                                        return true;
                                }
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
                                if(!(x.type == "INTEGER" || x.type == "BOOL" || x.type == "FLOAT") 
                                || !(y.type == "INTEGER" || y.type == "BOOL" || y.type == "FLOAT")) {
                                        this.postError("Invalid variable type on operation " + temp.value + ".");
                                        return true;
                                }
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
        }
        getSymbol(scope, variable ) {
                
                // Clear
                this.symbol = null;

                // Check the ol tables
                if(this.checkTables(variable, scope, true)) return true;

                // Assign 
                if(this.isGlobal) this.symbol = this.symbol_table["global"][variable];
                else if(this.isLocal) this.symbol = this.symbol_table[scope][variable];
                else {
                        this.postError("Varibale " + variable + " does not exist within scope.")
                }

                // Return!
                return false;
        }
        postError(message) {
                messanger.message = message;
                messanger.line = this.current.line;
                messanger.putError();
                console.log("Error dump.");
                console.log(this.current);
                console.log(this.next);
                console.log(this.state);
                console.log(this.symbol_table);
        }
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

                // TODO accept arrays
                this.operation.type = this.Operation.Types.NA;
                // Party on Garth
                return false;
        }
        // Store a value within the table
        updateSymbol(scope, keyword, new_symbol) {
                let temp_scope = null;
                // Check the tables
                this.wanted = true;
                if(this.checkTables(scope, keyword)) return true;
                
                // IF global, use ... global
                if(this.isGlobal) temp_scope = "global";
                else if(this.isLocal) temp_scope = scope;
                else {
                        this.postError("Parameter is undefined " + keyword + ".");
                        return true;
                }
                // Do the type check
                let type_a = this.symbol_table[temp_scope][keyword].type;
                let type_b = new_symbol.type;
                if(type_a != type_b) {
                        if((type_a == "INTEGER" || type_a == "FLOAT" || type_a == "BOOL") 
                        && (type_b == "INTEGER" || type_b == "FLOAT" || type_b == "BOOL")) {
                                if(type_a == "BOOL" || type_b == "BOOL") {
                                        new_symbol.type = "INTEGER";
                                }
                        }
                        else {
                                this.postError("Type " + type_a + " and " + type_b + " are incompatible.");
                                return true;
                        } 
                }
                return false;
        }
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
                        lexer.markError("Expected type mark.");
                        return true;
                }
        }
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
        }
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
        }
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

        }
        // postEnum(scope, name) {

        // }
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
        
        //#region TODO
        buildProgram() {
                // Just to get started
                lexer.index             = 0;
                lexer.current           = null;
                lexer.next              = null;
                this.master_statements  = new Object();
                this.master_symbol_table= new Object();
                this.global_symbol_table= new Object();
                this.symbol_table       = new Object();
                this.scope              = null; 
                this.switchState("program_start");
                if(scanner.tokens.length > 1) {
                        lexer.current  = scanner.tokens[0];
                        lexer.next =  scanner.tokens[1];
                }
                else {
                        return true;
                }
                // Call the main parser
                this.parseProgramMain();
                messanger.program.variables = this.master_symbol_table;

        }

        // parseProgram
        parseProgramMain() {
                while(1) {
                        // Test for the end of the program
                        if(this.program_state == "program_end") {
                                lexer.markError("Unexpected input after program end.");
                                return true;
                        }

                        // Switch on the current type
                        switch(lexer.current.type) {
                                // Some statement types
                                case "COND":
                                case "IDEN":
                                // If we are not in the global statement state, error out
                                if(this.program_state != "global_statement") {
                                        lexer.markError("Unexepected statement before BEGIN keyword.");
                                        return true;    // P&D for now 
                                }
                                if(parseStatement(this.scope)) return true; // P&D for now
                                break;
                                
                                case "PRGM":
                                if(lexer.next.type == "IDEN") {
                                        // Update the tokens.
                                        if(lexer.getToken()) return true;
                                        if(this.buildProgramHead()) return true;    // P&D for now      // TODO: call error recovery here
                                }
                                else {
                                        lexer.markError("Expected program identifier.");
                                        return true;    // P&D for now
                                }
                                break;

                                case "END":
                                if(this.program_state == "global_statement") {
                                        if(lexer.next.type == "PRGM") {
                                                this.switchState("program_end");
                                                // Update the messenger
                                                messanger.program.variables = this.master_symbol_table;
                                                return false;
                                        }
                                        else {
                                                lexer.markError("Expected keyword PROGRAM.");
                                                return true;    // P&D for now
                                        }        
                                }
                                else {
                                        lexer.markError("Unexpected END keyword within global scope.");
                                        return true;    // P&D for now
                                }

                                case "ENDP":
                                if(this.program_state == "end_of_program") {
                                        return false;
                                }
                                else {
                                        lexer.markError("Unexpected period within global scope.");
                                        return true;    // P&D for now
                                }

                                case "EOF":
                                lexer.markError("Expected period within global scope.");
                                return true;    // P&D for now

                                default:
                                lexer.markError("Unexpected input " + lexer.current.value + ".");
                                return true;
                        }
                }
        }

        // parseDeclaration
        parseDeclaration(scope) {
                // This function collects a single statement so the caller can control the exit statement
                // messanger.program.parser_ops.push("BEGIN -> PARSING STATEMENT.");
                switch(lexer.next.type) {
                        case "DECN":
                        break;

                }
        }

        // Parse an IF statement
        parseIf(scope) {
                let path = null;
                // See if the statement is true
                if(lexer.next.value == "(") {
                        messanger.program.parser_ops.push("BEGIN -> IF STATEMENT EVALUATION.");
                        if(this.evaluateExpression(false,null,scope)) return true;
                        if(typeof this.expression_result != 'undefined' && this.expression_result != null) {
                                messanger.program.parser_ops.push("VALUE -> IF STATEMENT EXPRESSION: " + this.expression_result.value);
                                
                                if(this.expression_result.value != 0) {
                                        messanger.program.parser_ops.push("DECISION -> IF STATEMENT TRUE.");
                                        path = 1;
                                }
                                else {
                                        messanger.program.parser_ops.push("DECISION -> IF STATEMENT FALSE.");
                                        path = 0;
                                } 
                        }
                        else {
                                lexer.markError("Expected an expression within IF statement.");
                                return true;
                        }
                        // Code gen
                }
                else {
                        lexer.markError("Expected expression with IF.");
                        return true;
                }


                // IF it is true, parse statements within the THEN
                if(lexer.current.value == "THEN") {
                        if(!path) {
                                messanger.program.parser_ops.push("DECISION -> SKIPPING ALL STATEMENTS AFTER THEN.");
                                while(lexer.next.value != "END" && lexer.next.value != "ELSE" && lexer.next.value != ";") {
                                        if(lexer.getToken()) return true;
                                }
                        }
                        else {
                                messanger.program.parser_ops.push("DECISION -> PROCESSING STATEMENTS AFTER THEN.");
                                while(lexer.current.value != "END" && lexer.current.value != "ELSE") {
                                        if(this.parseStatement(scope)) return true;
                                } 
                        }
                }
                else {
                        lexer.markError("Expected THEN keyword before statements.");
                        return true;
                }

                // IF is is false, see if there is an else
                if(lexer.next.value == "ELSE") {
                        if(path) {
                                messanger.program.parser_ops.push("DECISION -> SKIPPING ALL STATEMENTS AFTER ELSE.");
                                while(lexer.next.value != "END" && lexer.next.value != ";") {
                                        if(lexer.getToken()) return true;
                                } 
                        }
                        else {
                                messanger.program.parser_ops.push("DECISION -> PROCESSING ALL STATEMENTS AFTER ELSE.");
                                while(lexer.next.value != "END" && lexer.next.value != ";") {
                                        if(lexer.getToken()) return true;
                                }
                        } 
                }

                // Check for END IF
                if(lexer.next.value == "END") {
                        if(lexer.getToken()) return true;
                        if(lexer.next.value == "IF") {
                                messanger.program.parser_ops.push("COMPLETE -> IF STATEMENT EVALUATION.");
                                if(lexer.getToken()) return true;
                                return false;
                        }
                }

                // They did not end
                lexer.markError("Expected END IF.");
                return true;
        }

        // Set Expression
        setAssignment(scope) {
                // Pre-evaluation shit
                var temp_val = null;    // Temporary value to build on

                // Evaluate what types we can have
                switch(lexer.next.type) {

                        // Case NUMBER
                        case "AROP":
                        case "FLOAT":
                        case "INTEGER":
                        // Incriment the token flow
                        if(lexer.getToken()) return true;

                        // Check for the + or -
                        var sign = null;
                        if(lexer.current.type == "AROP") {
                                // Incriment the token flow
                                if(lexer.getToken()) return true;
                                if(lexer.current.value == "+") {
                                        sign = 1;
                                        
                                }
                                else if(lexer.current.value == "-") {
                                        sign = -1;
                                }
                                else {
                                        lexer.markError("Unexpected arithmatic operator.");
                                        return true;
                                }
                        }
                        else {
                                sign = 1;
                        }
                        
                        // Grab the number
                        if(lexer.current.type == "FLOAT" || lexer.current.type == "INTEGER") {
                                // Set the current type
                                this.current_type_assignment = lexer.current.type;
                                temp_val = sign*lexer.current.value;
                        }
                        else {
                                lexer.markError("Expected number.");
                                return true;
                        }

                        break;

                        // Case STRING
                        case "STRG":
 
                        this.current_type_assignment = "STRING";
                        // Incriment the token flow
                        if(lexer.getToken()) return true;
                        temp_val = lexer.current.value;

                        break;

                        // Case IDENTIFIER
                        case "IDEN":
                        // Incriment the token flow
                        if(lexer.getToken()) return true;

                        // Is it a TRUE keyword?
                        if(lexer.current.value == "TRUE") {
                                temp_val = 1;
                                this.current_type_assignment = "INTEGER";
                        }

                        // Is it a FALSE keyword?
                        else if(lexer.current.value == "FALSE") {
                                temp_val = 0;
                                this.current_type_assignment = "INTEGER";
                        }

                        // ELSE it is assummed an identifier
                        else {

                                // Check if the variable exists within the global scope
                                if(this.checkTables(lexer.current.value, scope, true)) return true;

                                // Grab the correct table symbol
                                var symbol = null;
                                if(this.isGlobal) {
                                     symbol = this.master_symbol_table["GLOBAL"][lexer.current.value]; 
                                }
                                else if(this.isLocal) {
                                     symbol = this.master_symbol_table[scope][lexer.current.value];   
                                }
                                else {
                                        lexer.markError("INTERNAL ERROR.");
                                        return true;
                                }
                                // If the symbol is a bool, lets convert
                                if(symbol.type == "BOOL") {
                                        
                                        // Set the current type to integer
                                        this.current_type_assignment = "INTEGER";

                                        // TRUE case
                                        if(symbol.value == "TRUE") {
                                                temp_val = 1;
                                        }

                                        // FALSE case
                                        else if(symbol.value == "TRUE") {
                                                temp_val = 0;
                                        }

                                        // ERROR
                                        else {
                                                lexer.markError("Variable does not have a value.");
                                                return true;
                                        }
                                }
                                // Else just inherit
                                else {
                                        this.current_type_assignment = symbol.type;
                                        temp_val = symbol.value;
                                }
                        }
                        break;
                        default:
                        lexer.markError("Unexpected assignment.");
                        return true;
                }
                
                switch(this.state_assignment) {
                        case "DIRECT":
                        if(temp_val != null) {
                                this.temp_assignment = temp_val;
                                this.previous_type_assignment = this.current_type_assignment;
                        }
                        else {
                                lexer.markError("Unexpected input within assignment statement.");
                                return true;   
                        }
                        break;

                        case "MULTIPLY":
                        case "DIVIDE":
                        case "ADD":
                        case "SUBTRACT":
                        if(this.temp_assignment == null || temp_val == null) {
                                lexer.markError("Expected a number before multiplying or dividing.");
                                return true;
                        }

                        // No, you cannot multiply with a string
                        if(this.current_type_assignment == "STRING") {
                                lexer.markError("What the fuck did you expect to happen?");
                                return true;
                        }

                        if(this.state_assignment == "MULTIPLY") {
                                this.temp_assignment = this.temp_assignment * temp_val;
                        }
                        else if(this.state_assignment == "ADD") {
                                this.temp_assignment = this.temp_assignment + temp_val;
                        }
                        else if(this.state_assignment == "SUBTRACT") {
                                this.temp_assignment = this.temp_assignment - temp_val;
                        }
                        else {
                                this.temp_assignment = this.temp_assignment / temp_val;
                        }

                        break;
                        default:
                        lexer.markError("Internal error.");
                        return true;
                }

                // Check for array member
                if(lexer.next.value == '[') {
                        // TODO array stuff
                        while(lexer.current.value != ']') {
                                if(lexer.getToken()) return true;
                        }
                }

                // Check if the next is the end
                switch(lexer.next.value) {
                        case ";":
                        return false;
                        case "*":
                        this.state_assignment = "MULTIPLY";
                        if(lexer.getToken()) return true;
                        if(this.setAssignment(scope)) return true;
                        break;
                        case "/":
                        this.state_assignment = "DIVIDE";
                        if(lexer.getToken()) return true;
                        if(this.setAssignment(scope)) return true;
                        break;
                        case "+":
                        this.state_assignment = "ADD";
                        if(lexer.getToken()) return true;
                        if(this.setAssignment(scope)) return true;
                        break;
                        case "-":
                        this.state_assignment = "SUBTRACT";
                        if(lexer.getToken()) return true;
                        if(this.setAssignment(scope)) return true;
                        break;
                        default:
                        lexer.markError("Expected endline character ; .");
                        return true;
                }
        }
        
        // Set type
        setType(scope, name) {
                if(lexer.current.value != "TYPE") {
                        lexer.markError("Expected keyword TYPE.");
                        return true;  
                }

                if(lexer.next.type == "IDEN") {
                        
                        if(lexer.getToken()) return true;

                        if(this.checkTables(lexer.current.value,scope, true)) return true;

                        // Update the type
                        this.current_identifier = lexer.current.value;
                        if(lexer.next.value == ":") {
                                if(lexer.getToken()) return true;
                                // Assign the temporary symbol table
                                if(this.current_scope_isGlobal) this.temp_symbol_table = this.master_symbol_table["GLOBAL"];
                                else this.temp_symbol_table = this.master_symbol_table[scope];
                                if(this.storeTypemark(scope, this.current_identifier)) return true;
                                if(lexer.next.value == ";") {
                                        if(lexer.getToken()) return true;
                                        this.master_symbol_table[scope] = this.temp_symbol_table;
                                        return false;
                                }
                                else {
                                        lexer.markError("Expected end of line.");
                                        return true;
                                }
                        }
                        else {
                                lexer.markError("Expected keyword : .");
                                return true;   
                        }
                }
                else {
                        lexer.markError("Expected keyword TYPE.");
                        return true;
                }
        }

        // Store the optional bound
        storeBound(scope, name) {
                
                // Yay
                if(lexer.next.value != "[") {
                        lexer.markError("Expected type mark.");
                        return true;
                }

                // Incriment the token
                if(lexer.getToken()) return true;

                switch(lexer.next.type) {
                        case "INTEGER":
                        if(lexer.getToken()) return true;
                        
                        if(lexer.current.value <= 0) {
                                lexer.markError("Bound must be an integer greater than 0. I mean just think about it before you type.");
                                return true;
                        }

                        if(lexer.next.value == "]") {
                                this.master_symbol_table[scope][name].bound = lexer.current.value;
                                if(lexer.getToken()) return true;
                                return false;
                        }
                        else {
                                lexer.markError("Unbalanced brackets in variable bound.");
                                return true;
                        }
                        default:
                        lexer.markError("Array bound must be a positive integer greater than 0.");
                        return true;
                }                
        }

        // Store the Enum
        storeEnum(scope, name) {
                var list = [];
                if(lexer.current.value != "{") {
                        lexer.markError("Expected opening { for enum list.");
                        return true;
                }
                else if(lexer.getToken()) return true;
                while(lexer.current.value != "}") {
                        if(lexer.current.type == "IDEN") {
                                list.push(lexer.current.value);
                                if(lexer.next.value == ",") {
                                        if(lexer.getToken()) return true;
                                }
                        }
                        else {
                                lexer.markError("Unexpected arguement within enum list.");
                                return true;   
                        }
                        if(lexer.getToken()) return true;
                }
                this.master_symbol_table[scope][name].enum_list = list;
                return false;
        }

        // Wrap the program up
        buildProgramEnd() {
                if(lexer.current.type == "PRGM" && lexer.next.value == ".") {
                        if(lexer.getToken()) return true;
                        messanger.program.parser_ops.push("COMPLETE -> PARSE PROGRAM.");
                        return false;
                }
                else {
                        lexer.markError("Expected period to end program.");
                        return true;
                }
        }

        switchState(state) {
                /* Possible states:
                global_declaration
                global_statement
                program_end
                */
                this.program_state = state                                      // Switch the state
                messanger.program.parser_ops.push("SWITCH -> STATE: " + state.toUpperCase() + ".");
        }

        //#endregion
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

        putName(name) {
                return;
        }

        putDeclaration(declaration) {
                return;
        }

        putStatement(statement) {
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
        let scanner_fail = null;                        // Declare variable to track if the scanner was successfull.
        scanner_fail = scanner.scanCode(data.value);    // Call the scanner to generate the tokens array.
        if(scanner_fail) messanger.flag = true;         // IF the scanner shits out, update messanger flag 
        messanger.token_list = scanner.tokens;          // Update the messanger token list
        //#endregion

        //#region -> STEP 3: Parse the tokens
        let parser = new Parser(scanner.tokens.slice());// Initialize the parser
        let parser_fail = false;                        // Variable to track parser failure
        if(parser.parseTokens()) parser_fail = true;    // Parse the tokens
        if(parser_fail) console.log("Parser ended in error.");
        else console.log("Parser ended successfully.");
        messanger.program.name = parser.program.name;
        //#endregion

        //#region -> STEP 4: Generate code

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




