let stream = null,
	audio = null,
	mixedStream = null,
	chunks = [], 
	recorder = null
	startButton = null,
	stopButton = null,
	downloadButton = null,
	recordedVideo = null;

	

async function setupStream () {
	
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false // You can set this to true if you want to record audio as well
    });

    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    recorder.onstop = (e) => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      
      // Display recorded video
      const videoElement = document.createElement('video');
      videoElement.src = videoUrl;
      videoElement.controls = true;
      document.body.appendChild(videoElement);
    };

    recorder.start();
    
    // Stop recording after 10 seconds (adjust as needed)
    setTimeout(() => {
      recorder.stop();
    }, 10000);
  } catch (err) {
    console.error('Error accessing screen:', err);
  }
}



function setupVideoFeedback() {
	if (stream) {
		const video = document.querySelector('.video-feedback');
		video.srcObject = stream;
		video.play();
	} else {
		console.warn('No stream available');
	}
}

async function startRecording () {
	await setupStream();

	if (stream && audio) {
		mixedStream = new MediaStream([...stream.getTracks(), ...audio.getTracks()]);
		recorder = new MediaRecorder(mixedStream);
		recorder.ondataavailable = handleDataAvailable;
		recorder.onstop = handleStop;
		recorder.start(1000);
	
		startButton.disabled = true;
		stopButton.disabled = false;
	
		console.log('Recording started');
	} else {
		console.warn('No stream available.');
	}
}

function stopRecording () {
	recorder.stop();

	startButton.disabled = false;
	stopButton.disabled = true;
}

function handleDataAvailable (e) {
	chunks.push(e.data);
}

function handleStop (e) {
	const blob = new Blob(chunks, { 'type': 'Bassil/mp4' });
	chunks = [];

	downloadButton.href = URL.createObjectURL(blob);
	downloadButton.download = 'Bassil.mp4';
	downloadButton.disabled = false;

	recordedVideo.src = URL.createObjectURL(blob);
	recordedVideo.load();
	recordedVideo.onloadeddata = function() {
		const rc = document.querySelector(".recorded-video-wrap");
		rc.classList.remove("hidden");
		rc.scrollIntoView({ behavior: "smooth", block: "start" });

		recordedVideo.play();
	}

	stream.getTracks().forEach((track) => track.stop());
	audio.getTracks().forEach((track) => track.stop());

	console.log('Recording stopped');
}

window.addEventListener('load', () => {
	startButton = document.querySelector('.start-recording');
	stopButton = document.querySelector('.stop-recording');
	downloadButton = document.querySelector('.download-video');
	recordedVideo = document.querySelector('.recorded-video');

	startButton.addEventListener('click', startRecording);
	stopButton.addEventListener('click', stopRecording);
})
