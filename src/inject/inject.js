// cant really hide stuff in a chrome extension :(

// kairos headers
var HEADERS = {
  app_id: "5b2e102e",
  app_key: "2a2d8eb7765e52b857042a7794f7c7ac"
};

var URL = "https://api.kairos.com/detect";

// css class name selectors
var LIKE = ".recsGamepad__button--like";
var DISLIKE = ".recsGamepad__button--dislike";
var IMAGE = ".recCard__img";

function swipeRight() {
  $(LIKE).click();
}

function swipeLeft() {
  $(DISLIKE).click();
}

function getImageUrl() {
  return $(IMAGE)
    .css("background-image")
    .replace(/^url\(["']?/, "")
    .replace(/["']?\)$/, "");
}

function getAttributes(response) {
  if (!response["images"]) {
    return null;
  }
  return response["images"][0]["faces"][0]["attributes"];
}

// handle messages from background.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request["imageSaved"]) {
    // send to API
    chrome.storage.local.get(["clicked", "imageUrl"], function(items) {
      // if we are not clicked then end execution
      if (!items["clicked"]) {
        return;
      }
      var payload = { image: items["imageUrl"] };
      $.ajax(URL, {
        headers: HEADERS,
        type: "POST",
        data: JSON.stringify(payload),
        dataType: "text",
        success: function(response) {
          jsonResponse = JSON.parse(response);
          console.log(jsonResponse);
          var attributes = getAttributes(jsonResponse);
          if (!attributes) {
            alert("No faces recognized");
            chrome.storage.local.set({
              clicked: false
            });
          }
        },
        error: function(error) {
          alert("Failed to call Kairos API");
        }
      });
    });
  } else if (request["getImageUrl"]) {
    var imageUrl = getImageUrl();
    chrome.storage.local.set(
      {
        imageUrl
      },
      function() {
        chrome.runtime.sendMessage({ imageUrlSaved: true });
      }
    );
  }
});

// send blank message to get the hightlight on bar
chrome.runtime.sendMessage({});

// the the document is ready then we inject
var readyStateCheckInterval = setInterval(function() {
  if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);

    // add the keyboard listener for cmd shift l
    document.addEventListener("keydown", function(event) {
      if (event.metaKey && event.shiftKey && event.keyCode == 76) {
        console.log("cmd shift l was pressed");
        // set the state
        chrome.storage.local.get("clicked", function(items) {
          var nextClickedStatus = !items["clicked"];
          if (nextClickedStatus) {
            var imageUrl = getImageUrl();
            chrome.storage.local.set(
              {
                imageUrl,
                clicked: true
              },
              function() {
                chrome.runtime.sendMessage({ imageUrlSaved: true });
              }
            );
          } else {
            // stop the execution
            chrome.storage.local.set({
              clicked: false
            });
          }
        });
      }
    });
  }
}, 10);
