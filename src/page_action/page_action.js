document.addEventListener("DOMContentLoaded", () => {
  var ids = ["anger", "disgust", "fear", "joy", "sadness", "surprise"];

  // load previous states
  chrome.storage.local.get(null, function(items) {
    for (i in ids) {
      document.querySelector(`#${ids[i]}`).checked = items[ids[i]];
      document.querySelector(`#${ids[i]}-confidence-value`).innerHTML =
        items[`${ids[i]}Confidence`];
      document.querySelector(`#${ids[i]}-confidence`).value = parseInt(
        items[`${ids[i]}Confidence`]
      );
      if (items["all"]) {
        document.querySelector(`#${ids[i]}`).disabled = true;
        document.querySelector(`#${ids[i]}-confidence`).disabled = true;
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
        document.querySelector(`#${ids[i]}-confidence`).disabled = true;
      }
      chrome.storage.local.set({ [e.target.id]: true });
    } else {
      for (i in ids) {
        document.querySelector(`#${ids[i]}`).disabled = false;
        document.querySelector(`#${ids[i]}-confidence`).disabled = false;
      }
      chrome.storage.local.set({ [e.target.id]: false });
    }
  });
  for (i in ids) {
    document
      .getElementById(`${ids[i]}-confidence`)
      .addEventListener("input", function(e) {
        console.log(`#${e.target.id}-value`);
        document.querySelector(`#${e.target.id}-value`).innerHTML = this.value;
        chrome.storage.local.set({
          [`${e.target.id.replace("-confidence", "")}Confidence`]: this.value
        });
      });
  }
  document
    .getElementById("kairos")
    .addEventListener("click", () => chrome.runtime.openOptionsPage());
});
