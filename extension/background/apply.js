function vcbRefresh(response) {
  sendToActiveTab({
    from:'commandHandler',
    payload:{
      commandText: response.command,
      action: response.action,
      message: response.command + " ["+response.action+"]",
      feedback: "Refreshing the page..."
    }
  }).then(()=>{setTimeout(()=>{
    var reloading = browser.tabs.reload();
  },1000); },()=>{});
}

function vcbOpen(response) {
  sendToActiveTab({
    from:'commandHandler',
    payload:{
      commandText: response.command,
      action: response.action,
      message: response.command + " ["+response.action+"]",
      feedback: "Opening you a new tab, what now?"
    }
  }).then(()=>{setTimeout(()=>{
    var creating = browser.tabs.create({
      url : browser.extension.getURL("resources/vcb.html")
    });
  },2000); },()=>{});
}

function vcbClose(response) {
  sendToActiveTab({
    from:'commandHandler',
    payload:{
      commandText: response.command,
      action: response.action,
      message: response.command + " ["+response.action+"]",
      feedback: "Closing the tab..."
    }
  }).then(()=>{setTimeout(()=>{
    var gettingCurrent = browser.tabs.query({currentWindow:true,active:true});
    gettingCurrent.then(
      function(tabs) {
        console.log(tabs);
        var removing = browser.tabs.remove(tabs[0].id);
      },function(error){
        console.log(error);
      }
    );
  },1500); },()=>{});
}

function vcbHistory(response) {
  sendToActiveTab({
    from:'commandHandler',
    payload:{
      commandText: response.command,
      action: response.action,
      message: "Going back in the history...",
      feedback: "Going back in the history..."
    }
  }).then(()=>{
    setTimeout(()=>{
      port.postMessage({
        intent:"execute",
        action:"history",
        command:response.command,
        timestamp:response.timestamp
      });
    },1500);
  },()=>{});
}

function num2order(num,active,total) {
  var str = "";
  switch (num) {
    case 0:
    str += "first";
    break;
    case 1:
    str += "second";
    break;
    case 2:
    str += "third";
    break;
    case 3:
    str += "fourth";
    break;
    case 4:
    str += "fifth";
    break;
    case 5:
    str += "sixth";
    break;
    case total-1:
    str += " last";
    break;
  }
  if (num == active - 1) {
    str += " left previous";
  } else if (num == active + 1) {
    str += " right next";
  }
  return str;
}
function vcbSwitch(response) {
  var querying = browser.tabs.query({currentWindow:true});
  querying.then(
    function(tabs) {
      sendToActiveTab({
        from:'logHandler',
        payload:{
          message: tabs
        }
      });
      var tabsPayload = [];
      var activeIndex = tabs.filter((tab) => tab.active)[0].index;
      for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        tabsPayload.push({
          order : num2order(tab.index,activeIndex,tabs.length),
          title : tab.title,
          url : tab.url
        });
      }
      sendToActiveTab({
        from:'logHandler',
        payload:{
          message: tabsPayload
        }
      });
      sendToActiveTab({
        from:'logHandler',
        payload:{
          message: predictTab(response.command,tabsPayload)
        }
      });
      sendToActiveTab({
        from:'commandHandler',
        payload:{
          commandText: response.command,
          action: response.action,
          message: "Switching the tab",
          feedback: "Switching the tab"
        }
      }).then(()=>{setTimeout(()=>{
        var updating = browser.tabs.update(
          tabs[predictTab(response.command,tabsPayload)].id,
            {active:true}
          );
      },1500); },()=>{});
    },
    function(error){console.log(error);}
  );
}

function predictTab(cmd, tabsPayload) {
  var scores = [];
  var cmdSet = new Set(cmd.toLowerCase().split(' ').splice(1).filter((t)=>t.length));
  for (var i = 0; i < tabsPayload.length; i++) {
    var pl = tabsPayload[i];
    var tabw = pl.title + " " + pl.url + " " + pl.order;
    tabw = tabw.replace(/[!"#$%&'()*+,\-.\/ :;<=>?@[\\\]^_`{|}~]+/g, " ");
    tabSet = tabw.toLowerCase().split(' ');
    var intersection = tabSet.filter(x => cmdSet.has(x));
    scores.push(intersection.length);
  }
  return scores.indexOf(Math.max(...scores));
}

function vcbGoto(response) {
  var cmd = response.command;
  var urls = cmd.match(/(www.)?[a-z0-9]+.(com|net|org|edu)[.a-z0-9]*/g);
  if (urls.length > 0) {
    sendToActiveTab({
      from:'commandHandler',
      payload:{
        commandText: response.command,
        action: response.action,
        message: "Okay, taking you to "+urls[0],
        feedback: "Okay, taking you to "+urls[0]
      }
    }).then(()=>{setTimeout(()=>{
    var updating = browser.tabs.update({
      url: "http://" + urls[0]
    });
    },1500); },()=>{});
  } else {
    sendToActiveTab({
      from:'commandHandler',
      payload:{
        commandText: response.command,
        action: response.action,
        message: "Sorry, couldn't understand the address you are saying.",
        feedback: "Sorry, couldn't understand the address you are saying."
      }
    });
  }
}

function vcbClick(response) {
  console.log("VCB Click is called");
  sendToActiveTab({
    from:'pageHandler',
    payload:{
      commandText: response.command,
      action: response.action,
      timestamp: response.timestamp
    }
  });
}

function vcbType(response) {
  console.log("VCB Type is called");
  sendToActiveTab({
    from:'pageHandler',
    payload:{
      commandText: response.command,
      action: response.action,
      timestamp: response.timestamp
    }
  });
}

function vcbScroll(response) {
  sendToActiveTab({
    from:'pageHandler',
    payload:{
      commandText: response.command,
      action: response.action,
      timestamp: response.timestamp,
      scrollTo: response.scroll
    }
  });
}
