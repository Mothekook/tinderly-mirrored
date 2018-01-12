# tinderly

Chrome plugin for Tinder &lt;3

## ADDING FUNCTIONALITY THAT ALREADY EXISTS IN POPULAR DATING SERVICES SUCH AS OKCUPID AND EAST MEET EAST ONTO TINDER.

![Screen shot](https://image.ibb.co/csy0Pw/Screen_Shot_2018_01_06_at_7_24_34_PM.png)

**USE AT YOUR OWN RISK**

Dating w racial preferences has all kinds of problems.

> This is about social forces shaping our preferences, and we’ll never progress without acknowledging that fact. To take one of the most obvious and simple examples, consider Hollywood, which is notoriously white. According to the 2014 and 2015 Hollywood Diversity Report, minorities “remain underrepresented on every front.” They’ve reported that “more than half of films had casts that were 10% minority or less.” (The Every Single Word Spoken project is a great illustration of this.) Hollywood is also hot. Like really hot. The societal norm for “hot,” in fact. That means the math equation looks something like this: If Hollywood=White, and Hollywood=Hot, then White=Hot.

https://theestablishment.co/yes-your-dating-preferences-are-probably-racist-e58ae2fd625d

## Table of Content

* [Roadmap](#roadmap)
* [Documentation](#documentation)
  * [Structure](#structure)
  * [Messages](#messages)
  * [Storage](#storage)

## Roadmap

* [x] Auto swiping (keyboard shortcut) cmd-shift-L
* [x] Grab image from Tinder + get base64 encoding
* [x] Set up inject.js and background.js message passing
* [x] Connect Haystack.ai
* [x] Allow user to swipe based on race
* [x] Add % confidence
* [x] Switch to kairos api
* [x] Add option for user to add their own API key
* [x] Make it prettier
* [x] Add contributing notes / documentation
* [x] Add disclaimer about dating w racial preferences
* [x] Clean up code and publish!!!!

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
var ids = ["black", "asian", "hispanic", "white"];
for (i in ids) {
  chrome.storage.local.set({
    [ids[i]]: false,
    [`${ids[i]}Confidence`]: 50
  });
}
chrome.storage.local.set({ all: true });
chrome.storage.local.set({ running: false });
```
