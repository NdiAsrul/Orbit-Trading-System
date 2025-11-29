// ORBIT MIDDLEWARE NODE
// Menyembunyikan URL Google & Menangani CORS

exports.handler = async (event, context) => {
  // 1. Handle Preflight Browser Check (CORS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // 2. Ambil URL Rahasia dari Environment Netlify
  const GAS_URL = process.env.GAS_URL; 

  if (!GAS_URL) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server Config Error: GAS_URL missing" }) };
  }

  try {
    // 3. Forward request ke Google
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: event.body,
      headers: { "Content-Type": "application/json" },
      redirect: "follow", // Ikuti redirect Google
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Buka akses ke frontend manapun
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Orbit Proxy Error", details: error.message }),
    };
  }
};