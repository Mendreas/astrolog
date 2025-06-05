const fetch = require('node-fetch');

// Substitua pelas suas credenciais
const applicationId = '43751113-5e87-4a75-946f-0b232db2d51b';
const applicationSecret = 'd8aa2fcb08d16a43b7aef292f6e4d5a1e5fb25001224b166102c12910101251eb954e305b1680dab5581feb38e02dcc131f3dadcb6035081a2145d428c9be7598a39f4b07ad24fa6827cfb7c56e721242d1f54fa797c0121aa074ceec6df62307592f7ca4565f3eabcf51d776db54718';

// CORRETO: só codificar em base64 (não hash)
const authString = Buffer.from(`${applicationId}:${applicationSecret}`).toString('base64');
console.log("Authorization String:", authString);

// Parâmetros obrigatórios
const params = new URLSearchParams({
  latitude: "40.7128",
  longitude: "-74.0060",
  elevation: "0",
  from_date: "2025-06-05",
  to_date: "2025-06-05",
  time: "12:00:00"
}).toString();

const apiUrl = `https://api.astronomyapi.com/api/v2/bodies/positions?${params}`;

fetch(apiUrl, {
  method: 'GET',
  headers: {
    "Authorization": `Basic ${authString}`
  }
})
  .then(response => response.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(error => console.error('Erro ao acessar a API:', error));

