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

function treeBFS(tree,tag) {
  var frontier = [tree];
  while (frontier.length > 0) {
    var current = frontier.shift();
    if (current.tag == tag) {
      return current;
    } else {
      for (var i = current.children.length - 1 ; i >= 0; i--) {
        frontier.push(current.children[i]);
      }
    }
  }
  return null;
}

function extractFeatures(rootTree) {
  var vpTree = treeBFS(rootTree,"VP") || rootTree;

  var vbTree = treeBFS(vpTree, "VB") || vpTree;
  var vb = (vbTree.isLeaf === true) ? vbTree.token : "<no-token>";

  var ppTree = treeBFS(vpTree, "PP");

  if (ppTree == null) {
    var npTree = treeBFS(vpTree, "NP") || vpTree;

    var nnTree = treeBFS(npTree, "NN") || npTree;
    var nn = (nnTree.isLeaf === true) ? nnTree.token : "<no-token>";

    var msg = "<p>a[" + vb + "], o["+ nn +"]</p>";
    msg += "<p>"+ parseResponse.parsed +"</p>"
  } else {
    var pnpTree = treeBFS(ppTree, "NP") || ppTree;
    var pnnTree = treeBFS(pnpTree, "NN") || pnpTree;

    var pnn = (pnnTree.isLeaf === true) ? pnnTree.token : "<no-token>";

    var npTree = treeBFS(vpTree, "NP") || vpTree;

    var nnTree = treeBFS(npTree, "NN") || npTree;
    var nn = (nnTree.isLeaf === true) ? nnTree.token : "<no-token>";

    var msg = "<p>a[" + vb + "], o["+ pnn +"], m["+ nn +"]</p>";
    msg += "<p>"+ parseResponse.parsed +"</p>"
  }

  return {
    action : vb,
    object : nn,
    argument : pnn,
    message : msg
  }
}
