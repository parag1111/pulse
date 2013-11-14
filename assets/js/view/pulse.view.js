// View Declaration

//*******************************************************************//
//* COMMON VIEWS *//
//*******************************************************************//


//* All Songlist view object *//		
var trackList = Backbone.View.extend({

            // The DOM Element associated with this view
			el: "#composer .songlist",
			model: globalAudioModel,

            // View constructor
            initialize: function() {
			
                // Calls the view's render method
                this.render();
				
				// calling updateview function of view once model is updated
				this.listenTo(this.model, 'change:songData', this.updateview);
            },
			
            // Updateview function that fires after model data is updated
			updateview : function(){
				//rendering the view again
				this.render();
				//PA.attachVolume();

			},
			
			// Render's view's template or HTML
            render: function() {
                // Setting the view's template property using the Underscore template method
				this.template = _.template(trackListTpl, {trackListData: this.model.songData.audios});
				
				//Rendering HTMl inside View's element
                this.$el.html(this.template);

                //After render functions
                $("input.volume, input.pan").slider();
                $("#composer .songEditor #grid, #composer .songEditor").height($(".songInfo").length * 100);
                bindEventstosongInfoObj();					
                // Maintains chainability
                new renderTracks();
                return this;
            }
        });	


//* All Songlist view object *//		
var renderTracks = Backbone.View.extend({

            // The DOM Element associated with this view
			el: "#grid",
			model: globalAudioModel,

            // View constructor
            initialize: function() {
			
                // Calls the view's render method
                this.render();
				
				// calling updateview function of view once model is updated
				this.listenTo(this.model, 'change:songData', this.updateview);
            },			
			
            // Updateview function that fires after model data is updated
			updateview : function(){
				//rendering the view again
				this.render();
			},
			
			// Render's view's template or HTML
            render: function() {
                // Setting the view's template property using the Underscore template method
				this.template = _.template(trackTpl, {trackListData: this.model.songData.audios});
				
				//Rendering HTMl inside View's element
                this.$el.html(this.template);
				bindEventtoSongTracks();
                // Maintains chainability
                return this;
            }
        });	


//* All Songlist view object *//		
var renderMP3List = Backbone.View.extend({

            // The DOM Element associated with this view
			el: "#mp3List",
			model: globalAudioModel,

            // View constructor
            initialize: function() {
			
                // Calls the view's render method
                this.render();
				
				// calling updateview function of view once model is updated
				this.listenTo(this.model, 'change:songData', this.updateview);
            },			
			
            // Updateview function that fires after model data is updated
			updateview : function(){
				//rendering the view again
				this.render();
			},
			
			// Render's view's template or HTML
            render: function() {
                // Setting the view's template property using the Underscore template method
				this.template = _.template(mp3FileList, {mp3FileListData: this.model.songData.audioClips});
				
				//Rendering HTMl inside View's element
                this.$el.html(this.template);
				bindEventtoMP3List();
                // Maintains chainability
                return this;
            }
        });	