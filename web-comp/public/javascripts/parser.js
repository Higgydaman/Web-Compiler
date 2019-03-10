'use strict'



class Scanner {
        // TODO: Put this into it's own threaded script so we can re-use for the ACE highlighting BS.
        constructor() {
            this.start = 0;
            this.end = 0;
            this.tokens = null;
        }
    
        update(data) {
            // See if it was a bulk update
            //console.log(data.details);
            this.details = data.details;
            this.code = data.value;
            var difference = this.details.end.row - this.details.start.row;
            //console.log(difference);
            if(difference == 0) {
                //console.log("PARSER: No change detected.");
                return;
            }
            switch(data.details.action) {
                
                case "insert":
    
                if(difference == 1) {
                        // console.log("PARSER: New line detected.");
                        if(this.end < this.details.end.row) {
                                this.insertOne();
                                this.end = this.details.end.row;
                        }
                        else {
                                this.updateOne();
                        }
                }
                else if(difference > 0) {
                        // console.log("PARSER: Bulk insert detected.");
                        if(this.end < this.details.end.row) {
                                this.insertMany();
                                this.end = this.details.end.row;
                        }
                        else {
                                this.updateMany();
                        }
                }
                else {
                    // console.log("PARSER: Unknown insert detected.")
                }
                break;
    
                case "remove":
    
                if(difference == 1) {
                        //console.log("PARSER: Update line detected.");
                        //console.log(this.details);
                        this.deleteOne();
                        this.end = this.end - 1;
                }
                else if(difference > 0) {
                        //console.log("PARSER: Bulk delete detected.");
                        //console.log(this.details);
                        this.deleteMany();
                        this.end = this.end - difference;
                }
                else {
                    console.log("PARSER: Unknown remove detected.")
                }
                break;
    
                default:
                console.log("PARSER: An unknown change to the editor has occured.")
            }
        }

        scanCode() {
                //console.log("LEXER: Scanning code.");
                
                // Declare the pre-init stuff
                this.eof = this.code.length - 1;
                this.index = 0;
                this.line_number = 0;
                this.token_list = [];
                this.current = null;
                this.letters = /^[A-Za-z]+$/;

                while(1) {
                        
                        if(this.index == this.eof) break;                       // The exit
                        if(this.code[this.index] == null) break;                // Why not another for corner case.
                        this.current = this.code[this.index].toUpperCase();     // Put all the inputs as uppercase.
                        this.getToken();                                        // Grab another token
                        if(this.incrimentIndex()) break;                        // Incriment the index
                        //console.log(current);
                        //if(this.code[index] == '\n') console.log("New line.");
                        //console.log(this.code[index]);
                }
        }

        // Push the next token on the array.
        getToken() {
                var next = this.lookAhead();
                switch(this.current) {
                        // Edge cases
                        case '\n':                              // Next line case
                        this.line_number++;
                        break;
                        
                        // BRKT
                        case '(':                               // BRKT case
                        case ')':                               // BRKT case
                        case '[':                               // BRKT case
                        case ']':                               // BRKT case
                        case '{':                               // BRKT case
                        case '}':                               // BRKT case
                        this.token_list.push({"type" : "BRKT", "value" : this.current, "line" : this.line_number});             
                        break;
                        
                        // AROP
                        case '/':                               // Possible comment
                        if((next == '/') || (next == '*')) {
                                if(this.incrimentIndex()) break;
                                //console.log("LEXER: Caught a comment section.");
                                this.skipComment();
                                break;
                        }
                        case '-':                               // AROP case
                        case '+':                               // AROP case
                        case '*':                               // AROP case
                        this.token_list.push({"type" : "AROP", "value" : this.current, "line" : this.line_number});
                        break;

                        // END 
                        case '.':
                        case ';':
                        this.token_list.push({"type" : "END", "value" : this.current, "line" : this.line_number});
                        break;

                        // EXOP
                        case '&':
                        case '|':
                        this.token_list.push({"type" : "EXOP", "value" : this.current, "line" : this.line_number});
                        break;

                        // NEXT
                        case ',':
                        this.token_list.push({"type" : "NEXT", "value" : this.current, "line" : this.line_number});
                        break;

                        // RLOP < | <= | > | >= | =< | => | != | =! | ! | == | =
                        case '<':
                        if(next) {
                                this.token_list.push({"type" : "RLOP", "value" : "<=", "line" : this.line_number});
                                this.incrimentIndex();
                                break;   
                        }
                        case '>':
                        if(next == '=') {
                                this.token_list.push({"type" : "RLOP", "value" : ">=", "line" : this.line_number});
                                this.incrimentIndex();
                                break;   
                        }
                        case '!':
                        if(next == '=') {
                                this.token_list.push({"type" : "RLOP", "value" : "!=", "line" : this.line_number});
                                this.incrimentIndex();
                                break;   
                        }
                        case '=':
                        switch(next) {
                                case '=':
                                this.token_list.push({"type" : "RLOP", "value" : "==", "line" : this.line_number});
                                this.incrimentIndex();
                                break;
                                case '>':
                                this.token_list.push({"type" : "RLOP", "value" : ">=", "line" : this.line_number});
                                this.incrimentIndex();
                                break;
                                case '<':
                                this.token_list.push({"type" : "RLOP", "value" : "<=", "line" : this.line_number});
                                this.incrimentIndex();
                                break;
                                case '!':
                                this.token_list.push({"type" : "RLOP", "value" : "!=", "line" : this.line_number});
                                this.incrimentIndex();
                                break;
                                default:
                                this.token_list.push({"type" : "RLOP", "value" : this.current, "line" : this.line_number});
                        } 
                        default:
                        if(this.current.match(this.letters)) {
                                //console.log(this.current);
                                var key = this.getString();
                                //console.log(key);
                                switch(key) {
                                        
                                        // END
                                        case "END":
                                        this.token_list.push({"type" : "END", "value" : "END", "line" : this.line_number});
                                        break;
                                        
                                        // BEGIN
                                        case "BEGIN":
                                        this.token_list.push({"type" : "STRT", "value" : "BEGIN", "line" : this.line_number});
                                        break;

                                        // PROGRAM
                                        case "PROGRAM":
                                        case "IS":
                                        this.token_list.push({"type" : "PRGM", "value" : key, "line" : this.line_number});
                                        break;

                                        // COND
                                        case "IF":
                                        case "ELSE":
                                        this.token_list.push({"type" : "COND", "value" : key, "line" : this.line_number});
                                        break;

                                        // GOTO
                                        case "RETURN":
                                        this.token_list.push({"type" : "GOTO", "value" : key, "line" : this.line_number});
                                        break;

                                        // DECN
                                        case "TYPE":
                                        case "VARIABLE":
                                        case "PROCEDURE":
                                        case "INTEGER":
                                        case "FLOAT":
                                        case "STRING":
                                        case "BOOL":
                                        case "ENUM":
                                        this.token_list.push({"type" : "DECN", "value" : key, "line" : this.line_number});
                                        break;

                                        default:
                                        this.token_list.push({"type" : "IDEN", "value" : key, "line" : this.line_number});
                                }
                        }
                }
        }

        // Reads until a string is built
        getString() {
                var result =  this.current;
                var next = this.lookAhead();
                while(next.match(/^[a-zA-Z0-9_]+$/)) {
                        result = result + next;
                        this.incrimentIndex();
                        next = this.lookAhead(); 
                        if(next == null) break;        
                }
                return result;
        }

        // Standard function to skip comments
        skipComment() {
                switch(this.code[this.index]) {
                        case '/':
                        while(this.code[this.index] != '\n') {
                                if(this.incrimentIndex()) break;
                        }
                        break;

                        case '*':
                        if(this.incrimentIndex()) break;
                        var completed = false;
                        var comment_count = 1;
                        while( completed == false ) {	                                        // While pacman hasn't eaten the entire comment
				switch( this.code[this.index] ) {	                        // Switch on the input character
				case '*' :					                // Maybe all the ghosts are gone?
                                        if( this.lookAhead() == '/' ) {	                        // Sweet, ghost insight
                                                this.incrimentIndex();                          // Incriment the index by one
						comment_count--;				// Eat that ghost
						if( comment_count == 0 ) {		        // Any ghosts left?
							completed = true;			// Fuck no!
                                                }
                                                break;
					}
					if(this.incrimentIndex()) {			        // Munch another pixel
                                                completed = true;
                                                break;
                                        }					
					break;
				case '/' :						        // Maybe another ghost
                                        if(this.lookAhead() == '*') {			        // look ahead
                                                comment_count++;
                                                this.incrimentIndex();
                                                break;
                                        }					
					if(this.incrimentIndex()) {			        // Munch another pixel
                                                completed = true;
                                                break;
                                        }
					break;
                                }
                                if(this.incrimentIndex()) {			                // Munch another pixel
                                        completed = true;
                                        break;
                                }
                        }
                        break;
                        default:
                        console.log("LEXER: Error within comment skip section");
                }
                
        }

        // Standard function to incriment the index
        incrimentIndex() {
                if((this.index + 1) == this.eof) return true;
                this.index++;
                this.current = this.code[this.index].toUpperCase();
                return false;
        }
        // Look ahead function
        lookAhead() {
                if((this.index + 1) == this.eof) return null;
                return this.code[this.index + 1].toUpperCase();
        }

        // TODO: Make these actually usable, right now they just keep updating the complete lexer.
        insertOne() {
                //console.log("LEXER: Inserting one.")
                this.scanCode();
        }

        insertMany() {
                //console.log("LEXER: Inserting many.")
                this.scanCode();
        }

        updateOne() {
                //console.log("LEXER: Updating one.")
                this.scanCode();
        }

        updateMany() {
                //console.log("LEXER: Updating many.")
                this.scanCode();
        }

        deleteOne() {
                //console.log("LEXER: Deleting one.")
                this.scanCode();
        }

        deleteMany() {
                //console.log("LEXER: Deleting many.")
                this.scanCode();
        }
}
var lexer = new Scanner();

class Parser {
        constructor() {
                this.message = null;
        }

        update() {
                //console.log("PARSER: Parsing the code.")
                this.message = lexer.code;
                for(var i in lexer.token_list) {
                        console.log(lexer.token_list[i].type);
                }
                //console.log("PARSER: Parsing completed. Sending message back.")
                postMessage(this.message);
        }
}
var parser = new Parser();

onmessage = function(e) {
        //var result = e.data;
        //console.log(e.data);
        lexer.update(e.data);
        parser.update();
        //postMessage(result);   
}





















// var identifier_propeties = {  
//         value : null,
//         scope : null
// }

// var general_properties = {
//         value : null
// }

var TokenType  = {
        IDEN    : 1,    // Any identifier
        END     : 2,    // Identifies the end of something              ; | . | END
        STRT    : 3,    // Identifies the start of something            BEGIN 
        BRKT    : 4,    // Identifies a bracket                         ( | ) | { | } | [ | ]
        EXOP    : 5,    // Identifies an expressional operator          & | | 
        NEXT    : 6,    // Identifies the next in a list                , 
        AROP    : 7,    // Identifies arithmatic operators              - | + | * | / | \ 
        RLOP    : 8,    // Identifies relational operators              < | <= | > | >= | =< | => | != | =! | ! | == | = | NOT | IS
        PROG    : 9,    // Identifies a program state                   PROGRAM     
        COND    : 10,   // Identifies a condiional state                IF | ELSE | RETURN
        DECN    : 11    // Identifies a declaration                     TYPE | VARIABLE | PROCEDURE | INTEGER | FLOAT | STRING | BOOL | ENUM
}; 


// class SymbolTable {
//         constructor() {
//                 this.symbol_table = {};
//         }
// }

// class Lexer {
//         constructor(table, code) {
//                 this.table = table;
//                 this.code  = code;
//                 this.index = 0;
//                 this.token = null;
//                 this.completed = false;     
//         }

//         get completed() {
//                 return this.completed;
//         }

//         // Get a token from the code
//         getToken() {
//                 getLexeme(this.code[this.index]);
//         }

//         // Just for debugging
//         sayHi() {
//                 console.log("The lexer says HI!");
//         }
// }




// // Go through the code until a lexeme is found
// function findLexeme() {

// }