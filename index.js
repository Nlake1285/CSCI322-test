require('dotenv').config();
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");

const { onSchedule } = require("firebase-functions/v2/scheduler");
const axios = require('axios');
const params = {};

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

const firebaseConfig = {
    apikey: process.env.APIKEY,
    authDomain: process.env.AUTHDOMAIN,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGINGSENDERID,
    appId: process.env.APPID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const docRef = db.collection('Facts').doc('Cat');

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
exports.pubsub = onSchedule("0 0 * * *", async (event) => {
    await axios.get('https://meowfacts.herokuapp.com/?count=3', {params})
        .then(response => {
            const apiResponse = response.data;
            logger.info("meowfacts payload", apiResponse);
            return docRef.set({
                current: apiResponse,
            });
        }).catch(error => {
            console.log(error);
        })
})

// Test function to make sure I'm not going crazy
// exports.pubsubHttp = onRequest(async (req, res) => {
//     try {
//         const response = await axios.get('https://meowfacts.herokuapp.com/?count=3', {params});
//         const apiResponse = response.data;
//         logger.info("meowfacts payload", apiResponse);
//         await docRef.set({
//             current: apiResponse,
//         });
//         res.status(200).send({ ok: true, current: apiResponse });
//     } catch (error) {
//         logger.error("pubsubHttp error", error);
//         res.status(500).send({ ok: false, error: "Failed to fetch or write data" });
//     }
// });