const express = require('express');
const path = require('path');
const axios = require('axios');
const morgan = require('morgan');

const app = express();

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => console.log(message.trim()),
    },
  }
);

app.use(morganMiddleware);

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');

async function getRandomJoke() {
  const response = await axios.get('https://api.chucknorris.io/jokes/random');

  return response.data;
}

app.get('/', async (req, res, next) => {
  try {
    const response = await getRandomJoke();

    res.render('home', {
      title: 'Random Chuck Norris Jokes',
      joke: response,
    });
  } catch (err) {
    next(err);
  }
});

app.get('/joke', async (req, res, next) => {
  try {
    const response = await getRandomJoke();
    res.json(response);
  } catch (err) {
    next(err);
  }
});

app.use(function (err, req, res, next) {
  console.error(err);
  res.set('Content-Type', 'text/html');
  res.status(500).send('<h1>Internal Server Error</h1>');
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`chucknorris server started on port: ${server.address().port}`);
});

function cleanupAndExit() {
  server.close(() => {
    console.log('chucknorris server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', cleanupAndExit);
process.on('SIGINT', cleanupAndExit);
