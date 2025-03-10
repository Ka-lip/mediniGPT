//$EXPERIMENTAL$
load("../.lib/AI/utils.js");
load("../.lib/helper.js");
load("../.lib/AI/configs.js");
load("../.lib/ui.js");
load("../.lib/factory.js");

var j = '```json\n{\n  \"NOT\": {\n    \"name\": \"No Stop\",\n    \"description\": \"The car fails to stop when the brake is engaged, leading to uncontrolled motion.\"\n  },\n  \"MORE\": {\n    \"name\": \"Excessive Delay\",\n    \"description\": \"The car takes longer than expected to come to a complete stop, potentially increasing the stopping distance.\"\n  },\n  \"LESS\": {\n    \"name\": \"Insufficient Brake Force\",\n    \"description\": \"The braking system applies less force than required, resulting in an inadequate stopping response.\"\n  },\n  \"AS WELL AS\": {\n    \"name\": \"Simultaneous Malfunction\",\n    \"description\": \"The car stops but experiences simultaneous issues with the steering or other auxiliary systems, affecting overall control.\"\n  },\n  \"PART OF\": {\n    \"name\": \"\",\n    \"description\": \"\"\n  },\n  \"REVERSE\": {\n    \"name\": \"Unexpected Acceleration\",\n    \"description\": \"In situations where a stop is initiated, the car experiences unintended acceleration instead, leading to dangerous situations.\"\n  },\n  \"OTHER THAN\": {\n    \"name\": \"\",\n    \"description\": \"\"\n  },\n  \"EARLY\": {\n    \"name\": \"Premature Stop\",\n    \"description\": \"The car stops unexpectedly before reaching the intended stopping point, which may endanger any passengers or other vehicles.\"\n  },\n  \"LATE\": {\n    \"name\": \"Delayed Stop\",\n    \"description\": \"The car stops later than intended, potentially causing a collision with obstacles ahead.\"\n  },\n  \"BEFORE\": {\n    \"name\": \"\",\n    \"description\": \"\"\n  },\n  \"AFTER\": {\n    \"name\": \"\",\n    \"description\": \"\"\n  },\n  \"PERIODIC\": {\n    \"name\": \"\",\n    \"description\": \"\"\n  }\n}\n```';
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
	getSubjects: function(guidewordObj){
		if (guidewordObj == undefined){var guidewordObj = selection[0];}
		var subjectEntries = guidewordObj.entries.toArray();
		var subjectArr = Array(subjectEntries.length);
		for (var i = 0; i < subjectEntries.length; i++){
			subjectArr[i] = subjectEntries[i].element;
		}
		return subjectArr;
	}
};

var writer = {
	newMalfunction: function(json, scope){
		if (scope == undefined){ var scope = selection[0]; }
		if (json.name){
			var malfunction = Factory.createElement(scope, Metamodel.safetyModel.Malfunction);
			malfunction.name = json.name;
			malfunction.description = json.description;
			return malfunction;
		}
	},
	updateGuidewordTable: function(malfunction, guideword){
		return 0;
	},
	newMalfunctions: function(json, scope){
		if (scope == undefined){ var scope = selection[0]; }
		var guidewords = Object.keys(json);
		var k, v;
		for (var i = 0; i < guidewords.length; i++){
			k = guidewords[i];
			v = json[k];
			this.newMalfunction(v, scope);
		}
		return 0; //TODO need to integrate with guideword table
	}
};

function main(){
    var guidewords = reader.getGuidewords();
	var subjects = reader.getSubjects();
	var promptContent = "Use guideword analysis approach to derive the malfunctions of the function 'car stops'. Your return shall be a JSON string for guidewords, NOT, MORE, LESS, AS WELL AS, PART OF, REVERSE, OTHER THAN, EARLY, LATE, BEFORE, AFTER, PEROIDIC. If there is no reasonable malfunction for a specific guideword, just keep the value empty. For each guideword, the values include the name of the malfunction, which shall be shorter, and the description of the malfunction, which should explain the malfunction in detail. Your return shall only have the JSON string without anything else.";

	for (var i = 0; i < subjects.length; i++){
		var subject = subjects[i];
		var gptJson = utils.gptJsonGenerator(prompts['messages0'], 1, promptContent, sampleGptJson);
		
		//for (var j = 0; j < Object.keys(malfunctionsJson).length; j++){
		//	var malfuncitionJson = malfunctionsJson[j];
		//	var malfunction = writer.newMalfunction(malfunctionJson);
		//	var guideword = ''; //TODO: get it from json
		//	writer.updateGuidewordTable(malfunction, guideword);
		//}
	}
	console.log('done');
}

//main();

//{
//  \"NOT\": {
//    \"name\": \"No Stop\",
//    \"description\": \"The car fails to stop when the brake is engaged, leading to uncontrolled motion.\"
//  },
//  \"MORE\": {
//    \"name\": \"Excessive Delay\",
//    \"description\": \"The car takes longer than expected to come to a complete stop, potentially increasing the stopping distance.\"
//  },
//  \"LESS\": {
//    \"name\": \"Insufficient Brake Force\",
//    \"description\": \"The braking system applies less force than required, resulting in an inadequate stopping response.\"
//  },
//  \"AS WELL AS\": {
//    \"name\": \"Simultaneous Malfunction\",
//    \"description\": \"The car stops but experiences simultaneous issues with the steering or other auxiliary systems, affecting overall control.\"
//  },
//  \"PART OF\": {
//    \"name\": \"\",
//    \"description\": \"\"
//  },
//  \"REVERSE\": {
//    \"name\": \"Unexpected Acceleration\",
//    \"description\": \"In situations where a stop is initiated, the car experiences unintended acceleration instead, leading to dangerous situations.\"
//  },
//  \"OTHER THAN\": {
//    \"name\": \"\",
//    \"description\": \"\"
//  },
//  \"EARLY\": {
//    \"name\": \"Premature Stop\",
//    \"description\": \"The car stops unexpectedly before reaching the intended stopping point, which may endanger any passengers or other vehicles.\"
//  },
//  \"LATE\": {
//    \"name\": \"Delayed Stop\",
//    \"description\": \"The car stops later than intended, potentially causing a collision with obstacles ahead.\"
//  },
//  \"BEFORE\": {
//    \"name\": \"\",
//    \"description\": \"\"
//  },
//  \"AFTER\": {
//    \"name\": \"\",
//    \"description\": \"\"
//  },
//  \"PERIODIC\": {
//    \"name\": \"\",
//    \"description\": \"\"
//  }
//}
