import { notes } from "./libs/notes";
import { randomTimeout } from "./libs/randomTimeout";

export const main = async (event, context) => {
  const id = event.pathParameters.id;

  // get item from database
  await randomTimeout();
  const note = notes.filter((n) => n.id == id);

  if (!note) {
    return {
      statusCode: 404,
      body: {
        message: `Note with id ${id} could not be found.`,
      },
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(note),
  };
};
