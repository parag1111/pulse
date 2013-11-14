// JavaScript Boilerplate Document

//*******************************************************************//
//* COMMON COMPONENTS WRAPPER / OBJECT *//
//*******************************************************************//

(function (MODULE, $, undefined) {
//HTML Generation
MODULE.addHTML = (function () {
        function _subModule() {

            var firebase = new Firebase('https://nitrox.firebaseio.com/audiodj/'),

            /* Caching HTML objects */
			params = {
					createProject 			: ".createProject",
					joinProject				: ".joinProject"
            },

            $cached = {
                createProjectBtn 			: $(params.createProject),
				joinProjectBtn				: $(params.joinProject)
			},


			/*Create new project*/
			createNewProject = function(){
				var nameBox = $("#proname"),
					lengthBox = $("#prolength");

				/* validation for text box */
				if(nameBox.val().length > 0){

					var nameValue = nameBox.val(),
						lengthValue = lengthBox.val(),
						projectData;

					firebase.transaction(function(nitroxData){

						projectData = nitroxData;						

						//console.log(projectData.length);
						
						if(projectData === null){

							return {Who : "Oops..There are no projects"};

						}else{

							return;

						}
						

					}, function(error, committed, snapshot){						

						if (error){

							console.log('Transaction failed abnormally!', error);	

						}/*else if (!committed){

							console.log('We aborted the transaction (because project: '+ txtValue +' already exists).');	

						}*/else{

							projectData = snapshot.val();							
							projectData[nameValue.replace(" ","")] = {audioClips:{},audios:{}, lastmodified:"", length: lengthValue, members:{}, name:nameValue,pan:"50",passkey:"random#",tempo:"120",vol: 100};
							firebase.set(projectData);
							$("#overlay").fadeOut();
							$("#addNewPro").fadeOut();
							$("div.joinProject").trigger('click');
						}
					    
					});
					

				}else{			
					/* format to red because no text entered */		
					txtBox.val("Enter Something Please!").css("color", "red");
				}

				/* format text box to original state */
				$("#create-txt-box").on("click", function(){
					$(this).val("").css("color", "black");

				})
			},			 
			
			/* Initializing to function */      
			applyFunctionality = function () {
				 $cached.createProjectBtn.on('click', function(event) {
				 	event.preventDefault();
				 	/* Act on the event */
				 	//alert("This feature is not yet built.");
				 	$("#addNewPro").fadeIn();
				 	$("#overlay").fadeIn();

				 	/* Bind create button event */
				 	$("#addNewPro #submit").on("click", createNewProject)
				 	
				 });

				 $("#overlay").click(function(event) {
	                /* Act on the event */
	                $("#addNewPro").find('input').not('#submit').val("");
	                $("#addNewPro").fadeOut();
	                $("#overlay").fadeOut();
	                $("#projectList").fadeOut();
	              });
				
				 $cached.joinProjectBtn.on('click', function(event) {
				 	event.preventDefault();
				 	/* Act on the event */
				 	///firebase = new Firebase('https://nitrox.firebaseio.com/audiodj/');
                    firebase.on('value', function(dataSnapshot) {
                              // Display project Menu
                              var data = dataSnapshot.val(),
                              	  HTML = "";
                              if(data != undefined && data != null ){
	                              for(var key in data){
	                              	HTML += '<div class="prolist" project-ref='+key+'>'+data[key].name+'</div>';
	                              }
	                          }else{
	                          	HTML = '<div class="prolist">No project available</div>';
	                          }

	                          $("#overlay").fadeIn();
                              $("#projectList").mCustomScrollbar({
										scrollButtons:{
											enable:true
										}
									}).fadeIn().html(HTML);

                              $("#projectList > div").on('click', function(event) {
								/* Act on the event */
								var _this = $(this),
									newHTML = "";
									if(_this.attr("project-ref")){
										newHTML = '<input type="text" id="djname" placeholder="Your Name"/><div class="gotoComposition" project-ref='+_this.attr("project-ref")+'>Modify Composition</div>'
										_this.parents("#projectList").addClass("formactive").html(newHTML);
									}else{
										$("#projectList").fadeOut();
										$("#overlay").fadeOut();
									}
									_applyClickFeature();
								});
                              function _applyClickFeature(){
                              	 $("#projectList > .gotoComposition").on('click', function(event) {
                              	 	window.location.href = 'composition.html?project='+$(this).attr("project-ref")+'&djname='+$("#djname").val();
                              	 });
                              }

                            });
				 });					
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
