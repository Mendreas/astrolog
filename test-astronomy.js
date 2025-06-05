const fetch = require('node-fetch');
const crypto = require('crypto');

// Substitua pelas suas credenciais
const applicationId = '43751113-5e87-4a75-946f-0b232db2d51b';
const applicationSecret = 'd8aa2fcb08d16a43b7aef292f6e4d5a1e5fb25001224b166102c12910101251eb954e305b1680dab5581feb38e02dcc131f3dadcb6035081a2145d428c9be7598a39f4b07ad24fa6827cfb7c56e721242d1f54fa797c0121aa074ceec6df62307592f7ca4565f3eabcf51d776db54718';

// Crie a string de autenticação 'applicationId:applicationSecret'
const authStringRaw = `${applicationId}:${applicationSecret}`;

// Gere o hash SHA-256 da string
const sha256Hash = crypto.createHash('sha256').update(authStringRaw).digest('base64');

// A string de autorização com o hash codificado em base64
const authString = Buffer.from(sha256Hash).toString('base64');

// Verifique se a string gerada está correta
console.log("Authorization String:", authString);

const headers = {
  "Authorization": `Basic ${authString}`,
  "Content-Type": "application/json"
};

const apiUrl = 'https://api.astronomyapi.com/api/v2/bodies/positions'; // Substitua com o endpoint desejado
const body = {
  bodies: ['sun', 'moon'],
  observer: {
    latitude: 40.7128,
    longitude: -74.0060,
    date: '2025-06-05',
  },
  view: 'horizontal'
};

// Enviar a solicitação para a API
fetch('https://api.astronomyapi.com/api/v2/bodies/positions', {
  method: 'GET', // ou 'POST', dependendo do endpoint
  headers: {
    'Authorization': `Basic ${authString}`,
    'Content-Type': 'application/json',
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erro ao acessar a API:', error));
