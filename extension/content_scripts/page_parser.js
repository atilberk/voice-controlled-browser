/*
Returns the links available on the current screen
*/
function getLinks() {
  var links = $("a").filter(
    /*
    check whether the element is visible
    and partially or completely seen in the window
    */
    (idx) => {
      var bore = $(this)[0].getBoundingClientRect();
      return $(this).css("display") != "none"
      && $(this).css("visibility") != "hidden"
      && bore.top < $(window).height()
      && bore.bottom > 0;
    }
  );
  return links;
}

function logLinks(request, sender, sendResponse) {
  if(request.from != 'pageHandler') {return;}
  console.log(getLinks());
}

$(document).ready(function(){
  browser.runtime.onMessage.addListener(logLinks);
});
