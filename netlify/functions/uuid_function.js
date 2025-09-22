const xml2js = require("xml2js");

exports.handler = async (event) => {
  console.log("Body:", event.body);
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/xml" },
    body: `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
    "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
      <dict>
        <key>Status</key>
        <string>OK</string>
      </dict>
    </plist>`
  };
};


