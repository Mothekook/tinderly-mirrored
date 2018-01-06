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
var IMAGE = "div.recCard__img:eq(1)";

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
          var attributes = getAttributes(jsonResponse);
          if (!attributes) {
            console.log("No faces recognized");
            swipeLeft();
            chrome.runtime.sendMessage({ swiped: true });
            return;
          }
          var shouldSwipeRight = true;
          var ethnicities = ["black", "asian", "hispanic", "white"];
          var fields = ethnicities.map(item => item + "Confidence");
          chrome.storage.local.get([...fields, ...ethnicities, "all"], function(
            items
          ) {
            if (items["all"]) {
              // swipe right
              console.log("all swipe right");
              swipeRight();
            } else {
              // get the required fields
              var required = [];
              for (i in ethnicities) {
                if (items[ethnicities[i]]) {
                  required.push(ethnicities[i]);
                }
              }
              // check that the required confidence match
              var requiredFields = required.map(item => item + "Confidence");
              for (var i = 0; i < requiredFields.length; i++) {
                var responseConfidence = attributes[required[i]];
                var storedConfidence = items[requiredFields[i]];
                if (responseConfidence < storedConfidence / 100) {
                  shouldSwipeRight = false;
                }
              }
              if (shouldSwipeRight) {
                console.log("swipe right");
                swipeRight();
              } else {
                console.log("swipe left");
                swipeLeft();
              }
            }
            chrome.runtime.sendMessage({ swiped: true });
          });
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
            console.log("execution ended");
            chrome.storage.local.set({
              clicked: false
            });
          }
        });
      }
    });
  }
}, 10);
