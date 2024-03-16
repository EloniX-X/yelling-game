var globalStream;
var globalAudioContext;

function getmic(ws) {
  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  })
    .then(function(stream) {
      var audioContext = new AudioContext();
      globalAudioContext = audioContext;
      var analyser = audioContext.createAnalyser();
      var microphone = audioContext.createMediaStreamSource(stream);
      globalStream = stream; 
      var scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);
      scriptProcessor.onaudioprocess = function() {
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var arraySum = array.reduce(function(a, value) { return a + value; }, 0);
        var average = arraySum / array.length;
        // console.log(Math.round(average));
        colorPids(average);
        ws.send(average);
      };
    })
    .catch(function(err) {
      console.error(err);
    });

}
function stopAudioProcessing() {
  if (globalStream) {
    let tracks = globalStream.getTracks();
    tracks.forEach(track => track.stop());
  }
  if (globalAudioContext) {
    globalAudioContext.close();
  }
}

function startTimer(duration, display, ws) {
  var timer = duration, minutes, seconds;
  setInterval(function () {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      display.textContent = minutes + ":" + seconds;

      if (--timer < 0) {
        // clearInterval(interval); 
        // console.log("done");
        ws.close()
        timer = duration;
        stopAudioProcessing(); 
      }
  }, 1000);
}




function colorPids(vol) {
  var allPids = document.querySelectorAll('.pid');
  var numberOfPidsToColor = Math.round(vol / 10);

  var pidsToColor = Array.prototype.slice.call(allPids, 0, numberOfPidsToColor);
  for (var i = 0; i < allPids.length; i++) {
    allPids[i].style.backgroundColor = "#e6e7e8";
  }
  for (var j = 0; j < pidsToColor.length; j++) {
    pidsToColor[j].style.backgroundColor = "#69ce2b";
  }
}

function colorenemypids(vol) {
  // console.log("JSTU GOT +"+vol);
  var allPids = document.querySelectorAll('.enemy-pid');
  var numberOfPidsToColor = Math.round(vol / 10);

  var pidsToColor = Array.prototype.slice.call(allPids, 0, numberOfPidsToColor);
  for (var i = 0; i < allPids.length; i++) {
    allPids[i].style.backgroundColor = "#e6e7e8";
  }
  for (var j = 0; j < pidsToColor.length; j++) {
    pidsToColor[j].style.backgroundColor = "#a81c5e";
  }
}
function hideButton() {
  document.getElementById("qubetn").style.display = "none";
}

function showButton() {
  document.getElementById("qubetn").style.display = "block";
}


function que () {
  // console.log("hi");
  var ws = new WebSocket("ws://localhost:8080");
  ws.onopen = function() {
    console.log("hello connected");
    ws.send("hello");
    var fiveMinutes = 60 * 0.1
    var display = document.querySelector("#time");
    startTimer(fiveMinutes, display, ws);
    hideButton();
    getmic(ws)
  };
  ws.onmessage = function(event) {
  //  console.log(event.data);
  if (event.data.includes("new highest score")) {
    console.log("highest")
    document.getElementById('contrue').textContent = event.data;
  }
    const message = event.target.result;
  //  console.log("Received:", message);

    var vollev = Number(event.data);
    colorenemypids(vollev);


  };
  ws.onclose = function(event) {
    console.log("closed")
    showButton();

  }

}