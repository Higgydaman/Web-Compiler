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

                if(this.eof == 0) {
                        this.token_list.push({
                                "type"  : "EOF", 
                                "value" : "EOF", 
                                "line"  : this.line_number
                                });
                        return;
                }

                while(1) {
                        
                        if(this.index == this.eof)  break;                 
                        if(this.code[this.index] == null) break;                // Why not another for corner case.
                        this.current = this.code[this.index].toUpperCase();     // Put all the inputs as uppercase.
                        this.getToken();                                        // Grab another token
                        if(this.incrimentIndex()) break;                        // Incriment the index
                        //console.log(current);
                        //if(this.code[index] == '\n') console.log("New line.");
                        //console.log(this.code[index]);
                }

                //this.sayHI();
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

                                        // LOOP
                                        case "FOR":
                                        this.token_list.push({"type" : "LOOP", "value" : key, "line" : this.line_number})
                                        break;

                                        // DECN
                                        case "GLOBAL":
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
                                        this.token_list.push({"type" : "IDEN", "name" : key, "line" : this.line_number});
                                        // name  = string value
                                        // value = value associated // is PROGRAM for the program identifier 
                                }
                        }
                }
        }

        // Reads until a string is built
        getString() {
                var result =  this.current;
                var next = this.lookAhead();
                if(next == null) return result;
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
                if((this.index + 1) == this.eof) {
                        this.token_list.push({
                                "type"  : "EOF", 
                                "value" : 'EOF', 
                                "line"  : this.line_number
                                });
                        return true;
                } 
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

        sayHI() {
                console.log("Lexer syas HI!");
                for(var i in this.token_list) {
                        console.log(this.token_list[i].type);
                } 
        }
}
var lexer = new Scanner();

class Parser {
        constructor() {
                this.message = null;
                this.token_index = 0;
                this.error = {
                        "flag"  : false,
                        "list"  : [{"msg": "","line" : 0}]
                }
                this.tree = " ";
                this.token = null;
                this.next = null;
                this.symbol = null;
                this.symbol_table = [];
        }

        update() {
                this.error = {
                        "flag"  : false,
                        "list"  : [{"msg": "","line" : 0}]
                }
                this.parseProg();
                postMessage({"error" : this.error,"tree" : this.tree});
        }

        lookAhead() {

                if(this.token != null) {
                        if(this.token.type == "EOF") {          // If the token is already EOF
                                this.next = this.token;         // Just set the next to EOF to keep up error generation
                                return false;                   // and return for no error. it is just EOF 
                        }
                }

                this.next = lexer.token_list[this.index + 1];

                if(this.next == null) return true;      // If the next is null then yes, an error has occured.

                return false;                           // Else pass back no error
        }

        getToken(symbol_name) {
                
                if(this.token != null) {
                        if(this.token.type == "EOF") {          // If the token is already EOF
                                return false;                   // and return for no error. it is just EOF 
                        }
                }
                
                this.token = lexer.token_list[this.index + 1];

                if(this.token == null) return true;     // If the next is null then yes, an error has occured.

                if(this.token.type == "IDEN") {     // Handle symbol table junk
                        if(this.symbol_table[this.token.value] == null) {
                                if(symbol_name != null) {
                                        this.symbol_table.push(symbol_name);
                                        this.symbol_table[symbol_name] = {
                                                "type" : null,
                                                "value": null,
                                                "scope": this.scope
                                        } 
                                }
                                else {
                                        this.symbol_table.push(this.token.value);
                                        this.symbol_table[this.token.value] = {
                                                "type" : null,
                                                "value": null,
                                                "scope": this.scope
                                        } 
                                }

                        }
                }

                this.index++;
                return false;                           // Else pass back no error
        }

        // Pass in two token types to see if you can recover onto them
        recover(tok1,tok2,tok3) {
                while(1) {
                        if(this.lookAhead()) return true; // grab the next
                        
                        switch(this.next.type) {
                                case tok1:                      // tok1?
                                case tok2:                      // tok2?
                                case tok3:                      // tok2?
                                        return false;           // Return to that position
                                case "EOF":
                                        return true;            // Return error
                                default:
                                        if(this.getToken()) return true;  // Update the current token
                        }     
                }
        }

        getProgramName() {
                this.lookAhead();               // Perform a lookahead
                switch(this.next.type) {
                        case "IDEN":
                                this.scope = -1;                                        // Set the scope to RESERVED
                                this.getToken("PROGRAM");                               // Grab one of dem tokens & update the symbol_table
                                this.symbol_table["PROGRAM"].type = "RESERVED";         // Set the type to reserved
                                this.symbol_table["PROGRAM"].value = this.token.value;  // set the value to the identifier specified    
                                return false;             // Mark successful
                        default:
                                return true;              // Mark the error
                        
                }
        }

        parseProg() {
                
                // Parse is a recursive decent LL(1).
                // Parse the program definition
                this.index = -1;
                this.scope = -1;

                if(this.lookAhead()) return;    // Perform a lookahead
                switch(this.next.value) {       // Look for FIRST
                        case "PROGRAM":
                                if(this.getToken()) return;                             // Grab the PRGM token
                                if(this.getProgramName()) {                             // Grabs the program name, stores it as an identifier for global scope
                                        this.markError("Expected a PROGRAM declaration.");   // Mark the error
                                        if(this.recover("PRGM","STRT","END")) return;   // If recovery fails, lets just exit
                                }
                        break;
                        default:
                                this.markError("Expected PROGRAM keyword.");            // Mark the error  
                                if(this.recover("PRGM","STRT","END")) return;           // Try to do some recovery if PROGRAM is not found
                }



                // this.getToken();

                // // Gen the program head name
                // switch(this.token.type) {
                        
                //         case "PRGM":
                //         switch(this.token.value) {
                                
                //                 case "PROGRAM":
                //                 this.getToken(this.scope);
                //                 switch(this.token.type) {
                                        
                //                         case "IDEN":
                //                         this.genProgramHead();
                //                         this.getToken(this.scope);
                                        
                //                         switch(this.token.type) {
                                                
                //                                 case "PRGM":
                //                                 if(this.token.value != "IS") {
                //                                         this.markError("Expected keyword IS after program name.");
                //                                 }
                //                                 break;
                //                                 default:
                //                                 this.markError("Expected keyword IS after program name.");
                //                         }
                //                         break;

                //                         default:
                //                         this.markError("Expected an identifier for the program name.");
                //                 }
                //                 break;
                                
                //                 default:
                //                 this.markError("Expected keyword PROGRAM.");
                //         }
                //         break;
                        
                //         default:
                //         this.markError("Expected keyword PROGRAM."); 
                // }

                // // Catch an error and make a recovery to a declaration or BEGIN
                // if(this.error.flag == true) {
                //         this.getToken(null);
                //         var recovering = true;
                //         while(recovering) {
                //                 this.getToken(null);
                //                 switch(this.token.type) {
                //                         case "DECN":
                //                         if(this.token.value == "GLOBAL") {
                //                                 this.resetToken(null);
                //                                 recovering = false;
                //                                 break;
                //                         }
                                        
                //                         case "STRT":
                //                         if(this.token.value == "BEGIN") {
                //                                 this.resetToken(null);
                //                                 recovering = false;
                //                                 break;
                //                         }
                //                         break;

                //                         case "EOF":
                //                         recovering = false;
                //                         return;
                //                         break;
                //                 } 
                //         }                 
                // }

                // // Gen the program gloabal declarations
                // this.scope = 0;
                // var collecting = true;
                // while(collecting) {
                //         this.getToken(this.scope);
                //         switch(this.current.type) {
                //                 case "DECN":
                //                 if(this.current.value == "GLOBAL") {
                //                         this.getDeclaration();
                //                         break;
                //                 }
                //                 break;
                //                 case "STRT":
                //                 if(this.current.value == "BEGIN") {
                //                         building = false;
                //                         break;
                //                 }
                //                 break;
                //                 default:
                //                 markError("Expected keyword BEGIN or GLOBAL declaration.");
                //                 building = false;
                //                 return;
                //         }
                // }

                // // Do some error recovery here to the point of the next statement or END PROGRAM
                  
                // // Gen the program end
                // this.scope = 1;
                // collecting = true;
                // while(collecting) {
                //         this.getToken(this.scope);
                //         switch(this.current.type) {
                //                 case "IDEN":
                //                 // TODO
                //                 break;
                                
                //                 case "COND": // IF ELSE
                //                 // TODO
                //                 break;

                //                 case "LOOP": // FOR
                //                 // TODO
                //                 break;
                                
                //                 case "GOTO": // RETURN
                //                 // TODO
                //                 break;

                //                 case "END":  // 
                //                 if(this.current.value == "END") {
                //                         this.getToken(this.scope);
                //                         switch(this.current.type) {
                //                                 case "PRGM":
                //                                 if(this.current.value == "PROGRAM") {
                //                                         this.tree = this.tree + "END PROGRAM";
                //                                         break;
                //                                 }
                //                                 default:
                //                                 markError("Expected keyword PROGRAM after END.");
                //                         }
                //                         collecting = false;
                //                         break;
                //                 }
                //                 break;
                //                 default:
                //                 markError("Expected END PROGRAM.");
                //                 collecting = false;
                //                 return;
                //         }
                // }

                // // Catch the period I guess?
                // this.getToken(null);
                // switch(this.token.type) {
                //         case "END":
                //         if(this.token.value == ".") {
                //                 this.tree = this.tree + '.';
                //                 break;
                //         }
                //         default:
                //         this.markError("Expected period to mark program end.");
                // } 
                
        }

        markError(message) {
                message = "ERROR: Line number " + this.token.line + ", " + message + "\n";
                this.error.flag = true;
                this.error.list.push({"msg" : message, "line" :this.token.line});
                return;
        }

        getDeclaration() {
                // TODO
        }

        parseProgramBody() {
                
                // Connect the program head to the body
                
                return;
        }

        genProgramHead() {
                this.tree = "Program name: " + this.token.name + "\n";
                this.token.scope = this.scope;
                this.token.value = "PROGRAM";
                return;
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