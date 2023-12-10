# FITBEAT
> **RythmTech**
> 
> UCSD CSE 118/218 Team F

## Alexa
- Alexa skill that queries streaming server for music to play

## Music-Server
- Server that streams music on endpoint /stream

## Music Emotion Recognition
- Classification model for determining the emotion of the music

## Exercise Detector
- A pose detection model that uses computer vision and pose landmarks to monitor the user's workout performance.
- [Git Repo](https://github.com/randaldong/Workout-Detector.git)

## Watch
This short explanation should hep you to start the software for the watch

### Requirements
- Platform Tools
- Android Studio

### Connect to the watch
1. Start up watch by pressing both buttons for some time
2. Check Wifi connection to CSE-B210
3. Click onto CSE-B210 to see the IPv4 address
4. Go into platform-tools folder and execute following command
   ```
   ./adb connect [IP-Address]
   ```

### Install Software
1. Open terminal, go into android-studio/bin
2. Execute following command:
   ```
   ./studio.sh
   ```
3. Open Watch Client project
4. Check in upper right corner that the watch is selected as device
5. Load project onto watch by pressing green play button
6. Wait until software is loaded onto watch
