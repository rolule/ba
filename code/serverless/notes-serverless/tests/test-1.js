import http from "k6/http";
import { sleep } from "k6";

const apiUrl = "https://6wxqnxn37k.execute-api.eu-central-1.amazonaws.com/dev";
const notesUrl = `${apiUrl}/notes`;

export const options = {
  stages: [{ duration: "10m", target: 1 }],
};

export default function main() {
  // 1. GET all notes
  http.get(notesUrl);

  sleep(1);
}
