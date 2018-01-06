// cant really hide stuff in a chrome extension :(
var API_KEY = "0fd774da9901ec352a6cfa6677f2cf66";
var API_URL = "https://api.haystack.ai/api/image/analyze";

// different ethnicities classified
var ASIAN = "Asian";
var INDIAN = "East_Indian";
var HISPANIC = "Latino_Hispanic";
var WHITE = "White_Caucasian";
var BLACK = "Black_African_descent";

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

// helper function to convert b64 string to Blob to send to Haystack
// credit to https://ourcodeworld.com/articles/read/322/how-to-convert-a-base64-image-into-a-image-file-and-upload-it-with-an-asynchronous-form-using-jquery
function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || "";
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

function getContentType(b64String) {
  var block = b64String.split(";");
  return block[0].split(":")[1];
}

function getRealData(b64String) {
  var block = b64String.split(";");
  return block[1].split(",")[1];
}

function getImageUrl() {
  return $(IMAGE)
    .css("background-image")
    .replace(/^url\(["']?/, "")
    .replace(/["']?\)$/, "");
}

// handle messages from background
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request["imageSaved"]) {
    // convert to blob and send to haystack
    chrome.storage.local.get(["clicked", "image"], function(items) {
      // if we are not clicked then end execution
      if (!items["clicked"]) {
        return;
      }
      var b64image = items["image"];
      var imageBlob = b64toBlob(
        getRealData(b64image),
        getContentType(b64image)
      );
      var url = `${API_URL}?output=json&apikey=${API_KEY}`;
      var formData = new FormData();
      formData.append("image", imageBlob);

      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          var responseObject = JSON.parse(this.responseText);

          if (!responseObject["people"]) {
            console.log("No one detected");
            // pretend we swiped and keep going
            chrome.runtime.sendMessage({ swiped: true });
            return;
          }

          var ethnicity = responseObject["people"][0]["ethnicity"]["ethnicity"];
          var confidence =
            responseObject["people"][0]["ethnicity"]["confidence"];

          console.log(ethnicity);
          console.log(confidence);

          // getting the states from local storage
          chrome.storage.local.get(
            [
              "black",
              "asian",
              "hispanic",
              "white",
              "indian",
              "all",
              "confidence"
            ],
            function(items) {
              if (parseInt(items["confidence"]) <= confidence * 100) {
                if (items["all"]) {
                  console.log("swipe right");
                } else {
                  switch (ethnicity) {
                    case BLACK:
                      if (items["black"]) {
                        console.log("swipe right");
                      } else {
                        console.log("swipe left");
                      }
                      break;
                    case ASIAN:
                      if (items["asian"]) {
                        console.log("swipe right");
                      } else {
                        console.log("swipe left");
                      }
                      break;
                    case INDIAN:
                      if (items["indian"]) {
                        console.log("swipe right");
                      } else {
                        console.log("swipe left");
                      }
                      break;
                    case HISPANIC:
                      if (items["hispanic"]) {
                        console.log("swipe right");
                      } else {
                        console.log("swipe left");
                      }
                      break;
                    case WHITE:
                      if (items["white"]) {
                        console.log("swipe right");
                      } else {
                        console.log("swipe left");
                      }
                      break;
                    default:
                      console.log("default swipe left");
                  }
                }
              } else {
                console.log("swipe left");
              }

              // send message that we swiped
              chrome.runtime.sendMessage({ swiped: true });
            }
          );
        } else if (this.readyState == 4) {
          alert("Haystack.ai http request failed");
        }
      };

      // async request
      xhttp.open("POST", url, true);
      xhttp.send(formData);
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
