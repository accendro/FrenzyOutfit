const fs = require('fs');

const API_URL = "https://script.google.com/macros/s/AKfycbyjNqmuPwJawaLPP4fm6JImQcngpg30FfSE6_SNUgeG6nchRMMG4u5fVjprCBX069mbxg/exec";

async function fetchProducts() {
  try {
    console.log("🤖 Robot starting: Fetching data from Google Sheets...");

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Google Apps Script Error: ${data.error}`);
    }

    fs.writeFileSync('products.json', JSON.stringify(data, null, 2));

    console.log(`✅ Success! Updated products.json with ${data.length} products.`);

  } catch (error) {
    console.error("❌ Fatal Error fetching data:", error);

    process.exit(1);
  }
}

fetchProducts();
