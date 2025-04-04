// load("../helper.js");
// load("./configs.js");

var utils = {
  getEnvVar: function (var_name) {
    return java.lang.System.getenv(var_name);
  },

  getGPTanswer: function (promptJsonObj) {
    var outJsonStr = performCommand([
      "curl",
      "-X",
      "POST",
      this.getSecret().endpoint,
      "-H",
      "Content-Type: application/json",
      "-H",
      "api-key:" + this.getSecret().apiKey,
      "-d",
      this.json2str(promptJsonObj),
    ]);
    console.log(outJsonStr);
    return outJsonStr;
  },

  prettifyGPTanswer: function (jsonStr) {
    if (
      !JSON.parse(jsonStr).choices ||
      !JSON.parse(jsonStr).choices[0] ||
      !JSON.parse(jsonStr).choices[0].message ||
      !JSON.parse(jsonStr).choices[0].message.content
    ) {
      throw (
        "Wrong json string. Check the return json string from the LLM sever.\n The json string are required to have choices[0].message.content.\nThe current string is: \n" +
        JSON.parse(jsonStr)
      );
    }
    return JSON.parse(jsonStr).choices[0].message.content;
  },

  json2str: function (jsonObj) {
    return JSON.stringify(jsonObj).replace(/"/g, '\\"');
  },

  getCurrentTime: function () {
    var timestamp = Date.now();
    var date = new Date(timestamp);
    return date.toJSON(); //E.g. 2025-01-14T06:15:43.626Z
  },
  getSecret: function () {
    var apiKey, endpoint;
    if (configs.apiAccessMethod == "c") {
      apiKey = configs.apiKey;
      endpoint = configs.endpoint;
    }
    if (configs.apiAccessMethod == "e") {
      apiKey = this.getEnvVar(configs.apiKey);
      endpoint = this.getEnvVar(configs.endpoint);
    }
    return { apiKey: apiKey, endpoint: endpoint };
  },

  handleNonASCII: function () {
    //TODO
    return "";
  },
  gptJsonGenerator: function (samplePrompt, seq, content, sampleGptJson) {
    var gptPrompt = samplePrompt;
    gptPrompt[seq]["content"] = content;

    var gptJson = sampleGptJson;
    gptJson["messages"] = gptPrompt;

    return gptJson;
  },

  text2json: function (text) {
    var t = text.replace(/```json/g, "");
    t = t.replace(/```/g, "");
    j = JSON.parse(t);
    return j;
  },
};

function GptConversation(inJsonObj) {
  if (!inJsonObj) {
    throw "Wrong arguments of GptConversation";
  }

  this.inJsonObj = inJsonObj;
  this.createdDate = utils.getCurrentTime();
  this.outJsonStr = utils.getGPTanswer(inJsonObj);
  this.content = utils.prettifyGPTanswer(this.outJsonStr);

  this.getContent = function (dataType) {
    if (dataType == undefined || dataType == "text") {
      return this.content;
    }
    if (dataType == "json") {
      return utils.text2json(this.content);
    }
  };
  this.getCreatedDate = function () {
    return this.createdDate;
  };
  this.getInJsonObj = function () {
    return this.inJsonObj;
  };
  this.getOutJsonObj = function () {
    return JSON.parse(this.outJsonStr);
  };
}
