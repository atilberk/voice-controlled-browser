/*
Get the command text from the corresponding input source.
*/
function getCommandText() {
  return document.getElementById('command').value;
}

/*
Clear the input field out.
*/
function clearCommandPrompt() {
  document.getElementById('command').value = "";
}

/*
Get and validate the input command

Inject the "vcb.js" content script in the active tab.

Then get the active tab and send "vcb.js" a message
containing the command text.
*/
function sendCommand() {
  var commandText = getCommandText();

  if (commandText.length) {
    browser.runtime.sendMessage(commandText);
    clearCommandPrompt();
  }
}

/*
Listen for key presses to the text field in the popup.

If the enter key is pressed:
Send the typed command to the page
*/
document.addEventListener("keydown", (e) => {
  if (e.target.id == "command" && e.which === 13) {
    sendCommand();
  }
});
