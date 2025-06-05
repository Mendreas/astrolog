// netlify/functions/astronomy.js

const fetch = require('node-fetch');

exports.handler = async function(event) {
  const { endpoint } = event.queryStringParameters || {};
  const body = event.body ? JSON.parse(event.body) : {};

  // Troca para os teus dados
  const applicationId = '43751113-5e87-4a75-946f-0b232db2d51b';
  const applicationSecret = 'd8aa2fcb08d16a43b7aef292f6e4d5a1e5fb25001224b166102c12910101251eb954e305b1680dab5581feb38e02dcc131f3dadcb6035081a2145d428c9be7598a39f4b07ad24fa6827cfb7c56e721242d1f54fa797c0121aa074ceec6df62307592f7ca4565f3eabcf51d776db54718';
  const auth = 'Basic ' + Buffer.from(`${applicationId}:${applicationSecret}`).toString('base64');

  const apiUrl = `https://api.astronomyapi.com/api/v2/${endpoint}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      "Authorization": auth,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  return {
    statusCode: response.status,
    body: JSON.stringify(data),
    headers: {
      'Access-Control-Allow-Origin': '*', // Se precisares para debug
    }
  };
};
