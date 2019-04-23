'using strict'

// TODO: Make a custom mode so that sexy text highlighting happens

// Some globals that are needed, we assume we have at least 4 threads for now
const front_end = new Worker("/javascripts/compiler/front.js");

document.getElementById("Scanner").addEventListener("click", switch_toScanner);
document.getElementById("Parser").addEventListener("click", switch_toParser);
document.getElementById("Code").addEventListener("click", switch_toCode);


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
                printer.print_result = printer.print_result + "[" + argument.type + "," + argument.value + "]";
            });
            printer.print_result = printer.print_result + "\n";
            break;
            case printer.Types.loop:
            printer.print_result = printer.print_result + space + "LOOP -> \n";
            printer.print_result = printer.print_result + space + "VARIABLE: " + operation.value.value.key + ",EXPRESSION: ";
            operation.value.expression.forEach(function(argument) {
                printer.print_result = printer.print_result + "[" + argument.type + "," + argument.value + "]";
            });
            printer.print_result = printer.print_result + space + "\n";
            printer.print_result = printer.print_result + space + "EXPRESSION: ";
            operation.expression.forEach(function(argument) {
                printer.print_result = printer.print_result + "[" + argument.type + "," + argument.value + "]";
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
                printer.print_result = printer.print_result + "[" + argument.type + "," + argument.value + "]";
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
                printer.print_result = printer.print_result + "[" + argument.type + "," + argument.key + "]";
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

var front_message = null;
front_end.onmessage = function(e) {
    // See where the error is

    front_message = e.data;

    editor.getSession().clearAnnotations();
    console.log(e.data);
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
        console.log(front_message.program.parser_ops);
        printer.printParser(front_message.program.parser_ops.operations);
        return; 
        case "CODE":
        print_result = " << CODE OUTPUT >> \n";
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

