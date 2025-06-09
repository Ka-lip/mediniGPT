//$EXPERIMENTAL$
load("../.lib/factory.js");
load("../.lib/finderEx.js");
load("../.lib/ui.js");
load("../.lib/helper.js");
load("../.lib/python.js");
load("../.lib/AI/utils.js");
load("../.lib/AI/configs.js");

var verbose = false;

// This variable is for offline debug
var _t =
  "```json\n" +
  "{\n" +
  '  "gate": "AND",\n' +
  '  "events": [\n' +
  '    "Electronic control unit failure",\n' +
  '    "Water ingress causing short circuit in speed sensor",\n' +
  '    "Loss of traction due to wet road conditions",\n' +
  '    "Communication breakdown between throttle control and braking system"\n' +
  "  ]\n" +
  "}\n" +
  "```";

var pySrcPath =
  __filedir.slice(0, __filedir.indexOf("\\scripts")) +
  "\\scripts\\.python\\LLM\\fta.py";
var argsStrTemplate =
  '--lang "{lang}" --event "{event}" --reasoning "{reasoning}"';

function createGate(kind, scope) {
  if (!scope) {
    scope = selection[0];
  }

  var gate = Factory.createElement(scope.model, Metamodel.FTA.LogicalGate);
  gate.kind = kind;
  Factory.createRelation(scope, gate, Metamodel.FTA.Connection);
  return gate;
}

function createFtaEvent(event, scope) {
  if (!scope) {
    scope = selection[0];
  }
  var e = Factory.createElement(scope.model, Metamodel.FTA.Event);
  e.name = event;
  e.id = AutoCounterSupport.createUniqueIDString(e, "id", "EXX");
  Factory.createRelation(scope, e.nodes[0], Metamodel.FTA.Connection);
}

function createFtaEvents(events, scope) {
  if (!scope) {
    scope = selection[0];
  }
  events.forEach(function (i) {
    createFtaEvent(i, scope);
  });
}

function getPrompt() {
  var t = inputText(
    "Prompt to LLM",
    "Please describe how to analyze this FTA event",
    "Only consider commercial vehicles"
  );
  return t;
}

function createFtaFromJson(ftaEventsJson) {
  var g = createGate(ftaEventsJson.gate);
  createFtaEvents(ftaEventsJson.events, g);
}

function main(event) {
  if (!event) {
    event = selection[0];
  }
  if (!(event instanceof Metamodel.FTA.EventNode)) {
    throw "Wrong selection object. Select an FTA event.";
  }
  var userPrompt = getPrompt();
  var eventName = event.name;
  var argsStr = argsStrTemplate
    .replace("{event}", eventName)
    .replace("{reasoning}", userPrompt)
    .replace("{lang}", configs.lang);
  var rawContent = runPy(pySrcPath, configs.pyAppPath, argsStr);
  if (verbose) {
    console.log(userPrompt);
    console.log(eventName);
    console.log(argsStr);
    console.log("{0}", rawContent);
  }
  createFtaFromJson(utils.text2json(rawContent));
  return;
}

main();
