//$EXPERIMENTAL$ $ENHANCED_JAVA_ACCESS$
load("../.lib/AI/utils.js");
load("../.lib/helper.js");
load("../.lib/AI/configs.js");
load("../.lib/ui.js");
load("../.lib/factory.js");

var promptContentTemplate = "Use guideword analysis approach to derive the malfunctions of the function 'FUNC_PLACEHOLDER'. Your return shall be a JSON string for guidewords, `NO OR NOT`, `MORE`, `LESS`, `AS WELL AS`, `PART OF`, `REVERSE`, `OTHER THAN`, `EARLY`, `LATE`, `BEFORE`, `AFTER`, `PEROIDIC`. If there is no reasonable malfunction for a specific guideword, just keep the value empty. For each guideword, the values include the name of the malfunction, which shall be shorter, and the description of the malfunction, which should explain the malfunction in detail. Your return shall only have the JSON string without anything else.";
// TODO: replace the guidewords in promptContentTemplate automatically
// TODO: allow multiple malfunctions for a single guideword
// TODO: update the HAZOP table without adding similar malfunctions
var reader = {
	getGuidewords: function(hazopTable){
		if (hazopTable == undefined){hazopTable = selection[0];}
		var hazopTableArr = hazopTable.guidewords.toArray();
		var guidewordArr = Array(hazopTableArr.length);
		for (var i = 0; i < hazopTableArr.length; i++){
			guidewordArr[i] = hazopTableArr[i].name;
		}
		return guidewordArr;
	},
	getFuncs: function(hazopTable){
		if (hazopTable == undefined){hazopTable = selection[0];}
		var funcEntries = hazopTable.entries.toArray();
		var funcArr = Array(funcEntries.length);
		for (var i = 0; i < funcEntries.length; i++){
			funcArr[i] = funcEntries[i].element;
		}
		return funcArr;
	}
};

var writer = {
	newMalfunction: function(json, scope){
		if (scope == undefined){ scope = selection[0]; }
		var malfunction;
		if (json.name){
			malfunction = Factory.createElement(scope, Metamodel.safetyModel.Malfunction);
			malfunction.name = json.name;
			malfunction.description = json.description;

			return malfunction;
		}
	},
	updateGuidewordTable: function(malfunction, guideword, hazopTable){
		if (hazopTable == undefined){ hazopTable = selection[0]; }
		var tableEntries = hazopTable.entries.toArray();
		var tableGuidewords = hazopTable.guidewords.toArray();
		if (malfunction == undefined || guideword == undefined){ return 1; }
		var entry = tableEntries.filter(function(e){return e.element == malfunction.mediniGetContainer();})[0];
		var gw = tableGuidewords.filter(function(g){return g.name == guideword;})[0];
		Factory.createMapEntry(entry.guidewordToFailures, gw, malfunction);

		return 0;
	},
	newMalfunctions: function(json, scope){
		if (scope == undefined){ scope = selection[0]; }
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
	var guideword;
	var funcs = reader.getFuncs();
	var func;
	var promptContent; 
	var gptJson;
	var malfunction, malfunctions; 
	var malfunctionsJson;

	for (var i = 0; i < funcs.length; i++){
		func = funcs[i];
		promptContent = promptContentTemplate.replace('FUNC_PLACEHOLDER', func.name);
		gptJson = utils.gptJsonGenerator(prompts['messages0'], 1, promptContent, sampleGptJson);
		gptConversation = new GptConversation(gptJson);
		malfunctionsJson = gptConversation.getContent('json');
		[guidewords, malfunctions] = writer.newMalfunctions(malfunctionsJson, func);
		for (var j = 0; j < malfunctions.length; j++){
			malfunction = malfunctions[j];
			guideword = guidewords[j];
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


//"Use guideword analysis approach to derive the malfunctions of the function 'Car brakes'. Your return shall be a JSON string for guidewords, `NO OR NOT`, `MORE`, `LESS`, `AS WELL AS`, `PART OF`, `REVERSE`, `OTHER THAN`, `EARLY`, `LATE`, `BEFORE`, `AFTER`, `PEROIDIC`. The value of each guideword is an array. If there is no reasonable malfunction for a specific guideword, just keep the array empty; if there are malfunctions more than one for one guideword, the array are allowed to has multiple sub-json for malfunctions. For each guideword, the values include the name of the malfunction, which shall be shorter, and the description of the malfunction, which should explain the malfunction in detail. Your return shall only have the JSON string without anything else."
//{
//  \"NO OR NOT\": [
//    {
//      \"name\": \"Brakes Not Engaging\",
//      \"description\": \"The brake system does not activate when the brake pedal is pressed, leading to a failure to stop the vehicle.\"
//    },
//    {
//      \"name\": \"Brake Warning Light Not Functioning\",
//      \"description\": \"The indicator light on the dashboard does not illuminate when there is a brake system issue, preventing the driver from being aware of potential problems.\"
//    }
//  ],
//  \"MORE\": [
//    {
//      \"name\": \"Excessive Brake Fade\",
//      \"description\": \"The brakes lose effectiveness after prolonged use, requiring more pressure to achieve the same stopping power.\"
//    },
//    {
//      \"name\": \"Increased Stopping Distance\",
//      \"description\": \"The vehicle requires a longer distance to come to a complete stop due to reduced braking force.\"
//    }
//  ],
//  \"LESS\": [
//    {
//      \"name\": \"Low Brake Fluid Level\",
//      \"description\": \"Insufficient brake fluid in the reservoir leads to less hydraulic force, resulting in decreased braking performance.\"
//    },
//    {
//      \"name\": \"Worn Brake Pads\",
//      \"description\": \"Deterioration of brake pads reduces the thickness available to create friction, thus lessening braking effectiveness.\"
//    }
//  ],
//  \"AS WELL AS\": [],
//  \"PART OF\": [
//    {
//      \"name\": \"Master Cylinder Failure\",
//      \"description\": \"The master cylinder, which generates hydraulic pressure for the braking system, fails, affecting the entire braking process.\"
//    },
//    {
//      \"name\": \"Caliper Failure\",
//      \"description\": \"Brake calipers that do not function properly can prevent the brake pads from clamping down on the rotors effectively.\"
//    }
//  ],
//  \"REVERSE\": [
//    {
//      \"name\": \"Brakes Apply When Not Pressed\",
//      \"description\": \"The braking system engages without pressing the brake pedal due to faulty sensors or wiring issues.\"
//    }
//  ],
//  \"OTHER THAN\": [],
//  \"EARLY\": [],
//  \"LATE\": [
//    {
//      \"name\": \"Delayed Response\",
//      \"description\": \"A noticeable lag occurs between pressing the brake pedal and the brakes engaging, posing a significant safety risk.\"
//    }
//  ],
//  \"BEFORE\": [],
//  \"AFTER\": [
//    {
//      \"name\": \"Brake Lock-Up\",
//      \"description\": \"Wheels lock prematurely after applying brakes, often due to sudden engagement or malfunctioning ABS, leading to loss of control.\"
//    }
//  ],
//  \"PERIODIC\": [
//    {
//      \"name\": \"Brake System Maintenance Neglect\",
//      \"description\": \"Failure to regularly inspect and maintain brake components, leading to gradual degradation and unexpected breakdowns.\"
//    }
//  ]
//}
