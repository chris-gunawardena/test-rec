/*jshint camelcase: false */
/*global $:false */

var data = {
	recording: false,
	steps: ''
};
var getCleanCSSSelector = null;
var last_right_clicked_element = null;
var last_right_clicked_element_stack = [];

chrome.runtime.onMessage.addListener(function(message, sender, callback) {

	switch(message.action) {

		case 'Start recording':
			data.recording = true;
			data.steps = data.steps + 'casper.thenOpen(\'http://localhost:4700/' + window.location.hash + '\')\n\n';
			break;

		case 'Stop recording':
			data.recording = false;
			break;

		case 'Clear':
			data.recording = false;
			data.steps = '';
			break;

		case 'Wait for element':
			if(data.recording) {
				console.log('Wait for element: ' + last_right_clicked_element);
				data.steps = data.steps + '.then(function() { casper.waitForSelector(\'' + last_right_clicked_element + '\'); })' + '\n\n';
			}
			break;

		case 'Wait while element exists':
			if(data.recording) {
				console.log('Wait while element exists: ' + last_right_clicked_element);
				data.steps = data.steps + '.then(function() { casper.waitWhileSelector(\'' + last_right_clicked_element + '\'); })' + '\n\n';
			}
			break;

		case 'Take screenshot':
			if(data.recording) {
				console.log('Take screenshot: ' + last_right_clicked_element);
				var screenshot_name = window.prompt('Please enter filename for screenshot', window.location.hash.substr(1).replace(/[|\/]/g, '_'));
				data.steps = data.steps + '.then(function() { phantomcss.screenshot(\'' + last_right_clicked_element + '\', \'' + screenshot_name + '\')})' + '\n\n';
			}
			break;

		case 'Scroll to element':
			if(data.recording) {
				console.log('Disable animations');
				data.steps = data.steps + '.then(function() {casper.evaluate(function() {$(\'body\').scrollTo(\'' + last_right_clicked_element + '\',{duration:0, offsetTop : \'50\'});});})' + '\n\n';
			}
			break;

		case 'Disable animations':
			if(data.recording) {
				console.log('Disable animations');
				data.steps = data.steps + '.then(function() {casper.evaluate(function() {var style = document.createElement(\'style\');style.innerHTML = \'* { -webkit-animation-delay: 0.01s !important; -webkit-animation-duration: 0.01s !important;  -webkit-transition-delay: 0.01s !important; -webkit-transition-duration: 0.01s !important; }\';document.body.appendChild(style);});})' + '\n\n';
			}
			break;

		case 'Badge Click':
			if(!data.recording){
				console.log('Badge Click');
				data.recording = true;
				data.steps = data.steps + 'casper.thenOpen(\'http://localhost:4700/' + window.location.hash + '\')\n\n';
			}
			break;

		case 'Edit':
			data.steps = message.steps;
			break;

		default:
			console.log(message);
			break;
	}
	if(callback) {
		callback(data);
	}
});

// Listen to every one of these events
[ 'click', 'change', 'keypress', 'select', 'submit', 'mousewheel', 'contextmenu'].forEach(function(event_name){
	document.documentElement.addEventListener(event_name, function(e){

		if(data.recording) {

			console.log(e);
			switch(e.type) {

				case 'click':
					data.steps = data.steps + '.then(function() { casper.waitForSelector(\'' + getCleanCSSSelector(e.target) + '\'); })' + '\n';
					data.steps = data.steps + '.then(function() { casper.click(\'' + getCleanCSSSelector(e.target) + '\'); })' + '\n\n';
					break;

				case 'change':
					// console.log('change: ', getCleanCSSSelector(e.target) + ' ' + $(e.target).val());
					// data.steps = data.steps + '((JavascriptExecutor) driver).executeScript(\'$(\'' + getCleanCSSSelector(e.target) + '\').val(\'' + $(e.target).val() + '\').trigger(\'change\')\');\n\n';
					break;

				case 'contextmenu':
					// if right cliking and nothing is selected, select something
					if ($('.test-rec-outline').length === 0) {
						// remove old outline
						$(last_right_clicked_element).removeClass('test-rec-outline');
						// get css selector
						last_right_clicked_element = getCleanCSSSelector(e.target);
						// add outline
						$(last_right_clicked_element).addClass('test-rec-outline');
						// // Stop opening the contex menu to allow change bounding box
						// e.preventDefault();
					}
					// cancel if not clicking on the same element or its children
					else if (!$(e.target).is($('.test-rec-outline')) && !$('.test-rec-outline').has($(e.target)).length) {
						// remove old outline
						$(last_right_clicked_element).removeClass('test-rec-outline');
						// Stop opening the contex menu
						e.preventDefault();
					}
					break;

				case 'mousewheel':
					// if somthing is selected
					if($('.test-rec-outline').length) {
						// stop scrolling
						e.preventDefault();
						// remove old outline
						$(last_right_clicked_element).removeClass('test-rec-outline');
						// up
						if(e.wheelDeltaY > 0) {
							// get new parent
							var parent = $(last_right_clicked_element).parent().get(0);
							if(parent) {
								last_right_clicked_element_stack.push(last_right_clicked_element);
								last_right_clicked_element = getCleanCSSSelector(parent);
							}
						}else if(last_right_clicked_element_stack.length){
							last_right_clicked_element = last_right_clicked_element_stack.pop();
						}
						// add new outline
						$(last_right_clicked_element).addClass('test-rec-outline');
					}
					break;

				//default:
				//	console.log(e.type, getCleanCSSSelector(e.target), e.target, e);
			}			
		}
	}, true);
});

// Add class used to highlight elements
$('head').append($('<style>').text('.test-rec-outline{outline: 1px solid red; -webkit-box-shadow: inset 0px 0px 14px 5px rgba(255,0,0,0.75);}'));

getCleanCSSSelector = function(element) {
	if(!element) {return;}
	var selector = element.tagName ? element.tagName.toLowerCase() : '';
	if(selector === '' || selector === 'html') {return '';}

	var tmp_selector = '';
	var accuracy = document.querySelectorAll(selector).length;
	var tmp_accuracy = accuracy;

	// // automations id
	// if(element.dataset.automationId) {
	// 	tmp_selector = selector + '[data-automation-id=\'' + element.dataset.automationId + '\']';
	// 	tmp_accuracy = document.querySelectorAll(tmp_selector).length;
	// 	if(accuracy===1) {return tmp_accuracy;}
	// 	if(tmp_accuracy<accuracy) {selector = tmp_selector;}
	// }

	if(element.id) {
		selector = selector + '#' + element.id.replace(/\./g, '\\.');
		accuracy = document.querySelectorAll(selector).length;
		if(accuracy===1) {return selector;}
	}


	for(var dataAttr in element.dataset) {
		//To Dashed from Camel Case
		tmp_selector = selector + '[data-' + dataAttr.replace(/([A-Z])/g, function($1){return '-'+$1.toLowerCase();}) + '=\\\'' +element.dataset[dataAttr] + '\\\']';
		tmp_accuracy = document.querySelectorAll(tmp_selector).length;
		if(tmp_accuracy===1)
		{	return tmp_selector;
		}
		if(tmp_accuracy<accuracy)
		{	selector = tmp_selector;
			accuracy = tmp_accuracy;
		}
	}

	//document.querySelectorAll( \'#se_exotics-selections-1-2165217 > div:nth-child(2) .rc-content-exotic-selection-btn.btn.exotic-selected\' )[0].dataset

	if(element.className) {
		tmp_selector = '.' + element.className.trim().replace(/ /g,'.');
		if(document.querySelectorAll(tmp_selector).length < accuracy) {
			selector = tmp_selector;
			accuracy = document.querySelectorAll(selector).length;
			if(accuracy===1) {return selector;}
		}
	}
	var parent = element.parentNode;
	var parent_selector = getCleanCSSSelector(parent);

	if(parent_selector) {

		// resolve sibling ambiguity
		var matching_sibling = 0;
		var matching_nodes = document.querySelectorAll(parent_selector + ' > ' + selector);
		for(var i=0; i<matching_nodes.length;i++) {
			if(matching_nodes[i].parentNode === parent) {matching_sibling++;}
		}
		if(matching_sibling > 1) {
			var index = 1;
			for (var sibling = element.previousElementSibling; sibling; sibling = sibling.previousElementSibling) 
				{index++;}
			selector = selector + ':nth-child(' + index + ')';
		}
		
		// remove useless intermediary parent
		var selector_array = parent_selector.split(' ');
		if(selector_array.length>1) {
			for(i=1;i<selector_array.length;i++) {
				tmp_selector = selector_array.slice(0,i).join(' ') + ' ' + selector;
				if(document.querySelectorAll(tmp_selector).length === 1) {
					selector = tmp_selector;
					break;
				}
			}
		} 

		// improve accuracy if still not correct
		accuracy = document.querySelectorAll(selector).length;
		if(accuracy>1) {
			tmp_selector = parent_selector + ' ' + selector;
			if(document.querySelectorAll(tmp_selector).length===1) {
				selector = tmp_selector;
			} else {
				selector = parent_selector + ' > ' + selector;
			}
		}
	}

	return selector;
};