const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

var jsonParser = bodyParser.json()

const musicDirectory = path.join(__dirname, 'music');
let currentSong = 'default.mp3'; // Initialize with the default song
let currentActivity = 'no activity';
let currentIntensity = 'no intensity';

app.get('/stream', (req, res) => {
  let songPath = path.join(musicDirectory, currentSong);

  // Check if the file exists
  fs.access(songPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('Song not found');
    }

    // Set the content type to audio/mpeg (you may need to adjust it based on your file type)
    res.setHeader('Content-Type', 'audio/mpeg');

    // Create a read stream from the file
    const stream = fs.createReadStream(songPath);

    console.log('Play song: '+currentSong);
    console.log('---');

    // Pipe the stream to the response
    stream.pipe(res);

    // Handle stream errors
    stream.on('error', (err) => {
      res.status(500).send('Internal Server Error');
    });
  });
});

app.get('/currentStatus', (req, res) => {
  const status = {
    currentActivity,
    currentIntensity
  };

  console.log('Reported activity to alexa: '+currentActivity);
  console.log('Reported intensity to alexa: '+currentIntensity);
  console.log('---');

  res.status(200).json(status);
});

app.post('/changeSong', jsonParser, (req, res) => {
  const { songs, activity, intensity } = req.body;

  console.log('Change playlist to: '+songs);
  console.log('Change activity to: '+activity);
  console.log('Change intensity to: '+intensity);
  console.log('---');

  // Validate the presence of 'activity', 'intensity', and 'songs' parameters
  if (!activity || !intensity || !songs || !Array.isArray(songs)) {
    return res.status(400).send('Please provide both activity, intensity, and an array of songs.');
  }

  currentActivity = activity;
  currentIntensity = intensity;

  // Check if the requested songs exist in the music directory
  const validSongs = songs.every((song) => {
    const songPath = path.join(musicDirectory, song);
    try {
      fs.accessSync(songPath, fs.constants.F_OK);
      return true;
    } catch (err) {
      return false;
    }
  });

  if (!validSongs) {
    return res.status(404).send('One or more requested songs not found');
  }

  // Update the current song based on the first song in the array
  currentSong = songs[0];

  res.status(200).send(`Changed song to ${currentSong}`);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
