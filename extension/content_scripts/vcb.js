/*
vcb():
* removes every node in the document.body,
* then inserts the supplied command
* then removes itself as a listener
*/

(function signalOut() {
  console.log("VCB is on!");
  setTimeout(signalOut,2000);
})();

function vcb(request, sender, sendResponse) {
  removeEverything();
  insertCommand(request.commandText);
  browser.runtime.onMessage.removeListener(vcb);
}

/*
Remove every node under document.body
*/
function removeEverything() {
  while (document.body.firstChild) {
    document.body.firstChild.remove();
  }
}

/*
Given a command, create and style an SPAN node consisting of the command,
then insert the node into the document.
*/
function insertCommand(commandText) {
  var commandSpan = document.createElement("span");
  commandSpan.appendChild( document.createTextNode(commandText) );
  document.body.appendChild(commandSpan);
}

/*
Assign vcb() as a listener for messages from the extension.
*/
browser.runtime.onMessage.addListener(vcb);
