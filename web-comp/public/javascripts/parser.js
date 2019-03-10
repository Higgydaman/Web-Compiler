'use strict'

// Some globals

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

        scanCode() {
                console.log("LEXER: Scanning code.");
        }

        // TODO: Make these actually usable, right now they just keep updating the complete lexer.
        insertOne() {
                console.log("LEXER: Inserting one.")
                this.scanCode();
        }

        insertMany() {
                console.log("LEXER: Inserting many.")
                this.scanCode();
        }

        updateOne() {
                console.log("LEXER: Updating one.")
                this.scanCode();
        }

        updateMany() {
                console.log("LEXER: Updating many.")
                this.scanCode();
        }

        deleteOne() {
                console.log("LEXER: Deleting one.")
                this.scanCode();
        }

        deleteMany() {
                console.log("LEXER: Deleting many.")
                this.scanCode();
        }
}
var lexer = new Scanner();

class Parser {
        constructor() {
                this.message = null;
        }

        update() {
                console.log("PARSER: Parsing the code.")
                this.message = lexer.code;
                console.log("PARSER: Parsing completed. Sending message back.")
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

// var token  = {
//         IDEN    : 1,    // Any identifier
//         END     : 2,    // Identifies the end of something              ; | . | END
//         STRT    : 3,    // Identifies the start of something            BEGIN 
//         BRKT    : 4,    // Identifies a bracket                         ( | ) | { | } | [ | ]
//         EXOP    : 5,    // Identifies an expressional operator          & | | 
//         NEXT    : 6,    // Identifies the next in a list                , 
//         AROP    : 7,    // Identifies arithmatic operators              - | + | * | / | \ 
//         RLOP    : 8,    // Identifies relational operators              < | <= | > | >= | =< | => | != | =! | ! | == | = | NOT | IS
//         PROG    : 9,    // Identifies a program state                   PROGRAM     
//         COND    : 10,   // Identifies a condiional state                IF | ELSE | RETURN
//         DECN    : 11,   // Identifies a declaration                     TYPE | VARIABLE | PROCEDURE | INTEGER | FLOAT | STRING | BOOL | ENUM
//         properties: {
//                 1       :       identifier_propeties,
//                 2       :       general_properties,
//                 3       :       general_properties,
//                 4       :       general_properties,
//                 5       :       general_properties,
//                 6       :       general_properties,
//                 7       :       general_properties,
//                 8       :       general_properties,
//                 9       :       general_properties,
//                 10      :       general_properties,
//                 11      :       general_properties
//         }
// }; 


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