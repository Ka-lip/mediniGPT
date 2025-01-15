/* 
* © 2021 ANSYS Inc.
*
* THE NON STANDARD SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE NON STANDARD SOFTWARE OR THE USE OR OTHER DEALINGS 
* IN THE NON STANDARD SOFTWARE.
*
*/

// disclaimer
alert("This script will renumber all functions found in the whole project. Use undo if you are not satisfied with the result. Note that the script is provided AS-IS and without any warranty.");

// get all events of the project but skip top level events
var events = finder.findByType(Metamodel.sysml.SysMLActivity, true).asList();
console.log("Found {0} Functions in the project to renumber", events.size());

// rearrange to native array so we can use nice Java Script methods
var eventArray = new Array();
for (var i = 0; i < events.size(); i++) {
	eventArray.push(events.get(i));
}

// now sort them based on the existing ID
eventArray.sort(function(e1, e2) {
	return parseInt(e1.id.substring(1)) - parseInt(e2.id.substring(1));
});

// now give them a new unique ID
for (var j = 0; j<eventArray.length; j++) {
	eventArray[j].id = ("F-" + (j+1));
}

console.log("Done");
