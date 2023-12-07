const Alexa = require('ask-sdk-core');
const axios = require('axios');

const apiUrl = 'https://ab4b-128-54-47-14.ngrok-free.app'

const STREAMS = [
    {
        'token': 'dabble-radio-1',
        'url': apiUrl+'/stream',
        'metadata': {
            'title': 'Dabble Radio',
            'subtitle': 'Music for coders',
            'art': {
                'sources': [
                    {
                        'contentDescription': 'Dabble Radio',
                        'url': 'https://s3.amazonaws.com/cdn.dabblelab.com/img/audiostream-starter-512x512.png',
                        'widthPixels': 512,
                        'heightPixels': 512,
                    },
                ],
            },
            'backgroundImage': {
                'sources': [
                    {
                        'contentDescription': 'Dabble Radio',
                        'url': 'https://s3.amazonaws.com/cdn.dabblelab.com/img/wayfarer-on-beach-1200x800.png',
                        'widthPixels': 1200,
                        'heightPixels': 800,
                    },
                ],
            },
        },
    },
];

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        try {
            const response = await axios.get(apiUrl+'/currentStatus');

            const { currentActivity, currentIntensity } = response.data;

            const speechOutput = `The current activity is ${currentActivity} and the intensity is ${currentIntensity}.`;

            const stream = STREAMS[0];

            const audioDirective = handlerInput.responseBuilder
                .speak(speechOutput)
                .addAudioPlayerPlayDirective('REPLACE_ALL', stream.url, stream.token, 0, null, stream.metadata)
                .getResponse();

            handlerInput.attributesManager.setSessionAttributes({ isRepeating: true });

            return audioDirective;

        } catch (error) {

            console.error('Error fetching data from the endpoint:', error);
            return handlerInput.responseBuilder.speak('Sorry, there was an error getting the current status.').getResponse();

        }
    }
};

const AudioPlayerEventHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'AudioPlayer.PlaybackFinished';
    },
    async handle(handlerInput) {
        return handlerInput.responseBuilder.speak('TEST').getResponse();
    },
};

/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (
                handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
            );
    },
    handle(handlerInput) {
        handlerInput.responseBuilder
            .addAudioPlayerClearQueueDirective('CLEAR_ALL')
            .addAudioPlayerStopDirective();

        return handlerInput.responseBuilder
            .getResponse();
    },
};


/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        AudioPlayerEventHandler,
        CancelAndStopIntentHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/music-straming/v1.0')
    .lambda();