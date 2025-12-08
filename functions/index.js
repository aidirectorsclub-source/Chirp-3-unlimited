/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

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
const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

admin.initializeApp();

// Callable function: set admin claim for a user by email
exports.makeAdmin = onCall({ region: "europe-west3" }, async (request) => {
    const context = request.auth;
    const data = request.data;

    if (!context) {
        throw new HttpsError("unauthenticated", "You must be signed in to call this function.");
    }

    // Verify caller is already an admin before allowing them to grant admin privileges
    if (context.token?.admin !== true) {
        throw new HttpsError("permission-denied", "Only admins can create other admins.");
    }

    // Rate limiting: 5 requests per minute per user
    const rateLimitRef = admin.firestore().collection('rateLimits').doc(context.uid);
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 5;

    try {
        const rateLimitDoc = await rateLimitRef.get();

        if (rateLimitDoc.exists) {
            const rateData = rateLimitDoc.data();
            // Filter requests within the time window
            const recentRequests = (rateData.requests || []).filter(
                timestamp => now - timestamp < windowMs
            );

            if (recentRequests.length >= maxRequests) {
                throw new HttpsError("resource-exhausted", "Rate limit exceeded. Please wait before trying again.");
            }

            // Update with new request timestamp
            await rateLimitRef.update({
                requests: [...recentRequests, now]
            });
        } else {
            // First request from this user
            await rateLimitRef.set({ requests: [now] });
        }
    } catch (rateLimitError) {
        if (rateLimitError.code === "resource-exhausted") {
            throw rateLimitError;
        }
        // Log but don't block if rate limit check fails
        console.warn("Rate limit check failed:", rateLimitError.message);
    }

    const email = data?.email;
    if (!email) {
        throw new HttpsError("invalid-argument", "Email is required.");
    }

    try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });
        return { message: `Admin claim set for ${email}` };
    } catch (error) {
        console.error("Error setting admin claim:", error);
        throw new HttpsError("internal", error.message || "Failed to set admin claim");
    }
});
