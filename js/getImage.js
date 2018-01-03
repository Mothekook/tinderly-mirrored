var blob = null;
var xhr = new XMLHttpRequest();
console.log("getting image");
xhr.open(
  "GET",
  "https://images-ssl.gotinder.com/5a41e435199b629412db247d/1080x1080_cfd5fc4e-172c-4653-8394-419576f5caae.jpg"
);
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
