// netlify/functions/astronomy.js
const fetch = require('node-fetch'); // Usando require() para CommonJS

exports.handler = async (event) => {
  // Debug temporário:
  console.log("QUERY:", event.queryStringParameters);
  console.log("BODY:", event.body);
  console.log("authString:", authString);
  console.log("Authorization header:", `Basic ${authString}`);

  // endpoint do tipo 'bodies/positions'
  const { endpoint = '' } = event.queryStringParameters;

  // Os dados da AstronomyAPI:
  const applicationId = 'be9e2092-773e-44e9-9856-bf51a01d4cc7';
  const applicationSecret = 'd8aa2fcb08d16a43b7aef292f6e4d5a1e5fb25001224b166102c12910101251eb954e305b1680dab5581feb38e02dcc131f3dadcb6035081a2145d428c9be7595ead0264fd198e2fd43dccd624cf05c9c4f2963f5257869da4399f9737ab8bad7e46ef2e816fdcd021411dfbd9effa84';
  const apiUrl = `https://api.astronomyapi.com/api/v2/${endpoint}`;

  const authString = Buffer.from(`${applicationId}:${applicationSecret}`).toString('base64');

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      body: event.body,
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('Erro na chamada da API:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao buscar dados da AstronomyAPI' }),
    };
  }
};
