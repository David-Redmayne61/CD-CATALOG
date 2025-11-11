import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOHJtf7DRCw_xzyP5UqTjP_-HncV3CUM8",
  authDomain: "cd-catalog.firebaseapp.com",
  projectId: "cd-catalog",
  storageBucket: "cd-catalog.firebasestorage.app",
  messagingSenderId: "935352892439",
  appId: "1:935352892439:web:4cfee9ed01e4d82d077052"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface CD {
  id?: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  barcode?: string;
  coverUrl?: string;
  notes?: string;
  dateAdded: Date;
}

// Add a new CD to Firestore
export const addCD = async (cd: Omit<CD, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'cds'), {
      ...cd,
      dateAdded: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding CD:', error);
    throw error;
  }
};

// Get all CDs from Firestore
export const getCDs = async (): Promise<CD[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'cds'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateAdded: doc.data().dateAdded?.toDate() || new Date()
    } as CD));
  } catch (error) {
    console.error('Error getting CDs:', error);
    throw error;
  }
};

// Update a CD
export const updateCD = async (id: string, updates: Partial<CD>): Promise<void> => {
  try {
    const cdRef = doc(db, 'cds', id);
    await updateDoc(cdRef, updates);
  } catch (error) {
    console.error('Error updating CD:', error);
    throw error;
  }
};

// Delete a CD
export const deleteCD = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'cds', id));
  } catch (error) {
    console.error('Error deleting CD:', error);
    throw error;
  }
};

export { db };
