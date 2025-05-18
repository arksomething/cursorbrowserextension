import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore'; // Firestore imports 
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail 
} from 'firebase/auth';



const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyAoFNbP2JEGaLDHVjBKWB8bfquDlRlw12E",
  authDomain: "cursor-chrome-extension.firebaseapp.com",
  databaseURL: "https://cursor-chrome-extension-default-rtdb.firebaseio.com",
  projectId: "cursor-chrome-extension",
  storageBucket: "cursor-chrome-extension.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

export const signUp = async (name, email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;
        try {
            await setDoc(doc(db, "users", user.uid), {
                email: email,
                name: name,
                plan: "Free",
                createdAt: new Date(),
                credits: 50,
                requestSent: 0,
                premiumCredits: 0,
            })
        } catch (err) {
            alert(err);
        }
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorCode, errorMessage);
        // ..
    });
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }

};

export const signIn = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    return await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent!');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};


export { auth, db }; 