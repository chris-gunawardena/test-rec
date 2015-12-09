/*jshint camelcase: false */

var send_msg_to_current_tab = function(msg_data){
	chrome.tabs.query({currentWindow: true, active: true}, function(tab) {
		chrome.tabs.sendMessage(tab[0].id, msg_data);
	});
};

chrome.contextMenus.create({
	'title': 'Wait for element',
	'contexts': ['page', 'selection', 'link'],
	'onclick' : function(e) {
		//console.log(e);
		send_msg_to_current_tab({ action: 'Wait for element', event: e});
	}
});

chrome.contextMenus.create({
	'title': 'Wait while element exists',
	'contexts': ['page', 'selection', 'link'],
	'onclick' : function(e) {
		//console.log(e);
		send_msg_to_current_tab({ action: 'Wait while element exists', event: e});
	}
});

chrome.contextMenus.create({
	'title': 'Take screenshot',
	'contexts': ['page', 'selection', 'link'],
	'onclick' : function(e) {
		//console.log(e);
		send_msg_to_current_tab({ action: 'Take screenshot', event: e});
	}
});

chrome.contextMenus.create({
	'title': 'Disable animations',
	'contexts': ['page', 'selection', 'link'],
	'onclick' : function(e) {
		//console.log(e);
		send_msg_to_current_tab({ action: 'Disable animations', event: e});
	}
});

chrome.contextMenus.create({
	'title': 'Scroll to element',
	'contexts': ['page', 'selection', 'link'],
	'onclick' : function(e) {
		//console.log(e);
		send_msg_to_current_tab({ action: 'Scroll to element', event: e});
	}
});

chrome.extension.isAllowedFileSchemeAccess(function(isAllowedAccess) {
    if (isAllowedAccess){
    	return; // Great, we've got access	
    } 

    // alert for a quick demonstration, please create your own user-friendly UI
    window.alert('Please "Allow access to file URLs" in the following screen.');

    chrome.tabs.create({
        url: 'chrome://extensions/?id=' + chrome.runtime.id
    });
});

