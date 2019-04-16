'using strict'

// TODO: Make a custom mode so that sexy text highlighting happens

/*  Prototype time! 
*   I am going to make the main thread (this one) the main hub for storage since it is allocated more from the start.
*   
*   An interesting issue is memory managent and when to completely restart the front end and when not to. 
*   I think this issue can be solved by managing the new inputs correctly. 
*   IF the input is updated, where was it updated? Can we match the overall Lex to the current input? I think so.
*   IF we parse the input into blocks where the beggining line number is associated with a handful of token, then we can modify JUST those token associted with that line number.
*   So the call to the scanner is simply an update to the tokens associated with that line number. Then Viola, we have a more dynamic front end.
*   We may be able to parse by line as well, maybe a stage 1 parse? I think this issue is a problem for future cameron.
*   I suppose we can just keep parsing until the parser does not see an error, otherwise we could just update the output with the error and line number. Or maybe just the current input error? 
*   I think we just made an IDE. For simplicity for now, lets just return from the parser a line number where the error occured. 
*   I also think that maybe the lexer can be tested and implimented as an extremely fast consistant feed back tool within the editor. 
*
*   On a update to the editor,
*   1) Main thread needs to detect a change in just a line number or a change to multiple.....copy and paste is a thing afterall. 
*   2) To make this editor as dynamic and snappy as possible, it may be smart to spawn a worker PER line update that updates just that line's tokens and then dies upon completion.   
*   This calls for a good ol fashioned re-write.
*/


// Some globals that are needed, we assume we have at least 4 threads for now
const front_end = new Worker("/javascripts/compiler/front.js");

document.getElementById("Scanner").addEventListener("click", switch_toScanner);
document.getElementById("Parser").addEventListener("click", switch_toParser);
document.getElementById("Code").addEventListener("click", switch_toCode);

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
        print_result = " << SCANNER OUTPUT >> \n";
        front_message.tokens.forEach(function(element) {
            print_result = print_result + "<" + element.type + "," + element.value + "," + (element.line + 1) + "> \n";
        });
        break;
        case "PARSER":
        print_result = " << PARSER OUTPUT >> \n";
        print_result = print_result + "<PROGRAM NAME," + front_message.program.name + ">\n";
        if(front_message.program.variables != null) {
            print_result = print_result + "<GLOBAL VARIABLES, \n";
            for(var variable in front_message.program.variables["GLOBAL"]) {
                print_result = print_result + "(" + variable + "," + front_message.program.variables["GLOBAL"][variable].type + "," + front_message.program.variables["GLOBAL"][variable].value + ")\n";
            }
            print_result = print_result + ">\n";
            for(var scope in front_message.program.variables) {
                if(scope != "GLOBAL") {
                    print_result = print_result + "<" + scope + " VARIABLES, \n";
                    for(var variable in front_message.program.variables[scope]) {
                        print_result = print_result + "(" + variable + "," + front_message.program.variables[scope][variable].type + "," + front_message.program.variables[scope][variable].value + ")\n";
                    }
                    print_result = print_result + ">\n";
                }
            }
            
        }
        break;
        case "CODE":
        print_result = " << CODE OUTPUT >> \n";
        break;
        default:
        print_result = " Select an output. \n";
    }
    if(front_message.error != true && state == "PARSER") print_result = print_result + "<PROGRAM END>\n";
    else if(state != "PARSER") {
        
    }
    else {
        print_result = print_result + "***PROGRAM PARSE FAILURE***\n";
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