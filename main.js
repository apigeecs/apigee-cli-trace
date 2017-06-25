#!/usr/bin/env node
var trace = require("./lib/apigee-cli-trace"),
 program = require('commander');

program
  .usage('<options>')
  .version('0.1.0')
  .option('-o --org <orgname>','organization name')
  .option('-e --env <envname>','environment name')
  .option('-a --api <apiname>','Apiproxy name')
  .option('-r --revision <revision>','Proxy revision number')

  program.on('--help', function(){
    console.log("example");
    console.log('');
    console.log('apigee-coverage -o askanapigeek -e test -a No-Target -r 4');
    console.log('');
  });

program.parse(process.argv);

var config = {};
config.org = program.org;
config.env = program.env;
config.api = program.api;
config.rev = program.revision;
config.saveTo = "./capturedTraceFiles";


if (!process.argv.slice(2).length) {
  program.outputHelp();
}
  else {
  trace.capture(config);
}
