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
      $('#levelSelect').val(q.query.level)
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
        var level = (q.query.level == "All" ? " (level = \"10\" OR level = \"12\" OR level = \"Both\") AND": " (level = \""+q.query.level+"\" OR level = \"Both\") AND");
        var version = (q.query.version == "All" ? " (version = \"A\" OR version = \"B\")": " version = \""+q.query.version+"\"");
        //TODO
        //TODO Need to add level in the search query
        var order = (q.query.order == "Year" ? "ORDER BY year DESC": " ORDER BY number, year desc");
        var sql = `SELECT * FROM amc WHERE ${year}${level}${version}${order}`
        con.query(sql, function (err, result) {
          if (err) throw err;
          var j = 0;
          for (var i = 0; i < result.length; i++) {
            if ((result[i].problemHTML != null) && (q.query.keyWords.toLowerCase() == "all" || result[i].problemHTML.toLowerCase().includes(q.query.keyWords.toLowerCase()) || result[i].solutions.toLowerCase().includes(q.query.keyWords.toLowerCase()))) {
              j++;
              if (Math.floor((j-1)/100)+1 == parseInt(q.query.page)) {
                $("#problemContainer").append(`<div id = 'problem${j}' class = "problem"></div>`)
                if (result[i].level != "Both") {
                  $(`#problem${j}`).append(`<h1>Problem ${j} (${result[i].year} AMC${result[i].level}${result[i].version} Problem ${result[i].number || result[i].numberAMC10}): </h1>`)
                  var url = `https://artofproblemsolving.com/wiki/index.php/${result[i].year}_AMC_${result[i].level}${result[i].version}_Problems/Problem_${result[i].number || result[i].numberAMC10}`
                } else {
                  $(`#problem${j}`).append(`<h1>Problem ${j} (${result[i].year} AMC10${result[i].version} Problem ${result[i].numberAMC10} and AMC12${result[i].version} Problem ${result[i].number}): </h1>`)
                  var url = `https://artofproblemsolving.com/wiki/index.php/${result[i].year}_AMC_10${result[i].version}_Problems/Problem_${result[i].numberAMC10}`
                }
                // $(`#problem${j}`).append(`<h1>Problem ${j} (${result[i].year} AMC${level}${result[i].version} Problem ${result[i].number}): </h1>`)
                $(`#problem${j}`).append(result[i].problemHTML)
                $(`#problem${j}`).append(`<p>Source: <a href="${url}" target="_blank">${url}</a></p>`)
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
          }
          if (j>100) {
            $('#pagesContainer').css("display", "block");
            var numPages = Math.floor((j+99)/100)
            $('#pageTitle').html(`Page ${q.query.page} out of ${numPages}`)
            for (var i=2; i<=numPages; i++) {
              $('#pageSelect').append(`<option value="${i}">${i}</option>`)
            }
            
          //   $('#pageSelect').find('option').each((i,op) => {
          //     console.log($(op).text())
          //  })
          } else {
            $('#pagesContainer').css("display", "none");
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