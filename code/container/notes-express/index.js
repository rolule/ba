const express = require("express");
var bodyParser = require("body-parser");

// does a timeout for 50ms
const randomTimeout = (onResolve) => {
  const randomTime = 50;

  return new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(randomTime);
    }, randomTime)
  );
};

// dummy data
const notes = [
  {
    id: 1,
    title: "Test note 1",
    content: "I am the test content.",
  },
  {
    id: 2,
    title: "Test note 2",
    content: "I am the test content.",
  },
  {
    id: 3,
    title: "Test note 3",
    content: "I am the test content.",
  },
  {
    id: 4,
    title: "Test note 4",
    content: "I am the test content.",
  },
  {
    id: 5,
    title: "Test note 5",
    content: "I am the test content.",
  },
];

// create server and use body parser middleware to access the request body
const app = express();
app.use(bodyParser.json());

// the port this app runs on in the container
const port = 80;

// get all notes
app.get("/notes", async (req, res) => {
  await randomTimeout();
  res.send(notes);
});

// get one note
app.get("/notes/:id", async (req, res) => {
  const { id } = req.params;

  await randomTimeout();
  const note = notes.find((note) => note.id == id);

  if (!note) {
    return res.send("Note could not be found");
  }

  res.send(note);
});

// update note
app.put("/notes/:id", async (req, res) => {
  const { id } = req.params;
  const noteToUpdate = req.body;

  // create item in database
  await randomTimeout();
  const updatedNote = { id, ...noteToUpdate };

  res.send(updatedNote);
});

// create note
app.post("/notes/", async (req, res) => {
  const noteToCreate = req.body;

  // create item in database
  await randomTimeout();
  const createdNote = { ...noteToCreate, id: notes.length };

  res.send(createdNote);
});

// server
app.listen(port, () => {
  console.log(`Notes express server running on http://localhost:${port}`);
});
