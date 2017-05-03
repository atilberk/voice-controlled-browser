var port = browser.runtime.connectNative("vcbnative");

/*
Listen for messages from the app.
*/
port.onMessage.addListener((response) => {
  console.log("Received: " + response);
});

function sendToActiveTab(message) {
  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then((tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message);
  });
}

function commandHandler(message) {
  if (message.from != 'popup') { return; }
  console.log("command is being handled...");

  var commandText = message.payload.commandText;

  sendToActiveTab({
    from:'commandHandler',
    payload:{
      commandText: commandText,
      message: "Hello world2"
    }
  });

  console.log("Sending:  ping");
  port.postMessage("ping");

  /*
  parseResponse = stanfordParse(commandText);

  console.log("recieved parse result!");
  if (parseResponse.status = 200) {
    var rootTree = parsedToTree(parseResponse.parsed);

    var features = extractFeatures(rootTree);

    if (features.object == "tab" && features.action == "open") {
      var creating = browser.tabs.create({
        url : "http://vlocal.com/vcb/"
      });
      creating.then(
        function(tab){
          sendToActiveTab({
            from:'commandHandler',
            payload:{
              commandText: commandText,
              message: features.message
            }
          });
        },
        function(error){
          console.log(error);
        }
      );
    } else if (features.action == "click") {
      sendToActiveTab({
        from:'pageHandler',
        payload: {}
      });
      sendToActiveTab({
        from:'commandHandler',
        payload:{
          commandText: commandText+". And, you can see the list of links at the console",
          message: features.message
        }
      });
    } else {
      sendToActiveTab({
        from:'commandHandler',
        payload:{
          commandText: commandText,
          message: features.message
        }
      });
    }
  }
  */
}
browser.runtime.onMessage.addListener(commandHandler);
