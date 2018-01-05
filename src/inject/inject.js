// recsGamepad__button--like
// recsGamepad__button--dislike
// recCard__img

// cant really hide stuff in a chrome extension :(
API_KEY = "71980d6f4428ea21e0f97f102472aadb";

// helper function to convert b64 string to Blob to send to Haystack
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
  return block[0].split(":")[1]; // In this case "image/gif"
}

function getRealData(b64String) {
  var block = b64String.split(";");
  return block[1].split(",")[1]; // In this case "R0lGODlhPQBEAPeoAJosM...."
}

function getImageUrl() {
  return $(".recCard__img")
    .css("background-image")
    .replace(/^url\(["']?/, "")
    .replace(/["']?\)$/, "");
}

// handle messages from background
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request["imageSaved"]) {
    console.log("imageSaved");
    // convert to blob and send to haystack
    chrome.storage.local.get("image", function(items) {
      var b64image = items["image"];
      var imageBlob = b64toBlob(
        getRealData(b64image),
        getContentType(b64image)
      );
      var url = `https://api.haystack.ai/api/image/analyze?output=json&apikey=${API_KEY}`;
      var formData = new FormData();
      formData.append("image", imageBlob);

      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          console.log("haystack response", this.response);
        }
      };

      xhttp.open("POST", url, true);
      xhttp.send(formData);
    });
  }
});

// the the document is ready then we inject
var readyStateCheckInterval = setInterval(function() {
  if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);
    console.log("Hello. This message was sent from scripts/inject.js");

    // add the keyboard listener for cmd shift l
    document.addEventListener("keydown", function(event) {
      if (event.metaKey && event.shiftKey && event.keyCode == 76) {
        console.log("cmd shift l was pressed");
        // set the state
        chrome.storage.local.get(["clicked", "clickInterval"], function(items) {
          var currentClickedStatus = !items["clicked"];
          var clickInterval = null;
          if (currentClickedStatus) {
            // clickInterval = setInterval(
            //   // () => $(".recsGamepad__button--like").click(),
            //   () => console.log("clickingggg"),
            //   100
            // );
            var imageUrl = getImageUrl();
            chrome.storage.local.set({
              imageUrl
            });
            chrome.runtime.sendMessage({ imageUrlSaved: true });
          } else {
            // clearInterval(items["clickInterval"]);
          }

          chrome.storage.local.set({
            clicked: currentClickedStatus,
            clickInterval
          });
        });
      }
    });
  }
}, 10);
