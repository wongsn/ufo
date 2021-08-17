import express, { response } from 'express';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import {
  read, write, add,
} from './jsonFileStorage.js';

const app = express();
const PORT = process.env.NODE_ENV || 3002;

// Override POST requests with query param ?_method=PUT to be PUT requests
app.use(methodOverride('_method'));
app.use(cookieParser());

// enables Express to serve files from a local folder called 'public;
app.use('/static', express.static('public'));
app.set('view engine', 'ejs');

// allow POST methods
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/random', (req, res) => {
  read('data.json', (err, data) => {
    const { length } = data.sighting;
    const randomNumber = Math.round(Math.random() * length);
    res.redirect(`/sightings/sighted/${randomNumber}`);
  });
});

app.get('/heatmap', (req, res) => {
  read('data.json', (err, jsonObj) => {
    const sightingArray = jsonObj.sighting;
    const state = {
      querySet: sightingArray,
    };
    res.render('heatmap', state);
  });
});

// accept a POST request to create a new sighting
// transfer to 'saved' landing page with the submitted params in boilerplate
app.post('/create', (req, res) => {
  const input = req.body;
  console.log(input);
  add('data.json', 'sighting', input, (err) => {
    if (err) {
      response.status(500).send('DB write error');
      return;
    }
    console.log('added');
    res.render('saved', input);
  });
}).get('/create', (req, res) => {
  // render a form that will create a new sighting
  res.render('create'); });

// render a single sighting
app.put('/sightings/sighted/:index', (req, res) => {
  const { index } = req.params;
  console.log(req.body);
  read('data.json', (err, data) => {
    data.sighting[index] = req.body;
    write('data.json', data, (err, data) => {
      if (err) {
        res.status(500).send('error writing to DB');
      }
      res.send('done');
    });
  });
}).delete('/sightings/sighted/:index', (req, res) => {
// accept a request to delete a sighting
  const { index } = req.params;
  read('data.json', (err, data) => {
    data.sighting.splice(index, 1);
    write('data.json', data, (err) => {
      if (err) {
        res.status(500).send('error writing to DB');
      }
      res.send('Done');
    });
  });
}).get('/sightings/sighted/:index/edit', (req, res) => {
  read('data.json', (err, data) => {
    const { index } = req.params;
    const sighting = data.sighting[index];
    const ejsData = { sighting, index };
    res.render('edit', ejsData);
  });
}).get('/sightings/sighted/:index', (req, res) => {
  read('data.json', (err, data) => {
    const { index } = req.params;
    const sighting = data.sighting[index];
    const ejsData = { sighting, index };
    res.render('sighting', ejsData);
  });
});

// render a list of sightings
// page starts from 1
app.get('/sightings/:page', (req, res) => {
  if (req.params.page) {
    const pageNo = req.params.page || 1;
    const rows = 10; // default
    const startIndex = (pageNo - 1) * rows;
    const endIndex = startIndex + rows;
    read('data.json', (err, jsonObj) => {
      const sightingArray = jsonObj.sighting;
      const state = {
        querySet: sightingArray.slice(startIndex, endIndex),
        index: startIndex + 1,
        currentPage: pageNo,
        totalPages: Math.round(sightingArray.length / rows),
        totalEntries: sightingArray.length - 2,
      };
      res.render('list', state);
    });
  }
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
