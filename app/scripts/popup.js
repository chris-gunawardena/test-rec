/*jshint camelcase: false */
/*global $:false */
/*global ace */

var editor;

var send_msg_to_current_tab = function(msg_data, callback){
	console.log('send_msg_to_current_tab', msg_data);
	chrome.tabs.query({currentWindow: true, active: true}, function(tab) {
		chrome.tabs.sendMessage(tab[0].id, msg_data, callback);
	});
};

var update_ui = function(response_data) {
	chrome.browserAction.setBadgeText({text: response_data.recording?'Rec':''});
	$('#record-btn').text(response_data.recording?'Stop recording':'Start recording');
	if (editor.getValue() !== response_data.steps) {
		editor.setValue(response_data.steps);
	}
};

var domready =  function() {
	// get state from content script
	send_msg_to_current_tab({ action: 'Badge Click' }, update_ui);

	//start/stop recording
	$('#record-btn').on('click', function() {
		send_msg_to_current_tab({ action: $('#record-btn').text()}, update_ui);
		switch( $('#record-btn').text() ) {
			case 'Start recording':
				$('#record-btn').text('Stop recording');
				break;
			case 'Stop recording':
				$('#record-btn').text('Start recording');
				break;
		}
	});

	// clear recording
	$('#clear-btn').on('click', function() {
		send_msg_to_current_tab({ action: 'Clear'}, update_ui);
	});

	// play recording
	$('#play-btn').on('click', function() {
		send_msg_to_current_tab({ action: 'Play'}, update_ui);
	});

	// ACE editor
    editor = ace.edit('steps-txt');
    editor.setTheme('ace/theme/twilight');
    editor.session.setMode('ace/mode/java');
    editor.getSession().on('change', function() {
    	send_msg_to_current_tab({ action: 'Edit', steps: editor.getValue() }, update_ui);
	});
};

document.removeEventListener('DOMContentLoaded', domready);
document.addEventListener('DOMContentLoaded', domready);

