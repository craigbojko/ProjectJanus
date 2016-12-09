// Main audio initialisation
(function() {
	var CrossfadeSample = window.CrossfadeSample = {
		playing : false
	};
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var context = new AudioContext();

	function BufferLoader(context, urlList, callback) {
		this.context = context;
		this.urlList = urlList;
		this.onload = callback;
		this.bufferList = new Array();
		this.loadCount = 0;
	}

	BufferLoader.prototype.loadBuffer = function(url, index) {
		// Load buffer asynchronously
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";

		var loader = this;

		request.onload = function() {
			// Asynchronously decode the audio file data in request.response
			loader.context.decodeAudioData(request.response, function(buffer) {
				if (!buffer) {
					alert('error decoding file data: ' + url);
					return;
				}
				loader.bufferList[index] = buffer;
				if (++loader.loadCount == loader.urlList.length)
					loader.onload(loader.bufferList);
			}, function(error) {
				console.error('decodeAudioData error', error);
			});
		}

		request.onerror = function() {
			alert('BufferLoader: XHR error');
		}

		request.send();
	}

	BufferLoader.prototype.load = function() {
		for (var i = 0; i < this.urlList.length; ++i)
			this.loadBuffer(this.urlList[i], i);
	}

	var bufferLoader = new BufferLoader(context,
			[ "https://s3-eu-west-1.amazonaws.com/pixel-drip/sites/janus/main.output.mp3" ], function() { //"../src/assets/Sequence01_1.mp3"
				console.log('BUFFERLOAD COMPLETE');
			});
	
	bufferLoader.load();
	var gainL;
	var gainR;
	
	CrossfadeSample.play = function() {
		// Create two sources.
		this.ctl1 = createSource(bufferLoader.bufferList[0]);
		// Mute the second source.
		this.ctl1.gainNode.gain.value = 1;
		// Start playback in a loop
		if (!this.ctl1.source.start) {
			this.ctl1.source.noteOn(0);
		} else {
			this.ctl1.source.start(0);
		}
		this.playing = true;

		function createSource(buffer) {
			var source = context.createBufferSource();
			var gainNode = context.createGain ? context.createGain() : context.createGainNode();
			source.buffer = buffer;
			// Turn on looping
			source.loop = false;
			// Connect source to gain.
//			source.connect(gainNode);
			// Connect gain to destination.
			
			
//			var oscillator = context.createOscillator();
//			var pannerNode = context.createPanner();
//
//			gainNode.connect(oscillator);
//			oscillator.connect(pannerNode);
//			pannerNode.connect(context.destinaton);

			
			gainL = context.createGain();
			gainR = context.createGain();
			
			var splitter = context.createChannelSplitter(2);

			//Connect to source
//			var source = context.createMediaElementSource(audioElement);
			//Connect the source to the splitter
			source.connect(splitter, 0, 0);
			//Connect splitter' outputs to each Gain Nodes
			splitter.connect(gainL, 0);
			splitter.connect(gainR, 1);

			//Connect Left and Right Nodes to the output
			//Assuming stereo as initial status
			gainL.connect(context.destination, 0);
			gainR.connect(context.destination, 0);

			return {
				source : source,
				gainNode : gainNode,
				splitter : splitter
			};
		}
	};
	
	CrossfadeSample.panToRight = function(){
		gainL.gain.value = 0;
		gainR.gain.value = 1;
	    console.log("RIGHT PAN");
	}

	//Mute right channel and set the left gain to normal
	CrossfadeSample.panToLeft = function(){
		gainL.gain.value = 1;
		gainR.gain.value = 0;
	    console.log("LEFT PAN");
	}
	
	//Restore stereo
	CrossfadeSample.panToStereo = function(){
		gainL.gain.value = 1;
		gainR.gain.value = 1;
	    console.log("STEREO PAN");
	}
	

	CrossfadeSample.stop = function() {
		if (!this.ctl1.source.stop) {
			this.ctl1.source.noteOff(0);
		} else {
			this.ctl1.source.stop(0);
		}
		this.playing = false;
	};

	CrossfadeSample.toggle = function() {
		this.playing ? this.stop() : this.play();
		this.playing = !this.playing;
	};
	
	
	$('a.audio_left').click(function(e){
		CrossfadeSample.panToLeft();
	});
	$('a.audio_right').click(function(e){
		CrossfadeSample.panToRight();
	});
	$('a.audio_stereo').click(function(e){
		CrossfadeSample.panToStereo();
	});
	$('a.audio_start').click(function(e){
		CrossfadeSample.play();
		console.log("START");
	});
	$('a.audio_stop').click(function(e){
		CrossfadeSample.stop();
		console.log("STOP");
	});
	
})()