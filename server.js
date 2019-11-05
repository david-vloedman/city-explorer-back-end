'use strict';


require('dotenv').config();


const express = require('express');
const cors = require('cors');


const PORT = process.env.PORT;
const app = express();
app.use(cors());

app.get('/', (request,response) => {
  response.send('Home Page!');
});

app.get('/bad', (request,response) => {
  throw new Error('poo');
});


app.get('/about', aboutUsHandler);

function aboutUsHandler(request,response) {
  response.status(200).send('About Us Page');
}

// ROUTES
app.get('/location', (request,response) => {
  try {
    const geoData = require('./data/geo.json');
    const city = request.query.data;
    const locationData = new Location(city,geoData);
    response.send(locationData);
  }
  catch(error) {
    errorHandler('So sorry, something went wrong.', request, response);
  }
});

app.get('/weather', (request, response) => {
  try{
    const weather = require('./data/darksky.json');

    const days = parseWeather(weather);

    response.send(days);

  } catch(error){
    errorHandler('THEY AINT NO DATA HERE', request, response);
  }
});

app.use('*', notFoundHandler);
app.use(errorHandler);

// HELPER FUNCTIONS
const parseWeather = json => {
  const data = Object.values(json.daily.data);
  const weatherDays = [];
  data.forEach(day => {
    weatherDays.push(new WeatherDay(new Date(day.time*1000).toDateString(), day.summary));
  });
  return weatherDays;
}

function WeatherDay(day, forecast){
  this.time = day;
  this.forecast = forecast;
}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}



function notFoundHandler(request,response) {
  response.status(404).send('huh?');
}

function errorHandler(error,request,response) {
  response.status(500).send(error);
}



// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is listening on ${PORT}`) );
