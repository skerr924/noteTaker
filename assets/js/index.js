// Dependencies
// ===========================================
var express = require("express");
var path = require("path");
var fs = require("fs"); 

// Sets up the Express App
// ===========================================
var app = express();
var PORT = 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//jQuery calls to various HTML elements 
const $noteTitle = $(".note-title");
const $noteText = $(".note-textarea");
const $saveNoteBtn = $(".save-note");
const $newNoteBtn = $(".new-note");
const $noteList = $(".list-container .list-group");

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

// Routes
// =============================================================

//displays homepage 
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

//displays notes page 
app.get("/notes/", function(req, res) {
  res.sendFile(path.join(__dirname, "notes.html"));
});

//gets all notes from the db.json file 
app.get('/api/notes', function(req, res) {

  try { 
  const storedNotes = fs.readFileSync("../../db/db.json", "utf8"); 
  storedNotes = JSON.parse(storedNotes); 
  } catch (err) { 
    console.log ("error getting api stored notes"); 
  }

  res.json(storedNotes); 

});

app.post("/api/notes", function(req, res) {
  try { 
    const storedNotes = fs.readFileSync("../../db/db.json", "utf8"); 
    storedNotes = JSON.parse(storedNotes); 
    req.body.id = storedNotes.length; 
    storedNotes.push(req.body)
    storedNotes = JSON.stringify(storedNotes); 

    try {
    fs.writeFile("../../db/db.json", storedNotes, "utf8")
    } 
    catch (err) { 
      console.log ("error writing to api"); 
    }
  
    res.json(JSON.parse(storedNotes));
  }  catch (err) { 
      console.log ("error writing to the API"); 
  }
});

app.delete("/api/notes/:id", function(req, res) {
  try { 
    const storedNotes = fs.readFileSync("../../db/db.json", "utf8"); 
    storedNotes = JSON.parse(storedNotes); 

    //filters through the notes and returns all notes that don't have the same 
    // id as the specNote we are trying to remove 
    storedNotes = storedNotes.filter(function(specNote){ 
      return specNote.id != req.params.id; 
    }); 

    storedNotes = JSON.stringify(storedNotes); 
    fs.writeFile("../../db/db.json", storedNotes, "utf8", function(err){ 
      if (err){ 
        throw err;
      }
    }); 

    res.send(JSON,parse(storedNotes)); 
  
  } catch (err) { 
    console.log("error writing to the API"); 
  }

}); 


// A function for getting all notes from the db
const getNotes = () => {
  return $.ajax({
    url: "/api/notes",
    method: "GET",
  });
};

// A function for saving a note to the db
const saveNote = (note) => {
  return $.ajax({
    url: "/api/notes",
    data: note,
    method: "POST",
  });
};

// A function for deleting a note from the db
const deleteNote = (id) => {
  return $.ajax({
    url: "api/notes/" + id,
    method: "DELETE",
  });
};

// If there is an activeNote, display it, otherwise render empty inputs
const renderActiveNote = () => {
  $saveNoteBtn.hide();

  if (activeNote.id) {
    $noteTitle.attr("readonly", true);
    $noteText.attr("readonly", true);
    $noteTitle.val(activeNote.title);
    $noteText.val(activeNote.text);
  } else {
    $noteTitle.attr("readonly", false);
    $noteText.attr("readonly", false);
    $noteTitle.val("");
    $noteText.val("");
  }
};

// Get the note data from the inputs, save it to the db and update the view
const handleNoteSave = function () {
  const newNote = {
    title: $noteTitle.val(),
    text: $noteText.val(),
  };

  saveNote(newNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Delete the clicked note
const handleNoteDelete = function (event) {
  // prevents the click listener for the list from being called when the button inside of it is clicked
  event.stopPropagation();

  const note = $(this).parent(".list-group-item").data();

  if (activeNote.id === note.id) {
    activeNote = {};
  }

  deleteNote(note.id).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Sets the activeNote and displays it
const handleNoteView = function () {
  activeNote = $(this).data();
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = function () {
  activeNote = {};
  renderActiveNote();
};

// If a note's title or text are empty, hide the save button
// Or else show it
const handleRenderSaveBtn = function () {
  if (!$noteTitle.val().trim() || !$noteText.val().trim()) {
    $saveNoteBtn.hide();
  } else {
    $saveNoteBtn.show();
  }
};

// Render's the list of note titles
const renderNoteList = (notes) => {
  $noteList.empty();

  const noteListItems = [];

  // Returns jquery object for li with given text and delete button
  // unless withDeleteButton argument is provided as false
  const create$li = (text, withDeleteButton = true) => {
    const $li = $("<li class='list-group-item'>");
    const $span = $("<span>").text(text);
    $li.append($span);

    if (withDeleteButton) {
      const $delBtn = $(
        "<i class='fas fa-trash-alt float-right text-danger delete-note'>"
      );
      $li.append($delBtn);
    }
    return $li;
  };

  if (notes.length === 0) {
    noteListItems.push(create$li("No saved Notes", false));
  }

  notes.forEach((note) => {
    const $li = create$li(note.title).data(note);
    noteListItems.push($li);
  });

  $noteList.append(noteListItems);
};

// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () => {
  return getNotes().then(renderNoteList);
};

$saveNoteBtn.on("click", handleNoteSave);
$noteList.on("click", ".list-group-item", handleNoteView);
$newNoteBtn.on("click", handleNewNoteView);
$noteList.on("click", ".delete-note", handleNoteDelete);
$noteTitle.on("keyup", handleRenderSaveBtn);
$noteText.on("keyup", handleRenderSaveBtn);

app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});


// Gets and renders the initial list of notes
getAndRenderNotes();
