'use strict'

class Scanner {

        constructor() {
                this.lexeme = null;
                this.program_state = null;
                this.body_declaration = false;
        }

        update(data) {
                // See if it was a bulk update

                this.body_declaration = false;
                this.details = data.details;
                this.code = data.value;
                messanger.clear();
                this.scanCode();
                messanger.token_list = this.lexeme_list;
        }

        markError(message) {
                messanger.message = message;
                messanger.line = this.current.line;
                messanger.putError();
                if(this.recover()) return true;
                return false;
        }

        // Scans the input text and creates an extremely low-level lexeme list.
        scanCode() {
                // Declare the pre-init stuff
                
                this.eof = this.code.length - 1;
                this.index = -1;
                this.line_number = 0;
                this.lexeme_list = [];
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
                                this.lexeme_list.push(this.lexeme);
                        }
                        else if(!EOF) {} // TODO
                }
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
                        this.current = this.lexeme_list[this.index];
                        if(this.index != 0) this.next = this.lexeme_list[this.index - 1];
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
                        if(this.next) {
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
                                        this.value = this.key;
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
                this.index         = -1;
                this.token_current = null;
                this.token_next    = null; 
        }

        getToken() {

                // End of file check
                if(this.incrimentIndex()) {
                        this.current = {
                                "type" : "EOF"
                        }

                        this.next = {
                                "type" : "EOF"
                        }

                        return true;
                }

                this.token_current = {
                        "type" : this.current.type,
                        "value": this.current.value
                }

                // Pass the current LEXEME
                if(this.next.type != "EOF") {
                        this.next = {
                                "type" : this.next.type,
                                "value": this.next.value
                        } 
                }
                
                
                return false;
        }

        markError(message) {
                messanger.message = message;
                messanger.line = this.current.line;
                messanger.putError();
        }

        incrimentIndex() {
                if(this.index >= scanner.lexeme_list.length - 1) {
                        return true;
                }
                else {
                        this.index++;
                        this.current = scanner.lexeme_list[this.index];
                        if(this.index >= scanner.lexeme_list.length - 1) {
                                this.token_next = {
                                        "type" : "EOF"
                                }
                        }
                        else {
                                this.next = scanner.lexeme_list[this.index + 1]
                        }
                        return false;
                }
        }
}
var lexer = new Lexer();

class Parser {

        // Build Program
        buildProgram() {
                lexer.index             = -1;
                lexer.current           = null;
                lexer.next              = null;
                this.master_statements  = new Object();
                this.master_symbol_table= new Object();
                this.global_symbol_table= new Object();
                this.symbol_table       = new Object();
                this.scope              = null;
                this.switchState("program_start");
                
                while(1) {
                        // Advance the token flow
                        if(lexer.getToken()) return true;

                        // Test for the end of the program
                        if(this.program_state == "program_end") {
                                lexer.markError("Unexpected input after progrqam end.");
                        }

                        // Switch on the current type
                        switch(lexer.current.type) {

                                case "COND":
                                if(this.program_state != "global_statement") {
                                        lexer.markError("Unexepected statement before BEGIN keyword.");
                                        return true;    // P&D for now 
                                }

                                // Make sure we are at the start
                                if(lexer.current.value == "IF") {
                                        if(this.parseIf()) return true; // P&D for now
                                        
                                        if(lexer.next.value != ";") {
                                                lexer.markError("Expected end of line character ; .");
                                                return true;    // P&D for now
                                        }

                                        if(lexer.getToken()) return true;
                                }
                                else {
                                        lexer.markError("Unexpected argument " + lexer.current.value + ".");
                                        return true;    // P&D for now 
                                }
                                break;
                                
                                // IDENTIFIER case, mostly assignment statements
                                case "IDEN":
                                // If we are not in the global statement state, error out
                                if(this.program_state != "global_statement") {
                                        lexer.markError("Unexepected statement before BEGIN keyword.");
                                        return true;    // P&D for now 
                                }

                                // Set the global variable false for now
                                this.current_identifier = lexer.current.value;  // This is used for table entrys
                                this.scope = messanger.program.name;            // This is used for table selection

                                // This is the case that there is a statement in front of the assignment statement, I really dont know what the fuck it is used for
                                if(lexer.next.value == "[") {
                                        // TODO array stuff
                                        while(lexer.current.value != ']') {
                                                if(lexer.getToken()) return true;
                                        } 
                                }

                                // This is the main test for assignment statement
                                if(lexer.next.value == ":") {
                                        // Advance the token, we know where we are
                                        if(lexer.getToken()) return true;

                                        // next token expected
                                        if(lexer.next.value == "=") {
                                                // Advance the token, we know where we are
                                                if(lexer.getToken()) return true;
                                                
                                                // Main call to generate the assignment
                                                if(this.evaluateExpression(false,null)) return true;

                                                // Store the expression
                                                if(this.storeSymbol(this.current_identifier,this.expression_result,this.scope)) return true;

                                                // Check for the end
                                                if(lexer.current.value != ";") {    
                                                        lexer.markError("Expected end of line character ; .");
                                                        return true;    // P&D for now           
                                                }
                                        }
                                        else {
                                                lexer.markError("Expected = .");
                                                return true;    // P&D for now  
                                        }
                                }
                                else {
                                        lexer.markError("Expected := .");
                                        return true;    // P&D for now
                                }

                                break;
                                
                                case "DECN":
                                // Set the global variable false for now
                                this.current_scope_isGlobal = false;
                                this.scope = messanger.program.name;
                                if(this.program_state == "global_declaration") {
                                        // Check if global scope 
                                        if(lexer.current.value == "GLOBAL") {
                                                this.current_scope_isGlobal = true;
                                                if(lexer.getToken()) return true; // P&D for now
                                        }

                                        if(lexer.current.value == "VARIABLE") {
                                                if(this.storeVariable()) return true; // P&D for now
                                        }
                                        else if(lexer.current.value == "TYPE") {
                                                if(this.setType()) return true;
                                        }
                                        else {
                                                lexer.markError("Unexpected declaration type.");
                                                return true; // P&D for now
                                        }

                                        this.master_symbol_table[this.scope] = this.symbol_table;
                                        this.master_symbol_table["GLOBAL"] = this.global_symbol_table;
                                }
                                else {
                                        lexer.markError("Unexpected declaration after BEGIN keyword.");
                                        return true;    // P&D for now
                                }
                                break;
                                
                                case "PRGM":
                                if(lexer.next.type == "IDEN") {
                                        // Update the tokens.
                                        if(lexer.getToken()) return true;
                                        if(this.buildProgramHead()) return true;    // P&D for now      // TODO: call error recovery here
                                        break;
                                }
                                else {
                                        lexer.markError("Expected program identifier.");
                                        return true;    // P&D for now
                                }

                                case "STRT":
                                if(this.program_state == "global_declaration") {
                                        this.switchState("global_statement");
                                }
                                else {
                                        lexer.markError("Unexpected BEGIN keyword within global scope.");
                                        return true;    // P&D for now
                                }
                                break;

                                case "END":
                                if(this.program_state == "global_statement") {
                                        if(lexer.next.type == "PRGM") {
                                                this.switchState("program_end");
                                                if(lexer.getToken()) return true;
                                                if(this.buildProgramEnd()) return true;    // P&D for now      // TODO: call error recovery here
                                                else {
                                                        // Update the messenger
                                                        this.master_symbol_table["GLOBAL"] = this.global_symbol_table;
                                                        messanger.program.variables = this.master_symbol_table;
                                                        return false;
                                                }
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
                                break;

                                case "ENDP":
                                if(this.program_state == "end_of_program") {
                                        if(lexer.next.type == "EOF") {
                                                return false;
                                        }
                                }
                                else {
                                        lexer.markError("Unexpected period within global scope.");
                                        return true;    // P&D for now
                                }
                                break;

                                case "EOF":
                                lexer.markError("Expected period within global scope.");
                                return true;    // P&D for now

                                default:
                                lexer.markError("Unexpected input " + lexer.current.value + ".");
                                return true;
                        }
                }

        }

        // Store a value within the table
        storeSymbol(keyword, new_symbol, scope) {
                let temp_scope = null;
                // Check the tables
                if(this.checkTables(keyword, scope)) return true;
                // IF global, use ... global
                if(this.isGlobal) temp_scope = "GLOBAL";
                else if(this.isLocal) temp_scope = scope;
                else {
                        lexer.markError("Parameter is undefined " + keyword + ".");
                        return true;
                }
                // Do the type check
                let type_a = this.master_symbol_table[temp_scope][keyword].type;
                let type_b = new_symbol.type;
                if(type_a != type_b) {
                        if((type_a == "INTEGER" || type_a == "FLOAT" || type_a == "BOOL") 
                        && (type_b == "INTEGER" || type_b == "FLOAT" || type_b == "BOOL")) {
                                if(type_a == "BOOL" || type_b == "BOOL") {
                                        new_symbol.type = "INTEGER";
                                }
                        }
                        else {
                                lexer.markError("Type " + type_a + " and " + type_b + " are incompatible.");
                                return true;
                        } 
                }
                // Now assign the value
                this.master_symbol_table[temp_scope][keyword].type = new_symbol.type;
                this.master_symbol_table[temp_scope][keyword].value = new_symbol.value;
                return false;
        }

        // Parse an IF statement
        parseIf() {
                // See if the statement is true
                if(lexer.next.value == "(") {
                        if(this.evaluateExpression(false,null)) return true;
                        if(lexer.next.value != ")") {
                                lexer.markError("Expected ending bracket in expression.");
                                return true;
                        }
                        if(lexer.getToken())  return true;
                }
                else {
                        lexer.markError("Expected expression with IF.");
                        return true;
                }


                // IF it is true, parse statements within the THEN
                if(lexer.next.value == "THEN") {
                        while(lexer.next.value != "END" || lexer.current.value != "ELSE") {
                                if(lexer.getToken()) return true;
                        }
                }
                else {
                        lexer.markError("Expected THEN keyword before statements.");
                        return true;
                }

                // IF is is false, see if there is an else
                if(lexer.next.value == "ELSE") {
                        while(lexer.next.value != "END") {
                                if(lexer.getToken()) return true;
                        }  
                }

                // Check for END IF
                if(lexer.next.value == "END") {
                        if(lexer.getToken()) return true;
                        if(lexer.next.value == "IF") {
                                if(lexer.getToken()) return true;
                                return false;
                        }
                }

                // They did not end
                lexer.markError("Expected END IF.");
                return true;
        }

        // Evaluate Expression
        evaluateExpression(short, list) {
                // Before we make the call we need to do this shit
                var argument_list = [];             // Something to store everything in
                var argument = null;
                var result = null;                  // Something to pass back
                var gathering = true;
                if(short) gathering = false;        // Gives the option to skip alot
                // Lets make a decision on what we are about to collect
                while(gathering) {
                        if(lexer.getToken()) return true;
                        argument = null;
                        switch(lexer.current.type) {
                                case "BRKT":
                                if(lexer.current.value == "(") {
                                        argument = {
                                                "type"  : "BRKT",
                                                "value" : "("
                                        }
                                        argument_list.push(argument);
                                        break;
                                }
                                else if(lexer.current.value == ")") {
                                        argument = {
                                                "type"  : "BRKT",
                                                "value" : ")"
                                        }
                                        argument_list.push(argument);
                                        break;
                                }
                                else {
                                        lexer.markError("Unexpected bracket type " + lexer.current.value + ".");
                                        gathering = false;
                                }
                                break;
                                case "AROP":
                                switch(lexer.current.value) {
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
                                        lexer.markError("Unexpected arithmatic operator " + lexer.current.value + ".");
                                        gathering = false;
                                }
                                break;
                                case "IDEN":
                                if(this.getSymbol(lexer.current.value)) return true; // Get the symbol
                                argument = {
                                        "type"  : this.symbol.type,
                                        "value" : this.symbol.value
                                }
                                argument_list.push(argument);
                                break;
                                case "STRG":
                                if(lexer.getToken()) return true;
                                argument = {
                                        "type"  : "STRING",
                                        "value" : lexer.current.value
                                }
                                argument_list.push(argument);
                                break;
                                case "INTEGER":
                                argument = {
                                        "type"  : "INTEGER",
                                        "value" : lexer.current.value
                                }
                                argument_list.push(argument);
                                break;
                                case "FLOAT":
                                argument = {
                                        "type"  : "FLOAT",
                                        "value" : lexer.current.value
                                }
                                argument_list.push(argument);
                                break;
                                case "NOT":
                                argument = {
                                        "type"  : "NOT",
                                        "value" : -1
                                }
                                argument_list.push(argument);
                                break;
                                case "RLOP":
                                case "EXOP":
                                argument = {
                                        "type"  : lexer.current. type,
                                        "value" : lexer.current.value
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

                // Get the correct list
                if(short) argument_list = list;


                // Check the list out for length
                if(argument_list.length == 1) {
                        result = argument_list[0];
                        if(result != "undefined" && typeof result != 'undefined' && result != null) {
                                if(result.type == "INTEGER" || result.type == "FLOAT" || result.type == "BOOL" || result.type == "STRG") {
                                        this.expression_result = result;

                                        return false;
                                }
                                else {
                                        lexer.markError("Expression result is not wihtin type.");
                                        return true;
                                }
                        }
                        else {
                                lexer.markError("Internal error 0.");
                                return true;
                        }

                        
                }

                // Evaluate the expression
                if(argument_list != "undefined" && typeof argument_list != 'undefined' && argument_list != null) {

                        // Do inner expressions first
                        var temp_array = [];
                        var x_array = [];
                        var x = null;
                        var y = null;
                        var temp = null;
                        while(1) {
                                // Grab the next value
                                temp = argument_list.shift();
                                
                                // Check if it is time to quit
                                if(temp == "undefined" || typeof temp === 'undefined' || temp == null) break;
                                
                                // See if we have found a FACTOR
                                if(temp.value == "(") {
                                        // Grab everything before the operation
                                        temp = argument_list.shift();
                                        var bracket_count = 1;
                                        while(1) {
                                                x_array.push(temp);        
                                                temp = argument_list.shift();
                                                
                                                // Exit if dead
                                                if(temp == "undefined" || typeof temp === 'undefined' || temp == null) {
                                                        lexer.markError("Unbalanced parenthesis.");
                                                        return true;
                                                }

                                                // Check for a new open
                                                if(temp.value == "(") {
                                                        bracket_count = bracket_count + 1;
                                                }
                                                // Check close
                                                if(temp.value == ")") {
                                                        bracket_count = bracket_count - 1
                                                }

                                                // Break if done
                                                if(bracket_count == 0) break;
                                        }
                                        // Call thyself
                                        if(this.evaluateExpression(true,x_array)) return true;
                                        // Assign the new value
                                        x = this.expression_result;
                                        this.expression_result = null;
                                }
                                else if(temp.value == ")") {
                                        lexer.markError("Unbalanced parenthesis.");
                                        return true;
                                } 
                                else {
                                        // Else push the temp
                                        x = temp;
                                }

                                if(x != "undefined" && typeof x != 'undefined' && x != null) {
                                        temp_array.push(x);
                                }
                        }

                        // Now ensure we do both sides of an expressional operator
                        argument_list = temp_array;
                        temp_array = [];
                        var x_array = [];
                        var y_array = [];
                        var x = null;
                        var y = null;
                        var temp = null;
                        while(1) {
                                // Grab the next value
                                temp = argument_list.shift();
                                
                                // Check if it is time to quit
                                if(temp == "undefined" || typeof temp === 'undefined' || temp == null) break;
                                
                                // See if we have found a EXOP
                                if(temp.value == "&" || temp.value == "|") {
                                        var exop = temp.value;
                                        temp = null;
                                        // Gather the left side
                                        while(1) {
                                                // Grab one
                                                temp = temp_array.pop();
                                                // Exit case
                                                if(temp == "undefined" || typeof temp === 'undefined' || temp == null) {
                                                        if(x_array.length == 0) {
                                                                lexer.markError("Expected arguments before expressional operator.");
                                                                return true;
                                                        }
                                                        break;
                                                }
                                                x_array.push(temp);
                                        }
                                        // Sweet we gathered it, now lets evaluate it
                                        if(this.evaluateExpression(true,x_array)) return true;
                                        if(this.expression_result == "undefined" || typeof this.expression_result === 'undefined' || this.expression_result == null) {
                                                lexer.markError("Internal error X.");
                                                return true;
                                        }
                                        if(this.expression_result.value != 0) x = 1;    // True case
                                        else x = 0;                                     // False otherwise

                                        // gather the right side
                                        temp = null;
                                        while(1) {
                                                // Grab one
                                                temp = argument_list.shift();
                                                // Exit case
                                                if(temp == "undefined" || typeof temp === 'undefined' || temp == null) {
                                                        if(y_array.length == 0) {
                                                                lexer.markError("Expected arguments after expressional operator.");
                                                                return true;
                                                        }
                                                        break;
                                                }
                                                y_array.push(temp);
                                        }

                                        // Sweet we gathered it, now lets evaluate it
                                        if(this.evaluateExpression(true,y_array)) return true;
                                        if(this.expression_result == 'undefined' || typeof this.expression_result === 'undefined' || this.expression_result == null) {
                                                lexer.markError("Internal error Y.");
                                                return true;
                                        }
                                        if(this.expression_result.value != 0) y = 1;  // True case
                                        else y = 0;                             // False otherwise

                                        // Perform logic
                                        if(exop == "&") {
                                                x = x * y;
                                        }
                                        else {
                                                x = x + y;
                                                if(x != 0) x = 1;
                                        }

                                        // Sweet we made it man
                                        argument = {
                                                "type" : "INTEGER",
                                                "value": x
                                        }

                                        // Assign X
                                        x = argument;
                                }
                                else {
                                        x = temp;
                                }

                                if(x != "undefined" && typeof x != 'undefined' && x != null) {
                                        temp_array.push(x);
                                }
                        }
                        
                                               

                        // Do factors now
                        argument_list = temp_array;
                        temp_array = [];
                        var x = null;
                        var y = null;
                        var temp = null;
                        while(1) {
                                // Grab the next value
                                temp = argument_list.shift();
                                
                                // Check if it is time to quit
                                if(temp == "undefined" || typeof temp === 'undefined' || temp == null) break;
                                
                                // See if we have found a FACTOR
                                if(temp.type == "FACTOR") {
                                        // Grab a new x value
                                        x = temp_array.pop();
                                        // Grab a new y value
                                        y = argument_list.shift();

                                        // Check if either are undefined
                                        if((x == "undefined" || typeof x == 'undefined' || x == null) || 
                                        (y == "undefined" || typeof y == 'undefined' || y == null)) {
                                                lexer.markError("Invalid variable type on operation " + temp.value + ".");
                                                return true;
                                        }

                                        // Type check
                                        if(!(x.type == "INTEGER" || x.type == "BOOL" || x.type == "FLOAT") 
                                        || !(y.type == "INTEGER" || y.type == "BOOL" || y.type == "FLOAT")) {
                                                lexer.markError("Invalid variable type on operation " + temp.value + ".");
                                                return true;
                                        }

                                        // IF either are FLOAT the result is a float
                                        if(x.value == "FLOAT" || y.value == "FLOAT") {
                                                x.type = "FLOAT";
                                        }
                                        // Get the new value
                                        if(temp.value == "*") {
                                                x.value = x.value * y.value;
                                        }
                                        else if(temp.value == "/") {
                                                x.value = x.value / y.value;
                                        }
                                        else {
                                                lexer.markError("Internal error.");
                                                return true;
                                        }
                                }
                                else {
                                        // Else push the temp
                                        x = temp;
                                }

                                temp_array.push(x);
                        }

                        // Do AROP now
                        argument_list = temp_array;
                        temp_array = [];
                        var x = null;
                        var y = null;
                        var temp = null;
                        while(1) {
                                // Grab the next value
                                temp = argument_list.shift();
                                
                                // Check if it is time to quit
                                if(temp == "undefined" || typeof temp === 'undefined' || temp == null) break;
                                
                                // See if we have found a FACTOR
                                if(temp.type == "AROP") {
                                        // Grab a new x value
                                        x = temp_array.pop();
                                        // Grab a new y value
                                        y = argument_list.shift();

                                        // Check if either are undefined
                                        if((x == "undefined" || typeof x == 'undefined' || x == null) || 
                                        (y == "undefined" || typeof y == 'undefined' || y == null)) {
                                                lexer.markError("Invalid variable type on operation " + temp.value + ".");
                                                return true;
                                        }

                                        // Type check
                                        if(!(x.type == "INTEGER" || x.type == "BOOL" || x.type == "FLOAT") 
                                        || !(y.type == "INTEGER" || y.type == "BOOL" || y.type == "FLOAT")) {
                                                lexer.markError("Invalid variable type on operation " + temp.value + ".");
                                                return true;
                                        }

                                        // IF either are FLOAT the result is a float
                                        if(x.value == "FLOAT" || y.value == "FLOAT") {
                                                x.type = "FLOAT";
                                        }
                                        // Get the new value
                                        if(temp.value == "+") {
                                                x.value = x.value + y.value;
                                        }
                                        else if(temp.value == "-") {
                                                x.value = x.value - y.value;
                                        }
                                        else {
                                                lexer.markError("Internal error.");
                                                return true;
                                        }
                                }
                                else {
                                        // Else push the temp
                                        x = temp;
                                }

                                temp_array.push(x);
                        }

                        argument_list = temp_array;
                        
                        // Verify argument list is as expected
                        if(argument_list.length != 1 && !short) {
                                lexer.markError("Internal error EXPRESSION.");
                                return true;
                        }

                        result = argument_list[0];
                }
                else {
                        result = null;
                }
                 

                this.expression_result = result;
                return false;
        }

        // Get a symbol from the appropriate table
        getSymbol(variable) {
                // Clear
                this.symbol = null;

                // Check the global table
                try {
                        this.symbol = this.master_symbol_table["GLOBAL"][variable];
                }
                catch(TypeError) {

                        // Check the local table
                        try {
                                this.symbol = this.master_symbol_table["SCOPE"][variable];;
                        } 
                        catch(TypeError) {
                                lexer.markError("Varaiable undefined.");
                                return true;
                        }
                }

                // Return!
                return false;
        }

        // Set Expression
        setAssignment() {
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
                                if(this.checkTables(lexer.current.value, this.scope)) return true;

                                // Grab the correct table symbol
                                var symbol = null;
                                if(this.isGlobal) {
                                     symbol = this.master_symbol_table["GLOBAL"][lexer.current.value]; 
                                }
                                else if(this.isLocal) {
                                     symbol = this.master_symbol_table[this.scope][lexer.current.value];   
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
                        if(this.setAssignment()) return true;
                        break;
                        case "/":
                        this.state_assignment = "DIVIDE";
                        if(lexer.getToken()) return true;
                        if(this.setAssignment()) return true;
                        break;
                        case "+":
                        this.state_assignment = "ADD";
                        if(lexer.getToken()) return true;
                        if(this.setAssignment()) return true;
                        break;
                        case "-":
                        this.state_assignment = "SUBTRACT";
                        if(lexer.getToken()) return true;
                        if(this.setAssignment()) return true;
                        break;
                        default:
                        lexer.markError("Expected endline character ; .");
                        return true;
                }
        }
        
        // Set type
        setType() {
                if(lexer.current.value != "TYPE") {
                        lexer.markError("Expected keyword TYPE.");
                        return true;  
                }

                if(lexer.next.type == "IDEN") {
                        if(lexer.getToken()) return true;
                        // If it is global 
                        if(this.current_scope_isGlobal) {
                                
                                // Check if it does not exist
                                if(this.master_symbol_table["GLOBAL"][lexer.current.value] == null) {
                                        lexer.markError("Variable does not exist within global scope.");
                                        return true;
                                }

                                // Check if it is the program name
                                if(this.master_symbol_table["GLOBAL"][lexer.current.value].value == messanger.program.name) {
                                        lexer.markError("Cannot reassign the program type.");
                                        return true;
                                }

                        }
                        // If it is some other scope
                        else {
                                if(this.master_symbol_table[this.scope][lexer.current.value] == null) {
                                        lexer.markError("Variable does not exist within this scope scope.");
                                        return true;
                                }
                        }

                        // Update the type
                        this.current_identifier = lexer.current.value;
                        if(lexer.next.value == ":") {
                                if(lexer.getToken()) return true;
                                // Assign the temporary symbol table
                                if(this.current_scope_isGlobal) this.temp_symbol_table = this.master_symbol_table["GLOBAL"];
                                else this.temp_symbol_table = this.master_symbol_table[this.scope];
                                if(this.storeTypemark()) return true;
                                if(lexer.next.value == ";") {
                                        if(lexer.getToken()) return true;
                                        // Assign temp
                                        if(this.current_scope_isGlobal) this.master_symbol_table["GLOBAL"] = this.temp_symbol_table;
                                        else this.master_symbol_table[this.scope] = this.temp_symbol_table;
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

        // Store a variable
        storeVariable() {
                if(lexer.current.value != "VARIABLE") {
                        lexer.markError("Expected varable.");
                        return true;
                }
                if(lexer.next.type == "IDEN") {
                        if(lexer.getToken()) return true;
                        if(this.current_scope_isGlobal) this.temp_symbol_table = this.global_symbol_table; 
                        else this.temp_symbol_table = this.symbol_table;
                        this.current_identifier = lexer.current.value;
                        this.temp_symbol_table[lexer.current.value] = {                 // Grab that shit
                                "type"          : null,
                                "list"          : [],
                                "value"         : null,
                                "global"        : this.current_scope_isGlobal,
                                "bound"         : null
                        }
                        if(lexer.next.value == ":") {
                                if(lexer.getToken()) return true;
                                if(this.storeTypemark()) return true;
                                // Put bound stuff here

                                // Check for end line
                                if(lexer.next.value == ";") {
                                        if(lexer.getToken()) return true;
                                        // Assign temp
                                        if(this.current_scope_isGlobal) this.global_symbol_table = this.temp_symbol_table;
                                        else this.symbol_table = this.temp_symbol_table;
                                        return false;
                                }
                                else if(lexer.next.value == "[") {
                                        if(this.storeBound()) return true;
                                        if(lexer.next.value == ";") {
                                                if(lexer.getToken()) return true;
                                                // Assign temp
                                                if(this.current_scope_isGlobal) this.global_symbol_table = this.temp_symbol_table;
                                                else this.symbol_table = this.temp_symbol_table;
                                                return false;
                                        }
                                        else {
                                                lexer.markError("Expected end of line.");
                                                return true;
                                        }
                                }
                                else {
                                        lexer.markError("Expected end of line.");
                                        return true;
                                }

                        }
                        else {
                                lexer.markError("Expected declaration continue key : .");
                                return true;    
                        }
                }
                else {
                        lexer.markError("Expected variable identifier.");
                        return true;
                }
        }

        // Store the optional bound
        storeBound() {
                if(lexer.next.value != "[") {
                        lexer.markError("Expected type mark.");
                        return true;
                }

                // Incriment the token
                if(lexer.getToken()) return true;

                // Temporary bound
                var temp_bound = 1;

                switch(lexer.next.type) {
                        case "AROP":
                        if(lexer.next.value == "-") {
                                if(lexer.getToken()) return true;
                                temp_bound = -1*temp_bound;
                                if(lexer.next.type != "INTEGER") {
                                        lexer.markError("Expected bound number.");
                                        return true; 
                                }
                                if(lexer.getToken()) return true;
                                if(lexer.next.value == "]") {
                                        temp_bound = temp_bound*lexer.token_current.value;
                                        this.temp_symbol_table[this.current_identifier].bound = temp_bound;
                                        if(lexer.getToken()) return true;
                                        return false;
                                }
                                else {
                                        lexer.markError("Unbalanced brackets in variable bound.");
                                        return true;
                                }
                        }
                        else {
                                lexer.markError("Expected bound number.");
                                return true; 
                        }
                        case "FLOAT":
                        case "INTEGER":
                        if(lexer.getToken()) return true;
                        if(lexer.next.value == "]") {
                                temp_bound = temp_bound*lexer.token_current.value;
                                this.temp_symbol_table[this.current_identifier].bound = temp_bound;
                                if(lexer.getToken()) return true;
                                return false;
                        }
                        else {
                                lexer.markError("Unbalanced brackets in variable bound.");
                                return true;
                        }
                        default:
                        lexer.markError("Expected bound number.");
                        return true;
                }                
        }

        // Store a type mark
        storeTypemark() {
                switch(lexer.next.type) {
                        case  "MARK":
                        if(lexer.getToken()) return true;
                        this.temp_symbol_table[this.current_identifier].type = lexer.current.value;

                        if(lexer.current.value == "ENUM") {
                                if(lexer.getToken()) return true;
                                if(this.storeEnum()) return true;
                        }
                        break;
                        case "IDEN": // I feel like something special should happen here.
                        if(lexer.getToken()) return true;
                        this.temp_symbol_table[this.current_identifier].type = lexer.current.value;
                        break;
                        default:
                        lexer.markError("Expected type mark.");
                        return true;
                }
                return false;
        }

        storeEnum() {
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

                this.temp_symbol_table[this.current_identifier].list = list;
                return false;

        }

        // Wrap the program up
        buildProgramEnd() {
                if(lexer.current.type == "PRGM" && lexer.next.value == ".") {
                        if(lexer.getToken()) return true;
                        return false;
                }
                else {
                        lexer.markError("Expected period to end program.");
                        return true;
                }
        }

        // Build the program header
        buildProgramHead() {
                if(lexer.current.type == "IDEN") {
                        if(lexer.next.type == "IS") {
                                this.global_symbol_table[lexer.current.value] = {        // Grab that shit
                                        "type"          : "STRING",
                                        "value"         : lexer.current.value,
                                        "global"        : true
                                }
                                messanger.program.name = lexer.current.value;           // Store the program name
                                if(lexer.getToken()) return true;                       // Grab that shit
                                this.switchState("global_declaration");                 // Switch the state
                                return false;
                        }
                        else {
                                lexer.markError("Expected keyword IS.");
                                return true;
                        }
                }
                else {
                        lexer.markError("Expected program identifier.");
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
        }

        checkTables(variable_name, scope) {
                // Pre-check reassignment
                this.isGlobal   = null;
                this.isLocal    = null;

                // See if it exists within the global scope
                try {
                        if(this.master_symbol_table["GLOBAL"][variable_name] != "undefined") {
                                this.isGlobal   = true;
                                this.isLocal    = false;
                                if(this.master_symbol_table["GLOBAL"][variable_name].value == messanger.program.name) {
                                        lexer.markError("Cannot use program name.");
                                        return true; 
                                }
                                return false;
                        }
                }
                catch(TypeError) {
                        try {
                                if(this.master_symbol_table[scope][variable_name] != "undefined") {
                                        this.isGlobal   = false;
                                        this.isLocal    = true;
                                        return false;
                                }
                        }
                        catch(TypeError) {
                                lexer.markError("Variable does not exist globally or locally.");
                                return true;
                        }
                }
        }

        checkType(scope_a, variable_name_a,type_b) {
                var type_a = this.master_symbol_table[scope_a][variable_name_a].type;
                this.type = type_a;

                if(type_a == null || type_b == null) {
                        lexer.markError("Variable type does not exist.");
                        return true;
                }

                if(type_a == type_b) {
                        return false;
                }

                if(type_a == "BOOL" || type_a == "INTEGER" || type_a == "FLOAT") {
                        if(type_b == "BOOL" || type_b == "INTEGER" || type_b == "FLOAT") {
                                return false;
                        }
                }

                lexer.markError("Variable types uncomprable.");
                return true;
        }
}
var parser = new Parser();

class Message {
        constructor() {
                // list of errors
                this.error_list = [];
                this.message    = null;
                this.line       = null;
                this.flag       = false;
                this.token_list = null;

                // The entire program
                this.program    = {
                        "name"          : "El Stupido",
                        "variables"     : null,
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
        // Scanner management
        scanner.update(data);
        parser.buildProgram();

        messanger.updateData();
        postMessage(messanger.data);
        return;
}




