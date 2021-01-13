import { notes } from "./libs/notes";
import { randomTimeout } from "./libs/randomTimeout";

export const main = async (event, context) => {
  // get items from database
  await randomTimeout();

  return {
    statusCode: 200,
    body: JSON.stringify(notes),
  };
};
