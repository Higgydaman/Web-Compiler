'using strict'

// TODO: Make a custom mode so that sexy text highlighting happens

// Some globals that are needed, we assume we have at least 4 threads for now
const front_end = new Worker("/javascripts/compiler/front.js");

document.getElementById("Scanner").addEventListener("click", switch_toScanner);
document.getElementById("Parser").addEventListener("click", switch_toParser);
document.getElementById("Code").addEventListener("click", switch_toCode);
document.getElementById("Language").addEventListener("click", switch_toLanguage);


class Print {
    Types = {
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
        "end_procedure" : 11
    }   
    printParser(ops) {
        this.print_result = "";
        parser(ops, 0);
        this.print_result = this.print_result + "COMPLETE PROGRAM STRUCTURE IN MEMORY:";
        this.print_result = this.print_result + JSON.stringify(ops, undefined, 5);
        result.setValue(this.print_result);
        result.clearSelection();
    };
};
printer = new Print();

function parser(ops, tab) {
    let space = "";
    let less_space = "";
    for(let i = 0; i < tab; i++) {
        space = space + "   ";
        if(i == (tab - 2)) {
            less_space = space;
        }
    }
    ops.forEach(function(operation) {
        switch(operation.type) {
            case printer.Types.start:
            printer.print_result = printer.print_result + "START PROGRAM: " + operation.value + "\n";
            break;
            case printer.Types.assignment:
            printer.print_result = printer.print_result + space + "ASSIGNMENT -> \n";
            printer.print_result = printer.print_result + space + "TO: " + operation.value.key + ",TYPE: " + operation.value.type + ",INDEX " + operation.value.index + ",BOUND: " + operation.value.bound + "\n";
            printer.print_result = printer.print_result + space + "FROM EXPRESSION: ";
            operation.expression.forEach(function(argument) {
                if(argument.value == "IDEN") {
                    printer.print_result = printer.print_result + "[" + argument.key + "," + argument.type + "," + argument.value + "," + argument.index + "," + argument.bound + "]";
                }
                else {
                    printer.print_result = printer.print_result + "[" + argument.type + "," + argument.value + "]";
                }
            });
            printer.print_result = printer.print_result + "\n";
            break;
            case printer.Types.loop:
            printer.print_result = printer.print_result + space + "LOOP -> \n";
            printer.print_result = printer.print_result + space + "VARIABLE: " + operation.value.value.key + ",EXPRESSION: ";
            operation.value.expression.forEach(function(argument) {
                if(argument.value == "IDEN") {
                    printer.print_result = printer.print_result + "[" + argument.key + "," + argument.type + "," + argument.value + "," + argument.index + "," + argument.bound + "]";
                }
                else {
                    printer.print_result = printer.print_result + "[" + argument.type + "," + argument.value + "]";
                }
            });
            printer.print_result = printer.print_result + space + "\n";
            printer.print_result = printer.print_result + space + "EXPRESSION: ";
            operation.expression.forEach(function(argument) {
                if(argument.value == "IDEN") {
                    printer.print_result = printer.print_result + "[" + argument.key + "," + argument.type + "," + argument.value + "," + argument.index + "," + argument.bound + "]";
                }
                else {
                    printer.print_result = printer.print_result + "[" + argument.type + "," + argument.value + "]";
                }
            });
            printer.print_result = printer.print_result + "\n";
            printer.print_result = printer.print_result + space + "OPERATIONS -> \n";
            parser(operation.operations, tab + 1);
            break;
            case printer.Types.end_for:
            printer.print_result = printer.print_result + less_space + "END FOR \n";
            break;
            case printer.Types.IF:
            printer.print_result = printer.print_result + space + "IF STATEMENT -> \n";
            printer.print_result = printer.print_result + space + "EXPRESSION: ";
            operation.expression.forEach(function(argument) {
                if(argument.value == "IDEN") {
                    printer.print_result = printer.print_result + "[" + argument.key + "," + argument.type + "," + argument.value + "," + argument.index + "," + argument.bound + "]";
                }
                else {
                    printer.print_result = printer.print_result + "[" + argument.type + "," + argument.value + "]";
                }
            });
            printer.print_result = printer.print_result + "\n";
            printer.print_result = printer.print_result + space + "OPERATIONS -> \n";
            parser(operation.operations, tab + 1);
            break; 
            case printer.Types.end_if:
            printer.print_result = printer.print_result + less_space + "END IF \n";
            break;
            case printer.Types.ELSE:
            printer.print_result = printer.print_result + space + "ELSE \n";
            break;
            case printer.Types.end_program:
            printer.print_result = printer.print_result + "END PROGRAM \n";
            break;
            case printer.Types.procedure:
            printer.print_result = printer.print_result + space + "PROCEDURE " + operation.value + " -> \n";
            printer.print_result = printer.print_result + space + "PARAMETERS: ";
            operation.parameters.forEach(function(argument) {
                if(argument.value == "IDEN") {
                    printer.print_result = printer.print_result + "[" + argument.key + "," + argument.type + "," + argument.value + "," + argument.index + "," + argument.bound + "]";
                }
                else {
                    printer.print_result = printer.print_result + "[" + argument.type + "," + argument.value + "]";
                }
            });
            printer.print_result = printer.print_result + "\n";
            printer.print_result = printer.print_result + space + "OPERATIONS -> \n";
            parser(operation.operations, tab + 1);
            break;
            case printer.Types.end_procedure:
            printer.print_result = printer.print_result + less_space + "END PROCEDURE \n";
            break;
        }
    });
}

function ready() {
    setupEditor();
}

var state = null;
function switch_toScanner() {
    state = "SCANNER";
    if(front_message != null) printResult();
}
function switch_toParser() {
    state = "PARSER";
    if(front_message != null) printResult();
}
function switch_toCode() {
    state = "CODE";
    if(front_message != null) printResult();
}

function switch_toLanguage() {
    state = "LANGUAGE";
    if(front_message != null) printResult();
}

var front_message = null;
front_end.onmessage = function(e) {
    // See where the error is

    front_message = e.data;

    editor.getSession().clearAnnotations();
    if(e.data.error == true) {
        var length = e.data.list.length - 1;
        var i = 0;
        while(i <= length) {
            editor.getSession().setAnnotations([{
                row: e.data.list[i].line,
                column: 1,
                text: e.data.list[i].msg,
                type: "error"
            }]);
            i = i + 1;
        }
    }

    printResult();
}

function printResult() {
    var print_result = null;
    switch(state) {
        case "SCANNER":
        print_result = "***********SCANNER OUTPUT*********** \n";
        print_result = "\n";
        front_message.tokens.forEach(function(element) {
            print_result = print_result + "<" + element.type + "," + element.value + "," + (element.line + 1) + "> \n";
        });
        break;
        case "PARSER":
        printer.printParser(front_message.program.parser_ops.operations);
        return; 
        case "CODE":
        print_result = " << CODE OUTPUT >> \n";
        break;
        case "LANGUAGE":
        print_result = " << LANGUAGE >> \n";
        print_result = print_result + "<program> ::= " + "\n" +
        "   <program_header> <program_body> . " + "\n" +
        "\n" +
        "<program_header> ::= program <identifier> is" + "\n" +
        "\n" + 
        "<program_body> ::= " + "\n" +
        "       ( <declaration> ; )*" + "\n" +
        "begin" +  "\n" +
        "       ( <statement> ; )*" +  "\n" +
        "end program" + "\n" +
        "\n" +
        "<declaration> ::=" + "\n" +
        "       [ global ] <procedure_declaration>" + "\n" +
        "|      [ global ] <variable_declaration>" + "\n" +
        "|      [ global ] <type_declaration>" + "\n" +
        "\n" +
        "<procedure_declaration> ::=" + "\n" +
        "   <procedure_header> <procedure_body>" + "\n" +
        "<procedure_header> :: = " + "\n" +
        "   procedure <identifier> : <type_mark>" + "\n" +
        "           ( [<parameter_list>] ) " + "\n" +
        "\n" +
        "<parameter_list> ::= " + "\n" +
        "   <parameter> , <parameter_list>" + "\n" +
        "|  <parameter>" + "\n" +
        "\n" +
        "<parameter> ::= <variable_declaration>" + "\n" +
        "\n" +
        "<procedure_body> ::=" + "\n" +
        "               ( <declaration> ; )*" + "\n" +
        "   begin" + "\n" +
        "               ( <statement> ; )*" + "\n" +
        "   end procedure" + "\n" +
        "\n" +
        "<variable_declaration> ::=" + "\n" +
        "   variable <identifier>: <type_mark>" + "\n" +
        "           [ [ <bound> ] ]" + "\n" +
        "\n" +
        "<type_declaration> ::=" + "\n" +
        "   type <identifier> is <type_mark>" + "\n" +
        "\n" +
        "<type_mark>" + "\n" +
        "   integer | float | string | bool" + "\n" +
        "|  <identifier>" + "\n" +
        "|  enum { <identifier> ( , <identifier> )* }" + "\n" +
        "\n" +
        "<bound> ::= <number>"+ "\n" +
        "\n" +
        "<statement> ::="+ "\n" +
        "   <assignment_statement>"+ "\n" +
        "|  <if_statement>"+ "\n" +
        "|  <loop_statement>"+ "\n" +
        "|  <return_statement>"+ "\n" +
        "\n" +
        "<procedure_call> ::="+ "\n" +
        "   <identifier> ( [<argument_list>] )"+ "\n" +
        "\n" +
        "<assignment_statement> ::="+ "\n" +
        "   <destination> := <expression>"+ "\n" +
        "\n" +
        "<destination> ::="+ "\n" +
        "   <identifier> [ [ <expression> ] ]"+ "\n" +
        "\n" +
        "<if_statement> ::="+ "\n" +
        "   if ( <expression> ) then ( <statement> ; )*"+ "\n" +
        "   [ else ( <statement> ; )* ]"+ "\n" +
        "   end if"+ "\n" +
        "\n" +
        "<loop_statement> ::="+ "\n" +
        "   for ( <assignment_statement> ;"+ "\n" +
        "           <expression> )"+ "\n" +
        "           ( <statement> ; )*"+ "\n" +
        "   end for"+ "\n" +
        "\n" +
        "<return_statement> ::= return <expression>"+ "\n" +
        "\n" +
        "<identifier> ::= [a-zA-Z][a-zA-Z0-9_]*"+ "\n" +
        "\n" +
        "<expression> ::="+ "\n" +
        "   <expression> & <arithOp>"+ "\n" +
        "|  <expression> | <arithOp>"+ "\n" +
        "|  [ not ] <arithOp>"+ "\n" +
        "\n" +
        "<arithOp> ::="+ "\n" +
        "   <arithOp> + <relation>"+ "\n" +
        "|  <arithOp> - <relation>"+ "\n" +
        "|  <relation>"+ "\n" +
        "\n" +
        "<relation> ::="+ "\n" +
        "   <relation> < <term>"+ "\n" +
        "|  <relation> >= <term>"+ "\n" +
        "|  <relation> <= <term>"+ "\n" +
        "|  <relation> > <term>"+ "\n" +
        "|  <relation> == <term>"+ "\n" +
        "|  <relation> != <term>"+ "\n" +
        "|  <term>"+ "\n" +
        "\n" +
        "<term> ::="+ "\n" +
        "   <term> * <factor>"+ "\n" +
        "|  <term> / <factor>"+ "\n" +
        "|  <factor>"+ "\n" +
        "\n" +
        "<factor> ::="+ "\n" +
        "   ( <expression> )"+ "\n" +
        "|  <procedure_call>"+ "\n" +
        "|  [ - ] <name>"+ "\n" +
        "|  [ - ] <number>"+ "\n" +
        "|  <string>"+ "\n" +
        "|  true"+ "\n" +
        "|  false"+ "\n" +
        "\n" +
        "<name> ::="+ "\n" +
        "   <identifier> [ [ <expression> ] ]"+ "\n" +
        "\n" +
        "<argument_list> ::="+ "\n" +
        "   <expression> , <argument_list>"+ "\n" +
        "|  <expression>"+ "\n" +
        "\n" +
        "<number> ::= [0-9][0-9_]*[.[0-9_]*]"+ "\n" +
        "END"+ "\n" +
        "\n" +
        "\n" +
        "\n" +
        "\n" ;
        break;
        default:
        print_result = " Select an output. \n";
    }
    result.setValue(print_result);
    result.clearSelection();
}

function setupEditor() {
    window.editor = ace.edit("editor");
    window.result = ace.edit("result");
    editor.setTheme("ace/theme/chaos");
    result.setTheme("ace/theme/cobalt");
    editor.getSession().on('change', function(data) {
        // This section handles the parser thread. 
        var difference = data.end.row - data.start.row;
        if(difference > 0) {
            value = editor.getValue();
            message = {
                "details": data,
                "value": value
            }
            front_end.postMessage(message);
        }
        else if(data.action == "insert") {
            var input = data.lines[0];
            if((input == " ") || (input == ";") || (input == ".")) {
                value = editor.getValue();
                message = {
                    "details": data,
                    "value": value
                }
                front_end.postMessage(message);
            }
        }

    });
    editor.focus();
    editor.setOptions({
      fontSize: "16pt",
      showLineNumbers: true,
      showGutter: true,
      vScrollBarAlwaysVisible:true,
      enableBasicAutocompletion: false, enableLiveAutocompletion: false
    });
    result.focus();
    result.setOptions({
      fontSize: "16pt",
      showLineNumbers: true,
      showGutter: true,
      vScrollBarAlwaysVisible:true,
      enableBasicAutocompletion: false, enableLiveAutocompletion: false
    });
    
    editor.setShowPrintMargin(true);
    editor.setBehavioursEnabled(false);

    editor.setValue(
    `program YOUR_PROGRAM_NAME is   
// Set some globals here before the begin!

begin
// Start your program code here after begin and before the end program!

end program.
    `,1); //1 = moves cursor to end
}

