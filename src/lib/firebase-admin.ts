import * as admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
            adminDb = admin.firestore();
            adminAuth = admin.auth();
            console.log("Firebase Admin Initialized successfully.");
        } else {
            console.warn("Firebase Admin Initialization skipped: Missing environment variables.");
        }
    } catch (error) {
        console.error('Firebase Admin Initialization error', error);
    }
} else {
    adminDb = admin.firestore();
    adminAuth = admin.auth();
}

export { adminDb, adminAuth };
