'use strict'

class Scanner {

        constructor() {
                this.lexeme = null;
                this.state = null;
                this.body_declaration = false;
        }

        update(data) {
                // See if it was a bulk update
                //console.log("Here");
                this.body_declaration = false;
                this.details = data.details;
                this.code = data.value;
                messanger.clear();
                this.scanCode();
                console.log(this.lexeme_list);
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
                                // console.log(this.lexeme);
                                this.lexeme_list.push(this.lexeme);
                        }
                        else if(!EOF) console.log("SCANNER ERROR CODE 0.");
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
                        console.log("Scanner ERROR CODE 1.");
                        return true;
                }
        }

        // Reads until a string is built
        getString() {
                this.key = null;
                var result =  this.current;
                while(this.next.match(/^[a-zA-Z0-9_]+$/)) {
                        result = result + this.next;
                        if((this.incrimentIndex("SCANNER")) | (this.next == null)) {
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
                var isfloat = false;
                var result =  this.current;
                while(this.next.match(/^[0-9.]+$/)) {
                        if(this.next == '.') {
                                isfloat = true;
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
                if(isfloat) {
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
                                                if(this.incrimentIndex("SCANNER")) return true;          // Incriment the index by one
						comment_count--;				// Eat that ghost
						if( comment_count == 0 ) {		        // Any ghosts left?
							completed = true;			// Fuck no!
                                                }
                                                break;
					}
					if(this.incrimentIndex("SCANNER")) return true;					
				break;
				case '/' :						        // Maybe another ghost
                                        if(this.next == '*') {			                // look ahead
                                                comment_count++;
                                                if(this.incrimentIndex("SCANNER")) return true;
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
                        console.log("Scanner: Error within comment skip section");
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
                                        
                                        // END
                                        case "END":
                                        this.type = "END";
                                        this.value = this.key;
                                        break;
                                        
                                        // BEGIN
                                        case "BEGIN":
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
                                this.type = "NUMB";
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
                if(this.incrimentIndex("SCANNER")) return true;
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
                        this.token_current = {
                                "type" : "EOF"
                        }

                        this.token_next = {
                                "type" : "EOF"
                        }

                        return false;
                }

                // Pass the current LEXEME
                this.token_current = {
                        "type" : this.current.type,
                        "value": this.current.value
                }

                // Pass the current LEXEME
                if(this.token_next.type != "EOF") {
                        this.token_next = {
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
                if(this.index == scanner.lexeme_list.length - 1) {
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
        buildPorgram() {
                lexer.index         = -1;
                lexer.token_current = null;
                lexer.token_next    = null;
                this.symbol_table   = [];
                this.state          = null;
                while(1) {
                        if(lexer.getToken()) return true;
                        switch(lexer.token_current.type) {
                                case "PRGM":
                                if(lexer.token_next.type == "IDEN") {
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
                                if(this.state == "global_declaration") {
                                        this.switchState("global_statement");
                                }
                                else {
                                        lexer.markError("Unexpected BEGIN keyword within global scope.");
                                        return true;    // P&D for now
                                }
                                break;

                                case "END":
                                if(this.state == "global_statement") {
                                        if(lexer.token_next.type == "PRGM") {
                                                this.switchState("program_end");
                                                if(lexer.getToken()) return true;
                                                if(this.buildProgramEnd()) return true;    // P&D for now      // TODO: call error recovery here
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
                                console.log(lexer.token_next.type);
                                if(this.state == null) {
                                        if(lexer.token_next.type == "EOF") {
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
                                lexer.markError("Unexpected input.");
                                console.log(lexer.token_current);
                                return true;
                        }
                }
        }

        // Wrpa the program up
        buildProgramEnd() {
                if(lexer.token_current.type == "PRGM") {
                        messanger.programs[messanger.program.name] = messanger.program;
                        console.log(messanger.programs);
                        messanger.clearProgram();
                        this.switchState(null);
                        return false;
                }
                else {
                        lexer.markError("Expected PROGRAM keyword.");
                        return true;
                }
        }

        // Build the program header
        buildProgramHead() {
                if(lexer.token_current.type == "IDEN") {
                        if(lexer.token_next.type == "IS") {
                                this.symbol_table[lexer.token_current.value] = {        // Grab that shit
                                        "type"          : "STRING",
                                        "value"         : lexer.token_current.value,
                                        "global"        : true
                                }
                                messanger.program.name = lexer.token_current.value;     // Store the program name
                                if(lexer.getToken()) return true;                       // Grab that shit
                                this.switchState("global_declaration");                 // Switch the state
                                console.log("Addition to the symbol table:");           // DEBUG
                                console.log(this.symbol_table["YOUR_PROGRAM_NAME"]);    // DEBUG
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
                this.state = state                                      // Switch the state
                console.log("STATE SWITCH: " + this.state);             // DEBUG
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

                // The entire program
                this.program    = {
                        "name"          : "El Stupido",
                        "declarations"  : null,
                        "statements"    : null
                }

                // Something to contain everything.
                this.data = {
                        "error"         : null,
                        "list"          : null,
                        "program"       : null
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
                        "declarations"  : null,
                        "statements"    : null
                }

                // Something to contain everything.
                this.data = {
                        "error"         : null,
                        "list"          : null,
                        "program"       : null
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
                        "declarations"  : null,
                        "statements"    : null
                }

                // Something to contain everything.
                this.data = {
                        "error"         : null,
                        "list"          : null,
                        "program"       : null
                }  
        }

        // Updates the data
        updateData() {
                this.data.error = this.flag;
                this.data.list  = this.error_list;
                this.data.program = this.program;
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
        if(parser.buildPorgram()) console.log("Parser failed.");

        messanger.updateData();
        postMessage(messanger.data);
        return;
}




