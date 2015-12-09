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
	if(response_data){
		chrome.browserAction.setBadgeText({text: response_data.recording?'Rec':''});
		$('#record-btn').text(response_data.recording?'Stop recording':'Start recording');
		if (editor.getValue() !== response_data.steps) {
			editor.setValue(response_data.steps);
		}
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
	// $('#play-btn').on('click', function() {
	// 	send_msg_to_current_tab({ action: 'Play'}, update_ui);
	// });

	// save recording
	// $('#save-btn').on('click', function() {
	// 	function save_content_to_file(content, filename)
	// 	{
	// 		var dlg = false;
	// 		with(document){
	// 			ir=createElement('iframe');
	// 			ir.id='ifr';
	// 			ir.location='about.blank';
	// 			ir.style.display='none';
	// 			body.appendChild(ir);
	// 			with(getElementById('ifr').contentWindow.document){
	// 				open("text/plain", "replace");
	// 				charset = "utf-8";
	// 				write(content);
	// 				close();
	// 				document.charset = "utf-8";
	// 				dlg = execCommand('SaveAs', false, filename+'.jpg/png');
	// 			}
	// 			body.removeChild(ir);
	// 		}
	// 		return dlg;
	// 	}
	// 	save_content_to_file("Hello", "C:\somewhere");
	// });

	// ACE editor
    editor = ace.edit('steps-txt');
    editor.setTheme('ace/theme/twilight');
    editor.session.setMode('ace/mode/java');
    editor.getSession().on('change', function() {
    	send_msg_to_current_tab({ action: 'Edit', steps: editor.getValue() }, update_ui);
	});

    // Load test files list to drop down
	// var xhr = new XMLHttpRequest();  
	// xhr.open('GET', 'file:///C:/PROJECTS/mobile/autotest/ui-tests/tests/', true);
	// xhr.onreadystatechange = function() {
	// 	if(xhr.readyState === 4){	
	// 		var file_list = xhr.responseText.match(/<script>addRow(.*)<\/script>/g).map(function(line){
	// 			line = line.replace('<script>addRow(','').replace(');</script>','');
	// 			return JSON.parse('[' + line + ']');
	// 		});

	// 		// $('<option />').appendTo($('#file-picker'));
	// 		// for(var i=1; i<file_list.length; i++) {
	// 		// 	$('<option />', {value: file_list[i][0], text: file_list[i][0]}).appendTo($('#file-picker'));
	// 		// }
	// 	}
	// };
	// xhr.send();

	// Load test file to editor
	// $('#file-picker').on('change', function(){
	// 	xhr.open('GET', 'file:///C:/PROJECTS/mobile/autotest/ui-tests/tests/' + $('#file-picker').val(), true);
	// 	xhr.onreadystatechange = function() {
	// 		if(xhr.readyState === 4){
	// 			send_msg_to_current_tab({ action: 'Edit', steps: xhr.responseText });
	// 			editor.setValue(xhr.responseText);
	// 		}
	// 	};
	// 	xhr.send();
	// });

};

document.removeEventListener('DOMContentLoaded', domready);
document.addEventListener('DOMContentLoaded', domready);

