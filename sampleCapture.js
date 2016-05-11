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