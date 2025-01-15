load("../helper.js");
load("./config.js");

var utils = {
    getEnvVar: function (var_name){
        return performCommand(["cmd", "/C", "echo", "%" + var_name + "%"]).join("\n");
    },
    
    getGPTanswer: function (promptJsonObj){
        var outJsonStr = performCommand(["curl", "-X", "POST", this._getEnvVar("GPT_endpoint"), 
                                                 "-H", "Content-Type: application/json", 
                                                 "-H", "api-key:"+ this._getEnvVar("GPT_API"), 
                                                 "-d", this._json2str(promptJsonObj)]);
        return outJsonStr;
    },
    
    prettifyGPTanswer: function (jsonStr){
        return JSON.parse(jsonStr).choices[0].message.content;
    },
    
    json2str: function (jsonObj){
        return JSON.stringify(jsonObj).replace(/"/g,'\\"');
    },
    
    getCurrentTime: function(){
        var timestamp = Date.now();
        var date      = new Date(timestamp);
        return date.toJSON(); //E.g. 2025-01-14T06:15:43.626Z
    }

};

function gptClass(inJsonObj){
    this.inJsonObj      = inJsonObj;
    this.createdDate    = utils.getCurrentTime();
    this.outJsonStr     = utils.getGPTanswer(inJsonObj);
    this.outJsonObj     = JSON.parse(this.outJsonStr);
    this.content        = utils.prettifyGPTanswer(this.outJsonStr);
    
    this.getContent     = function(){return this.content;};
    this.getCreatedDate = function(){return this.createdDate;};
    this.getInJsonObj   = function(){return this.inJsonObj;};
    this.getOutJsonObj  = function(){return this.outJsonObj;};
}