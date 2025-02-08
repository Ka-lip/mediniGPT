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
/*
 * 
 * This script updates the diagnostic coverage values for SPF and LF Safety mechanisms in the selected DC Worksheet
 * The values will be taken from the Safety Mechanism Collection(s). A strategy may be applied for multiple assigned safety mechanisms.
 * Current implemented combination strategies are:
 * 		Minimum - smallest coverage value of all non-filtered and activated safety mechanisms
 * 		Maximum - largest coverage value of all non-filtered and activated safety mechanisms
 * 		OR Combined - combines all coverage values of all non-filtered and activated safety mechanisms using the OR-Probability calculation
 * 		Set to 0 - sets the dc value for failure modes with multiple non-filtered and activated safety mechanisms to zero
 * The script will check whether an property "activated" is defined for the Safety Mechanism and takes into account only the activated mechanisms.
 * The profile property activated shall have the values "YES" and "NO", the fault assumption is YES (in case no variable is defined or no value is given)
 * 
 */
load("~/.lib/ui.js");

// name of the activation indication property - adapt according to data model
// Note: Do not use "active" as that is already a system defined attribute
var NAME_VARIABLE = "user_activated_";

//
var strategy = -1;

/**
 * Returns <code>false</code> if the given element has a variable with name
 * NAME_VARIABLE and this variable has the value "NO".
 * 
 * @param element
 *            a system element
 */
function isActivated(element) {
	if (!element) {
		return true;
	}
	if (!element[NAME_VARIABLE]) {
		return true;
	}
	if (element[NAME_VARIABLE] == "NO") {
		return false;
	}
	return true;
}

function determine_coverage(sm_list, dc_kind) {
	if (!sm_list || (sm_list && sm_list.size() == 0)) {
		return 0;
	}
	var dc_Array = new Array();
	for (var i = 0; i < sm_list.size(); i++) {
		if (isActivated(sm_list.get(i))) {
			
			if (dc_kind == 0) {//SPF
				dc_Array.push(sm_list.get(i).spfPercentage);
			} else 
			if(dc_kind ==1 ){//LF
				dc_Array.push(sm_list.get(i).lfPercentage);
			} else 
			if(dc_kind ==2 ){//TSF
				dc_Array.push(sm_list.get(i).spfTransientPercentage);
			} else 
			if(dc_kind ==3 ){//TLF
				dc_Array.push(sm_list.get(i).lfTransientPercentage);
			}
		}
	}
	if (dc_Array.length == 0) {
		return 0;
	}
	if (dc_Array.length ==1){
		return dc_Array[0];
	}
	if (dc_Array.length > 1) {
		dc_Array.sort(function(a, b) {
			return b - a;
		});
	};
	if (strategy == 0) { // MAX
		return dc_Array[0];
	} else if (strategy == 1) { // MIN
		return dc_Array[dc_Array.length - 1];
	} else if (strategy == 2) { // OR Combine
		return andCombine(dc_Array);
	}
	else return 0; //Set-to-0
}
function andCombine(theArray) {
	if (theArray.length == 1) {
		return theArray[0];
	}
	var result = 1;
	for (var i = 0; i < theArray.length; i++) {
		result = result * (1 - theArray[i] * 0.01);
	}
	return 100 * (1 - result);
}
/**
 * Main entry point of the script.
 */
function main() {
	// check the selection - this script must be run on a DC Worksheet
	var scope = finder;
	if (!selection || (selection && selection.length > 1)
			|| selection[0].prototype != Metamodel.dc.DCWorksheet) {
		alert("Please select a single DC Worksheet");
		return;
	}
	if (selection[0].mediniGetContainer() != undefined) {
		alert("No or invalid selection - please select a single DC Worksheet");
		return;
	}
	if (selection && selection.length == 1) {
		scope = Global.getFinder(selection[0]);
	}
	strategy = selectOption(
			"Strategy for the combination of multiple assigned safety mechanisms",
			"Please select a strategy", [ "Maximum", "Minimum", "OR-Combined",
					"Set to 0" ]);
	if (strategy < 0 || strategy > 3) {
		alert("No or invalid strategy selected");
		return;
	}
	var failureModes = scope.findByType(Metamodel.dc.DCFailureModeEntry, true).asList();
	if (!failureModes || !failureModes.size()) {
		alert("There are no failure modes in the worksheet");
		return;
	}

	progressMonitor.beginTask("Updating Diagnostic Coverage values",failureModes.size());

	for (var i = 0; i < failureModes.size(); i++) {
		var fm = failureModes.get(i);
		var spf_sm = fm.allSpfSafetyMechanismsApplicable ? fm.element.spfSafetyMechanisms
				: fm.spfSafetyMechanisms;
		var lf_sm = fm.allLmpfSafetyMechanismsApplicable ? fm.element.mpfSafetyMechanisms
				: fm.lmpfSafetyMechanisms;
		if(!fm.transient){
			fm.spfCoverage = java.math.BigDecimal(determine_coverage(spf_sm, 0));
			fm.lmpfCoverage = java.math.BigDecimal(determine_coverage(lf_sm, 1));
		}
		else {
			fm.spfCoverage = java.math.BigDecimal(determine_coverage(spf_sm, 2));
			fm.lmpfCoverage = java.math.BigDecimal(determine_coverage(lf_sm, 3));
		}
		progressMonitor.worked(1);
	};
	progressMonitor.done();
	return;
}

main();