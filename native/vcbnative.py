#!/usr/bin/env python

import sys
import json
import struct
import time
import pyautogui
import re

# Python 3.x version

# Encode a message for transmission,
# given its content.
def encodeMessage(messageContent):
    encodedContent = json.dumps(messageContent).encode('utf-8')
    encodedLength = struct.pack('@I', len(encodedContent))
    return {'length': encodedLength, 'content': encodedContent}

# Send an encoded message to stdout
def sendMessage(encodedMessage):
    sys.stdout.buffer.write(encodedMessage['length'])
    sys.stdout.buffer.write(encodedMessage['content'])
    sys.stdout.buffer.flush()

# Read a message from stdin and decode it.
def getMessage():
    rawLength = sys.stdin.buffer.read(4)
    while len(rawLength) == 0:
        time.sleep(1)
        rawLength = sys.stdin.buffer.read(4)
        # sys.exit(0)
    messageLength = struct.unpack('@I', rawLength)[0]
    message = sys.stdin.buffer.read(messageLength).decode('utf-8')
    return json.loads(message)

# Action Classification:
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.ensemble import RandomForestClassifier

f = open("../data/me_sample_sentences.txt",'r')
s = [l.strip() for l in f.readlines()]
f.close()

vectorizer = CountVectorizer(analyzer = "word",   \
                             tokenizer = None,    \
                             preprocessor = None, \
                             stop_words = None,   \
                             max_features = 5000)

tdf = vectorizer.fit_transform(s)
tdf = tdf.toarray()

forest = RandomForestClassifier(n_estimators = 100)
forest = forest.fit( tdf, [int(i/30) for i in range(len(s))] )

# currently available action classes
classes = [
    "refresh",
    "open",
    "close",
    "switch",
    "history",
    "go-to",
    "scroll",
    "click",
    "type",
    "read"
]

# positional filtering
from functools import reduce

positionals = {
    "top" : ["top", "up"],
    "bottom" : ["bottom", "down"],
    "right" : ["right"],
    "left" : ["left"],
}

allPositionals = reduce(lambda a,b: a+b,list(positionals.values()))

screenWidth, screenHeight = (1366, 768-92) # TODO: detect it automatically

def filterPositional(cmdl,targets):
    # top segment
    if len(set(cmdl).intersection(set(positionals["top"]))):
        targets = list(filter(lambda tg: tg["y"] < screenHeight/2, targets))
    # top segment
    if len(set(cmdl).intersection(set(positionals["bottom"]))):
        targets = list(filter(lambda tg: tg["y"] + tg["height"] > screenHeight/2, targets))
    # top segment
    if len(set(cmdl).intersection(set(positionals["left"]))):
        targets = list(filter(lambda tg: tg["x"] < screenWidth/2, targets))
    # top segment
    if len(set(cmdl).intersection(set(positionals["right"]))):
        targets = list(filter(lambda tg: tg["x"] + tg["width"] > screenWidth/2, targets))

    cmdl = list(filter(lambda t: t not in allPositionals, cmdl))
    return (cmdl, targets)


# visual filtering

# TODO: implement the color similarity
def filterVisual(cmdl,targets):
    return (cmdl, targets)


# textual filtering

tagmap = {
    "a":["text","link","button"],
    "button":["button"],
    "input":["button","option","box","checkbox"]
}

puncrem = re.compile(r"[!\"#$%&'()*+,\-.\/ :;<=>?@[\\\]^_`{|}~]+")
noinformatives = ['to', 'on', 'a', 'an', 'the', 'with', 'into', 'in', 'at']
urlrelateds = ["http", "https", "html", "php", "aspx", "www"]

def textify(tg):
    str = ""
    if tg["tag"].lower() in tagmap:
        str += " ".join(tagmap[tg["tag"].lower()]) + " "
    if len(tg["url"]):
        str += " ".join(list(filter(lambda t: t not in urlrelateds,puncrem.sub(" ",tg["url"].lower()).split()))) + " "
    if len(tg["id"]):
        str += puncrem.sub(" ",tg["id"].lower()) + " "
    if len(tg["class"]):
        str += puncrem.sub(" ",tg["class"].lower()).replace("btn", "button") + " "
    if len(tg["text"]):
        str += (puncrem.sub(" ",tg["text"].lower()) + " ")*3
    if len(tg["value"]):
        str += (puncrem.sub(" ",tg["value"].lower()) + " ")*2
    return str

typeTagmap = {
    "textarea":["field","box","message","form"],
    "input":["field","box","search","form"]
}

def typeTextify(tg):
    str = ""
    if tg["tag"].lower() in tagmap:
        str += " ".join(tagmap[tg["tag"].lower()]) + " "
    if len(tg["id"]):
        str += puncrem.sub(" ",tg["id"].lower()) + " "
    if len(tg["class"]):
        str += puncrem.sub(" ",tg["class"].lower()).replace("btn", "button") + " "
    if len(tg["text"]):
        str += (puncrem.sub(" ",tg["text"].lower()) + " ")*2
    if len(tg["value"]):
        str += (puncrem.sub(" ",tg["value"].lower()) + " ")*2
    if len(tg["placeholder"]):
        str += (puncrem.sub(" ",tg["placeholder"].lower()) + " ")*3
    if len(tg["label"]):
        str += (puncrem.sub(" ",tg["label"].lower()) + " ")*3
    if len(tg["title"]):
        str += (puncrem.sub(" ",tg["title"].lower()) + " ")*3
    return str

def filterTextual(cmdl,targets):
    cmds = set(cmdl)
    intersmap = list(map(lambda tg: (len(cmds.intersection(set(textify(tg).lower().split())))/float(len(textify(tg).lower().split())), tg),targets))
    sortedi = sorted(intersmap, reverse=True, key=lambda e: e[0])
    maxi = sortedi[0][0] if sortedi else 0
    if len(sortedi) > 1:
        candidates = list(map(lambda t: t[1],sortedi[:(1 if maxi - sortedi[1][0] > 0 else 2)]))
    else:
        candidates = [sortedi[0][1]] if maxi > 0 else []
    return (cmdl, candidates)

def filterTypeTextual(cmdl,targets):
    cmds = set(cmdl)
    intersmap = list(map(lambda tg: (len(cmds.intersection(set(typeTextify(tg).lower().split())))/float(len(typeTextify(tg).lower().split())), tg),targets))
    sortedi = sorted(intersmap, reverse=True, key=lambda e: e[0])
    maxi = sortedi[0][0] if sortedi else 0
    if len(sortedi) > 1:
        candidates = list(map(lambda t: t[1],sortedi[:(1 if maxi - sortedi[1][0] > 0 else 2)]))
    else:
        candidates = [sortedi[0][1]] if maxi > 0 else []
    return (cmdl, candidates)

def filterClickTarget(cmd, targets):
    writelog("filterClickTarget HEAD")
    # w,h = pyautogui.size()
    # ss = pyautogui.screenshot(region(0,92,w,h-92))
    # ss.save("/home/atilberk/Desktop.foo.png")
    # writelog("filterClickTarget ss")

    cmd = puncrem.sub(" ",cmd)
    cmdl = cmd.split()
    cmdl = list(filter(lambda t: t not in noinformatives,cmdl))

    cmdl, targets = filterPositional(cmdl,targets)
    writelog("positional filter done")
    cmdl, targets = filterVisual(cmdl,targets)
    writelog("visual filter done")
    cmdl, targets = filterTextual(cmdl,targets)
    writelog("textual filter done")

    if len(targets) == 0:
        return {
            "status" : "none",
            "target" : targets
        }
    elif len(targets) > 1:
        return {
            "status" : "multiple",
            "target" : targets
        }
    else:
        return {
            "status" : "exact",
            "target" : targets
        }

def filterTypeTarget(cmd, targets):
    writelog("filterTypeTarget HEAD")
    # w,h = pyautogui.size()
    # ss = pyautogui.screenshot(region(0,92,w,h-92))
    # ss.save("/home/atilberk/Desktop.foo.png")
    # writelog("filterClickTarget ss")

    cmd = puncrem.sub(" ",cmd)
    cmdl = cmd.split()
    cmdl = list(filter(lambda t: t not in noinformatives,cmdl))

    cmdl, targets = filterPositional(cmdl,targets)
    writelog("positional filter done")
    cmdl, targets = filterVisual(cmdl,targets)
    writelog("visual filter done")
    cmdl, targets = filterTypeTextual(cmdl,targets)
    writelog("textual filter done")

    if len(targets) == 0:
        return {
            "status" : "none",
            "target" : targets
        }
    elif len(targets) > 1:
        return {
            "status" : "multiple",
            "target" : targets
        }
    else:
        return {
            "status" : "exact",
            "target" : targets
        }

prepositions = ["to","into","in","at","on"]
field_cursors = ["box", "field", "area", "search", "searchbox", "form", "message", "messagebox"]
def extractMessage(cmd):
    cmdl = cmd.lower().split()[1:]
    if cmdl and cmdl[0] == "for":
        cmdl = cmdl[1:]
    first_p = 0
    for i in range(len(cmdl)):
        if cmdl[i] in prepositions:
            first_p = i
            break
    last_c = -1
    for j in range(len(cmdl))[::-1]:
        if cmdl[j] in field_cursors:
            last_c = j
            break
    if last_c > first_p:
        msg = " ".join(cmdl[:first_p] + cmdl[last_c+1:])
    else:
        msg = " ".join(cmdl[first_p:])
    # return (first_p, last_c, cmdl, msg)
    return msg

def writelog(msg):
    f = open("/home/atilberk/Desktop/vcblog.txt","a+")
    f.write(msg+"\n")
    f.close()
    return

latest = 0
while True:
    receivedMessage = getMessage()
    writelog("received message")

    if receivedMessage["intent"] == "action":
        cmd = receivedMessage["command"]
        tf = vectorizer.transform([cmd]).toarray()
        result = forest.predict(tf)
        action = classes[int(result[0])]
        if action == "scroll":
            scroll = list(set(cmd.lower().split()).intersection({"up", "down","top", "bottom"}))
            sendMessage(encodeMessage(
                {
                    "responseTo":"action",
                    "command":cmd,
                    "action":action,
                    "scroll": scroll[0] if scroll else "down",
                    "timestamp": receivedMessage["timestamp"]
                }
            ))
        else:
            sendMessage(encodeMessage(
                {
                    "responseTo":"action",
                    "command":cmd,
                    "action":action,
                    "timestamp": receivedMessage["timestamp"]
                }
            ))

    elif receivedMessage["intent"] == "execute":
        if "timestamp" not in receivedMessage or receivedMessage["timestamp"] <= latest:
            continue
        latest = receivedMessage["timestamp"]
        writelog("intent: execute")
        result = {}
        cmd = receivedMessage["command"]
        action_type = receivedMessage["action"]

        if action_type == "history":
            writelog("action: history")
            pyautogui.click(x=20, y=75,duration=1)

        elif action_type == "click":
            writelog("action: click")
            result = filterClickTarget(cmd, receivedMessage["targets"])
            writelog("got a result")
            if result["status"] == "exact":
                target = result["target"][0]
                pyautogui.click(x=target["x"]+target["width"]/2, y=target["y"]+target["height"]/2+92,duration=1)

        elif action_type == "type":
            writelog("action: type")
            result = filterTypeTarget(cmd, receivedMessage["targets"])
            writelog("got a result")
            message = extractMessage(cmd)
            writelog("got a message")
            if result["status"] == "exact":
                target = result["target"][0]
                pyautogui.click(x=target["x"]+target["width"]/2, y=target["y"]+target["height"]/2+92,duration=1)
                pyautogui.typewrite(message,interval=0.3)

        elif action_type == "hover":
            x = receivedMessage["x"]
            y = receivedMessage["y"] + 92
            pyautogui.moveTo(x,y)

        # FEEDBACK
        writelog("giving feedback...")

        sendMessage(encodeMessage(
            {
                "responseTo":"execute",
                "command":cmd,
                "action":action_type,
                "timestamp": receivedMessage["timestamp"],
                "result":result
            }
        ))
        writelog("gave.")
