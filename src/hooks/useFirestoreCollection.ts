// hooks/useFirestoreCollection.js
import { useEffect, useState, useCallback } from "react";
import { collection, addDoc, onSnapshot, updateDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path to your Firebase config

export const useFirestoreCollection = (collectionName) => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch documents and listen for changes
  useEffect(() => {
    // const unsubscribe = onSnapshot(
    //   collection(db, collectionName),
    //   (snapshot) => {
    //     const data = snapshot.docs.map((doc) => ({
    //       id: doc.id,
    //       ...doc.data(),
    //     }));
    //     console.log("FB DATA", data);
    //     setDocs(data);
    //     setLoading(false);
    //   },
    //   (err) => {
    //     console.error("Firestore error:", err);
    //     setError(err);
    //     setLoading(false);
    //   }
    // );
    // return () => unsubscribe();
  }, [collectionName]);

  // Add new document
  // const addDocument = useCallback(
  //   async (data) => {
  //     console.log("ADD data", data);
  //     try {
  //       await addDoc(collection(db, collectionName), data);
  //     } catch (err) {
  //       console.error("Add doc error:", err);
  //       setError(err);
  //     }
  //   },
  //   [collectionName]
  // );

  const addDocument = (data) => {
    console.log(data);
  };

  // Update a document by ID
  const updateDocument = useCallback(
    async (id, updatedData) => {
      try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, updatedData);
      } catch (err) {
        console.error("Update doc error:", err);
        setError(err);
      }
    },
    [collectionName]
  );

  return {
    documents: docs,
    loading,
    error,
    addDocument,
    updateDocument,
  };
};
