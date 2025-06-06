// Usando require() para node-fetch (versão 2)
const fetch = require('node-fetch');

// Dados de autenticação da API
const applicationId = '43751113-5e87-4a75-946f-0b232db2d51b';
const applicationSecret = 'd8aa2fcb08d16a43b7aef292f6e4d5a1e5fb25001224b166102c12910101251eb954e305b1680dab5581feb38e02dcc131f3dadcb6035081a2145d428c9be7598a39f4b07ad24fa6827cfb7c56e721242d1f54fa797c0121aa074ceec6df62307592f7ca4565f3eabcf51d776db54718';

// Inicialize a string de autenticação
const authString = btoa(`${applicationId}:${applicationSecret}`);
console.log("Authorization String: ", authString); // Para depuração

exports.handler = async (event) => {
  // Debug temporário
  console.log("QUERY:", event.queryStringParameters);
  console.log("BODY:", event.body);
  console.log("authString:", authString);
  console.log("Authorization header:", `Basic ${authString}`);

  // Endpoint a ser usado
  const { endpoint = '' } = event.queryStringParameters;
  const apiUrl = `https://api.astronomyapi.com/api/v2/${endpoint}`;

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
    console.error("Erro ao acessar API:", err); // Agora o erro está capturado corretamente
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erro ao acessar API", error: err.message }), // Passando a mensagem do erro para o retorno
    };
  }
};


