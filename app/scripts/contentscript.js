'use strict';

document.documentElement.addEventListener("click", function(e){
	console.log(e.target, e);
}, true);



// Object.getOwnPropertyNames(window).filter(function(key){
// 	return key.slice(0,2)=='on';
// }).map(function(key){
// 	return key.slice(2);
// }).forEach(function(window){
// 	document.addEventListener(eventName, function(event){
// 		console.log(event.type. e.target, e);
// 	});
// });