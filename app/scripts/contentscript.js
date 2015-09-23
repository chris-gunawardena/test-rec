
/*jshint camelcase: false */

data = {
	recording: false,
	steps: ''
};
last_right_clicked_element = null;

chrome.runtime.onMessage.addListener(function(message, sender, callback) {

	switch(message.action) {

		case 'Start recording':
			data.recording = true;
			data.steps = 'driver.get("http://localhost:4700/' + window.location.hash + '");\n';
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
				data.steps = data.steps + '(new WebDriverWait(driver, 10)).until(ExpectedConditions.visibilityOfAllElementsLocatedBy(By.cssSelector("' + last_right_clicked_element + '")));' + "\n";
			}
			break;

		case 'Assert if exists':
			if(data.recording) {
				console.log('Assert if exists: ' + last_right_clicked_element);
				data.steps = data.steps + 'assertEquals(driver.findElements(By.cssSelector("' + last_right_clicked_element + '")).size(), 1);' + "\n";
			}
			break;

		case 'Assert for text':
			if(data.recording) {
				console.log('Assert for text: ' + last_right_clicked_element + ' = ' + $(last_right_clicked_element).text());
				data.steps = data.steps + 'assertEquals(driver.findElements(By.cssSelector("' + last_right_clicked_element + '")).get(0).getText(), "' + $(last_right_clicked_element).text() + '");' + "\n";
			}
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
[ 'click', 'change', 'keypress', 'select', 'submit', 'mousedown'].forEach(function(event_name){
	document.documentElement.addEventListener(event_name, function(e){
		if(data.recording) {
			switch(e.type) {
				case 'click':
					console.log('click: ' + getCleanCSSSelector(e.target));
					data.steps = data.steps + '(new WebDriverWait(driver, 10)).until(ExpectedConditions.visibilityOfAllElementsLocatedBy(By.cssSelector("' + getCleanCSSSelector(e.target) + '")));' + "\n";
					data.steps = data.steps + 'driver.findElements(By.cssSelector("' + getCleanCSSSelector(e.target) + '")).get(0).click();\n\n';
					break;

				case 'change':
					console.log('change: ', getCleanCSSSelector(e.target) + ' ' + $(e.target).val());
					data.steps = data.steps + '((JavascriptExecutor) driver).executeScript("$(\'' + getCleanCSSSelector(e.target) + '\').val(\'' + $(e.target).val() + '\').trigger(\'change\')");\n\n';
					break;

				case 'mousedown':
					// Store this for later
					last_right_clicked_element = getCleanCSSSelector(e.target);
					break;

				default:
					console.log(e.type, getCleanCSSSelector(e.target), e.target, e);
			}			
		}
	}, true);
});

document.addEventListener("mousedown", function(event){
    //right click
    if(event.button == 2) { 
        clickedEl = event.target;
    }
}, true);


function getCleanCSSSelector(element) {
	if(!element) {return;}
	var selector = element.tagName ? element.tagName.toLowerCase() : '';
	if(selector === '' || selector === 'html') {return '';}

	var tmp_selector = '';
	var accuracy = document.querySelectorAll(selector).length;
	var tmp_accuracy = accuracy;

	// // automations id
	// if(element.dataset.automationId) {
	// 	tmp_selector = selector + '[data-automation-id="' + element.dataset.automationId + '"]';
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
		tmp_selector = selector + '[data-' + dataAttr.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();}); + '=\'' +element.dataset[dataAttr] + '\']';
		tmp_accuracy = document.querySelectorAll(tmp_selector).length;
		if(tmp_accuracy===1)
		{	return tmp_selector;
		}
		if(tmp_accuracy<accuracy)
		{	selector = tmp_selector;
			accuracy = tmp_accuracy;
		}
	}

	//document.querySelectorAll( "#se_exotics-selections-1-2165217 > div:nth-child(2) .rc-content-exotic-selection-btn.btn.exotic-selected" )[0].dataset

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
}





// Add to all events
// Object.getOwnPropertyNames(window).filter(function(key){
// 	return key.slice(0,2)==='on';
// }).map(function(key){
// 	return key.slice(2);
// }).forEach(function(window){
// 	document.addEventListener(eventName, function(event){
// 		console.log(event.type. e.target, e);
// 	});
// });