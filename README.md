apigee-cli-trace
===================
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/504be22d91f04164a421851b1d9f8c91)](https://www.codacy.com/app/dallen/apigee-cli-trace?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=apigeecs/apigee-cli-trace&amp;utm_campaign=Badge_Grade)

A utility providing a means of easily capturing trace messages for offline analysis from the command line.

## Installation

The only prerequisites not handled during the installation are a functional Node environment, the availability of npm, and sufficient priviledges to run commands as adminstrator. The steps below are applicable to a Mac OS X environment, similar steps work under Linux or Windows. 
	
Clone the apigee-cli-trace repository to your local machine:

	ApigeeCorporation$ git clone https://github.com/apigeecs/apigee-cli-trace.git

Alternatively you can download the zip file via the GitHub home page and unzip the archive.

Navigate to the package directory:

	ApigeeCorporation$ cd path/to/apigee-cli-trace/package/

Install globally:

	ApigeeCorporation$ sudo npm install . -g

## Usage

	var trace = require("./package/apigee-cli-trace");

	trace.capture({
	    debug: true,
	    org: "davidwallen2014",
	    env: "prod",
	    api: "24Solver",
	    rev: "19",
	    auth: "Basic encodeduserandsecret",
	    saveTo: "./capturedTraceFiles"
	});

Execute the following:
	ApigeeCorporation$ node ./capture.js

Where capture.js is a script as outlined above. Note the script runs until cancelled.

Output includes a information summarizing captured trace messages:

Note that the utility captures a subset of traffic - it is not capable of nor intended to capture all traffic in a given run. Consider it as sampling as much as 90% or as low as 60% of traffic depending on the speed of your local machine, local network, and rate of traffic in the target proxy.

## Tests

  none yet


## Security Thoughts

Storing your hased credentials in the configuration file is not optimal. Alternatively, you can create environment variables that will be used if you omit the auth in the configuration. Define Apigee_User and Apigee_Secret to utilize this feature.

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.1.0 Initial release
