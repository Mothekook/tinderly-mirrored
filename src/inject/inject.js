// recsGamepad__button--like
// recsGamepad__button--dislike
// recCard__img

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
          console.log(items);

          var currentClickedStatus = !items["clicked"];
          console.log("currentClickedStatus", currentClickedStatus);

          var clickInterval = null;
          if (currentClickedStatus) {
            clickInterval = setInterval(
              // () => $(".recsGamepad__button--like").click(),
              () => console.log("clickingggg"),
              100
            );
            var imageUrl = getImageUrl();
            chrome.runtime.local.set(
              {
                imageUrl
              },
              function() {
                console.log("got image url");
              }
            );
          } else {
            clearInterval(items["clickInterval"]);
          }

          chrome.storage.local.set(
            {
              clicked: currentClickedStatus,
              clickInterval
            },
            function() {
              // Notify that we saved.
              console.log("updated");
            }
          );
        });
      }
    });
  }
}, 10);
