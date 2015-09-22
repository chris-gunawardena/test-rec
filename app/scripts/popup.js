'use strict';
/*jshint camelcase: false */

var popup = function(){

	var send_msg_to_current_tab = function(msg_data, callback){
		console.log('send_msg_to_current_tab', msg_data);
		chrome.tabs.query({currentWindow: true, active: true}, function(tab) {
			chrome.tabs.sendMessage(tab[0].id, msg_data, callback);
		});
	}

	var update_ui = function(response_data) {
		$('#record-btn').text(response_data.recording?'Stop recording':'Start recording');
		$('#steps-txt').text(response_data.steps);
	}

	document.addEventListener('DOMContentLoaded', function(e) {
		// get state from content script
		send_msg_to_current_tab('DOMContentLoaded', update_ui);

		//start/stop recording
		$('#record-btn').on('click', function(e) {
			send_msg_to_current_tab($('#record-btn').text(), update_ui);
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
		$('#clear-btn').on('click', function(e) {
			send_msg_to_current_tab('Clear', update_ui);
		});
	});

}();

