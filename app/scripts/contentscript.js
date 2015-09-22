
/*jshint camelcase: false */

data = {
	recording: false,
	steps: ''
};

chrome.runtime.onMessage.addListener(function(message, sender, callback) {

	switch(message) {

		case 'Start recording':
			data.recording = true;
			data.steps = 'driver.get("http://localhost:4700/' + window.location.hash + "\");\n";
			break;

		case 'Stop recording':
			data.recording = false;
			break;

		case 'Clear':
			data.recording = false;
			data.steps = '';
			break;
	}
	callback(data);
});


// Listen to every one of these events
[ 'click', 'change', 'keypress', 'select', 'submit'].forEach(function(event_name){
	document.documentElement.addEventListener(event_name, function(e){
		if(data.recording) {
			switch(e.type) {
				case 'click':
					//console.log('driver.findElements(By.cssSelector("' + getCleanCSSSelector(e.target) + '")).get(0).click();');
					//console.log('$(\''+getCleanCSSSelector(e.target)+'\')');
					data.steps = data.steps + 'driver.findElements(By.cssSelector("' + getCleanCSSSelector(e.target) + '")).get(0).click();\n';
					console.log(data);
					break;

				case 'change':
					//console.log('driver.findElements(By.cssSelector("' + getCleanCSSSelector(e.target) + '")).get(0).click();');
					console.log('$(\''+getCleanCSSSelector(e.target)+'\').val()');
					break;

				default:
					console.log(e.type, getCleanCSSSelector(e.target), e.target, e);
			}			
		}
	}, true);
});

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
		tmp_selector = selector + '[data-' +dataAttr + '="' +element.dataset[dataAttr] + '"]';
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