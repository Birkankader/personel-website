const xml2js = require("xml2js");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const xml = event.body || "";
    console.log("Raw XML:", xml);

    // XML'i JSON'a çevir
    const parsed = await xml2js.parseStringPromise(xml);

    // UDID'yi bulmaya çalış
    // Apple'ın gönderdiği plist yapısında UDID genelde dict içindeki string alanlarından biridir
    let udid = null;
    if (parsed && parsed.plist && parsed.plist.dict) {
      const dict = parsed.plist.dict[0];
      const keys = dict.key;
      const values = dict.string;

      if (keys && values) {
        keys.forEach((k, i) => {
          if (k === "UDID") {
            udid = values[i];
          }
        });
      }
    }

    console.log("Extracted UDID:", udid);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, udid }),
    };
  } catch (err) {
    console.error("Error parsing UDID:", err);
    return {
      statusCode: 500,
      body: "Error parsing UDID",
    };
  }
};
