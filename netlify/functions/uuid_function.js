const xml2js = require("xml2js");

exports.handler = async (event) => {
  console.log("Method:", event.httpMethod);
  console.log("Headers:", event.headers);
  console.log("Body:", event.body);

  return {
    statusCode: 200,
    body: "OK",
  };
};

