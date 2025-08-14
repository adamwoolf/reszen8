// store/databaseListener.ts
import { ref, onValue, off } from "firebase/database";
import { db, auth } from "../firebase";
import { AppDispatch } from "./reduxStore";
import { setMeta, setMeditations } from "./contentSlice";

const paths = {
  meta: "meta",
  meditations: "meditations",
};

const listeners: Record<string, () => void> = {};

const PROJECT_ID = "reszen8-1d832-default-rtdb"; // replace with your actual ID
const BASE_URL = `https://${PROJECT_ID}.firebaseio.com`;

async function fetchFromFirebase(path: string) {
  const token = await auth?.currentUser?.getIdToken();
  const url = `${BASE_URL}/${path}.json?auth=${token}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${path}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getMetaREST() {
  return fetchFromFirebase("meta");
}

export async function getMeditationItemsREST() {
  return fetchFromFirebase("meditations");
}

export const startDatabaseListeners = (offline: boolean) => (dispatch: AppDispatch) => {
  Object.entries(paths).forEach(([key, path]) => {
    const dbRef = ref(db, path);
    const handler = (snapshot: any) => {
      const data = snapshot.val() || {};
      switch (key) {
        case "meta":
          dispatch(setMeta(data));
          localStorage.setItem("myData", data);
          break;

        case "meditations":
          dispatch(setMeditations(data));
          localStorage.setItem("myData", data);

          break;

        default:
          break;
      }
    };

    const errorHandler = (err: any) => {
      console.log(err);
    };

    onValue(dbRef, handler, errorHandler);
    listeners[key] = () => off(dbRef); // Store cleanup function
  });
};

export const stopDatabaseListeners = () => {
  Object.values(listeners).forEach((unsubscribe) => unsubscribe());
};
