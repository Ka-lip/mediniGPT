//$EXPERIMENTAL$  $ENHANCED_CONTAINMENT_ACCESS$
/* 
* © 2022 ANSYS Inc.
*
* THE NON STANDARD SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE NON STANDARD SOFTWARE OR THE USE OR OTHER DEALINGS 
* IN THE NON STANDARD SOFTWARE.
*
*/
/* 
 * This script expects a  SysML model (i.e. with HW parts as a result of import/update from Excel)
 * The elements of the model have an annotation indicating the package or path to the package to which they belong (by default stored in a user defined property 'user_circuit_block' )
 * The script will create appropriate containers or a full heirarchy and will move all elements to the containers they belong to.
 * Organizing the model to folders instead of container components is availabel on user demand
 */
load("~/.lib/finderEx.js");
load("~/.lib/factory.js");
load("~/.lib/ui.js");


//name of the container or container path for the element - adapt according to data model
var NAME_VARIABLE = "user_circuit_block";
//separator for full path names - adapt according to data model 
var SEPARATOR = "/";

//log a lot of verbose messages to the console
var verbose = false;

//marker that console may contain important information
var reviewConsole = true;

//indicate whether packages or components shall be used for the structure
var usePackages = true;

/**
 * Returns <code>true</code> if the given element has a variable with name
 * NAME_VARIABLE and this variable has a value.
 * 
 * @param element
 *            a system element
 */
function hasVariableSet(element) {
	if (!element) {
		return false;
	}
	if (!element[NAME_VARIABLE])  {
		return false;
	}
	if (element[NAME_VARIABLE]==""){
		return false;
	}
	return true;
}

/**
 * Arrange the given element, i.e. move it to a container that is addressed by its
 * HW block.
 * 
 * @param element
 *            the element to move
 * @param scope
 *            the selected model
 */
function arrange(element, theContainer) {
	element.the_owner = theContainer;
	if(!element.typeCode || element.typeCode =="")
		element.typeCode = "Hardware Part"
}

/**
 * Main entry point of the script.
 */
function main() {
	var selected = selectOption(
			"Restructure HW Architecture",
			"This script will create a structure for the selected hardware model and move all parts into the appropriate containers.\n\n"
			+ 	"It expects the container name of a part to be stored in the property " + NAME_VARIABLE +" with \"" +SEPARATOR+ "\" as separator in case of a full path names."
			+   "\n\nPlease select whether folders or components hall be used as container.", 
			[ "Component", "Folder", "Cancel" ]);
	if (selected == 2) {
		alert("No changes have been made.");
		return;
	}
	usePackages = (selected == 1);
	// check the selection - this script must be run on a single SysML model
	var scope = finder;
	if (!selection || (selection && selection.length > 1)
			|| selection[0].prototype != Metamodel.sysml.SysMLContainerPackage) {
		alert( "Please select a single system model"); return;
	}
//  un-comment the next two lines in case the usage of the script shall be restricted to a full architecture model only	
//	if (selection[0].mediniGetContainer() != undefined) {
//		alert(  "No or invalid selection - please select a single system model"); return;
//	}
	if (selection && selection.length == 1) {
		scope = Global.getFinder(selection[0]);
		if (verbose) {
			console.log("Scope changed to selected element");
		}
	}
	var children = scope.findByType(Metamodel.sysml.SysMLPart, true).filter(
			hasVariableSet).asArray();
	if (verbose) {
		console.log("{0} parts with target folder name found", children.length);
	}
	if (!children || !children.length) {
		alert(  "There are no elements with appropriate circuit block information in the selected scope"); return;
	}
	//
	progressMonitor.beginTask("Re-arranging elements", children.length); 
	// Collect all circuit block names and sort elements accordingly
	children.sort(function(a, b){
		var x = a[NAME_VARIABLE];
		var y = b[NAME_VARIABLE];
		if (x < y) { return -1;}
		if (x > y) {return 1; }
		return 0;
	}); 
	for (var i = 0; i < children.length; i++) {
		var c = children[i];
		if (verbose) {
			console.log("Sorting entry #{0} {1}", i, c.name);
			console.log("Package {0}", c[NAME_VARIABLE]);
		};
		var split_names = c[NAME_VARIABLE].split(SEPARATOR);
		var target = selection[0];
		for(var j  in split_names){	
			if(split_names[j]!="" ){			
				if (usePackages){
					target = findOrCreateContainerPackage (target, split_names[j]);
				}
				else{
					target = findOrCreatePart(target,split_names[j]);
					target.typeCode = "Component";				
				}
			}
		}
		if (verbose) {
			console.log("Moving {0} to {1}", c.name, c[NAME_VARIABLE]);
		};
		arrange(c, target);
		progressMonitor.worked(1); 
	}
	var message = "The script run without critical problems.";
	if (reviewConsole) {
		message += " Note: However, a few details have been logged to the console. You may check the script console for more information.";
	}
	alert( message);
	progressMonitor.done();
	return
}

main();