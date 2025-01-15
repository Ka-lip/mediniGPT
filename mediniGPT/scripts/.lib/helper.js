/* 
 * Copyright (c) 2015-2020 Ansys Inc.
 * All rights reserved.
 * 
 * The script is provided "as is" without warranty of any kind. 
 * ANSYS medini Technologies AG disclaims all warranties, either express or implied, 
 * including the warranties of merchantability and fitness for a particular purpose.
 * 
 * v2022-05-03 - JM Added performCommand
 * v2020-04-06 - JM Added unshift helper
 * v2018-04-16 - JM Added getModelRoot
 * v2018-02-21 - JM Added getQualifiedName
 * v2016-06-21 - JM Marked some methods deprecated
 * v2015-07-22 - JM Initial version
 */

/**
 * Basic dump function to see element type and its attributes and operations on the console.
 * 
 * @param {Object} element
 *            any object
 */
function dump(element) {
	console.log("Dumping element of type ''{0}'' (prototype={1})", typeof element, element.prototype);
	for ( var i in element) {
		console.log("{0} : {1}", i, typeof element[i]);
	}
}

/**
 * Checks on a given object whether it is a Java list object or not.
 * 
 * @param {Object} object
 *            any object
 * @returns <code>true</code> if it is most likely a java.util.List object,
 *          <code>false</code> otherwise
 * @deprecated due to weak implementation without replacement
 */
function isList(object) {
	try {
		// lists have methods as get() and size()
		return object && object.get && object.size;
	}
	catch (e) {
		// no chance to access a non existing function without an exception in Rhino
		return false;
	}
}

/**
 * Performs the given function for each element of the given list until all
 * elements have been processed or the function throws an exception.
 * 
 * @param {List} list
 *            list of objects
 * @param {function} f
 *            the function to call
 * @deprecated due to weak implementation, better convert lists to arrays and
 *             use native forEach
 */
function foreach(list, f) {
	for (var i = 0; i < list.size(); i++) {
		var element = list.get(i);
		f.call(this, element);
	}
}

/**
 * Returns the qualified name for any {@link ENamedElement}, separated by <code>delimited</code>, or
 * <code>undefined</code> if element is null or undefined.
 *
 * @param {EObject} element any model object
 * @param {String} delimiter the delimiter to use (e.g. ":" or ","
 * @return {String} qualified name
 */
function getQualifiedName(element, delimiter) {
	// element is undefined -> bail out
	if (element == undefined) {
		return undefined;
	}
	// element has no name attribute -> bail out
	if (!"name" in element) {
		return undefined;
	}
	if (delimiter == undefined) {
		delimiter = ".";
	}
	
	var qualifiedName = "";
	qualifiedName += (element.name ? element.name : "(no name)");
	
	// do not use recursion but iterate up to the uppermost parent
	var namedElement = element;
	while (namedElement != null) {
		var container = namedElement.mediniGetContainer();
		// special case: jump over the proxy barrier
		if (!container && !namedElement.mediniGetOpposites("originalModel").isEmpty()) {
			var proxy = namedElement.mediniGetOpposites("originalModel").get(0);
			container = proxy.mediniGetContainer();
		}
		if (container && "name" in container) {
			namedElement = container;
			qualifiedName = delimiter + qualifiedName;
			qualifiedName = (namedElement.name ? namedElement.name
					: "(no name)")
					+ qualifiedName;
		} else {
			namedElement = null;
		}
	}

	return qualifiedName;
}

/**
 * Returns the model root for any {@link MediniObject}, or
 * <code>undefined</code> if element is null or undefined.
 * 
 * @param {EObject} element the model element
 * @return {EObject} the root object or <code>undefined</code>
 */
function getModelRoot(element) {
	// element is undefined -> bail out
	if (element == undefined) {
		return undefined;
	}

	var container = element.mediniGetContainer();
	while (container.mediniGetContainer()) {
		container = container.mediniGetContainer();
	}

	return container;
}

/**
 * Unfortunately Rhino does not offer "unshift" on native Java arrays but only
 * on JS arrays. We implement "unshift" by creating a copy of a given array and
 * injecting the given element at the beginning.
 * 
 * @param array {Array}
 * @param element {Object}
 * @returns {Array}
 */
function unshift(array, element) {
	var copy = [];
	copy.push(element);
	array.forEach(function (o) {
		copy.push(o);
	});
	return copy;
}

/**
 * @param cmd {Array} an array of command line arguments
 * @param max {Number} maximum number of lines to read from the process output (default is 1000)
 * @returns {Array} an array of output lines, never undefined or null
 */
function performCommand(cmd, max) {
	var rt = java.lang.Runtime.getRuntime();
	var process = rt.exec(cmd);
	var lines = [];
	if (max == undefined) {
		// read max 1000 lines
		max = 1000;
	}
	
	// capture output via INPUT STREAM!
	var input = process.getInputStream();
	// default charset is most likely appropriate here
	var inr = new java.io.BufferedReader(new java.io.InputStreamReader(input));
	var line = inr.readLine();
	while (line != null && lines.length < max) {
	    lines.push(line);
	    line = inr.readLine();
	}
	
	// TODO Not reading all lines from the process may block it
	var exitValue = process.waitFor();
	console.log("Process exited with {0}", exitValue);
	console.log("Output: {0}", lines.join('\n'));
	return lines;
}