function ajax(options) {
  var url = options.url;
  var method = options.method ? options.method.toUpperCase() : "GET";
  var data = options.data || {};
  var fmtArr = [];
  var xhr = new XMLHttpRequest();

  for (var prop in data) {
    fmtArr.push(String.prototype.concat(prop, "=", data[prop]));
  }

  data = fmtArr.join("&");

  if (method === "GET" && fmtArr.length > 0) {
    url = String.prototype.concat(url, "?", data);
  }

  xhr.open(method, url);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        options.success(JSON.parse(xhr.responseText));
      } else {
        options.error(new Error(xhr.statusText));
      }
    }
  };

  if (method === "POST") {
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  }

  xhr.send(method === "POST" ? data : null);
}