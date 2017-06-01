function featurizeElement(element, action_type) {
  if (action_type == "click") {
    var bcr = element[0].getBoundingClientRect();
    return {
      "tag" : element.prop("tagName"),
      "type" : element.attr("type") || "",
      "value" : element.val() || "",
      "placeholder" : element.attr("placeholder") || "",
      "id" : element.attr("id") || "",
      "class" : element.attr("class") || "",
      "text" : element.text() || "",
      "url" : element.attr("href") || "",
      "x" : bcr.x,
      "y" : bcr.y,
      "width" : bcr.width,
      "height" : bcr.height,
    }
  } else if (action_type == "type") {
    var bcr = element[0].getBoundingClientRect();
    return {
      "tag" : element.prop("tagName"),
      "type" : element.attr("type") || "",
      "value" : element.val() || "",
      "placeholder" : element.attr("placeholder") || "",
      "id" : element.attr("id") || "",
      "class" : element.attr("class") || "",
      "text" : element.text() || "",
      "label" : (element.closest("label").length) ? element.closest("label").text() : "",
      "title" : element.attr("title") || "",
      "url" : element.attr("href") || "",
      "x" : bcr.x,
      "y" : bcr.y,
      "width" : bcr.width,
      "height" : bcr.height,
    }
  } else {
    return {}
  }
}

/*
check whether the element is visible
and partially or completely seen in the window
*/
function isInScreen(el) {
  var bore = el.getBoundingClientRect();
  return $(el).css("display") != "none"
  && $(el).css("visibility") != "hidden"
  && bore.top < $(window).height()
  && bore.bottom > 0;
}

/*
find the elements that are bound to an event
*/
function findElementsByEvent(me, eventType) {
  var elements = [];
  if (typeof $._data($(me)[0], 'events') !== "undefined") {
    if (eventType in $._data($(me)[0], 'events')) {
      console.log("found!");
      elements.push($(me)[0]);
      console.log(elements);
    }
  }
  for (var i = 0; i < $(me).children().length; i++) {
    elements = elements.concat(findElementsByEvent($(me).children()[i],eventType));
  }
  return elements;
}

/*
Find the elements with the specific tags
*/
function findElementsByTag(tags) {
  var links = $(tags);
  var elements = [];
  for (var i = 0; i < links.length; i++) {
    elements.push(links[i]);
  }
  return elements;
}

/*
Maps each element to its feature object
*/
function prepareElements(elements, action_type) {
  var payload = [];
  for (var i = 0; i < elements.length; i++) {
    var el = elements[i];
    var pl = featurizeElement($(el),action_type);
    payload.push(pl);
  }
  return payload;
}

/*
function filterLinks(cmd, links) {
  var cmdSet = new Set(cmd.toLowerCase().split(' ').splice(1).filter((t)=>t.length));
  var scores = [];
  for (var i = 0; i < links.length; i++) {
    var pl = links[i];
    var linkw = pl.text;
    linkw = linkw.replace(/[!"#$%&'()*+,\-.\/ :;<=>?@[\\\]^_`{|}~]+/g, " ");
    linkSet = linkw.toLowerCase().split(' ');
    var intersection = linkSet.filter(x => cmdSet.has(x));
    scores.push(intersection.length);
  }
  return links[scores.indexOf(Math.max(...scores))];
}
*/

function logElements(request, sender, sendResponse) {
  if(request.from != 'pageHandler') {return;}
  console.log("logging!");
  console.log(request.payload.action);
  if (Date.now() -request.payload.timestamp > 8000) {
    console.log("Timed-out");
    return;
  }
  if (request.payload.action == "click") {
    var elements = findElementsByTag("a, button, input[type!=text]")
                    .concat(findElementsByEvent("body",request.payload.action))
                    .filter(isInScreen)
                    .map((el) => featurizeElement($(el), request.payload.action));

    console.log(elements);
    console.log("sending native message...");
    browser.runtime.sendMessage({
      from:'passHandler',
      payload: {
        targets: elements,
        command: request.payload.commandText,
        action: request.payload.action,
        timestamp: request.payload.timestamp
      }
    });
    console.log("message passed to bg");
  } else if (request.payload.action == "type") {
    var elements = findElementsByTag("input[type=text], textarea")
                    // .concat(findElementsByEvent("body",request.payload.action))
                    .filter(isInScreen)
                    .map((el) => featurizeElement($(el), request.payload.action));

    console.log(elements);
    console.log("sending native message...");
    browser.runtime.sendMessage({
      from:'passHandler',
      payload: {
        targets: elements,
        command: request.payload.commandText,
        action: request.payload.action,
        timestamp: request.payload.timestamp
      }
    });
    console.log("message passed to bg");
  } else if (request.payload.action == "scroll") {
    if (request.payload.scrollTo == "down") {
      window.scrollTo(0, window.scrollY+360);
    } else if (request.payload.scrollTo == "up") {
      window.scrollTo(0, window.scrollY-360);
    } else if (request.payload.scrollTo == "top") {
      window.scrollTo(0, 0);
    } else if (request.payload.scrollTo == "bottom") {
      window.scrollTo(0, window.scrollMaxY);
    }
  }
}

$(document).ready(function(){
  browser.runtime.onMessage.addListener(logElements);
  console.log("logElements added.");
});
