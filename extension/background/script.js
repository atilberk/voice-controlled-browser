/*
Send a XHR to utilize the Stanford Parser to parse the command and return the response
*/
function stanfordParse(command) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "http://nlp.stanford.edu:8080/parser/index.jsp", false);
  xhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send("query="+encodeURIComponent(command));

  var el = $("<html></html>");
  el.html(xhttp.responseText);
  var parsed = $("pre#parse",el).text();

  return {"status":xhttp.status,"parsed": parsed};
}

function sendToActiveTab(message) {
  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then((tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message);
  });
}

function commandHandler(commandText) {
  parseResponse = stanfordParse(commandText);

  if (parseResponse.status = 200) {
    sendToActiveTab({"commandText":commandText, "parsed":parseResponse.parsed});
  }
}

browser.runtime.onMessage.addListener(commandHandler);
