
var spawn = require('child_process').spawn
var py = spawn('python', ['webscraping.py'])
var html = "";

console.log("second test")

py.stdout.on('data', function(data){
  html += data;
});
py.stdout.on('end', function(){
  console.log(html);
});
// py.stdin.write(JSON.stringify(data));
py.stdin.end();

console.log("I did stuff")

$(document).ready(function(){
  var myEl = $(html);
  $('#problemContainer').append(myEl);
});

