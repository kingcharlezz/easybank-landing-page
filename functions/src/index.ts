/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const resetCounts = 
  functions.pubsub.schedule("0 0 1 * *").onRun(async (_) => {  // eslint-disable-line @typescript-eslint/no-unused-vars
  const db = admin.firestore();
  const usersRef = db.collection("users");

  const usersSnapshot = await usersRef.get();
  const batch = db.batch();

  usersSnapshot.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
    const userRef = usersRef.doc(doc.id);
    batch.update(userRef, {apiCounts: admin.firestore.FieldValue.delete()});
  });

  await batch.commit();
  console.log("API counts reset for all users.");

  return null;
});

