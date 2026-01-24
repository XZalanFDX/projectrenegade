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

const { Client } = require('pg');
const { Resend } = require('resend');

// A Netlify-on beállított kulcsot használja
const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const data = JSON.parse(event.body);
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // 1. Mentés Neonba
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

    // 2. Email küldése Resenddel
    await resend.emails.send({
      from: 'Zirc Bejelento <onboarding@resend.dev>',
      to: [data.email],
      subject: 'Visszaigazolás: Online bejelentés másolata',
      html: `
        <h2>Tisztelt ${data.teljes_nev}!</h2>
        <p>Köszönjük, hogy használta Zirc Polgármesteri Hivatalának online felületét.</p>
        <p><strong>Az Ön által beküldött adatok másolata:</strong></p>
        <hr>
        <p><strong>Lakcím:</strong> ${data.iranyitoszam} ${data.varos}, ${data.utca}</p>
        <p><strong>Üzenet:</strong> ${data.uzenet}</p>
        <hr>
        <p>Munkatársaink hamarosan feldolgozzák a bejelentést.</p>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Sikeres mentés és e-mail!" })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Hiba történt a feldolgozás során." })
    };
  }
};
