const Alexa = require('ask-sdk-core');

const STREAMS = [
  {
    'token': 'dabble-radio-1',
    'url': 'https://4cd4-137-110-202-39.ngrok-free.app/stream',
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
    handle(handlerInput) {
        const speakOutput = 'Welcome to fit beat! What do you want to play?';
        const repromptOutput = 'You can say "Play music for curl and intensity high"';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptOutput)
            .getResponse();
    }
};

const PlayActivityMusicHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayActivityMusicIntent';
    },
    handle(handlerInput) {
        const activity = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Activity')
        const intensity = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Intensity')
    
        const stream = STREAMS[0];

        if(!activity || !intensity) {
            handlerInput.responseBuilder
            .speak(`starting music for no specific activity and intensity.`)
            .addAudioPlayerPlayDirective('REPLACE_ALL', stream.url, stream.token, 0, null, stream.metadata);
        } else {
            handlerInput.responseBuilder
            .speak(`starting music for activity ${activity} and intensity ${intensity}.`)
            .addAudioPlayerPlayDirective('REPLACE_ALL', stream.url+`?a=${activity}&i=${intensity}.`, stream.token, 0, null, stream.metadata);
        }


        return handlerInput.responseBuilder
            .getResponse();
    }
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
        PlayActivityMusicHandler,
        CancelAndStopIntentHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/music-straming/v1.0')
    .lambda();