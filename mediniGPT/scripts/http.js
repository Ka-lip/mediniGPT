var curl = load(".lib/curl.js");
load("api.js");
/**
 * Main script to test the library.
 */
function main() {
	var j = {"messages": [{"role": "user", 
	                       "content": "Write a description for ESL (electrical steering lock) for functional safety anslysis."}], 
	         "max_tokens": 100};
	var exit = curl.POST(endpoint, JSON.stringify(j).replace(/"/g,'\\"'), "Content-Type: application/json", api_header);
	console.log("Completed with {0}", exit);
}

// using a main function has the advantage to use "return"
main();