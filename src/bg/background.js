// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

//example of using a message handler from the inject scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  chrome.pageAction.show(sender.tab.id);
  if (request["imageUrlSaved"]) {
    console.log("imageUrlSaved");
    // send acknoledgement that URL was saved
    chrome.tabs.sendMessage(sender.tab.id, { ackImgUrlSaved: true });
  } else if (request["swiped"]) {
    console.log("swiped");
    // send message to getImageUrl
    chrome.tabs.sendMessage(sender.tab.id, { getImageUrl: true });
  }
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

var ids = ["anger", "disgust", "fear", "joy", "sadness", "surprise"];
for (i in ids) {
  chrome.storage.local.set({
    [ids[i]]: false,
    [`${ids[i]}Confidence`]: 0
  });
}
chrome.storage.local.set({ all: true });
chrome.storage.local.set({ running: false });
