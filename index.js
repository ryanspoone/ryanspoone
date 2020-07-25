/**
 * @copyright Copyright (c) 2020 Ryan Spoone
 */

'use strict';

require('dotenv').config();
const _ = require('lodash');
const Mustache = require('mustache');
const fetch = require('isomorphic-fetch');
const fs = require('fs');

const DATA = {
    refreshDate: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short',
        timeZone: 'America/Chicago'
    }),
    cityTemperature: 'N/A',
    cityWeather: 'N/A',
    cityWeatherIcon: null,
    sunRise: 'N/A',
    sunSet: 'N/A',
    latestBlogPosts: '<ul><li>Not available</li></ul>'
};

const setWeatherInformation = async () => {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Austin&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=imperial`
    );
    const { main: { temp } = {}, weather, sys: { sunrise, sunset } = {} } = await response.json();
    const { description, icon } = _.first(weather) || {};
    DATA.cityTemperature = Math.round(temp);
    DATA.cityWeather = description;
    DATA.cityWeatherIcon = icon;
    DATA.sunRise = new Date(sunrise * 1000).toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Chicago'
    });
    DATA.sunSet = new Date(sunset * 1000).toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Chicago'
    });
};

const setBlogPosts = async () => {
    // TODO
};

const generateReadMe = async () => {
    await fs.readFile('./main.mustache', (err, data) => {
        if (err) {
            throw err;
        }
        const output = Mustache.render(data.toString(), DATA);
        fs.writeFileSync('README.md', output);
    });
};

const action = async () => {
    await setWeatherInformation();
    await setBlogPosts();
    await generateReadMe();
};

action();
