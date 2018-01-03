// recsGamepad__button--like
// recsGamepad__button--dislike

// local storage stuff
chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    var storageChange = changes[key];
    console.log(
      'Storage key "%s" in namespace "%s" changed. ' +
        'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue
    );
  }
});

chrome.runtime.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);
      console.log("Hello. This message was sent from scripts/inject.js");

      // add the keyboard listener for cmd shift l
      document.addEventListener("keydown", function(event) {
        if (event.metaKey && event.shiftKey && event.keyCode == 76) {
          console.log("cmd shift l was pressed");
          // set the state
          chrome.storage.local.get(["clicked", "clickInterval"], function(
            items
          ) {
            var currentClickedStatus = !items["clicked"];
            console.log("currentClickedStatus", currentClickedStatus);
            var clickInterval = null;
            if (currentClickedStatus) {
              clickInterval = setInterval(
                // () => $(".recsGamepad__button--like").click(),
                () => console.log("clickingggg"),
                100
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
});
