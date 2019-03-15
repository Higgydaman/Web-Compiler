'use strict'

class Lexer {

        constructor() {
                this.token_list = [];
                this.lexeme = null;
                this.state = null;
        }

        update(data) {
                // See if it was a bulk update
                //console.log("Here");
                this.details = data.details;
                this.code = data.value;
                messanger.clear();
                this.scanCode();
                this.buildTokens();
        }

        // Builds the token list required for the parser. Uses the lexeme list generated.
        buildTokens() {
                this.token_list = [];
                console.log(this.lexeme_list);
                this.index = this.lexeme_list.length;
                this.state = "FOOTER";

                // We go backwords by the way
                while(1) {
                        if(this.incrimentIndex("BUILDER")) return;
                        console.log(this.current);
                        if(this.getToken()) return;
                        if(this.token != null) {
                                console.log(this.token);
                        }  
                }
        }

        // Uses the LEXEME list to generate some tokens.
        getToken() {
                this.token = null;
                switch(this.state) {
                        case "FOOTER":
                        if(this.stateFooter()) return true;
                        break;
                        case "BODY":
                        if(this.stateBody()) return true;
                        break;
                        case "HEADER":
                        console.log("Exiting premature."); // Just for now
                        return true;                                    // Just for now
                        default:
                        console.log("LEXER ERROR CODE 2.");
                }
                return false;
        }

        // Recovery based on what state you are in.
        recover() {
                switch(this.state) {

                        case "FOOTER":
                        switch(this.next.value) {
                                case ";":
                                case "BEGIN":
                                this.state = "BODY";
                                return false;
                                case "IS":
                                case "PROGRAM":
                                this.state = "HEADER";
                                return false;
                                default:
                                if(this.incrimentIndex("BUILDER")) return true;
                                return this.recover();
                        }

                        case "BODY":
                        switch(this.next.value) {
                                case ";":
                                return false;
                                case "BEGIN":
                                return false;
                                case "IS":
                                this.state = "HEADER";
                                return false;
                                case "PROGRAM":
                                this.state = "HEADER";
                                return false;
                                default:
                                if(this.incrimentIndex("BUILDER")) return true;
                                return this.recover();
                        }

                        case  "HEADER":         // If we error at this point, just leave
                        return true;
                }
                return false;
        }

        // State to generate the EOF token
        stateFooter() {
                switch(this.current.value) {
                        case ".":
                        switch(this.next.value) {
                                case "PROGRAM":
                                if(this.incrimentIndex("BUILDER")) return true;
                                switch(this.next.value) {
                                        case "END":
                                        if(this.incrimentIndex("BUILDER")) return true;
                                        this.state = "BODY";
                                        this.token = {
                                                "type" : "EOF"
                                        }
                                        return false;
                                }
                                default:
                        }
                        default:
                        if(this.markError("Expected keywords END PROGRAM (.) .")) return true;
                        return false;
                }
        }

        // State to generate body tokens
        stateBody() {
                switch(this.current.value) {
                        case ";":
                        if(this.recover()) return true; // Just for now
                        break;
                        case "BEGIN":
                        if(this.recover()) return true; // Just for now
                        break;
                        case "IS":
                        this.state = "HEADER";
                        break;
                        case "PROGRAM":
                        if(this.markError("Expected keyword IS.")) return true;
                        break;
                        default:
                        if(this.markError("Unexpted input.")) return true;
                        return false;
                }
                return false;
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
                this.token_list = [];
                this.lexeme_list = [];
                this.current = null;
                this.letters = /^[A-Za-z]+$/;
                this.numbers = /^[0-9]/;

                var EOF = false;
                var EOF = this.incrimentIndex("SCANNER"); 
                while(!EOF) {               
                        EOF = this.getLexeme();
                        EOF = this.incrimentIndex("SCANNER");
                        if(this.lexeme != null) {
                                this.lexeme_list.push(this.lexeme);
                        }
                        else if(!EOF) console.log("SCANNER ERROR CODE 0.");
                }
        }

        // Standard function to incriment the index
        incrimentIndex(caller) {
                
                switch(caller) {

                        case "SCANNER":
                        if((this.index) == (this.eof - 1)) return true;
                        this.index++;
                        this.current = this.code[this.index].toUpperCase();
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
                        console.log("LEXER ERROR CODE 1.");
                        return true;
                }
        }

        // Reads until a string is built
        getString() {
                this.key = null;
                var result =  this.current;
                while(this.next.match(/^[a-zA-Z0-9_]+$/)) {
                        result = result + this.next;
                        if(this.incrimentIndex("SCANNER")) {
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
                var result =  this.current;
                while(this.next.match(/^[0-9.]+$/)) {
                        if(this.next == '.') {
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
                this.number = result;
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
                        console.log("LEXER: Error within comment skip section");
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

                        // END 
                        case '.':
                        case ';':
                        this.type = "END";
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
                                        case "IS":
                                        this.type = "PRGM";
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
                                console.log(this.number);
                                this.type = "NUMB";
                                this.value = this.number;
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
}
var lexer = new Lexer();

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

        clear() {
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

        // Updates the data
        updateData() {
                this.data.error = this.flag;
                this.data.list  = this.error_list;
                this.prgram     = this.program;
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
        // Lexer management
        lexer.update(data);

        // Return to the caller
        messanger.updateData();
        postMessage(messanger.data);
        return;
}

class Declaration {
        
        constructor() {
                this.type               = null;
                this.name               = null; 
                this.declaration_list   = [];
        }

        // **Public

        // Update all values associated with the type sent
        updateDeclaration(type, name) {
                // PROCEDURE | VARIABLE | TYPE
                this.putName(name);
                

                return;
        }

        // Send the built declaration 
        sendDeclaration(type) {
                // PROCEDURE | VARIABLE | TYPE
                
                // Make sure the declaration is cool with the standards
                if(this.checkDeclaration(type)) return true;


                return;
        }

        // **Provate

        // Checout the built declaration based on type
        checkDeclaration(type) {
                // PROCEDURE | VARIABLE | TYPE
                
                return;
        }

        // Place the name of the declaration
        putName(name) {
               
                return;
        }
}



