import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCZG-Wjzl2rdOtBDWz0gAsx0D1s3aXIog4",
  authDomain: "herbtrade-ai.firebaseapp.com",
  projectId: "herbtrade-ai",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123456def7890",
};

const app = initializeApp(firebaseConfig);
export { app };
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); 