// Declaring AudioContext
	var context,
		bufferLoader,
		allTracks = [],
		allBuffers = [],
		allGains = [],
		allPans = [],
		allFilters = [],
		mainTimer,
		currTime = 0,
		audios = [],
		PA = PA || {},
		audioEnabled,
		audioTime = 0,
		audioTimer,
		analyser,
		javascriptNode,
		ctx = $("#audioSpectrum").get()[0].getContext("2d"),
		gradient = ctx.createLinearGradient(0,0,0,300);

		try {
		    // Fix up for prefixing
		    window.AudioContext = window.AudioContext||window.webkitAudioContext;
		    context = new AudioContext();
		  }
		  catch(e) {
		    alert('Web Audio API is not supported in this browser');
		  }


	PA.bufferload = function(){
			audios = new Array();
			for (var i = 0; i<globalAudioModel.songData.audios.length; i++){
				audios.push("audio/"+projectName+"/"+globalAudioModel.songData.audios[i].audio);
			}
		
			//Buffer loader function
			bufferLoader = new BufferLoader(
				context,
			    audios,
			    PA.finishedLoading
			    );

			  bufferLoader.load();		
	}

	// After finishing loading of all audios
	PA.finishedLoading = function(bufferlist){
		  // storing all songs in allTracks
		  allTracks = bufferlist;
		  $(".masterPlayer").fadeIn("300");
		  audioEnabled = true;
	}

	//Play all tracks 
	PA.playAll = function(){
		// Main timer
		mainTimer = setInterval(function(){
			// setting features
			currTime = currTime + 250;			
			$("#tracker").animate({"left": (currTime/10)}
				,200, "linear");
		},250);
		PA.controlTracks("play");
	}

	//Pause all tracks
	PA.stopAll = function(){
		window.clearInterval(mainTimer);
		window.clearInterval(audioTimer);
		$("#tracker").animate({"left": (0)},250, "linear");
		currTime = 0;
		PA.controlTracks("stop");
		PA.bufferload();
	}

	//control all tracks 
	PA.controlTracks = function(params){

		if(params == "play"){
			PA.attachSettings();
		}else{
			for(var i = 0; i<allBuffers.length; i++){
				allBuffers[i].stop(0);
			}
			audioTime = 0;
		}
	}

	//Attach settings to all source 
	PA.attachSettings = function(){
		allBuffers = new Array();
		allGains = new Array();
		allPans = new Array();
		allFilters = new Array();
		audioTime = 0;
		audioSpectrum = new Array();
		 	  
		

			  //Bind volume control to audio
			  jQuery('input.volume').each(function(index, el) {
				var gainNode = context.createGainNode();
					gainNode.gain.value = jQuery(this).val() / 100;
			 		// Adding all panning to allPan					
				  	
				  if(gainNode.gain.value == 0){gainNode.gain.value = -1};
				    allGains.push(gainNode);

			  	jQuery(this).change(function(event) {
			  		/* Act on the event */
			  		var volVal = jQuery(this).val() / 100;
			  			allGains[index].gain.value = volVal;
			  			globalAudioModel.songData.audios[index].vol = jQuery(this).val();
			  	});
			  });

    		  //Bind panning control to audio
			  jQuery('input.pan').each(function(ind, el) {
 	
			 	var panNode = context.createPanner();
			  	 panNode.setPosition(jQuery(this).val(), 0, 0);
			  	 allPans.push(panNode);

			  	jQuery(this).change(function(event) {
			  		//Act on the event 
			  		var panVal = jQuery(this).val();
			  			allPans[ind].setPosition(panVal, 0, 0);
			  			globalAudioModel.songData.audios[ind].pan = panVal;
			  			
			  	});
			  });

			  //Bind Mute to audio
			  jQuery('div.mute').each(function(ind, el) {
 					var _this = $(el);
 					_this.on('click', function(event) {
 						event.preventDefault();
 						/* Act on the event */
 						if(_this.hasClass('notenabled')){
	 						allGains[ind].gain.value = 0;
	 					}else{
	 						allGains[ind].gain.value = globalAudioModel.songData.audios[ind].vol / 100;
	 					}
 					
 					});		
 					
	 				if(_this.hasClass('notenabled')){
	 					allGains[ind].gain.value = 0;
	 				}	  			
			  	});

			  //Binding effects to audio
			  jQuery('div.fxBtn').each(function(index, el) {
			  	var filter = context.createBiquadFilter();

			  		switch(globalAudioModel.songData.audios[index].roomEffect)
					{
					case "hpf":
					  filter.type = 1; // NONE
					  break;
					case "lpf":
					  filter.type = 0; // Lowpass
					  break;
					case "bpf":
					  filter.type = 2; // Lowpass
					  break;
					case "pf":
					  filter.type = 5; // Lowpass
					  break;
					case "nf":
					  filter.type = 6; // Lowpass
					  break;
					default:
					  filter.type = 4;
					}

					  // Clamp the frequency between the minimum value (40 Hz) and half of the
					  // sampling rate.
					  var minValue = 40;
					  var maxValue = context.sampleRate / 2;
					  // Logarithm (base 2) to compute how many octaves fall in the range.
					  var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
					  // Compute a multiplier from 0 to 1 based on an exponential scale.
					  var myval = 0;
					  calltInc();
					  
					  function calltInc(){
						  var tInc = setInterval(function(){
						  		var multiplier = Math.pow(2, numberOfOctaves * (myval - 1.0));	
						  			// Get back to the frequency value between min and max.
						  			filter.frequency.value = maxValue * multiplier;
						  			myval += 0.01;

						  			if(myval >= 0.8){
						  				window.clearTimeout(tInc);
						  				calltDec();
						  			}
						  },12.5);
						}
					  function calltDec(){
						   var tDec = setInterval(function(){
						  		var multiplier = Math.pow(2, numberOfOctaves * (myval - 1.0));	
						  			// Get back to the frequency value between min and max.
						  			filter.frequency.value = maxValue * multiplier;
						  			myval -= 0.01;
						  			if(myval <= 0){
						  				window.clearTimeout(tDec);
						  				calltInc();
						  			}
						  },12.5);
					  }
					  filter.Q.value = 5;
					// Connect source to filter, filter to destination.
					allFilters.push(filter);

					//Binding Change Event
					$(el).on('click',function(event) {
						event.preventDefault();
						/* Act on the event */
						var _this = $(event.target),
							_newIndex = _this.closest("aside.songlist > div").index();
						    
						switch(_this.attr("data-effect"))
						{
						case "hpf":
						  allFilters[_newIndex].type = 1; // NONE
						  _this.attr("data-effect","bpf").removeClass('hpf').addClass('bpf');
						  globalAudioModel.songData.audios[_newIndex].roomEffect = "bpf";
						  break;
						case "lpf":
						  allFilters[_newIndex].type = 0; // Lowpass
						  _this.attr("data-effect","hpf").removeClass('lpf').addClass('hpf');
						  globalAudioModel.songData.audios[_newIndex].roomEffect = "hpf";
						  break;
						case "bpf":
						  allFilters[_newIndex].type = 2; // Lowpass
						  _this.attr("data-effect","pf").removeClass('bpf').addClass('pf');
						  globalAudioModel.songData.audios[_newIndex].roomEffect = "pf";
						  break;
						case "pf":
						  allFilters[_newIndex].type = 5; // Lowpass
						  _this.attr("data-effect","nf").removeClass('pf').addClass('nf');
						  globalAudioModel.songData.audios[_newIndex].roomEffect = "nf";
						  break;
						case "nf":
						  allFilters[_newIndex].type = 6; // Lowpass
						  _this.attr("data-effect","normal").removeClass('nf').addClass('normal');
						  globalAudioModel.songData.audios[_newIndex].roomEffect = "normal";
						  break;
						default:
						  allFilters[_newIndex].type = 4;
						  _this.attr("data-effect","lpf").removeClass('hpf').addClass('lpf');
						  globalAudioModel.songData.audios[_newIndex].roomEffect = "lpf";
						}
						
	
					});
			  });
			   


		//Repeat based on tempo
		/*for (var bar = 0; bar < 2; bar++) {
		  var time = startTime + bar * 8 * eighthNoteTime;
		  // Play the bass (kick) drum on beats 1, 5
		  playSound(kick, time);
		  playSound(kick, time + 4 * eighthNoteTime);

		  // Play the snare drum on beats 3, 7
		  playSound(snare, time + 2 * eighthNoteTime);
		  playSound(snare, time + 6 * eighthNoteTime);

		  // Play the hi-hat every eighth note.
		  for (var i = 0; i < 8; ++i) {
		    playSound(hihat, time + i * eighthNoteTime);
		  }
		}*/

		
	 audioTimer = setInterval(function(){		
		//Apply filters and gain to all audio and play
		for(var i = 0; i < allTracks.length; i++){

			var source = context.createBufferSource();
		  		source.buffer = allTracks[i];
		  		if(globalAudioModel.songData.audios[i].repeat  == true){
					source.loop = true;
				}
		  		
		  	 allBuffers.push(source);

			 allBuffers[i].connect(allGains[i]);
			 allGains[i].connect(allPans[i]);
			 allPans[i].connect(allFilters[i]);    		 
			 allFilters[i].connect(context.destination);
    		 /*Creating Spectrum
			    gradient.addColorStop(1,'#000000');
			    gradient.addColorStop(0.75,'#ff0000');
			    gradient.addColorStop(0.25,'#ffff00');
			    gradient.addColorStop(0,'#ffffff');
			    
			    javascriptNode = context.createJavaScriptNode(2048, 1, 1);
		        javascriptNode.connect(context.destination);
		        
		        analyser = context.createAnalyser();
		        analyser.smoothingTimeConstant = 0.3;
		        analyser.fftSize = 512;

		        //sourceNode > audio source
		        allFilters[i].connect(analyser);
		        analyser.connect(javascriptNode);

    		 	//allFilters[i].connect(context.destination);

		        javascriptNode.onaudioprocess = function() {
		                var array =  new Uint8Array(analyser.frequencyBinCount);
			                analyser.getByteFrequencyData(array);
			                ctx.clearRect(0, 0, 1000, 325);
			                ctx.fillStyle=gradient;
			                PA.spectrum(array);
		            }
		        //Spectrum creation ends*/

				if(globalAudioModel.songData.audios[i].track[0].start  == currTime){
					allBuffers[i].start(0);
				}
				if(globalAudioModel.songData.audios[i].track[0].end  == currTime){
					allBuffers[i].stop(0);
				}
			}
	  },250);
	}
							  
	
	PA.spectrum = function(array){
        for ( var i = 0; i < (array.length); i++ ){
            var value = array[i];
            ctx.fillRect(i*5,325-value,3,325);
        }
	}
