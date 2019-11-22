var http = require('http');
var path = require("path");
var fs = require("fs");
var url = require("url");
var cheerio = require("cheerio");
var spawn = require('child_process').spawn
var amcDb = require('./addAMCToDatabase');
var mysql = require("mysql");

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.replaceAt=function(index, replacement) {
  return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}

// amcDb.addAllAMCSolutions();

http.createServer((req, res) => {
  var q = url.parse(req.url, true);
  if (q.pathname === '/AMC') {
    fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
      res.writeHead(200, {'Content-Type': 'text.html'});
      var $ = cheerio.load(content);
      $('#yearSelect').val(q.query.year)
      $('#versionSelect').val(q.query.version)
      $('#keyWordInput').val(q.query.keyWords)
      $('#orderSelect').val(q.query.order)
      $('#pageSelect').val(q.query.page)

      var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Dtumimi1!",
        database: "mydb"
      }); 

      con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        var year = (q.query.year == "All" ? "": "year = "+q.query.year+" AND");
        var version = (q.query.version == "All" ? " (version = \"A\" OR version = \"B\")": " version = \""+q.query.version+"\"");
        var order = (q.query.order == "Year" ? "ORDER BY year DESC": " ORDER BY number, year desc");
        var sql = `SELECT * FROM amc WHERE ${year}${version}${order}`
        con.query(sql, function (err, result) {
          if (err) throw err;
          // console.log(result)
          var j = 0;
          for (var i = 0; i < result.length; i++) {
            if ((result[i].problemHTML != null) && (q.query.keyWords == "ALL" || result[i].problemHTML.toLowerCase().includes(q.query.keyWords.toLowerCase()) || result[i].solutions.toLowerCase().includes(q.query.keyWords.toLowerCase()))) {
              j++;
              $("#problemContainer").append(`<div id = 'problem${j}' class = "problem"></div>`)
              $(`#problem${j}`).append(`<h1>Problem ${j} (AMC ${result[i].year}${result[i].version}, Problem ${result[i].number}): </h1>`)
              $(`#problem${j}`).append(result[i].problemHTML)
              // $("#problemContainer").append(`<button type="button" onclick="if (document.getElementById('toggle${j}').style.display === 'block') {document.getElementById('toggle${j}').style.display = 'none'} else {document.getElementById('toggle${j}').style.display = 'block'}" >Click To Show Solutions</button>`)
              $(`#problem${j}`).append(`<button class = "btn" type="button" id='btn${j}' onclick="toggleSolutions(document.getElementById('toggle${j}'), this, document.getElementById('problem${j}'), false)" >Show Solutions</button>`)
              var solutionsStr = `<section id = "toggle${j}" style = "display: none">`
              solutionsStr += `<hr><h2>Problem ${j} Solution: </h2>`

              var solutions = result[i].solutions.split("(@)")
              // console.log("Solutions: "+solutions)
              for (k=0; k<solutions.length; k++) {
                if (k!=0) {
                  solutionsStr+=`<hr>`
                }
                solutionsStr += `<h4>Solution ${k+1}:</h4>`
                solutionsStr += solutions[k]
              }
              solutionsStr += `<button class = "btn" type="button" onclick="toggleSolutions(document.getElementById('toggle${j}'), document.getElementById('btn${j}'), document.getElementById('problem${j}'), true)" >Hide Solutions</button>`
              solutionsStr += `</section>`
              $(`#problem${j}`).append(solutionsStr)
            }
          }
          res.end($.html())
        })
      })
    })

    
  }  else {

    // console.log(req.url)
    var filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

    var extname = path.extname(filePath)
    var contentType = 'text.html'
    if (extname === ".css") {
      contentType = "text/css"
    } else if (extname === ".js"){
      contentType = "application/javascript"
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        // if (err.code == "ENOENT") {
          fs.readFile(path.join(__dirname, 'public', "404.html"), (error, errorContent) => {
            if (error) throw error
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(errorContent)
          })
        // }
      } else {
        res.writeHead(200, {'Content-Type': contentType});
        res.end(content)

      }

    })
  }
}).listen(8080); 