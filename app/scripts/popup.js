
/*jshint camelcase: false */



var send_msg_to_current_tab = function(msg_data, callback){
	console.log('send_msg_to_current_tab', msg_data);
	chrome.tabs.query({currentWindow: true, active: true}, function(tab) {
		chrome.tabs.sendMessage(tab[0].id, msg_data, callback);
	});
}

var update_ui = function(data) {
	localStorage.setItem('rest_rec_data', {
		state: data.state,
		steps: data.steps
	});
	$('#record-btn').html(localStorage.getItem('rest_rec_data').state);
	$('#steps-txt').html(localStorage.getItem('rest_rec_data').steps);
}

document.addEventListener('DOMContentLoaded', function(e) {
	// get state from content script
	send_msg_to_current_tab({}, update_ui);

	//start/stop recording
	$('#record-btn').on('click', function(e) {
		switch(localStorage.getItem('rest_rec_data').state) {
			case 'stopped':
				localStorage.getItem('rest_rec_data').state = 'recording';
				break;
			case 'recording':
				localStorage.getItem('rest_rec_data').state = 'stopped';
				break;
		}
		send_msg_to_current_tab(localStorage.getItem('rest_rec_data'), update_ui);
	});

	// clear recording
	$('#record-btn').on('click', function(e) {
		localStorage.getItem('rest_rec_data').state = 'stopped';
		localStorage.getItem('rest_rec_data').steps = '';
		send_msg_to_current_tab(localStorage.getItem('rest_rec_data'), update_ui);
	});
});


