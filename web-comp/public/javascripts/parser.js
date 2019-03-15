'use strict'

var 



class Scanner {
        // TODO: Put this into it's own threaded script so we can re-use for the ACE highlighting BS.
        constructor() {
            this.start = 0;
            this.end = 0;
            this.tokens = null;
        }
    
        update(data) {
            // See if it was a bulk update
            this.details = data.details;
            this.code = data.value;
            var difference = this.details.end.row - this.details.start.row;
            if(difference == 0) {
                return;
            }
            switch(data.details.action) {
                
                case "insert":
    
                if(difference == 1) {
                        if(this.end < this.details.end.row) {
                                this.insertOne();
                                this.end = this.details.end.row;
                        }
                        else {
                                this.updateOne();
                        }
                }
                else if(difference > 0) {
                        if(this.end < this.details.end.row) {
                                this.insertMany();
                                this.end = this.details.end.row;
                        }
                        else {
                                this.updateMany();
                        }
                }
                else {
                }
                break;
    
                case "remove":
    
                if(difference == 1) {
                        this.deleteOne();
                        this.end = this.end - 1;
                }
                else if(difference > 0) {
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
                
                // Declare the pre-init stuff
                this.eof = this.code.length - 1;
                this.index = -1;
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
                        if(this.incrimentIndex())       break;     // Incriment the index                
                        if(this.getToken())             break;     // Grab another token
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
                        case ':':
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
                                var key = this.getString();
                                switch(key) {
                                        
                                        // END
                                        case "END":
                                        this.token_list.push({"type" : "END", "value" : key, "line" : this.line_number});
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
                        this.line_number++;
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
                                case "\n":
                                        this.line_number++;
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
                                "type"  : "EOF"
                        });
                        return true;
                } 
                this.index++;
                this.current = this.code[this.index].toUpperCase();
                this.next = this.code[this.index + 1].toUpperCase();
                return false;
        }

        // TODO: Make these actually usable, right now they just keep updating the complete lexer.
        insertOne() {
                this.scanCode();
        }

        insertMany() {
                this.scanCode();
        }

        updateOne() {
                this.scanCode();
        }

        updateMany() {
                this.scanCode();
        }

        deleteOne() {
                this.scanCode();
        }

        deleteMany() {
                this.scanCode();
        }

        sayHI() {
                console.log("Lexer syas HI!");
                for(var i in this.token_list) {
                        console.log(this.token_list[i].type + " " + this.token_list[i].line);
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
                this.mark = null;
        }

        update() {
                this.error = {
                        "flag"  : false,
                        "list"  : [{"msg": "","line" : 0}]
                }
                this.parseProg();
                postMessage({"error" : this.error,"tree" : this.tree});
        }

        dumpError(caller) {
                console.log("PARSER: ERROR DUMP FROM " + caller);
                console.log("Current Token:");
                console.log(this.token);
                console.log("Current Index:");
                console.log(this.index);
        }

        markError(message) {
                //lexer.sayHI();
                this.error.flag = true;
                var line = this.token.line;
                if(this.next.type != undefined) {
                        line = this.next.line;
                }
                message = "ERROR LINE " + line + ", " + message + "\n";
                this.error.list.push({"msg" : message, "line" :this.token.line});
                //this.dumpError("Marker");
                this.recover();
                return;
        }

        getToken() {
                this.token = lexer.token_list[this.index];
                this.next = lexer.token_list[this.index + 1];
                if(this.program.completed == true && this.token.type != "EOF") {
                        this.token.type = "EXCP";
                        this.token.line_number;
                }
        }

        parseProg() {
                // Grab the program name and declare the program structure
                this.program = {
                        "completed"     : false,
                        "state"         : "INIT",
                        "name"          : "stupid",
                        "declarations"  : [],
                        "statements"    : [],
                        "symbols"       : []
                }
                for(this.index = 0; (lexer.token_list.length - 1); this.index++) {
                        this.getToken();
                        switch(this.token.type) {
                                case "DECN":    // GLOBAL | TYPE | VARIABLE | PROCEDURE | INTEGER | FLOAT | STRING | BOOL | ENUM
                                if(this.program.state != "DECL") {
                                        this.markError("declaration not accept before IS or after BEGIN.")
                                } else {
                                        switch(this.token.value) {
                                                case "GLOBAL":
                                                this.stateDeclaration();
                                                switch(this.next.type) {
                                                        case "END":
                                                        if(this.next.value != ";") {
                                                                this.recover();
                                                                this.markError("expected a declaration end ; .");
                                                        } else {
                                                                this.incrimentToken();
                                                        }
                                                        break;
                                                        default:
                                                        this.markError("expected a declaration end ; .");
                                                }
                                                break;
                                                case "TYPE":
                                                case "VARIABLE":
                                                case "PROCEDURE":
                                                case "INTEGER":
                                                case "FLOAT":
                                                case "STRING":
                                                case "BOOL":
                                                case "ENUM":
                                                this.markError("GLOBAL keyword expected before declaration.");
                                                break;
                                                default:
                                                this.markError("unsupported declaration type.");
                                        }
                                }
                                break;
                                case "PRGM":    // PROGRAM | IS
                                switch(this.token.value) {
                                        case "PROGRAM":
                                        if(this.program.state != "INIT") {
                                                this.markError("Program already declared.");
                                        } else this.stateProgram();
                                        break;
                                        case "IS":
                                        if(this.program.state == "INIT") {
                                                this.program.state = "DECL";
                                        } else this.markError("unexpested IS.");
                                        break;
                                        default:
                                        this.markError(this.token.value + " is unsupported.");
                                } 
                                break;
                                case "STRT":    // BEGIN
                                switch(this.token.value) {
                                        case "BEGIN":
                                        if(this.program.state == "DECL") {
                                                this.program.state = "STMT";
                                        }
                                        else {
                                                this.program.markError("unexepted BEGIN statement.");
                                        }
                                        break;
                                        default:
                                        this.markError("unexpected " + this.token.value);
                                }
                                break;
                                case "COND":    // IF | ELSE
                                if(this.program.state != "STMT") {
                                        this.markError("BEIGN statement is needed before statements.");
                                } 
                                break;
                                case "GOTO":    // RETURN 
                                break;
                                case "LOOP":    // FOR 
                                break;
                                case "END":     // . | END | ;
                                switch(this.token.value) {
                                        case ".":
                                        this.program.completed = true;
                                        console.log(this.program);
                                        return;
                                        case "END":
                                        switch(this.next.value) {
                                                case "PROGRAM":
                                                this.program.statements.push("EOF");
                                                this.incrimentIndex();
                                                this.getToken();
                                                break;
                                                default:
                                                this.markError(this.next.value + " unexpected.");
                                        }
                                        break;
                                        case ";":
                                        this.markError(this.token.value + " unexpected.");
                                        break;
                                        default:
                                        this.markError("unsupported.");
                                }
                                break;
                                case "EXCP":
                                this.markError("Parsing ends at period.");
                                break;
                                case "EOF":
                                console.log(this.program);
                                return;
                        }
                }
        }

        incrimentIndex() {
                this.index = this.index + 1;
        }

        incrimentToken() {
                this.index = this.index + 1;
                this.getToken();
        }

        recover() {
                var recovering = true;
                while(recovering) {
                        switch(this.next.value) {
                                case ";":
                                this.incrimentIndex();
                                case "EOF":
                                case "GLOBAL":
                                case "BEGIN":
                                case ".":
                                recovering = false;
                                break;
                                default:
                                this.incrimentToken();
                        }
                }
        }

        stateProgram() {
                switch(this.next.type) {
                        case "IDEN":
                        this.incrimentToken();
                        if(this.program.symbols[this.token.name] == undefined) {
                                this.program.symbols.push(this.token.name);
                                this.program.symbols[this.token.name] = {
                                        "type" : "RESERVED",
                                        "value": null
                                }
                                this.program.name = this.token.name;
                                return;
                        }
                        else {
                                this.markError("program name is reserved.");
                                return;
                        }
                        default:
                        this.markError("Expected indentifier for PROGRAM.");
                        return;
                }
        }

        stateDeclaration() {
                this.incrimentToken();
                switch(this.token.value) {
                case "TYPE":
                switch(this.next.type) {
                case "IDEN":
                this.incrimentToken();
                        if(this.program.declarations[this.token.name] == null) {
                                var name = this.token.name;
                                this.program.declarations[name] = {
                                        "type" : "TYPE",
                                        "mark" : null,
                                        "enums": []
                                }
                                switch(this.next.value) {
                                case "IS":
                                this.incrimentToken();
                                if(this.stateType()) return;
                                this.program.declarations[name].mark = this.mark;
                                if(this.mark == "ENUM") {
                                        this.program.declarations[name].enums = this.enums;
                                }
                                break;
                                default:
                                this.markError("expected IS.");
                                return true;
                                }
                        } else {
                                this.markError("identifier cannot be reused.");
                                return true;
                        }
                        break;
                        default:
                        this.markError("identifier expected after " + this.next.value);
                        }
                        break;
                        case "VARIABLE":
                        break;
                        case "PROCEDURE":
                        break;
                        default:
                        this.markError("unsupported declaration type.");
                        return;
                }
        }

        stateType() {
                this.mark = null;
                switch(this.next.type) {
                       case "DECN":
                       switch(this.next.value) {
                                case "INTEGER":
                                case "FLOAT":
                                case "STRING":
                                case "BOOL":
                                this.incrimentToken();
                                this.mark = this.token.value;
                                return false;
                                case "ENUM":
                                this.incrimentToken();
                                if(this.stateEnum()) return true;
                                this.mark  = "ENUM";
                                return false;
                                break;
                                default:
                                this.markError("unexpected declaration type.");
                                return true;
                       }
                       case "IDEN":
                       this.incrimentToken();
                       if(this.program.symbols[this.token.name] != undefined) {
                               this.markError("identifier already used.");
                               return true;
                       }
                       this.mark = this.token.name;
                       return false;
                       default:
                       this.markError("unexpected value recived in state declaration.");
                       return true;
                }
        }

        stateEnum() {
                this.enums = [];
                var collecting = true;
                switch(this.next.value) {
                        case "{":
                        while(collecting) {
                                this.incrimentToken();
                                switch(this.next.type) {
                                case "IDEN":
                                if(this.program.symbols[this.next.name] != undefined) {
                                        this.markError("enum identifier already defined.");
                                        return true;
                                }
                                this.enums.push({"name" : this.next.name});
                                break;
                                case "BRKT":
                                if(this.next.value == "}") {
                                        this.incrimentToken();
                                        collecting = false;
                                        return false;
                                }
                                case "NEXT":
                                if(this.next.value == ",") {
                                        break;
                                }
                                default:
                                this.markError("expected identifier or ending bracket }.");
                                return true;
                                }
                        }
                        break;
                        default:
                        this.markError("missing bracket {.");
                        return true;
                }
        }
}
var parser = new Parser();

onmessage = function(e) {
        lexer.update(e.data);
        parser.update();   
}