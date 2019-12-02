
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

        var sql = "SELECT * FROM amc WHERE year = "+year+" AND level = \"12\" AND version = \""+version+"\""
        con.query(sql, function (err, result) {
          if (err) throw err;
          
          for (var i = 0; i< problems.length; i++) {
            // console.log(i+1, year, version, problems[i][1])
            if (level.equals("12")) {
              if (!result.length) {
              var sql = "INSERT INTO amc (year, version, number, problem, problemHTML) VALUES ("+year+", \""+version+"\", \""+(i+1)
                      +"\", \""+String(problems[i][1]).replaceAll("\"", "\'")+"\", \""+String(problems[i][0]).replaceAll("\"", "\'")+"\")"
              } else {
                console.log(String(problems[i][1]).replaceAll("\"", "\'"))
                var sql = "UPDATE amc SET problem = \""+String(problems[i][1]).replaceAll("\"", "\'")+"\", problemHTML = \""+
                        String(problems[i][0]).replaceAll("\"", "\'")+"\" WHERE year = "+year+" AND number = \""+(i+1)+"\""+" AND version = \""+version+"\"";
              }
            } else {
              var problemRepeated = false;
              for (p in result) {
                if (problems[i][1].equals(p.problem)) {
                  problemRepeated = true;
                  break;
                }
              }
              if (problemRepeated) {
                console.log(`Problem ${i+1} is a repeat`)
              }
              
            }
            

            // con.query(sql, function (err, result) {
            //   if (err) throw err;
            //   totalCounter+=1;
            //   console.log("record inserted: "+totalCounter);
            //   if (totalCounter == 25 && callNext) {
            //     callNextContest(year, version);
            //   }
            // });
            // con.end();
          }
          
        });

    }); 
    });
    py.stdin.end();
  },

  addAllAMCs: function() {
    // this.addToDatabase(2018, "A", true);
    this.addToDatabase(2019, "B", false)
    // this.addToDatabase(2004, "B", false)
  },

  addAllAMCSolutions: function() {
    console.log("I'm here")
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
      // console.log(solutions)
      
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
            // console.log(i+1, year, version, solutions[i].length)
            // solutionsStr = JSON.stringify(solutions[i]).replaceAll("\"", "\'");
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
      module.exports.addSolutionsToDatabase(year-1, "A", true)
    }
  } else {
    module.exports.addSolutionsToDatabase(year, "B", true)
  }
}

