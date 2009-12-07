/**
 * Visual logger for the YUI3 tests used to implement the unit tests.
 * Provides a better visual representation than the YUI Console.
 *
 * @author <a href="mailto:fiann.ohagan@jshub.org">Fiann O'Hagan</a>
 */
// Y is a YUI instance declared in the layout for the tests
// suite contains the suite of tests for the page
/*global Y, suite */

(function() {

  // TODO wrap window.console properly to stop x-browser errors
  if (window.console && window.console.info) {
    window.console.info("Running tests", suite);
  }
  
  if (typeof Y === 'undefined') {
    alert("Configuration error: YUI3 is not present");
    return;
  }
  
  if (typeof suite === 'undefined') {
    alert("Configuration error: test suite is not defined");
    return;
  }
  
  var resultsDiv = Y.get('#results');
  var statusBar = Y.Node.create('<div class="logsummary"></div>');
  resultsDiv.appendChild(statusBar);
  var resultsTable = Y.Node.create('<table class="logtable">' +
    '<thead><tr><th>Test</th><th>Result</th><th>Message</th></tr></thead>' +
    '</table>');
  resultsDiv.appendChild(resultsTable);
  
  /**
   * Show a message in the status bar above the test results
   * @param {String} msg
   */
  var updateStatus = function(msg) {
    statusBar.set('innerHTML', msg);
  };
  
  /**
   * Add a result to the results table.
   * @param {Object} result
   */
  var reportResult = function(result) {
    var className, message;
    updateStatus("Test '" + result.testName + "' " + result.type + "ed.");
    switch (result.type) {
      case 'pass':
        className = 'passed';
        message = 'Test passed';
        break;
      case 'fail':
        className = 'failed';
        message = '<pre>' + result.error + '</pre>';
        break;
      case 'ignore':
        className = 'ignored';
        message = 'Test ignored';
        break;
      default:
        className = 'error';
        message = 'Cannot parse test status "' + result.type + '"';
    }
	var row = Y.Node.create('<tr class="' + className + '">'+
      '<td>' + result.testCase.name + ': ' + result.testName + '</td>'+
      '<td>' + result.type + 'ed</td>' +
      '<td>' + message + '</td></tr>')
    resultsTable.appendChild(row);
  };
  
  var reportCompletionStatus = function(evt) {
    var status, timeTaken = (+new Date()) - startTime;
	console.log('results', evt.results);
	if (evt.results.failed == 0) {
	  status = evt.results.passed + " test" + 
	    (evt.results.passed !== 1 ? "s" : "") +
	    " passed in " + timeTaken + "ms";
	  statusBar.addClass("passed");
	} else {
	  status = evt.results.failed + " test" + 
	    (evt.results.failed !== 1 ? "s" : "") +
	    " failed. Tests complete in " + timeTaken + " ms";
	  statusBar.addClass("failed");
	}
	updateStatus(status);
    // ... and send the results to the data collection server
    var reporter = new Y.Test.Reporter("../results");
    reporter.report(evt.results);
  }
  
  // initialise test runner
  var startTime = 0;
  var TestRunner = Y.Test.Runner;
  
  // add the test cases and suites
  TestRunner.add(window.suite);
  
  // visualise results
  TestRunner.subscribe(TestRunner.BEGIN_EVENT, function () {
  	startTime = +new Date();
	updateStatus("Test execution started");
  });
  TestRunner.subscribe(TestRunner.TEST_PASS_EVENT, reportResult);
  TestRunner.subscribe(TestRunner.TEST_FAIL_EVENT, reportResult);
  TestRunner.subscribe(TestRunner.TEST_IGNORE_EVENT, reportResult);
  TestRunner.subscribe(TestRunner.COMPLETE_EVENT, reportCompletionStatus);
  
  // ... but also report to Firebug console
  Y.config.useConsole = true;
  
  // run all tests
  Y.Test.Runner.run();
  
})();
