/**
 * Shared Firebase SDK instances.
 * This file is isomorphic and can be imported by both Client and Server components.
 */
import { initializeFirebase } from "@/firebase";

const { firebaseApp: app, auth, firestore: db } = initializeFirebase();

export { app, auth, db };
