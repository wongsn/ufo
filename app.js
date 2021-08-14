import express from 'express';
import methodOverride from 'method-override';
import {
  read, write, add, edit,
} from './jsonFileStorage.js';

const app = express();
const PORT = process.env.NODE_ENV || 3000;
// Override POST requests with query param ?_method=PUT to be PUT requests
app.use(methodOverride('_method'));

// enables Express to serve files from a local folder called 'public;
app.use('/static', express.static('public'));
app.set('view engine', 'ejs');

// allow POST methods
app.use(express.urlencoded({ extended: false }));

// render a form that will create a new sighting
app.get('/sighting', (req, res) => {
  res.render('create'); });

// accept a POST request to create a new sighting
// transfer to 'saved' landing page with the submitted params in boilerplate
app.post('/sighted', (req, res) => {
  add('data.json', 'sightings', req.body, (err, str) => {
    console.log('added');
    res.render('saved', req.body);
  });
});

// render a single sighting
app.get('/sighting/:index', (req, res) => {
  read('data.json', (err, jsonObj) => {
    console.log('read');
    const found = jsonObj.sightings[req.params.index];
    const foundObj = { found };
    res.render('sighting', foundObj);
  });
});

// render a list of sightings
app.get('/', (req, res) => {
  read('data.json', (err, jsonObj) => {
    res.render('list', jsonObj);
  });
});

// render a form to edit a sighting
// accept a request to save a single sighting edit
app.get('/sighting/:index/edit', (req, res) => {
  read('data.json', (err, jsObj) => {
    const { index } = req.params;
    const sighting = jsObj.sightings[index];
    sighting.index = index;
    const ejsData = { sighting };
    res.render('edit', ejsData);
  });
}).put('sightings/:index/edit', (req, res) => {
  const { index } = req.params;
  read('data.json', (err, data) => {
    data.sightings[index] = req.body;
    write('data.json', data, (err) => {
      res.send('done');
    });
  });
});

// accept a request to delete a sighting
app.delete('sightings/:index/delete', (req, res) => {
  const { index } = req.params;
  read('data.json', (err, data) => {
    data.sightings.splice(index, 1);
    write('data.json', data, (err) => {
      res.send('Done');
    });
  });
});

// render a list of sightings shapes
app.get('/shapes', (req, res) => {
  read('data.json', (err, jsonObj) => {
    res.render('shapes', jsonObj);
  });
});

// render a list of sightings that has one shape.
app.get('/shapes/:shape', (req, res) => {
  read('data.json', (err, jsonObj) => {
    console.log('read');
    const found = jsonObj.sightings[req.params.index];
    const foundObj = { found };
    res.render('sighting', foundObj);
  });
});

app.listen(PORT);
