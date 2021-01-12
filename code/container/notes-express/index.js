const express = require("express");
var bodyParser = require("body-parser");

const randomTimeout = (onResolve) => {
  const randomTime = 2000;

  return new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(randomTime);
    }, randomTime)
  );
};

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

const app = express();
app.use(bodyParser.json());

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
  console.log(note);

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
  const { id } = req.params;
  const noteToCreate = req.body;

  // create item in database
  await randomTimeout();
  const createdNote = { ...noteToCreate, id: notes.length };

  res.send(createdNote);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
