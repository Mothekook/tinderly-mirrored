# tinderly

Chrome plugin for Tinder &lt;3

## Table of Content

* [Documentation](#documentation)
  * [Structure](#structure)
  * [Messages](#messages)
  * [Storage](#storage)

## Documentation

Using chrome message passing / handling to handle the url parsing and swiping instead of setInterval since we have to wait for `$.ajax` calls

### Structure

`src/inject/inject.js` is injected into https://tinder.com. Adds the event liseners and does the ajax calls and swiping

`src/bg/background.js` is run in the background. Mainly used for setting initial storage values and responding the messages from inject.js

`src/options_custom` contains the `fancy-settings` options menu that allows users to set the Kairos config

`src/page_action` contains the code for the actual popup. Allows user to choose their ethnic preferences

### Messages

`imageUrlSaved` **boolean** sent from `inject.js`. Tells the background that the image url is saved in storage

`getImageUrl` **boolean** sent from `background.js`. Tells the injected code to get the image url

`swiped` **boolean** send from `inject.js`. Tells the background that we swiped.

`ackImgUrlSaved` **boolean** sent from `background.js`. Tells the injected code to do the swiping process

```javascript
// in background.js
chrome.tabs.sendMessage(sender.tab.id, { getImageUrl: true });

// in inject.js
chrome.runtime.sendMessage({ imageUrlSaved: true });
```

### Storage

We use local storage to store stuff about preferences and other states

`running` **boolean** are we running the auto swiper

`asian` **boolean** is asian checked

`black` **boolean** is black checked

`hispanic` **boolean** is hispanic checked

`white` **boolean** is white checked

`all` **boolean** is no preference checked

`asianConfidence` **int** confidence percentage for asians (default 50)

`blackConfidence` **int** confidence percentage for blacks (default 50)

`hispanicConfidence` **int** confidence percentage for hispanics (default 50)

`whiteConfidence` **int** confidence percentage for whites (default 50)

`imageUrl` **string** image url fetched from the tinder.com webapp

```javascript
// inital states of the plugin
var ids = ["anger", "disgust", "fear", "joy", "sadness", "surprise"];
for (i in ids) {
  chrome.storage.local.set({
    [ids[i]]: false,
    [`${ids[i]}Confidence`]: 50
  });
}
chrome.storage.local.set({ all: true });
chrome.storage.local.set({ running: false });
```
