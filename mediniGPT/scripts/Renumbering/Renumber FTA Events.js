//$EXPERIMENTAL$  $ENHANCED_CONTAINMENT_ACCESS$
/* 
 * © 2021 ANSYS Inc.
 *
 * THE NON STANDARD SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE NON STANDARD SOFTWARE OR THE USE OR OTHER DEALINGS 
 * IN THE NON STANDARD SOFTWARE.
 *
 */

//Rename FTA events within a selected Fault Tree
load("~/.lib/ui.js");
alert("This script will renumber all events found in the selected FTA. Use undo if you are not satisfied with the result. Note that the script is provided AS-IS and without any warranty.");
//lets check the selection first - it must be a single FTA model
if (!selection || selection.length != 1
		|| selection[0].prototype != Metamodel.FTA.FTAModel) {
	// TODO: Check whether selection is a SysML model
	throw "No or invalid selection - please select a single FTA model";
}
if (selection[0].mediniGetContainer() != undefined) {
	throw "No or invalid selection - please select a single FTA model";
}
var PREFIX ="";
PREFIX = inputText("Event Prefix", "Please enter a prefix that shall be used for all events of this FTA model\nIf no prefix is given, all events will get a generic new unique ID", "E")
//find all parts in the model
var events = Global.getFinder(selection[0]).findByType(
		Metamodel.FTA.Event, false).asList();
if (events.isEmpty()) {
	throw "The model contains no events";
}

//rearrange to native array so we can use nice Java Script methods
var eventArray = new Array();
for (var i = 0; i < events.size(); i++) {
	eventArray.push(events.get(i));
};
//now sort them based on the existing ID
eventArray.sort(function(e1, e2) {
	return parseInt(e1.id.substring(1)) - parseInt(e2.id.substring(1));
});

// now give them a new unique ID
for (var j = 0; j<eventArray.length; j++) {
	eventArray[j].id = (PREFIX+"-" + (j+1));
}


console.log("Done");
