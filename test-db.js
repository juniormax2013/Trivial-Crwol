import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('.firebase/hosting.YnVpbGQ.cache', 'utf8')); // fake
// Wait, I can't easily query Firestore from node without credentials.
