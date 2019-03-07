'using strict'

function ready(){
    setupEditor();
    update();
}

const parser = new Worker("/javascripts/parser.js");
const idoc = document.getElementById('iframe').contentWindow.document;

parser.onmessage = function(e) {
    idoc.open();
    idoc.write(e.data);
    idoc.close();
}

function update(){
    if(window.Worker) {
        // this.parser.terminate();
        parser.postMessage(editor.getValue());
    }
    else {
        console.log("Fucking browser doesn't support that shit dawg.")
    }
}

function setupEditor() {
    window.editor = ace.edit("editor");
    editor.setTheme("ace/theme/chaos");
    

    // I have to redo all this
//     editor.getSession().setMode("ace/mode/html");
//     editor.setValue(`<!DOCTYPE html>
//   <html>
//   <head>
//   </head>
  
//   <body>
//   </body>
  
//   </html>`,1); //1 = moves cursor to end
    editor.getSession().on('change', function() {
        update();
    });
    editor.focus();
    editor.setOptions({
      fontSize: "16pt",
      showLineNumbers: true,
      showGutter: false,
      vScrollBarAlwaysVisible:true,
      enableBasicAutocompletion: false, enableLiveAutocompletion: false
    });
  
    editor.setShowPrintMargin(false);
    editor.setBehavioursEnabled(false);
}