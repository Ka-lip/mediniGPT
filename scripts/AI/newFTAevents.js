// $EXPERIMENTAL$ $STRICT_MODE$ $ENHANCED_CONTAINMENT_ACCESS$ $DEBUG$ $ENHANCED_JAVA_ACCESS$
load("../.lib/factory.js");
load("../.lib/helper.js");
load("../.lib/python.js");

var python_path = "C:\\Users\\kchu\\OfflineDocuments\\gitRepositories\\mediniGPT\\python\\venv\\Scripts\\python.exe";
var s =  "C:\\Users\\kchu\\OfflineDocuments\\gitRepositories\\mediniGPT\\scripts\\.python\\test2.py";

// var a = new Py(s, python_path);
var a = runPy("print(4*3)", python_path);
