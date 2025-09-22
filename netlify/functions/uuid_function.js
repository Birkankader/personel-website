exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    // iOS cihazı XML (plist) formatında POST yapar
    const body = event.body;

    // Burada gelen XML'i logluyoruz
    console.log("Received UDID payload:", body);

    // İstersen xml2js gibi bir kütüphane ile parse edebilirsin
    // const parsed = await xml2js.parseStringPromise(body);

    return {
      statusCode: 200,
      body: "UDID received successfully",
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: "Server Error",
    };
  }
};
