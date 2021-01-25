import { notes } from "./libs/notes";
import { randomTimeout } from "./libs/randomTimeout";

export const main = async (event, context) => {
  const noteToCreate = JSON.parse(event.body);

  // create item in database
  await randomTimeout();
  const newNote = { id: notes.length + 1, ...noteToCreate };

  return {
    statusCode: 200,
    body: JSON.stringify(newNote),
  };
};
