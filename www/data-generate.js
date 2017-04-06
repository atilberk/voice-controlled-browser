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

/*
Assign fill() as a listener for messages from the extension.
*/
$(document).ready(function() {

  var skip = true;
  var idx = -1;
  console.log("ready");
  $("tr").each(function(){
    idx ++;
    if (skip) {
      skip = false;
      return;
    }
    var commandText = $(this).find("td").first().text().trim();
    skip = (commandText.length == 0);
    if (!skip) {
      $(this).find("td").last().html(stanfordParse(commandText).parsed);
      console.log("Sent for : " + commandText);
    }
  });


});
