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
  var results = [];
  var frontier = [tree];
  while (frontier.length > 0) {
    var current = frontier.shift();
    if (current.tag == tag) {
      results.push(current);
    }
    for (var i = current.children.length - 1 ; i >= 0; i--) {
      frontier.push(current.children[i]);
    }
  }
  return results.length > 0 ? results : [null];
}

function treeToText(tree) {
  var results = [];
  var frontier = [tree];
  while (frontier.length > 0) {
    var current = frontier.pop();
    if (current.isLeaf) {
      results.push(current.token);
    }
    for (var i = current.children.length - 1 ; i >= 0; i--) {
      frontier.push(current.children[i]);
    }
  }
  return results.length > 0 ? results.join(" ") : "<empty-string>";
}

function extractFeatures(rootTree) {
  var vpTree = treeBFS(rootTree,"VP")[0] || rootTree;

  var vbTree = treeBFS(vpTree, "VB")[0] || vpTree;
  var vb = (vbTree.isLeaf) ? vbTree.token : "<no-token>";

  var rpTree = treeBFS(rootTree,"RP")[0];
  var rp = "<no-rp>";
  if (rpTree != null) {
    rp = (rpTree.isLeaf) ? rpTree.token : "<no-token>";
  }

  var ppTree = treeBFS(vpTree, "PP")[0];

  if (ppTree == null) {
    var npTree = treeBFS(vpTree, "NP")[0] || vpTree;

    var nnTree = treeBFS(npTree, "NN")[0] || npTree;
    var nn = (nnTree.isLeaf) ? nnTree.token : "<no-token>";

    var jjTree = treeBFS(npTree, "JJ");
    if (jjTree[0] != null) {
      jj = jjTree.map(function(j){return "*"+j.token;}).join();
    } else {
      jj = "<no-jj>";
    }

    var msg = "a[" + vb + "], o["+ nn +", "+jj+"], r[" + rp + "]";
  } else {
    console.log(treeToText(ppTree));

    var pnpTree = treeBFS(ppTree, "NP")[0] || ppTree;
    var pnnTree = treeBFS(pnpTree, "NN")[0] || pnpTree;

    var pnn = (pnnTree.isLeaf) ? pnnTree.token : "<no-token>";

    var pjjTree = treeBFS(pnpTree, "JJ");
    if (pjjTree[0] != null) {
      pjj = pjjTree.map(function(j){return "*"+j.token;}).join();
    } else {
      pjj = "";
    }

    var npTree = treeBFS(vpTree, "NP")[0] || vpTree;

    var nnTree = treeBFS(npTree, "NN")[0] || npTree;
    var nn = (nnTree.isLeaf) ? nnTree.token : "<no-token>";

    var jjTree = treeBFS(npTree, "JJ");
    if (jjTree[0] != null) {
      jj = jjTree.map(function(j){return "*"+j.token;}).join();
    } else {
      jj = "";
    }

    var msg = "a[" + vb + "], o["+ pnn +", "+pjj+"], m["+ nn +", "+jj+"], r[" + rp + "]";
  }

  return {
    action : vb,
    object : nn,
    argument : pnn,
    message : "<p>"+msg+"</p><pre>"+parseResponse.parsed+"</pre>"
  }
}
