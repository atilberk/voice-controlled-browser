# Voice-Controlled Browser
As the implementation of *"Browsing Web via Voice Commands"*

Koç University Department of Computer Engineering Graduation Project

June 2017

---

## What is Voice-Controlled Browser?

VCB is a collection of cross-browser web extension and utilities for allowing users to control their web browsers by talking rather than mouse or keyboard.

## How to install?

*(Instructions for Ubuntu 16.04 + Mozilla Firefox)*

1. Clone the repository to your local
1. Install the python dependencies (Tested with Python 3.5.2)
1. Symbollically link the VCB's native executable to Mozilla's native messaging directory

   ```sudo ln -s /path/to/vcb/native/vcbnative.json /usr/lib/mozilla/native-messaging-hosts/```
   
1. On your browser, go to `about:debugging` and temporarily add the extension by pointing the `/path/to/vcb/extension/manifest.json`
   
1. Now, you can either test the VCB by
   - typing through the extension button
   - typing through http://vcb-atilberk.rhcloud.com/
   - sending a RESTful POST request to https://voice-controlled-browser.firebaseio.com/commands.json the following:
      ```{message:"<MESSAGE>", timestamp:<TIMESTAMP>}```
