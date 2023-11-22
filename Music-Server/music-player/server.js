const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const defaultSong = 'default.mp3'; // Change this to the name of your music file
const highIntensitySong = 'highIntensitySong.mp3'; // Change this to the name of your music file
const lowIntensitySong = 'lowIntensitySong.mp3'; // Change this to the name of your music file

app.get('/stream', (req, res) => {
  const { i } = req.query;
  console.log(i);
  let songPath = path.join(__dirname, 'music', defaultSong);
  if (i === 'low.') {
    songPath = path.join(__dirname, 'music', lowIntensitySong);
  } else if (i === 'hard.') {
    songPath = path.join(__dirname, 'music', highIntensitySong);
  }

  // Check if the file exists‘
  fs.access(songPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('Song not found');
    }

    // Set the content type to audio/mpeg (you may need to adjust it based on your file type)
    res.setHeader('Content-Type', 'audio/mpeg');

    // Create a read stream from the file
    const stream = fs.createReadStream(songPath);

    // Pipe the stream to the response
    stream.pipe(res);

    // Handle stream errors
    stream.on('error', (err) => {
      res.status(500).send('Internal Server Error');
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
