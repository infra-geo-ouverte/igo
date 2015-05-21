/*
phantomjs run-qunit.js http://geodev10.sso.msp.gouv.qc.ca/igo_navigateur/testUnit/
https://svn.jenkins-ci.org/trunk/hudson/dtkit/dtkit-format/dtkit-junit-model/src/main/resources/com/thalesgroup/dtkit/junit/model/xsd/junit-4.xsd
http://stackoverflow.com/questions/4922867/junit-xml-format-specification-that-hudson-supports
http://help.catchsoftware.com/display/ET/JUnit+Format
https://pzolee.blogs.balabit.com/2012/11/jenkins-vs-junit-xml-format/
*/



var system = require('system');

function showResult(errorMsg) {
    var el, failed, passed, total;
    if(!errorMsg){
        try {
            var elResume = document.getElementById('qunit-testresult');
            failed = elResume.getElementsByClassName('failed')[0].innerHTML;
            passed = elResume.getElementsByClassName('passed')[0].innerHTML;
            total = elResume.getElementsByClassName('total')[0].innerHTML;
            
            el = document.getElementById('qunit-tests').children;
        } catch (e) { }
    }

    console.log("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    console.log("<testsuite name=\"Tests_qUnit_javascript.tousLesModules\" tests=\""+total+"\" failures=\""+failed+"\">");
    
    
    for (var i = 0; i < el.length; i++) {
        var testEl = el[i];
        
        var moduleName = testEl.getElementsByClassName("module-name")[0].innerHTML;
        var testName = testEl.getElementsByClassName("test-name")[0].innerHTML;
        
        console.log("<testcase name=\""+moduleName+"."+testName+"\">");

        if(testEl.className !== "pass"){
            //todo: mettre le type de failure
            console.log("<failure type=\"error\" message=\"Test failed\"> Échec - TODO: indiquer la cause </failure>");
        }

        console.log("</testcase>");
    }
    
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
