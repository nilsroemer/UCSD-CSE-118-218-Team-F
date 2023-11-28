import json
import sys

activity = sys.argv[1]
intensity = sys.argv[2]

state = 0
musicList = []

if (activity == 'curl'):
    if (intensity == 'high'):
        state = 1
        musicList = ['0.mp3', '1.mp3', '2.mp3']
    else:
        state = 2
        musicList = ['0.mp3', '2.mp3', '3.mp3']

data = {
    "state": state,
    "musicList": musicList
}
data = json.dumps(data)

print(data)
sys.stdout.flush()