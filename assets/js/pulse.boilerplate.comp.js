var userName,
    projectName;

// JavaScript Boilerplate Document

//*******************************************************************//
//* COMMON COMPONENTS WRAPPER / OBJECT *//
//*******************************************************************//

(function (MODULE, $, undefined) {
//HTML Generation
MODULE.addHTML = (function () {
        function _subModule() {

            var firebase,
            	globleModel,
            	tempo,
                first = true,

            /* Caching HTML objects */
      			params = {
      					createProject 	: ".createProject",
      					joinProject			: ".joinProject",
      					proInfo					: ".proInfo",
      					tempo 					: "#tempo",
                askUpdate       : "#askUpdate",
                update          : ".proInfo .update",
                playBtn         : ".playButton",
                mp3List         : "#mp3List"
            },

            $cached = {
                createProjectBtn 	: $(params.createProject),
				        joinProjectBtn		: $(params.joinProject),
				        proInfo						: $(params.proInfo),
				        tempo 						: $(params.tempo),
                askUpdate         : $(params.askUpdate),
                masterUpdate      : $(params.update),
                playButton        : $(params.playBtn),
                mp3List           : $(params.mp3List)
			},
			 
			
      			/* Initializing to function */      
      			applyFunctionality = function () {
      				getFireBaseObj();

      				userName = getURLParameter("djname");
      				projectName = getURLParameter("project");

              $cached.masterUpdate.click(function(event) {
                globalAudioModel.songData.set({lastmodified:userName});
                submitFirebase();
              });

              $cached.playButton.click(function(event) {
                /* Act on the event */
                event.preventDefault();
                if(audioEnabled == true){
                  var _this = $(this);
                  if(_this.hasClass('play')){
                    PA.playAll();
                    _this.removeClass('play').addClass('pause');
                  }else{
                    PA.stopAll();
                    _this.removeClass('pause').addClass('play');
                  }
                }
              });

      			}

      			getFireBaseObj = function(){
      				firebase = new Firebase('https://nitrox.firebaseio.com/audiodj/');
                      firebase.on('value', function(dataSnapshot) {
                          if(first == true){
                      	   globalAudioModel.songData = dataSnapshot.val()[projectName];
                             renderViews();
                             userOnline();
                             first = false;
                      	}else{
                          if(dataSnapshot.val()[projectName].lastmodified != userName){
                              askUpdate(dataSnapshot.val()[projectName]);
                            }else{
                              alert("Project saved.");
                            }
                        }
                      });
      			}

            submitFirebase = function(){
              var firebaseUrl = 'https://nitrox.firebaseio.com/audiodj/'+projectName;
                    firebase = new Firebase(firebaseUrl);
                    firebase.update(globalAudioModel.songData);
            },

      			getURLParameter = function (name) {
      			   name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
                    var regexS = "[\\?&]"+name+"=([^&#]*)";
                    var regex = new RegExp( regexS );
                    var results = regex.exec( window.location.href );
                    if( results == null )
                      return "";
                    else
                      return decodeURIComponent(results[1].replace(/\+/g, " "));
      			},

            renderViews = function(){
                //set values to HTML
                $cached.proInfo.find(".left > span").html(globalAudioModel.songData.name);
                $cached.tempo.val(globalAudioModel.songData.tempo);
                $("#composer .songEditor #grid").width(globalAudioModel.songData.length / 2);
                PA.bufferload();

                new trackList();
                new renderMP3List();
            },

            askUpdate = function(obj){
                $cached.askUpdate.fadeIn();
                $cached.askUpdate.find("p").html("This project is modified by "+obj.lastmodified+".<br> Do you want to merge the changed?");
                $cached.askUpdate.find(".popupUpdate").click(function(event) {
                    /* Act on the event */
                    globalAudioModel.set({songData:obj});
                    renderViews();
                    $cached.askUpdate.fadeOut();
                    $cached.askUpdate.find("p").html("");
                });
                $cached.askUpdate.find(".close").click(function(event) {
                    /* Act on the event */
                     $cached.askUpdate.fadeOut();
                     $cached.askUpdate.find("p").html("");
                });

            },

            bindEventtoMP3List = function(){

              var songDetails = $("#addNewSong");
              
              $cached.mp3List.on('click', function(event){
                var newtext = $(event.target).html();
                  songDetails.fadeIn();
                  $("#overlay").fadeIn();
                  songDetails.find('input#songpath').val(newtext);
                  
                  //event.dataTransfer.setData("Text", newtext);
              });

              $("#overlay").click(function(event) {
                /* Act on the event */
                songDetails.find('input').val("");
                songDetails.fadeOut();
                $("#overlay").fadeOut();
              });

              $('#addNewSong #submit').click(function(event) {
                /* Act on the event */
                var data = globalAudioModel.songData;
                    globalAudioModel.set({songData:""});

                data.audios.push({
                  audio:$("#songpath").val(),
                  editable:true,
                  enabled:"enabled",
                  name:$("#songname").val(),
                  pan:"0",
                  repeat:$("#repeat").val(),
                  roomEffect:"normal",
                  track:[{start:$("#start").val(), end: $("#end").val()}],
                  user:userName,
                  vol:"90"
                });
                globalAudioModel.set({songData:data});

                songDetails.find('input').val("");
                songDetails.fadeOut();
                $("#overlay").fadeOut();

              });
              
            }

            bindEventstosongInfoObj = function(){

              //Binding Events
              $(".songInfo").each(function(i){
                var _this = $(this);
                    
                    //Binding Volume Change Event
                    _this.find("input.volume").change(function(event) {
                      /* Act on the event */
                      globalAudioModel.songData.audios[i].vol = $(event.target).val();
                      changeModel();

                    });

                    //Binding Pan Change Event
                    _this.find("input.pan").change(function(event) {
                      /* Act on the event */
                      globalAudioModel.songData.audios[i].pan = $(event.target).val();
                    });

                    //Binding enable disable event
                    _this.find("div.mute").click(function(event) {
                        var eventTarget = $(event.target);
                            if(eventTarget.hasClass('enabled')){
                                eventTarget.removeClass('enabled').addClass('notenabled');
                                globalAudioModel.songData.audios[i].enabled = "notenabled";
                              }else{
                                eventTarget.removeClass('notenabled').addClass('enabled');
                                globalAudioModel.songData.audios[i].enabled = "enabled";
                              }
                    });
              })
              //Master tempo change
              $("#tempo").change(function(event) {
                globalAudioModel.songData.tempo = $(event.target).val();
              });

            }

            bindEventtoSongTracks = function(){
              $(".trackContainer").each(function(i){
                var _this = $(this),
                    randColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);

                //Set Location of tracks
                _this.find(".track").each(function(j){
                    var __this = $(this);
                        __this.css({
                          width: (Number(__this.attr("data-end"))/10 - Number(__this.attr("data-start"))/10),
                          "background-color":randColor
                        });
                        __this.animate({left: Number(__this.attr("data-start")) / 10},500);

                      __this.pep({
                            axis: "x",
                            shouldEase: false,
                            useCSSTranslation: false,
                            constrainTo: 'parent',
                            grid: [25,25],
                            stop: function(ev, obj){
                              var startTime = __this.position().left * 10,
                                  parentIndex = __this.parents(".trackContainer").index(),
                                  thisIndex =  __this.index(),
                                  thisWidth = globalAudioModel.songData.audios[parentIndex].track[thisIndex].end - globalAudioModel.songData.audios[parentIndex].track[thisIndex].start;

                                  globalAudioModel.songData.audios[parentIndex].track[thisIndex].start = startTime;
                                  globalAudioModel.songData.audios[parentIndex].track[thisIndex].end = startTime + thisWidth;
                            }
                          });
                });
              });
            }
			
			 userOnline = function(){
                for(var x=0; x < globalAudioModel.songData.members.length; x++){
                  if(globalAudioModel.songData.members[x].user == userName){
                    globalAudioModel.songData.members[x].active = true;
                  }

                }
                submitFirebase();
              }

        changeModel = function(){
          var json = JSON.stringify(globalAudioModel.songData);
              globalAudioModel.songData = "";
              globalAudioModel.songData = JSON.parse(json);
        }

			 /**
             * Init call
             */
            this.init = function () {
                applyFunctionality();
                return this; /*this refere to MODULE.subModule*/
            };

            return this.init(); /*this refere to MODULE.subModule.init()*/
        }
        return new _subModule(); /*creating a new object of subModule rather then a funtion*/
    }());

/**
 * Check to evaluate whether 'MODULE' exists in the global namespace - if not, assign window.MODULE an object literal
 */
}(window.pulse = window.pulse || {}, jQuery));