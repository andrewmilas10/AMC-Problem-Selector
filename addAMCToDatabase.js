
var spawn = require('child_process').spawn
var mysql = require("mysql");

module.exports = {
  addToDatabase: function(year, version, level, callNext = false) {
    var py = spawn('python', ['getAmcQuestions.py', year, version, level])
    var html = "";
    totalCounter = 0;
              
    py.stdout.on('data', function(data){
      html += data;
    });

    py.stdout.on('end', function(){
      var problems = eval(html)
      console.log(problems)
      
      var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Dtumimi1!",
        database: "mydb"
      });

      con.connect(function(err) {
        if (err) throw err;

        var sql = "SELECT * FROM amc WHERE year = "+year+" AND (level = \"12\" or level =\"Both\") AND version = \""+version+"\""
        con.query(sql, function (err, result) {
          if (err) throw err;
          
          for (var i = 0; i< problems.length; i++) {
            // console.log(i+1, year, version, problems[i][1])
            if (level === "12") {
              if (!result.length) {
              var sql = `INSERT INTO amc (year, version, number, problem, problemHTML, level) VALUES (${year}, \"${version}\", \"${i+1}\", 
                        \"${String(problems[i][1]).replaceAll("\"", "\'")}\", \"${String(problems[i][0]).replaceAll("\"", "\'")}\", \"12\")`
              } else {
                console.log(String(problems[i][1]).replaceAll("\"", "\'"))
                var sql = `UPDATE amc SET problem = \"${String(problems[i][1]).replaceAll("\"", "\'")}\", problemHTML = \"${String(problems[i][0]).replaceAll("\"", "\'")}
                           \" WHERE year = ${year} AND number = \"${i+1}\" AND version = \"${version}\" AND (level = \"12\" OR level = \"both\")`;
              }
            } else {
              var problemRepeated = false;
              for (var j = 0; j < result.length; j++) {
                if (i+1 === parseInt(result[j].numberAMC10)) {
                  problemRepeated = true;
                  break;
                }
              }
              if (problemRepeated) {
                totalCounter+=1;
                console.log("record inserted: "+totalCounter);
                if (totalCounter == 25 && callNext) {
                  callNextContest(year, version);
                }
                continue;
              } else {
                var sql = `UPDATE amc SET problem = \"${String(problems[i][1]).replaceAll("\"", "\'")}\", problemHTML = \"${String(problems[i][0]).replaceAll("\"", "\'")}
                           \" WHERE year = ${year} AND numberAMC10 = \"${i+1}\" AND version = \"${version}\" AND level = \"10\"`;
              }
            }
            

            con.query(sql, function (err, result) {
              if (err) throw err;
              totalCounter+=1;
              console.log("record inserted: "+totalCounter);
              if (totalCounter == 25 && callNext) {
                callNextContest(year, version);
              }
            });
            // con.end();
          }
          
        });

    }); 
    });
    py.stdin.end();
  },

  addRepeatsToDatabase: function(year, version, callNext = false) {
    var py = spawn('python', ['getAmcRepeats.py', year, version])
    var repeatedList = "";
    totalCounter = 0;
              
    py.stdout.on('data', function(data){
      repeatedList += data;
    });

    py.stdout.on('end', function(){
      var repeats = eval(repeatedList)
      
      var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Dtumimi1!",
        database: "mydb"
      });

      con.connect(function(err) {
        if (err) throw err;

        var sql = "SELECT * FROM amc WHERE year = "+year+" AND level = \"10\" AND version = \""+version+"\""
        con.query(sql, function (err, result) {
          if (err) throw err;
          
          for (var i = 0; i< repeats.length; i++) {

            if (repeats[i][0]) {
              var sql = `UPDATE amc SET level = \"Both\", numberAMC10 = \"${i+1}\" WHERE year = ${year} AND number = \"${repeats[i][1]}\" AND version = \"${version}\" AND level = \"12\"`;
            } else if (!result.length) {
                var sql = `INSERT INTO amc (year, version, level, numberAMC10) VALUES (${year}, \"${version}\", \"10\", \"${i+1}\")`
            } else {
              totalCounter+=1;
              console.log("record already inserted: "+totalCounter);
              if (totalCounter == 25 && callNext) {
                callNextContest(year, version);
              }
            }

            if (repeats[i][0] || !result.length) {
              con.query(sql, function (err, result) {
              if (err) throw err;
              totalCounter+=1;
              console.log("record inserted: "+totalCounter);
              if (totalCounter == 25 && callNext) {
                callNextContest(year, version);
              }
            });
            }
            
            // con.end();
          }
          
        });

    }); 
    });
    py.stdin.end();
  },

  addAllAMCs: function() {
    // this.addToDatabase(2018, "A", true);
    //TODO
    //TODO 2006 A adding solutions didn't work problem 17 got set to what problem 18 is
    //TODO
    this.addToDatabase(2009, "B", "10", true)
    // this.addToDatabase(2004, "B", false)
  },

  addAllAMCReapeats: function() {
    this.addRepeatsToDatabase(2005, "B", true)

  },

  addAllAMCSolutions: function() {
    this.addSolutionsToDatabase(2019, "A", "10", true)
  },

  addSolutionsToDatabase: function(year, version, callNext = false) {
    var py = spawn('python', ['getAmcSolutions.py', year, version])
    var html = "";
    totalCounter = 0;
              
    py.stdout.on('data', function(data){
      html += data;
    });

    py.stdout.on('end', function(){
      var solutions = eval(html)
      
      var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Dtumimi1!",
        database: "mydb"
      });

      con.connect(function(err) {
        if (err) throw err;

        var sql = "SELECT * FROM amc WHERE year = "+year+" AND version = \""+version+"\""
        con.query(sql, function (err, result) {
          if (err) throw err;
          
          for (var i = 0; i< solutions.length; i++) {
            solutionsStr = ""
            for (var j = 0; j< solutions[i].length; j++) {
              solutionsStr+="(@)"+solutions[i][j]
            }
            solutionsStr = solutionsStr.replace("(@)", "").replaceAll("\"", "\'")
            console.log("\n\n\n\nSolution "+i+":  "+solutionsStr) //Replace the double quotes with singles
            if (!result.length) {
              var sql = "INSERT INTO amc (year, version, number, solutions) VALUES ("+year+", \""+version+"\", \""+(i+1)
                      +"\", \""+solutionsStr+"\")"
            } else {
              // console.log(String(solutions[i]).replaceAll("\"", "\'"))
              var sql = "UPDATE amc SET solutions = \""+solutionsStr+
                        "\" WHERE year = "+year+" AND number = \""+(i+1)+"\""+" AND version = \""+version+"\"";
            }

            con.query(sql, function (err, result) {
              if (err) throw err;
              totalCounter+=1;
              console.log("record inserted: "+totalCounter);
              if (totalCounter == 25 && callNext) {
                callNextContest(year, version);
              }
            });
            // con.end();
          }
          
        });

    }); 
    });
    py.stdin.end();
  },

  deleteAMCs: function() {
    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Dtumimi1!",
      database: "mydb"
    });

    con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");

      var sql = "SET SQL_SAFE_UPDATES = 0; DELETE FROM amc; ALTER TABLE amc AUTO_INCREMENT = 1;"
      sql += "SELECT * FROM amc"
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Records Deleted")
      })
    })
  }

}

function callNextContest(year, version) {
  console.log(year, version)
  if (version == "B") {
    if (year >= 2003) {
      module.exports.addToDatabase(year-1, "A", "10", true)
    }
  } else {
    module.exports.addToDatabase(year, "B", "10", true)
  }
}

