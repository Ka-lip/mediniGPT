//$EXPERIMENTAL$ $ENHANCED_JAVA_ACCESS$
load("../.lib/AI/utils.js");
load("../.lib/helper.js");
load("../.lib/AI/configs.js");
load("../.lib/ui.js");
load("../.lib/factory.js");

var reader = {
	getGuidewords: function(hazopTable){
		if (hazopTable == undefined){var hazopTable = selection[0];}
		var hazopTableArr = hazopTable.guidewords.toArray();
		var guidewordArr = Array(hazopTableArr.length);
		for (var i = 0; i < hazopTableArr.length; i++){
			guidewordArr[i] = hazopTableArr[i].name;
		}
		return guidewordArr;
	},
	getSubjects: function(hazopTable){
		if (hazopTable == undefined){var hazopTable = selection[0];}
		var subjectEntries = hazopTable.entries.toArray();
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
	updateGuidewordTable: function(malfunction, guideword, hazopTable){
		if (hazopTable == undefined){ var hazopTable = selection[0]; }
		var tableEntries = hazopTable.entries.toArray();
		var tableGuidewords = hazopTable.guidewords.toArray();
		if (malfunction == undefined || guideword == undefined){ return 1; }
		var entry = tableEntries.filter(function(e){return e.element == malfunction.mediniGetContainer();})[0];
		var gw = tableGuidewords.filter(function(g){return g.name == guideword;})[0];
		Factory.createMapEntry(entry.guidewordToFailures, gw, malfunction);

		return 0;
	},
	newMalfunctions: function(json, scope){
		if (scope == undefined){ var scope = selection[0]; }
		var guidewords = Object.keys(json);
		var malfunctions = Array(guidewords.length);
		var k, v;
		for (var i = 0; i < guidewords.length; i++){
			k = guidewords[i];
			v = json[k];
			malfunctions[i] = this.newMalfunction(v, scope);
		}
		return [guidewords, malfunctions];
	}
};

function main(){
    var guidewords = reader.getGuidewords();
	var subjects = reader.getSubjects();
	// TODO: replace the guidewords in promptContentTemplate automatically
	// TODO: allow multiple malfunctions for a single guideword
	var promptContentTemplate = "Use guideword analysis approach to derive the malfunctions of the function 'FUNC_PLACEHOLDER'. Your return shall be a JSON string for guidewords, `NO OR NOT`, `MORE`, `LESS`, `AS WELL AS`, `PART OF`, `REVERSE`, `OTHER THAN`, `EARLY`, `LATE`, `BEFORE`, `AFTER`, `PEROIDIC`. If there is no reasonable malfunction for a specific guideword, just keep the value empty. For each guideword, the values include the name of the malfunction, which shall be shorter, and the description of the malfunction, which should explain the malfunction in detail. Your return shall only have the JSON string without anything else.";

	for (var i = 0; i < subjects.length; i++){
		var subject = subjects[i];
		var promptContent = promptContentTemplate.replace('FUNC_PLACEHOLDER', subject.name);
		var gptJson = utils.gptJsonGenerator(prompts['messages0'], 1, promptContent, sampleGptJson);
		gptConversation = new GptConversation(gptJson);
		malfunctionsJson = gptConversation.getContent('json');
		var [guidewords, malfunctions] = writer.newMalfunctions(malfunctionsJson, subject);
		for (var j = 0; j < malfunctions.length; j++){
			var malfunction = malfunctions[j];
			var guideword = guidewords[j];
			writer.updateGuidewordTable(malfunction, guideword);
		}
	}
}

main();
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
