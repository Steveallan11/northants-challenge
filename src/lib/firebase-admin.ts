import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getAdminConfig(): ServiceAccount | null {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

export function hasFirebaseAdmin() {
  return Boolean(getAdminConfig());
}

export function getFirebaseAdminApp() {
  const config = getAdminConfig();
  if (!config) {
    throw new Error("Missing Firebase Admin configuration.");
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert(config),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  return getApps()[0];
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}
