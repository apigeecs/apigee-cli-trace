// packages
var path = require("path"),
    fs = require("fs"),
    Stream = require("stream"),
    https = require("https"),
    traceResponse = {
        "traceFiles": [],
        "curTraceFile": {}
    },
    traceMessages = {},
    config;

function print(msg) {
    try {
        if (msg && (typeof msg === "object")) {
            console.log(JSON.stringify(msg));
        } else {
            console.log(msg);
        }
    } catch (error) {
        console.log(error);
    }
}

function debugPrint(msg) {
    if (config.debug) {
        print(msg);
    }
}

function getStackTrace(e) {
    return e.stack.replace(/^[^\(]+?[\n$]/gm, "")
        .replace(/^\s+at\s+/gm, "")
        .replace(/^Object.<anonymous>\s*\(/gm, "{anonymous}()@")
        .split("\n");
}

function mkdirSync(path) {
    try {
        fs.existsSync(path) || fs.mkdirSync(path);
    } catch (e) {
        if (e.code !== "EEXIST") {
            throw e;
        }
    }
}

function mkdirpSync(dirpath) {
    var parts = dirpath.split(path.sep);
    for (var i = 1; i <= parts.length; i++) {
        mkdirSync(path.join.apply(null, parts.slice(0, i)));
    }
}

function writeTraceFile(id, data) {
    //file exists? If not create
    //append to it
    if (config.saveTo) {
        fs.existsSync(config.saveTo) || mkdirpSync(config.saveTo);
        fs.writeFile(config.saveTo + "/" + id + ".xml", data, function(err) {
            if (err) { console.error(err); }
        });
    }
}

function processTraceTransaction(trans) {
    var data = "",
        id = trans.id;

    var options = {
        host: "api.enterprise.apigee.com",
        port: 443,
        path: "/v1/organizations/" + config.org + "/environments/" + config.env + "/apis/" + config.api + "/revisions/" + config.rev + "/debugsessions/" + config.debugSessionId + "/data/" + id,
        method: "GET",
        headers: {
            Accept: "application/xml",
            Authorization: config.auth
        }
    };

    var req = https.request(options, function(res) {
        res.on("data", function(d) {
            data += d;
        });
        res.on("end", function() {
            if (data.indexOf("<Completed>true</Completed>") > -1) {
                writeTraceFile(id, data);
            } else {
                debugPrint("ignoring " + JSON.stringify(trans) + " will retry later.");
                trans.inProcess = false;
            }
        });
    });

    req.on("error", function(e) {
        print("error in the https call");
        console.error(e);
        trans.processed = false;
    });
    req.end();

}

function uuid() {
    var d = new Date().getTime();
    var theUuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return theUuid;
}

function isJson(blob) {
    return (/^[\],:{}\s]*$/.test(blob.replace(/\\["\\\/bfnrtu]/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, "")));
}

function processDebugSession() {
    var options = {
        host: "api.enterprise.apigee.com",
        port: 443,
        path: "/v1/organizations/" + config.org + "/environments/" + config.env + "/apis/" + config.api + "/revisions/" + config.rev + "/debugsessions?session=" + config.debugSessionId,
        method: "POST",
        headers: {
            //Accept: "application/json",
            Authorization: config.auth,
            "Content-Type": "application/x-www-url-form-encoded"
        }
    };

    var req = https.request(options, function(res) {
        res.setEncoding("utf8");
        if (res.statusCode >= 300) {
            console.error(res.statusCode + ": " + res.statusMessage + " with " + JSON.stringify(options));
        }
        res.on("data", function(d) {
            d = JSON.parse(d);
            config.debugSessionId = d.name;
            config.debugStart = new Date();
            //now we want to call the retrieval loop
            processTraceTransactions();
        });
    });

    req.on("error", function(e) {
        console.error(e);
        console.error("error in creating a debug session with " + JSON.stringify(options));
    });
    req.end();
}

function processTraceMessages() {
    for (var id in traceMessages) {
        if ({}.hasOwnProperty.call(traceMessages, id)) {
            if (!traceMessages[id].processed && !traceMessages[id].inProcess) {
                traceMessages[id].inProcess = true;
                processTraceTransaction(traceMessages[id]);

            }
        }
    }
}

function processTransactionPayload(str) {
    var d = JSON.parse(str);
    /*"{
            "code" : "distribution.DebugSessionNotFound",
            "message" : "DebugSession bdbfa0a5-3dc3-4971-edfb-25a277f5d7bd not found",
            "contexts" : [ ]
    }"*/

    if (d.code === "distribution.DebugSessionNotFound" || d.length >= 20 || ((new Date() - config.debugStart) > 10 * 60 * 1000)) {
        config.debugSessionId = uuid();
        processDebugSession();
    } else {
        for (var i = d.length; i-- > 0;) {
            traceMessages[d[i]] = traceMessages[d[i]] || {
                id: d[i],
                processed: false,
                inProcess: false
            };
        }
        processTraceMessages();
        processTraceTransactions();
    }
}

function processTraceTransactions() {
    var options = {
            host: "api.enterprise.apigee.com",
            port: 443,
            path: "/v1/organizations/" + config.org + "/environments/" + config.env + "/apis/" + config.api + "/revisions/" + config.rev + "/debugsessions/" + config.debugSessionId + "/data",
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: config.auth
            }
        },
        data = "";

    var req = https.request(options, function(res) {
        res.setEncoding("utf8");
        res.on("data", function(d) {
            data += d;
        });
        res.on("end", function() {
            if (isJson(data)) {
                processTransactionPayload(data);
            } else {
                print("error in the the response - JSON not found");
                print(data);
            }
        });
    });

    req.setTimeout(30000, function() {
        //when timeout, this callback will be called
    });

    req.on("error", function(e) {
        print("error in the https call");
        console.error(e);
    });
    req.end();
}

function buildAuth() {
    var user = process.env.Apigee_User,
        secret = process.env.Apigee_Secret;
    if (!user || !secret) {
        var errMsg = "no authorization provided and no env variable(s) for Apigee_User and/or Apigee_Secret";
        print(errMsg);
        print(process.env);
        throw new Error(errMsg);
    }
    return ("Basic " + (new Buffer(user + ":" + secret)).toString("base64"));
}

var capture = function(aConfig) {
    config = aConfig;
    try {
        debugPrint("loading live trace data");
        config.debugSessionId = config.debugSessionId || uuid();
        config.auth = config.auth || buildAuth();
        processDebugSession();
    } catch (e) {
        var stack = getStackTrace(e);
        print("error:");
        print(e);
        print(stack);
    }
};

module.exports = {
    capture
};
