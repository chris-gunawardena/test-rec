'use strict';


[ 'click', 'change', 'keypress', 'select', 'submit'].forEach(function(event_name){
	document.documentElement.addEventListener(event_name, function(e){
		console.log(e.type, e.target, e, getCleanCSSSelector(e.target));
	}, true);
});

// Popup closed on start
var popup_open = false;

window.addEventListener("load", function() {
	// Listen to events from popup
	chrome.runtime.onMessage.addListener(function(message) {
		alert('sss');
		switch(message.type) {
			case 'clickBrowserAction':
				popup_open = !popup_open;
				chrome.browserAction.setBadgeText({text: popup_open?'':'Recccc'});
			break;
		}
		return true;
	});
}, true);

/*jshint camelcase: false */
function getCleanCSSSelector(element) {
	if(!element) {return;}
	var selector = element.tagName ? element.tagName.toLowerCase() : '';
	if(selector === '' || selector === 'html') {return '';}

	var tmp_selector = '';
	var accuracy = document.querySelectorAll(selector).length;

	if(element.dataset.automationId) {
		selector = '[data-automation-id="' + element.dataset.automationId + '"]';
		accuracy = document.querySelectorAll(selector).length;
		if(accuracy===1) {return selector;}
	}

	if(element.id) {
		selector = '#' + element.id.replace(/\./g, '\\.');
		accuracy = document.querySelectorAll(selector).length;
		if(accuracy===1) {return selector;}
	}

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




// Object.getOwnPropertyNames(window).filter(function(key){
// 	return key.slice(0,2)==='on';
// }).map(function(key){
// 	return key.slice(2);
// }).forEach(function(window){
// 	document.addEventListener(eventName, function(event){
// 		console.log(event.type. e.target, e);
// 	});
// });