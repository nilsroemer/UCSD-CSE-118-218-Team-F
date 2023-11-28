import express from 'express';
import { WebSocketServer } from 'ws' 
import http from 'http';
import bodyParser from 'body-parser'
import { spawn } from 'child_process'

// Create server
const app = express();
const port = process.env.PORT || 8081;
const server = http.createServer();
const wss = new WebSocketServer({ server });

// Body-parser middleware
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

// Mount app to server
server.on('request', app);

// To send and save request
app.post('/test', function(request, response) {
	console.log('POST /test')
	console.log(request)
	
	response.writeHead(200, {'Content-Type': 'text/html'})
	response.end('OK')
})

app.get('/', (request, response) => {
	response.status(200)
	response.send('')
})

server.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})