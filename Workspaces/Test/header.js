/**
 * for standard headers
 * @param {TRequest} req
 * */
module.exports.before = (context, req) => {
  /**
   * @type {http.OutgoingHttpHeaders}
   */
  return {};
};


/**
 * for standard headers
 * @param {TRequest} req
 * @param {IBuiltRequest} built
 * */
module.exports.after = (context, req, built) => {
  const body = built.body;
  if (req.sendBody && built.body) {
    let bodySize = 0;
    if (body.value) {
      const value = typeof body.value === "string" ? body.value : JSON.stringify(body.value);
      bodySize = Buffer.byteLength(value);
    } else {
      bodySize = body.path ? require("fs").statSync(body.path).size : 0;
    }
    return {
      ["content-length"]: bodySize
    };
  } else {
    return {};
  }
};
