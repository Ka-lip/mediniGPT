/* 
 * Copyright (c) 2022 ANSYS Inc.
 * All rights reserved.
 * 
 * THE NON STANDARD SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
 * EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE NON STANDARD
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE NON STANDARD SOFTWARE.
 * 
 * ABOUT: Library to easily execute cURL commands
 * 
 * v2022-09-09 - JM initial version
 */

({
	// read max 1000 lines
	max : 1000,

	/**
	 * @param {String}
	 *            target
	 * @param {String}
	 *            file
	 */
	GET : function (target, file) {
		if (!target || !file) {
			throw "wrong arguments";
		}
		var cmd = [ __filedir + "\\.lib\\curl.exe", target, "--output", file ];
		console.log("curl: Executing ''{0}''", cmd.join(' '));
		var rt = java.lang.Runtime.getRuntime();
		var process = rt.exec(cmd);

		// capture output
		var output = this._captureProcessOutput(process);

		// TODO Not reading all lines from the process may block it
		var exitValue = process.waitFor();
		console.log("curl: Process exited with {0}", exitValue);
		console.log("curl: Output is {0}", output.join('\n'));

		return exitValue;
	},

	/**
	 * @param prefix
	 *            The prefix string to be used in generating the file's name;
	 *            must be at least three characters long
	 * 
	 * @param suffix
	 *            The suffix string to be used in generating the file's name;
	 *            may be <code>null</code>, in which case the suffix
	 *            <code>".tmp"</code> will be used
	 */
	newTemp : function (prefix, suffix) {
		return java.io.File.createTempFile(prefix, suffix).getAbsolutePath();
	},
	
	/*
	 * Internal function to capture process output.
	 */
	_captureProcessOutput : function (process) {
		var lines = [];
		// capture output via INPUT STREAM!
		var input = process.getInputStream();
		// default charset is most likely appropriate here
		var inr = new java.io.BufferedReader(new java.io.InputStreamReader(
				input));
		var line = inr.readLine();
		while (line != null && lines.length < this.max) {
			lines.push(line);
			line = inr.readLine();
		}

		if (!lines.length) {
			lines.push("<nothing>");
		}

		return lines;
	},
	POST: function(target, data, header1, header2) {
		var cmd = [__filedir + "\\.lib\\curl.exe", "-X", "POST", target, "-H", header1, "-H", header2, "-d", data];

		console.log("curl: Executing '{0}'", cmd.join(' '));
		var rt = java.lang.Runtime.getRuntime();
		var process = rt.exec(cmd);

		// capture output
		var output = this._captureProcessOutput(process);

		// TODO Not reading all lines from the process may block it
		var exitValue = process.waitFor();
		console.log("curl: Process exited with {0}", exitValue);
		console.log("curl: Output is {0}", output.join('\n'));

		return exitValue;
	},
});