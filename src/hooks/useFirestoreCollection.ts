// hooks/useRealtimeDatabase.ts
import { useEffect, useState, useCallback } from "react";
import { getDatabase, ref, onValue, set, update, remove, off } from "firebase/database";
import { db } from "../firebase"; // Adjust path to your firebase config

type Data = any;

export const useRealtimeDatabase = (path: string) => {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const dbRef = ref(db, path);
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        setData(snapshot.val());
        setLoading(false);
      },
      (err) => {
        console.error("Realtime DB error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => off(dbRef); // Cleanup
  }, [path]);

  const addOrUpdate = useCallback(
    async (id: string, value: any) => {
      try {
        await set(ref(db, `${path}/${id}`), value);
      } catch (err) {
        console.error("Add/Update error:", err);
        setError(err);
      }
    },
    [path]
  );

  const patch = useCallback(
    async (id: string, updates: any) => {
      try {
        await update(ref(db, `${path}/${id}`), updates);
      } catch (err) {
        console.error("Patch error:", err);
        setError(err);
      }
    },
    [path]
  );

  const deleteDocument = useCallback(
    async (id: string) => {
      try {
        await remove(ref(db, `${path}/${id}`));
      } catch (err) {
        console.error("Delete error:", err);
        setError(err);
      }
    },
    [path]
  );

  return {
    data,
    loading,
    error,
    addOrUpdate,
    patch,
    deleteDocument,
  };
};

export default useRealtimeDatabase;
