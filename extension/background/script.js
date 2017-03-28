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
  var parsed = $("pre#parse",el).text().trim();

  return {"status":xhttp.status,"parsed": parsed};
}

function parsedToTree(parsed) {
  var tree = {tag:'',children:[]};
  if (parsed[0] == '(' && parsed[parsed.length -1] == ')') {
    parsed = parsed.substring(1,parsed.length-1);
    tree.tag = parsed.substring(0,parsed.indexOf(" "));
    parsed = parsed.substring(parsed.indexOf(" ")+1);
    var stack = [];
    for (var i = 0; i < parsed.length; i++) {
      var ch = parsed[i];
      if (ch == '(') {
        stack.push(i);
      } else if (ch == ')') {
        var j = stack.pop();
        if (stack.length == 0) {
          var subtree = parsedToTree(parsed.substring(j,i+1));
          tree.children.push(subtree);
        }
      }
    }
    if (tree.children.length == 0) {
      tree.token = parsed;
      tree.isLeaf = true;
    } else {
      tree.isLeaf = false;
    }
  }
  return tree;
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
