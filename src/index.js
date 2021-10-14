const { default: axios } = require('axios');
const express = require('express');
const redis = require('redis');
const responseTime = require('response-time');
const { promisify } = require('util');

const app = express();
app.use(responseTime());

const client = redis.createClient({
  host: 'localhost',
  port: 6379
});

const GET_ASYNC = promisify(client.get).bind(client);
const SET_ASYNC = promisify(client.set).bind(client);

app.get('/character', async (req, res) => {
  try {
    const reply = await GET_ASYNC('characters');
    if (reply) {
      return res.send(JSON.parse(reply));
    }

    const response = await axios.get(
      'https://rickandmortyapi.com/api/character'
    );
    await SET_ASYNC('characters', JSON.stringify(response.data), 'EX', 10);

    res.send(response.data);
  } catch (error) {
    res.send(error.message);
  }
});

function paginatedCharacters() {
  console.log('testing');
}

app.get('/character/:id', async (req, res) => {
  try {
    const reply = await GET_ASYNC(req.originalUrl);
    if (reply) {
      return res.send(JSON.parse(reply));
    }

    const response = await axios.getp(
      'https://rickandmortyapi.com/api/character/' + req.originalUrl
    );
    await SET_ASYNC(req.originalUrl, JSON.stringify(response.data));
    return res.json(response.data);
  } catch (error) {
    return res.status(error.response.status).json({ message: error.message });
  }
});

app.listen(3000);
console.log('Server on port 3000');
