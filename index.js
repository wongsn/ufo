import express from 'express';
import {
  read, write, add, edit,
} from './jsonFileStorage.js';

const app = express();
const port = process.env.NODE_ENV || 3000;

// allow POST methods
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

// default request handler
const handleDefaultRequest = (req, res) => {
  res.render('create');
};

// default error handler
const errorHandler = (err, req, res, next) => {
  if (err) {
    switch (err) {
      case 404:
        res.status(404).send('Too bad, file not found');
        break;

      default:
        res.status(400).send('bad request');
        break;
    }
  }
};

// default route
app.get('/', (req, res) => {
  res.redirect('../sighting');
});

// render a form that will create a new sighting
app.get('/sighting', handleDefaultRequest);

// accept a POST request to create a new sighting
// transfer to 'saved' landing page with the submitted params in boilerplate
app.post('/sighted', (req, res) => {
  add('data.json', 'sightings', req.body, (err, str) => {
    console.log('added');
    res.render('saved', res.body);
  });
}, errorHandler);

// render a single sighting
app.get('/sighting/:index', (req, res) => {
  read('data.json', (err, jsonObj) => {
    console.log('read');
    const found = jsonObj.sightings[res.params.index];
    res.render('saved', res.body);
  });
}, errorHandler);

// render a list of sightings
app.get('/list', (req, res) => {
  read('data.json', (err, jsonObj) => {
    if (err) {
      console.error('not found');
    }

    res.render('list', jsonObj);
  });
});

app.listen(port);
