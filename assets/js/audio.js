// Creating a context object for WebkitAudio
var context;
var bufferLoader;


window.addEventListener('load', init, false);
function init() {
  try {
    // Fix up for prefixing
    console.log(window.webkitAudioContext);
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();
  }
  catch(e) {
    alert('Web Audio API is not supported in this browser');
  }

  //Buffer loader function
  bufferLoader = new BufferLoader(
    context,
    [
      'audio/funky-drums.mp3',
      'audio/funky-lead.mp3'
    ],
    finishedLoading
    );

  bufferLoader.load();
}


//This snippet is for loading sound from server
var dogBarkingBuffer = null;

function loadDogSound(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      dogBarkingBuffer = buffer;
    }, onError);
  }
  request.send();
}

//loadDogSound("assets/sample.mp3");

// Plays buffered sound
function playSound(buffer, time) {
  var source = context.createBufferSource(); // creates a sound source
  source.buffer = buffer;                    // tell the source which sound to play
  source.connect(context.destination);       // connect the source to the context's destination (the speakers)
  source.start(time);                           // play the source now
                                             // note: on older systems, may have to use deprecated noteOn(time);
}

// Buffered loader class
function finishedLoading(bufferList) {

  // Create two sources and play them both together.
  var source1 = context.createBufferSource();
  var source2 = context.createBufferSource();
  source1.buffer = bufferList[0];
  source2.buffer = bufferList[1];

  source1.connect(context.destination);
  source2.connect(context.destination);
  //source1.start(0);
  source2.start(0);

  // Rhythem of songs

var startTime = context.currentTime + 0.100;
var tempo = 60; // BPM (beats per minute)
var eighthNoteTime = (60 / tempo) / 2;

for (var bar = 0; bar < 100; bar++) {
  var time = startTime + bar * 8 * eighthNoteTime;
  // Play the bass (kick) drum on beats 1, 5
  playSound(source1.buffer, time);
  playSound(source1.buffer, time + 4 * eighthNoteTime);

  // Play the snare drum on beats 3, 7
  //playSound(source2.buffer, time + 2 * eighthNoteTime);
  //playSound(source2.buffer, time + 6 * eighthNoteTime);
  
  // Play the hi-hat every eighth note.
  for (var i = 0; i < 8; ++i) {
    //playSound(hihat, time + i * eighthNoteTime);
  }
}

}


