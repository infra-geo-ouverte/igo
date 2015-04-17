/*
phantomjs run-qunit.js http://geodev10.sso.msp.gouv.qc.ca/igo_navigateur/testUnit/
https://svn.jenkins-ci.org/trunk/hudson/dtkit/dtkit-format/dtkit-junit-model/src/main/resources/com/thalesgroup/dtkit/junit/model/xsd/junit-4.xsd
http://stackoverflow.com/questions/4922867/junit-xml-format-specification-that-hudson-supports
http://help.catchsoftware.com/display/ET/JUnit+Format
https://pzolee.blogs.balabit.com/2012/11/jenkins-vs-junit-xml-format/
*/



var system = require('system');

function showResult(errorMsg) {
    var failed;
    if(!errorMsg){
        try {
            var el = document.getElementById('qunit-testresult');
            failed = el.getElementsByClassName('failed')[0].innerHTML;
        } catch (e) { }
    }

    var nbTest = 1;
    var nbFailed = 0;
    if(!failed || failed !== '0'){
        nbTest = 0;
        nbFailed = 1;
    }
    console.log("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    console.log("<testsuite classname=\"Tests_qUnit_javascript_suite\" tests=\""+nbTest+"\" failures=\""+nbFailed+"\">");
    console.log("<testcase classname=\"Tests_qUnit_javascript\">");

    if(!failed){
    	if(!errorMsg){
    		errorMsg = "Echec du test";
    	}
    	console.log("<failure type=\"NotEnoughFoo\" message=\"testMessage\" propriete=\"" + errorMsg + "\"> test </failure>");
    	//console.log("<failure type=\"NotEnoughFoo\">Echec du test</failure>");
    } else if(failed !== '0'){
    	console.log("<failure type=\"NotEnoughFoo\" message=\"testMessage\" propriete=\"" + failed + " tests failed\"> tests </failure>");
    	//console.log("<failure type=\"NotEnoughFoo\">"+failed+" tests failed</failure>");
    }

    console.log("</testcase>");
    console.log("</testsuite>");
    return failed;
};

/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3001, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    showResult("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    //console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 100); //< repeat check every 250ms
};

if (system.args.length !== 2) {
    console.log('Usage: run-qunit.js URL');
    phantom.exit(1);
}

var page = require('webpage').create();

// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.open(system.args[1], function(status){
    if (status !== "success") {
        showResult("Unable to access network");
        phantom.exit(1);
    } else {
        waitFor(function(){
            return page.evaluate(function(){
                var el = document.getElementById('qunit-testresult');
                if (el && el.innerText.match('completed')) {
                    return true;
                }
                return false;
            });
        }, function(){
            var failedNum = page.evaluate(showResult);
            setTimeout(function(){
                phantom.exit((parseInt(failedNum, 10) > 0) ? 1 : 0);
            }, 0);
        });
    }
});
