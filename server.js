// server.js
const express = require("express");
const axios = require("axios");
// const crypto = require("crypto");
const CryptoJS = require("crypto-js");

const app = express();
const PORT = process.env.PORT || 3000;
// var timestamp = Math.floor(Date.now() / 1000).toString();
const timestamp = Date.now().toString();

// Function to generate the Signature
function generateSignature() {
  const method = "GET"; // Uppercase method
//   const timestamp = Date.now().toString(); // Current timestamp

  const concatString = method.toLowerCase() + timestamp;
  const secretKey = "senha"; // Replace 'senha' with your actual secret key

  //   const concatString = method.toUpperCase() + timestamp;
  //   const hash = CryptoJS.SHA256(concatString).toString(CryptoJS.enc.Base64);
  const hash = CryptoJS.HmacSHA256(concatString, secretKey).toString(CryptoJS.enc.Base64);

  //   const hash = crypto
//     .createHash("sha256")
//     .update(concatString)
//     .digest("base64");

  return hash;
}

// Define a route to proxy requests to the external API
app.get("/api", async (req, res) => {
  try {
    // Get the current timestamp
    // const timestamp = Math.floor(Date.now() / 1000).toString();

    // Generate the Signature
    const signature = generateSignature();
    // console.log({ signature });

    // Make the request to the authentication endpoint to get the token
    const authResponse = await axios.get(
      "http://idealsoftexportaweb.eastus.cloudapp.azure.com:60500/auth/?serie=HIEAPA-600759-ROCT&codfilial=1",
      {
        headers: {
          "cache-control": "no-cache",
          Signature: "-1",
        },
      }
    );

    // res.json(authResponse.data); -> Auth is working fine

    // Extract the token from the response data
    const token = authResponse.data.dados.token;
    console.log(`Token ${token}`);
    console.log({ signature });
    console.log({ timestamp });
    // Make the request to the client data endpoint using the obtained token
    const clientResponse = await axios.get(
      "http://idealsoftexportaweb.eastus.cloudapp.azure.com:60500/clientes/9",
      {
        headers: {
          "cache-control": "no-cache",
          Signature: signature,
          CodFilial: "1",
          Authorization: `Token ${token}`,
          Timestamp: timestamp,
          "Access-Control-Allow-Origin": "*"
        },
      }
    );

    // Return the client data as the response
    res.json(clientResponse.data);

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
