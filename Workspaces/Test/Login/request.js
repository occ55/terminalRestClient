module.exports.Properties = (context) => {
  return {
    method: "GET",
    host: "google.com",
    port: 80,
    protocol: "http",
    path: "/",
    sendBody: true,
    body: {
      a: 1
    },
    bodyType: "json", //json, xml, binary
    /*query: {
      name: "asd"
    },*/
    header: {
      ["my-header"]: true
    },
    //args = {context, body, query, headers}
    //helpers
    beforeRequest: (args, helpers) => {
      console.log("beforeRequest", args, helpers);
    },
    afterRequest: (args, result, helpers) => {
      console.log("afterRequest", args, result, helpers);
    }
  };
};

module.exports.ID = "req_Rcz3B45NkacLlCcC8vPGPw==";

/*
 module.exports = {
  method: "POST",
  url: "https://localhost:8080/test",
  sendBody: true,
  identifier: ""
};*/