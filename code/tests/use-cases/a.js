import http from "k6/http";
import { sleep } from "k6";

// Fargate: http://ec2co-ecsel-14dnyt6ihjqi3-1173665240.eu-central-1.elb.amazonaws.com
// Lambda : https://6wxqnxn37k.execute-api.eu-central-1.amazonaws.com/dev
const apiUrl = __ENV.API_URL;
const notes = `${apiUrl}/notes`;

// ±10% des Basiswertes schlafen
function think(base) {
  sleep(Math.random() * 0.2 + base - 0.1);
}

export default function main() {
  // 1. Alle notizen abrufen
  http.get(notes);

  // Nachdenken
  think(1);
}
