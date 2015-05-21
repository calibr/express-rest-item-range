function err(res, code, message) {
  res.status(code);
  res.send(message);
}

module.exports = function(req, res, next) {
  if(req.method !== "GET") {
    return next();
  }
  if(!req.headers.range) {
    return next();
  }
  var range = req.headers.range.match(/^items=([0-9]+)-([0-9]+)$/);
  if(!range) {
    return err(res, 400, "Range header is invalid \"items=N-M\" expected");
  }
  if(!res.api) {
    res.api = {};
  }
  res.api.contentRangeOffset = function(offset, count, total) {
    var startIndex = offset,
        endIndex = offset + count - 1;
    res.api.contentRange(startIndex, endIndex, total);
  };
  res.api.contentRange = function(startIndex, endIndex, total) {
    if(startIndex > endIndex) {
      res.set("Content-Range", "*/" + total);
      res.status(216);
    }
    else {
      res.set("Content-Range", startIndex + "-" + endIndex + "/" + total);
      res.status(206);
    }
  };
  var startIndex = parseInt(range[1], 10);
  var endIndex = parseInt(range[2], 10);
  req.api.range = {
    offset: startIndex,
    limit: endIndex - startIndex + 1,
    startIndex: startIndex,
    endIndex: endIndex
  };
  next();
};