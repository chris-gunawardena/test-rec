'use strict';
/*jshint camelcase: false */

var popup = function(){

	var data = {
		state: 'stopped',
		steps: ''
	};

	var send_msg_to_current_tab = function(msg_data, callback){
		console.log('send_msg_to_current_tab', msg_data);
		chrome.tabs.query({currentWindow: true, active: true}, function(tab) {
			chrome.tabs.sendMessage(tab[0].id, msg_data, callback);
		});
	}

	var update_ui = function(response_data) {
		data = response_data;


		$('#record-btn').html(data.state);
		$('#steps-txt').html(data.steps);
	}

	document.addEventListener('DOMContentLoaded', function(e) {
		// get state from content script
		send_msg_to_current_tab(data, update_ui);

		//start/stop recording
		$('#record-btn').on('click', function(e) {
			switch(data.state) {
				case 'stopped':
					data.state = 'recording';
					break;
				case 'recording':
					data.state = 'stopped';
					break;
			}
			send_msg_to_current_tab(data, update_ui);
		});

		// clear recording
		$('#record-btn').on('click', function(e) {
			data.state = 'stopped';
			data.steps = '';
			send_msg_to_current_tab(data, update_ui);
		});
	});

}();

