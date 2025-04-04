//$EXPERIMENTAL$ $ENHANCED_JAVA_ACCESS$ $DEBUG$
load("../.lib/AI/utils.js");
load("../.lib/helper.js");
load("../.lib/AI/configs.js");
load("../.lib/ui.js");
load("../.lib/factory.js");

var promptContentTemplate =
  "Use guideword analysis approach to derive the malfunctions of the function 'FUNC_PLACEHOLDER'. Your return shall be a JSON string for guidewords, `NO OR NOT`, `MORE`, `LESS`, `AS WELL AS`, `PART OF`, `REVERSE`, `OTHER THAN`, `EARLY`, `LATE`, `BEFORE`, `AFTER`, `PERIODIC`. The value of each guideword is an array. If there is no reasonable malfunction for a specific guideword, just keep the array empty; if there are malfunctions more than one for one guideword, the array is allowed to has multiple sub-jsons for malfunctions. For each guideword, the values include the name of the malfunction, which shall be shorter, and the description of the malfunction, which should explain the malfunction in detail. Your return shall only have the JSON string without anything else.";
// TODO: replace the guidewords in promptContentTemplate automatically
// TODO: allow multiple malfunctions for a single guideword
// TODO: update the HAZOP table without adding similar malfunctions

var reader = {
  getGuidewords: function (hazopTable) {
    if (hazopTable == undefined) {
      hazopTable = selection[0];
    }
    var hazopTableArr = hazopTable.guidewords.toArray();
    var guidewordArr = Array(hazopTableArr.length);
    for (var i = 0; i < hazopTableArr.length; i++) {
      guidewordArr[i] = hazopTableArr[i].name;
    }
    return guidewordArr;
  },
  getFuncs: function (hazopTable) {
    if (hazopTable == undefined) {
      hazopTable = selection[0];
    }
    var funcEntries = hazopTable.entries.toArray();
    var funcArr = Array(funcEntries.length);
    for (var i = 0; i < funcEntries.length; i++) {
      funcArr[i] = funcEntries[i].element;
    }
    return funcArr;
  },
};

var writer = {
  newMalfunction: function (json, scope) {
    if (scope == undefined) {
      scope = selection[0];
    }
    var malfunction;
    if (json.name) {
      malfunction = Factory.createElement(
        scope,
        Metamodel.safetyModel.Malfunction
      );
      malfunction.name = json.name;
      malfunction.description = json.description;

      return malfunction;
    }
  },
  updateGuidewordTable: function (malfunction, guideword, hazopTable) {
    if (hazopTable == undefined) {
      hazopTable = selection[0];
    }
    var tableEntries = hazopTable.entries.toArray();
    var tableGuidewords = hazopTable.guidewords.toArray();
    if (malfunction == undefined || guideword == undefined) {
      return 1;
    }
    var entry = tableEntries.filter(function (e) {
      return e.element == malfunction.mediniGetContainer();
    })[0];
    var gw = tableGuidewords.filter(function (g) {
      return g.name == guideword;
    })[0];
    Factory.createMapEntry(entry.guidewordToFailures, gw, malfunction);

    return 0;
  },
  newMalfunctions: function (json, scope) {
    if (scope == undefined) {
      scope = selection[0];
    }
    var guidewords = Object.keys(json);
    var malfunctions = Array(guidewords.length);
    var k, v;
    for (var i = 0; i < guidewords.length; i++) {
      k = guidewords[i];
      v = json[k];
      malfunctions[i] = this.newMalfunction(v, scope);
    }
    return [guidewords, malfunctions];
  },
};

function main() {
  var guidewords = reader.getGuidewords();
  var guideword;
  var funcs = reader.getFuncs();
  var func;
  var promptContent;
  var gptJson;
  var malfunction, malfunctions;
  var guidewordsJson;

  for (var f = 0; f < funcs.length; f++) {
    func = funcs[f];
    promptContent = promptContentTemplate.replace(
      "FUNC_PLACEHOLDER",
      func.name
    );
    gptJson = utils.gptJsonGenerator(
      prompts["messages3"],
      1,
      promptContent,
      sampleGptJson
    );
    gptConversation = new GptConversation(gptJson);
    guidewordsJson = gptConversation.getContent("json");
    for (var g = 0; g < guidewords.length; g++) {
      guideword = guidewords[g];
      malfunctions = guidewordsJson[guideword];
      for (var m = 0; m < malfunctions.length; m++) {
        malfunction = writer.newMalfunction(malfunctions[m], func);
        guideword = guidewords[g];
        writer.updateGuidewordTable(malfunction, guideword);
      }
    }
  }
}

main();
