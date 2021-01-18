import { randomTimeout } from "./libs/randomTimeout";

export const main = async (event, context) => {
  const id = event.pathParameters.id;
  const noteToUpdate = JSON.parse(event.body);

  // create item in database
  await randomTimeout();
  const updatedNote = { id, ...noteToUpdate };

  return {
    statusCode: 200,
    body: JSON.stringify(updatedNote),
  };
};
