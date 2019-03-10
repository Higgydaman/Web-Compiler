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
const parser = new Worker("/javascripts/parser.js");
const scanner = new Worker("/javascripts/scanner.js");

function ready() {
    setupEditor();
}

parser.onmessage = function(e) {
    // See where the error is

    // Mark it in the editor
    if(e.data.error.flag == true) {
        result.setValue(e.data.error.msg,1);
    }
    else {
        //console.log(e.data.tree);
        result.setValue(e.data.tree);
    }
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
            //console.log("MAIN: Sending message to parser thread.")
            value = editor.getValue();
            message = {
                "details": data,
                "value": value
            }
            parser.postMessage(message);
        }
        else {
            value = editor.getValue();
            // var Range = require("ace/range").Range
            // editor.session.addMarker(new Range(0, 0, 0, 1), 'ace_highlight-marker', 'fullLine');
            
        }

        // This code handles the scanner thread and immediate highlighting.
        // TODO

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