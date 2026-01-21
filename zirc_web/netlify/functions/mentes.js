const { Client } = require('pg');

exports.handler = async (event) => {
  // Csak POST kérést fogadunk el
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const data = JSON.parse(event.body);
  
  // A DATABASE_URL-t a Netlify felületén fogjuk megadni biztonsági okokból
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const query = `
      INSERT INTO bejelentesek (nev, szuletes_datum, lakcim, telefon, email, uzenet)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    const values = [
      data.teljes_nev,
      `${data.szu_ev}.${data.szu_honap}.${data.szu_nap}`,
      `${data.iranyitoszam} ${data.varos}, ${data.utca}`,
      `+36 ${data.tel_korzet} ${data.tel_szam}`,
      data.email,
      data.uzenet
    ];

    await client.query(query, values);
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Sikeres mentés!" })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Adatbázis hiba történt." })
    };
  }
};