apigee-cli-trace
===================
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/504be22d91f04164a421851b1d9f8c91)](https://www.codacy.com/app/dallen/apigee-cli-trace?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=apigeecs/apigee-cli-trace&amp;utm_campaign=Badge_Grade)

A utility providing a means of easily capturing trace messages for offline analysis from the command line.

## Installation

npm install apigee-coverage

## Usage
```
	apigee-coverage -o askanapigeek -e test -a No-Target -r 4
	Set Apigee_User and Apigee_Secret to utilize this feature as your environment variables

```
## Tests

  none yet


## Security Thoughts

Storing your hased credentials in the configuration file is not optimal. Alternatively, you can create environment variables that will be used if you omit the auth in the configuration. Define Apigee_User and Apigee_Secret to utilize this feature.

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.1.0 Initial release
