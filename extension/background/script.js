function sendToActiveTab(message) {
  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then((tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message);
  });
}

function commandHandler(commandText) {
  parseResponse = stanfordParse(commandText);

  if (parseResponse.status = 200) {
    var rootTree = parsedToTree(parseResponse.parsed);

    var features = extractFeatures(rootTree);

    if (features.object == "tab" && features.action == "open") {
      var creating = browser.tabs.create({
        url : "http://vlocal.com/vcb/"
      });
      creating.then(
        function(tab){
          sendToActiveTab({commandText: commandText, message: features.message});
        },
        function(error){
          console.log(error);
        }
      );
    } else {
      sendToActiveTab({commandText: commandText, message: features.message});
    }
  }
}

browser.runtime.onMessage.addListener(commandHandler);
