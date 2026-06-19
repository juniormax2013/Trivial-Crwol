const admin = require('firebase-admin');

// Initialize firebase-admin
admin.initializeApp({
  projectId: "trivial-app-bcrown"
});

const db = admin.firestore();

async function check() {
  console.log("Reading global_main via admin SDK...");
  const docRef = db.collection("chats").doc("global_main");
  try {
    const snap = await docRef.get();
    console.log("global_main exists:", snap.exists);
    if (snap.exists) {
      console.log("global_main data:", snap.data());
    }
  } catch (e) {
    console.error("Failed to read global_main:", e);
  }
}

check();
