const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Detect if running locally
const isLocal = process.env.FUNCTIONS_EMULATOR === "true" || process.env.NODE_ENV !== "production";

// Firebase project ID (optional, for bucket naming)
const projectId = process.env.GCLOUD_PROJECT || "your-project-id";

let bucket;

if (isLocal) {
  // Local: use service account JSON
  const keyPath = path.join(__dirname, "serviceAccountKey.json");

  if (!fs.existsSync(keyPath)) {
    throw new Error(
      "Service account key not found at " +
        keyPath +
        ". Download it from Firebase Console → Project Settings → Service Accounts."
    );
  }

  const serviceAccount = require(keyPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${projectId}.appspot.com`,
  });

  bucket = admin.storage().bucket();
  console.log("Firebase Admin initialized locally with service account.");
} else {
  // Production: use default credentials provided by Firebase Functions
  admin.initializeApp({
    storageBucket: `${projectId}.appspot.com`,
  });

  bucket = admin.storage().bucket();
  console.log("Firebase Admin initialized using default credentials.");
}

module.exports = { admin, bucket };
