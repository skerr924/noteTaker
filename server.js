// Dependencies
// ===========================================
var express = require('express');
var path = require('path');
var fs = require('fs'); 

// Sets up the Express App
// ===========================================
var app = express();
var PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'))

//storedNotes array moves data back and forth from api 
let storedNotes = []; 

// Routes
// =============================================================

//displays homepage 
app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
  });
  
  //displays notes page 
  app.get("/notes", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/notes.html"));
  });
  
  //gets all notes from the db.json file 
  app.get('/api/notes', function(err, res) {
  
    try { 
    storedNotes = fs.readFileSync("./db/db.json", "utf8"); 
    storedNotes = JSON.parse(storedNotes); 
    } catch (err) { 
      console.log ("error getting api stored notes"); 
    }
  
    res.json(storedNotes); 
  
  });
  
  app.post("/api/notes", function(req, res) {
    try { 
      storedNotes = fs.readFileSync("./db/db.json", "utf8"); 
      storedNotes = JSON.parse(storedNotes); 
      req.body.id = Math.floor(Math.random() * Math.floor(1000000)); 
      storedNotes.push(req.body)
      storedNotes = JSON.stringify(storedNotes); 
      fs.writeFile("./db/db.json", storedNotes, "utf8", function (err){ 
        if (err) throw err; 
      }); 

      res.json(JSON.parse(storedNotes)); 
    
    }  catch (err) { 
        throw err; 
        console.log ("error writing to the API"); 
    }
  });
  
  app.delete("/api/notes/:id", function(req, res) {
    try { 
      storedNotes = fs.readFileSync("./db/db.json", "utf8"); 
      storedNotes = JSON.parse(storedNotes); 
  
      //filters through the notes and returns all notes that don't have the same 
      // id as the specNote we are trying to remove 
      let tempNotes = storedNotes.filter(function(specNote){ 
        return specNote.id != req.params.id; 
      }); 
      storedNotes = JSON.stringify(tempNotes); 
      fs.writeFile("./db/db.json", storedNotes, "utf8", function(err){ 
        if (err){ 
          throw err;
        }
      }); 
  
      res.send(JSON.parse(storedNotes)); 
    
    } catch (err) { 
      throw err; 
      console.log("error deleting note and writing to the API"); 
    }
  
  }); 

  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
  