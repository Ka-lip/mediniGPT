//$EXPERIMENTAL$
load("../.lib/AI/utils.js");
load("../.lib/helper.js");
load("../.lib/AI/configs.js");
load("../.lib/ui.js");
load("../.lib/python.js");

var pySrcPath =
  __filedir.slice(0, __filedir.indexOf("\\scripts")) +
  "\\scripts\\.python\\LLM\\item_definition.py";
var argsStrTemplate = '--item "{item}" --lang "{lang}" --detail "{detail}"';
var reader = {
  getName: function (obj) {
    return obj.name;
  },
  getDesc: function (obj) {
    return obj.description;
  },
};

var writer = {
  decideWriteMode: function () {
    var mode = prompt(
      'Type "a" for append mode, or "r" for replace mode.',
      "a"
    );
    return mode;
  },
  replaceOldDesc: function (selObj, newContent) {
    // use pointer to manipulate external objects
    selObj.description = newContent.replace(/\\n/g, "\n");
    return;
  },
  appendOldDesc: function (selObj, newContent) {
    // use pointer to manipulate external objects
    selObj.description =
      selObj.description + "\n" + newContent.replace(/\\n/g, "\n");
    return;
  },
  updateDesc: function (selObj, content, mode) {
    while (mode != "a" && mode != "r") {
      mode = this.decideWriteMode();
    }
    if (mode == "a") {
      this.appendOldDesc(selObj, content);
    }
    if (mode == "r") {
      this.replaceOldDesc(selObj, content);
    }
    return;
  },
  addDisclaimer: function (content) {
    var header = "<AI generated>\n";
    var time = "Contents are appended at " + utils.getCurrentTime() + "\n";
    var warning =
      "!!!YOU ARE REQUIRED TO REVIEW THE RESULTS GENERATED BY AI!!!\n";
    var footer = "</AI generated>\n";
    return header + time + warning + content + "\n" + footer;
  },
};

function _main_curl() {
  // depreciated since Python is introduced
  var name = reader.getName(selection[0]);
  var desc = reader.getDesc(selection[0]);
  var promptContent =
    "Write a description for the " +
    name +
    ". Here are some useful information. " +
    desc +
    " Put the information together and ensure that the aritcle you write is comprehensive but easy to understand.";
  var gptJson = utils.gptJsonGenerator(
    prompts["messages0"],
    1,
    promptContent,
    sampleGptJson
  );
  var gpt = new GptConversation(gptJson);
  var content = writer.addDisclaimer(gpt.getContent());
  writer.updateDesc(selection[0], content, "a");
  return;
}

function main() {
  var name = reader.getName(selection[0]);
  var desc = reader.getDesc(selection[0]);
  var argsStr = argsStrTemplate
    .replace("{item}", name)
    .replace("{detail}", desc)
    .replace("{lang}", configs.lang);
  var rawContent = runPy(pySrcPath, configs.pyAppPath, argsStr);
  writer.updateDesc(selection[0], rawContent, "a");
  return;
}

main();
