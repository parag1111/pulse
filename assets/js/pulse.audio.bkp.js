// Declaring AudioContext
	var context,
		bufferLoader,
		allTracks = [],
		allGains = [],
		allPans = [],
		mainTimer,
		currTime = 0,
		audios = [],
		PA = PA || {};

		try {
		    // Fix up for prefixing
		    window.AudioContext = window.AudioContext||window.webkitAudioContext;
		    context = new AudioContext();
		  }
		  catch(e) {
		    alert('Web Audio API is not supported in this browser');
		  }


	PA.bufferload = function(){			
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
		  for(var i =0; i< bufferlist.length; i++){
		  	var source = context.createBufferSource();
		  		source.buffer = bufferlist[i];
		  		allTracks.push(source);


		  	// Adding volume to allGains
		  	var gainNode = context.createGainNode();
			  	gainNode.gain.value = globalAudioModel.songData.audios[i].vol / 100;
			  if(gainNode.gain.value == 0){gainNode.gain.value = -1};
			    allGains.push(gainNode);

			 // Adding all panning to allPan
			 var panNode = context.createPanner();
			 	 panNode.setPosition(globalAudioModel.songData.audios[i].pan, 0, 0);
			  	 allPans.push(panNode);
		  }

		  
	}

	//Play all tracks 
	PA.playAll = function(){	
		// Main timer
		mainTimer = setInterval(function(){
			// setting features
			currTime = currTime + 500;
			$("#tracker").animate({
				"left": (currTime / 10)
				},500,"linear");
		},500);
		PA.controlTracks("play");
	}

	//Pause all tracks
	PA.stopAll = function(){
		window.clearInterval(mainTimer);
		$("#tracker").animate({
				"left": (0)
			},1000,"linear").stop();
		currTime = 0;
		PA.controlTracks("stop");
		PA.bufferload();
	}

	//control all tracks 
	PA.controlTracks = function(params){

		if(params == "play"){
			PA.attachSettings();
		}else{
			for(var i = 0; i<allTracks.length; i++){
				allTracks[i].stop(0);
			}
		}
	}

	//Attach settings to all source 
	PA.attachSettings = function(){

		for(var i = 0; i < allTracks.length; i++){
			 	  

			  //Bind volume control to audio
			  jQuery('input.volume').each(function(index, el) {
			  	jQuery(this).change(function(event) {
			  		/* Act on the event */
			  		var volVal = jQuery(this).val() / 100;
			    		allGains[index].gain.value = volVal;
			    		globalAudioModel.songData.audios[index].vol = volVal;
			  	});
			  });

    		  //Bind panning control to audio
			  jQuery('input.pan').each(function(ind, el) {
			  	jQuery(this).change(function(event) {
			  		//Act on the event 
			  		var panVal = jQuery(this).val();
			  			allPans[ind].setPosition(panVal, 0, 0);
			  			globalAudioModel.songData.audios[ind].pan = panVal;
			  			
			  	});
			  });

			 allTracks[i].connect(allGains[i]);
			 allGains[i].connect(allPans[i]);
    		 allPans[i].connect(context.destination);

			 allTracks[i].start(0);
			  
			}
							  
	}
