var port = browser.runtime.connectNative("vcbnative");

/*
Listen for messages from the app.
*/
port.onMessage.addListener((response) => {
  if (response.responseTo != "action") {return;}
  console.log("Received: " + JSON.stringify(response));
  if (Date.now() -response.timestamp > 8000) {
    console.log("Timed-out");
    return;
  }
  if (response.action == "refresh") {
    vcbRefresh(response);
  } else if (response.action == "open") {
    vcbOpen(response);
  } else if (response.action == "close") {
    vcbClose(response);
  } else if (response.action == "switch") {
    vcbSwitch(response);
  } else if (response.action == "history") {
    vcbHistory(response);
  } else if (response.action == "go-to") {
    vcbGoto(response);
  } else if (response.action == "click") {
    vcbClick(response);
  } else if (response.action == "scroll") {
    vcbScroll(response);
  } else if (response.action == "type") {
    vcbType(response);
  } else if (response.action == "read") {
    sendToActiveTab({
      from:'commandHandler',
      payload:{
        commandText: response.command,
        action: response.action,
        message: response.command + " ["+response.action+"]",
        feedback: "I see that you want me to read something but I currently cannot."
      }
    });
  } else {
    sendToActiveTab({
      from:'commandHandler',
      payload:{
        commandText: response.command,
        action: response.action,
        message: response.command + " ["+response.action+"]",
        feedback: "I see that you want me to "+response.action+" by saying that "+response.command
      }
    });
  }
});
port.onMessage.addListener((response) => {
  if (response.responseTo != "execute") {return;}
  console.log("caught result message!");
  console.log(response);

  if (response.action == "click") {
    var fb = "Okay, clicking...";
    if (response.result.status == "none") {
      fb = "Couldn't understand where to click. Maybe you can be more descriptive?";
    } else if (response.result.status == "multiple") {
      fb = "Sorry, couldn't decide which one to click. Maybe you can be more specific?";
    }
    console.log(fb);
    sendToActiveTab({
      from:'commandHandler',
      payload:{
        commandText: response.command,
        action: response.action,
        message: response.result.status,
        feedback: fb
      }
    });
  } else if (response.action == "type") {
    var fb = "Okay, typing...";
    if (response.result.status == "none") {
      fb = "Couldn't understand where to type. Maybe you can be more descriptive?";
    } else if (response.result.status == "multiple") {
      fb = "Sorry, couldn't decide where to type. Maybe you can be more specific?";
    }
    console.log(fb);
    sendToActiveTab({
      from:'commandHandler',
      payload:{
        commandText: response.command,
        action: response.action,
        message: response.result.status,
        feedback: fb
      }
    });
  }
});

function sendToActiveTab(message) {
  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  return gettingActiveTab.then((tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message);
  });
}


function passTargets(message) {
  if (message.from != 'passHandler') { return; }
  port.postMessage({
    intent:"execute",
    command:message.payload.command,
    action:message.payload.action,
    targets: message.payload.targets,
    timestamp: message.payload.timestamp
  });
  console.log({
    intent:"execute",
    command:message.payload.command,
    action:message.payload.action,
    timestamp: message.payload.timestamp,
    targets: message.payload.targets
  });
  console.log(JSON.stringify(message.payload.targets[0]));
  console.log("posted to native");
}
browser.runtime.onMessage.addListener(passTargets);

function commandHandler(message) {
  if (message.from != 'popup') { return; }
  console.log("command is being handled...");

  var commandText = message.payload.commandText;

  console.log("Sending the command to the vcbnative");
  port.postMessage({
    intent:"action",
    command:commandText,
    timestamp:Date.now()
  });
}
browser.runtime.onMessage.addListener(commandHandler);

var latest = "";
function commandPoll() {
  console.log("polling...");
  var endPoint = 'https://voice-controlled-browser.firebaseio.com/commands.json?orderBy="timestamp"&limitToLast=1';
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", endPoint, false);
  xhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send();

  var resp = xhttp.responseText;
  var o = JSON.parse(resp);
  var k = Object.keys(o)[0];
  var t = o[k].timestamp;
  var c = o[k].command;
  if ((Date.now()-t < 10000) && (latest != t)) {
    console.log(o);
    // browser.runtime.sendMessage({from:'popup', payload:{commandText:resp}});
    commandHandler({from:'popup', payload:{commandText:c}});
  }
  latest = t;

  setTimeout(commandPoll,3000);
}
commandPoll();
