'use strict'

// Some globals

class Scanner {
        constructor() {
            this.start = 0;
            this.end = 0;
        }
    
        update(data) {
            // See if it was a bulk update
            //console.log(data.details);
            this.details = data.details;
            this.code = data.value;
            var difference = this.details.end.row - this.details.start.row;
            //console.log(difference);
            if(difference == 0) {
                console.log("PARSER: No change detected.");
                return;
            }
            switch(data.details.action) {
                
                case "insert":
    
                if(difference == 1) {
                        console.log("PARSER: New line detected.");
                        if(this.end < this.details.end.row) {
                                this.insertOne();
                                this.end = this.details.end.row;
                        }
                        else {
                                this.updateOne();
                        }
                }
                else if(difference > 0) {
                        console.log("PARSER: Bulk insert detected.");
                        if(this.end < this.details.end.row) {
                                this.insertMany();
                                this.end = this.details.end.row;
                        }
                        else {
                                this.updateMany();
                        }
                }
                else {
                    console.log("PARSER: Unknown insert detected.")
                }
                break;
    
                case "remove":
    
                if(difference == 1) {
                        console.log("PARSER: Update line detected.");
                        console.log(this.details);
                        this.deleteOne();
                        this.end = this.end - 1;
                }
                else if(difference > 0) {
                        console.log("PARSER: Bulk delete detected.");
                        console.log(this.details);
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

        insertOne() {
                console.log("LEXER: Inserting one.")
        }

        insertMany() {
                console.log("LEXER: Inserting many.")
        }

        updateOne() {
                console.log("LEXER: Updating one.")
        }

        updateMany() {
                console.log("LEXER: Updating many.")
        }

        deleteOne() {
                console.log("LEXER: Deleting one.")
        }

        deleteMany() {
                console.log("LEXER: Deleting many.")
        }
}

var lexer = new Scanner();

onmessage = function(e) {
        //var result = e.data;
        //console.log(e.data);
        lexer.update(e.data);

        //postMessage(result);   
}





















var identifier_propeties = {  
        value : null,
        scope : null
}

var general_properties = {
        value : null
}

var token  = {
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
        DECN    : 11,   // Identifies a declaration                     TYPE | VARIABLE | PROCEDURE | INTEGER | FLOAT | STRING | BOOL | ENUM
        properties: {
                1       :       identifier_propeties,
                2       :       general_properties,
                3       :       general_properties,
                4       :       general_properties,
                5       :       general_properties,
                6       :       general_properties,
                7       :       general_properties,
                8       :       general_properties,
                9       :       general_properties,
                10      :       general_properties,
                11      :       general_properties
        }
}; 


class SymbolTable {
        constructor() {
                this.symbol_table = {};
        }
}

class Lexer {
        constructor(table, code) {
                this.table = table;
                this.code  = code;
                this.index = 0;
                this.token = null;
                this.completed = false;     
        }

        get completed() {
                return this.completed;
        }

        // Get a token from the code
        getToken() {
                getLexeme(this.code[this.index]);
        }

        // Just for debugging
        sayHi() {
                console.log("The lexer says HI!");
        }
}

class Parser {
        constructor(table, lexer) {
                this.table   = table;
                this.lexer   = lexer; 
                this.result  = {
                        success : false,      // Guilty until proven otherwise 
                        code_index : null,    // Marks the current index of the Lexer
                        output : null
                }            
        }

        getProgram(){
                while(this.lexer.completed() == false) {
                        let token = getToken();
                }
        }
        

}


// Go through the code until a lexeme is found
function findLexeme() {

}