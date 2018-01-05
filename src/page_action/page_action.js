document.addEventListener("DOMContentLoaded", () => {
  var ids = ["black", "asian", "hispanic", "white", "indian"];

  // load previous states
  chrome.storage.local.get([...ids, "all", "confidence"], function(items) {
    document.querySelector("#confidence-value").innerHTML = items["confidence"];
    document.querySelector("#confidence").value = parseInt(items["confidence"]);
    for (i in ids) {
      document.querySelector(`#${ids[i]}`).checked = items[ids[i]];
      if (items["all"]) {
        document.querySelector(`#${ids[i]}`).disabled = true;
        document.querySelector("#all").checked = true;
      }
    }
  });

  for (i in ids) {
    document
      .querySelector(`#${ids[i]}`)
      .addEventListener("change", function(e) {
        if (e.target.checked) {
          chrome.storage.local.set({ [e.target.id]: true });
        } else {
          chrome.storage.local.set({ [e.target.id]: false });
        }
      });
  }
  document.querySelector("#all").addEventListener("change", function(e) {
    if (e.target.checked) {
      for (i in ids) {
        document.querySelector(`#${ids[i]}`).disabled = true;
      }
      chrome.storage.local.set({ [e.target.id]: true });
    } else {
      for (i in ids) {
        document.querySelector(`#${ids[i]}`).disabled = false;
      }
      chrome.storage.local.set({ [e.target.id]: false });
    }
  });
  document.getElementById("confidence").oninput = function() {
    document.querySelector("#confidence-value").innerHTML = this.value;
    chrome.storage.local.set({ confidence: this.value });
  };
});
