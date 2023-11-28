import express from 'express';
import { WebSocketServer } from 'ws' 
import http from 'http';
import bodyParser from 'body-parser'
import { spawn } from 'child_process'

// Connections
// Actuator
const actuator_host = "localhost"
const actuator_port = 8081
const actuator_path = "/test"

// Create server
const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer();
const wss = new WebSocketServer({ server });

// Body-parser middleware
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

const users = {};

function processData(user) {
	let previousState = users[user].state
	let userData = users[user].data
	let response;
	
	// Detect state change
	if (userData.activity && userData.intensity) {
		let activity = userData.activity.value;
		let intensity = userData.intensity.value;
		
		const pythonProcess = spawn('python', ["./test.py", activity, intensity]);
		
		pythonProcess.stdout.on('data', data => {
			console.dir("success");
			response = JSON.parse(data)
			console.dir(response)
		});
		
		pythonProcess.stderr.on('data', data => {
			console.dir(`fail with error:\n ${data}`);
		});
		
		pythonProcess.on('exit', code => {			
			// Call actuator if state changes
			if (response && response.state != previousState) {
				
				// Set new state to user's state
				users[user].state = response.state;
				console.dir("State changed")
				
				// Call actuator
				const postData = JSON.stringify({
					'user': user,
					'musicList': response.musicList
				});
				
				const options = {
					hostname: actuator_host,
					port: actuator_port,
					path: actuator_path,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Content-Length': Buffer.byteLength(postData),
					},
				};
				
				const req = http.request(options, (res) => {
					console.log(`STATUS: ${res.statusCode}`);
					console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
					res.setEncoding('utf8');
					res.on('data', (chunk) => {
						console.log(`BODY: ${chunk}`);
					});
				
					res.on('end', () => {
						console.log('No more data in response.');
					});
				});
				
				req.on('error', (e) => {
					console.error(`problem with request: ${e.message}`);
				});
				
				req.write(postData);
				req.end();
			}
		});
	}
}

// Mount app to server
server.on('request', app);

// To send and save request
app.post('/send-data', function(request, response) {
	console.log('POST /send-data')
	let body = request.body;
	
	let user = body.user	// Specific user
	let device = body.device	// Device data sent from
	let type = body.type	// Type of data
	let value = body.value	// Actual data	
	let currentdate = new Date();
	
	// Add new data to user
	if (!users[user])
		users[user] = {
			"state": null,
			"data": {}
	}		
	users[user]["data"][type] = {
		"device": device,
		"value": value,
		"timestamp": currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds()
	}
	
	// Architecture calls
	processData(user)

	console.dir(users[user])
	response.writeHead(200, {'Content-Type': 'text/html'})
	response.end('OK')
})

app.get('/', (request, response) => {
	response.status(200)
	response.send(users)
})

server.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})