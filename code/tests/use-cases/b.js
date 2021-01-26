import http from "k6/http";
import { sleep } from "k6";

/*
 * Use Case B: Notiz bearbeiten
 *
 * 1. Der Benutzer ruft alle Notizen ab.
 * 2. Er entscheidet sich eine Notiz bearbeiten und ruft die Notiz ab.
 * 3. Er bearbeitet die Notiz und speichert die Notiz ab.
 */

// Fargate: http://ec2co-ecsel-14dnyt6ihjqi3-1173665240.eu-central-1.elb.amazonaws.com
// Lambda : https://6wxqnxn37k.execute-api.eu-central-1.amazonaws.com/dev
const apiUrl = __ENV.API_URL;
const notes = `${apiUrl}/notes`;
const singleNote = `${notes}/1`;

// ±10% des Basiswertes schlafen
function think(base) {
  sleep(Math.random() * 0.2 + base - 0.1);
}

export default function main() {
  // 1. Alle Notizen abrufen
  http.get(notes);

  // Nachdenken
  think(1);

  // 2. Einzelne Notiz abrufen
  http.get(singleNote);

  // Notiz bearbeiten
  think(3);

  // 3. Bearbeitung beenden
  const updatedNote = { title: "Updated Note 1", content: "I am the updated content." };
  http.put(singleNote, JSON.stringify(updatedNote), { headers: { "Content-Type": "application/json" } });

  // Warten
  think(1);
}
