chrome.storage.local.get("imageUrl", function(items) {
  if (!items["imageUrl"]) {
    return;
  }
  var xhr = new XMLHttpRequest();
  console.log("getting image");
  xhr.open("GET", items["imageUrl"]);
  xhr.responseType = "blob"; //force the HTTP response, response-type header to be blob

  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      chrome.storage.local.set(
        {
          image: reader.result
        },
        function() {
          // Notify that we saved.
          console.log("saved image");
        }
      );
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.send();
});
