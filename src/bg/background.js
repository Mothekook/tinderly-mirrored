// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

//example of using a message handler from the inject scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  chrome.pageAction.show(sender.tab.id);
  chrome.tabs.executeScript(null, { file: "js/getImage.js" });
  sendResponse();
});

// local storage stuff, for debugging
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
