/*
vcb():
* then inserts the supplied command
* then removes itself as a listener
*/
function vcb(request, sender, sendResponse) {
  if($("#vcb-bar").length == 0) {
    $("body").first().prepend(
      "<div id='vcb-bar' style='position:fixed;top:0;width:95%;min-height:30px;background-color:#2980b9;z-index:9999;padding:10px 2.5%;box-sizing:content-box;'> \
      <span id='vcb-out' style='font-family:monospace;color:white;font-weight:bold;font-size:16pt;'></span>\
      <span style='cursor:pointer;font-family:Helvetica;color:rgba(255,255,255,0.3);font-weight:bold;font-size:14pt;float:right;' onclick='this.parentNode.parentNode.removeChild(this.parentNode)'>x</span>\
      </div>"
    );
  }
  insertRequest(request);
  //browser.runtime.onMessage.removeListener(vcb);
}

/*
Given a command, create and style an SPAN node consisting of the command,
then insert the node into the document.
*/
function insertRequest(request) {
  $("#vcb-out").html(request.message);
}

/*
Assign vcb() as a listener for messages from the extension.
*/
$(document).ready(function() {

  browser.runtime.onMessage.addListener(vcb);

  console.log("script started on " + window.location);

});
