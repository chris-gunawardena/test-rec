'use strict';
/*jshint camelcase: false */


chrome.tabs.query({currentWindow: true, active: true}, function(tab) { /*Select active tab of the current window*/
	chrome.tabs.sendMessage(tab[0].id, {msg: 'hello'}); /*Send a message to the content script*/
});