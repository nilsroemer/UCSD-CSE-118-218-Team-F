const express = require('express');
const fs = require('fs');
const pump = require('pump');
const rangeParser = require('range-parser');
const path = require('path');

const app = express();
const port = 3000;

const defaultSong = 'default.mp3'; // Change this to the name of your music file
const musicFilePath = path.join(__dirname, 'music', defaultSong); // Update this with the path to your music file

app.get('/stream', (req, res) => {
  const stat = fs.statSync(musicFilePath);
  const fileSize = stat.size;

  const rangeHeader = req.headers.range || 'bytes=0-';
  const ranges = rangeParser(fileSize, rangeHeader, { combine: true });

  if (!ranges || ranges === -1) {
    res.status(416).send('Invalid Range');
    return;
  }

  const range = ranges[0];

  const start = range.start;
  const end = range.end === undefined ? fileSize - 1 : range.end;

  const chunkSize = (end - start) + 1;

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunkSize,
    'Content-Type': 'audio/mpeg',
  });

  const stream = fs.createReadStream(musicFilePath, { start, end });

  // Use a stream buffer for reading chunks
  const streamBuffer = new stream.PassThrough();

  // Pipe the stream buffer to the response
  pump(streamBuffer, res);

  // Read and send chunks of data
  let bytesRead = 0;
  streamBuffer.on('data', (data) => {
    bytesRead += data.length;
    if (bytesRead >= chunkSize) {
      // Stop reading once the required chunk size is reached
      streamBuffer.end();
    }
  });

  streamBuffer.on('end', () => {
    // Repeat the stream once it reaches the end
    res.end();
  });

  streamBuffer.on('error', (err) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
  });

  // Pipe the file stream to the stream buffer
  stream.pipe(streamBuffer);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
