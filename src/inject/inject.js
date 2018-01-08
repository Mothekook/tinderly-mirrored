// cant really hide stuff in a chrome extension :(
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
  // if the URL was acknoledged
  if (request["ackImgUrlSaved"]) {
    chrome.storage.local.get(
      ["running", "imageUrl", "kairosId", "kairosKey"],
      function(items) {
        // if we are not running then end execution
        if (!items["running"]) {
          return;
        }
        var header = {
          app_id: items["kairosId"],
          app_key: items["kairosKey"]
        };
        var payload = { image: items["imageUrl"] };
        $.ajax(URL, {
          headers: header,
          type: "POST",
          data: JSON.stringify(payload),
          dataType: "text",
          success: function(response) {
            jsonResponse = JSON.parse(response);
            var attributes = getAttributes(jsonResponse);
            if (!attributes) {
              // console.log("No faces recognized");
              swipeLeft();
              chrome.runtime.sendMessage({ swiped: true });
              return;
            }
            var shouldSwipeRight = true;
            var ethnicities = ["black", "asian", "hispanic", "white"];
            var fields = ethnicities.map(item => item + "Confidence");
            chrome.storage.local.get(
              [...fields, ...ethnicities, "all"],
              function(items) {
                if (items["all"]) {
                  // swipe right
                  // console.log("all swipe right");
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
                  var requiredFields = required.map(
                    item => item + "Confidence"
                  );
                  for (var i = 0; i < requiredFields.length; i++) {
                    var responseConfidence = attributes[required[i]];
                    var storedConfidence = items[requiredFields[i]];
                    if (responseConfidence < storedConfidence / 100) {
                      shouldSwipeRight = false;
                    }
                  }
                  if (shouldSwipeRight) {
                    // console.log("swipe right");
                    swipeRight();
                  } else {
                    // console.log("swipe left");
                    swipeLeft();
                  }
                }
                chrome.runtime.sendMessage({ swiped: true });
              }
            );
          },
          error: function(error) {
            alert(
              "Failed to call Kairos API. Make sure you are not over minute limit of 25 calls"
            );
          }
        });
      }
    );
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
        // console.log("cmd shift L was pressed");
        // set the state
        chrome.storage.local.get(["running", "kairosId", "kairosKey"], function(
          items
        ) {
          if (!items["kairosId"] || !items["kairosKey"]) {
            alert("Please set Kairos configs!");
            return;
          }

          var nextStatus = !items["running"];
          if (nextStatus) {
            var imageUrl = getImageUrl();
            chrome.storage.local.set(
              {
                imageUrl,
                running: true
              },
              function() {
                chrome.runtime.sendMessage({ imageUrlSaved: true });
              }
            );
          } else {
            // stop the execution
            // console.log("execution ended");
            chrome.storage.local.set({
              running: false
            });
          }
        });
      }
    });
  }
}, 10);
