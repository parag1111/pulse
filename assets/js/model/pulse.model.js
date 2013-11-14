// Model Declaration

//*******************************************************************//
//* COMMON MODELS *//
//*******************************************************************//


//* All Songs model *//	
var audioDataModel = Backbone.Model.extend({
	 
	 initialize  : function() {
		//referring songData as _this
	   _this = this;

    },
	
	
    //Modify entire song data
	modifySong : function(obj){
		
		for(var i=0; i<obj.length; i++){
			var sampleObj = obj[i];
		
			_this.modifySingleSong(sampleObj,i);
		}
       /*Cleaning up songData variable
		_this.set({songData:""});
			
       //Overwriting songData with updated records
		_this.set({songData:[obj]});*/

	},

    //Modify single song entry in data
	modifySingleSong : function(obj, index){
		
		//Storing current data
		var currsongData = _this.songData;

       //Cleaning up songData variable
		_this.set({songData:""});
		
       //Passing single data entry to saved data
		currsongData[index] = obj;
		
       //Overwriting songData with updated records
		_this.set({songData:[currsongData]});

	},
	
    //Sample songData
	songData:[{
        "roomEffect" : "normal",
        "vol" : 100,
        "pan" : 50,
        "name" : "Sample Song",
        "audio" : "sample.mp3",
        "start" : 0,
        "end" : 2000
      }]
	
});

//Declaring Model instance as global
var globalAudioModel = new audioDataModel();
