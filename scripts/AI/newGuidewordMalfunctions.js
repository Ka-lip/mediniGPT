//$EXPERIMENTAL$
load('../.lib/AI/utils.js');
load("../.lib/helper.js");
load("../.lib/AI/configs.js");
load("../.lib/ui.js");

var reader = {
	getGuidewords: function(guidewordObj){
		if (guidewordObj == undefined){var guidewordObj = selection[0];}
		var guidewordObjArr = guidewordObj.guidewords.toArray();
		var guidewordArr = Array(guidewordObjArr.length);
		for (var i = 0; i < guidewordObjArr.length; i++){
			guidewordArr[i] = guidewordObjArr[i].name;
		}
		return guidewordArr;
	},
	getSubjects: function(guidewords){
		return 0;
	}
}
var writer = {
	newMalfunction: function(json){
		return 0;
	}
	updateGuidewordTable: function(malfunction, guideword){
		return 0;
	}

}

function main(){
    var guidewords = reader.getGuidewords();
	var subjects = reader.getSubjects();
	var promptContent = '';

	for (var i = 0; i < subjects.length; i++){
		var subject = subjects[i];
		var gptJson = utils.gptJsonGenerator(prompts['messages0'], 1, promptContent, sampleGptJson);
		var gpt = GptConversation(gptJson);
		var malfunctionsJson = gpt.getContent();

		for (var j = 0; j < malfunctionsJson.length; j++){
			var malfuncitionJson = malfunctionsJson[j];
			var malfunction = writer.newMalfunction(malfunctionJson);
			var guideword = ''; //TODO: get it from json
			writer.updateGuidewordTable(malfunction, guideword);

		}
	}
}

// main();
