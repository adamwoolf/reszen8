// store/databaseListener.ts
import { ref, onValue, off } from "firebase/database";
import { db } from "../firebase";
import { AppDispatch } from "./reduxStore";
import { setMeta, setMeditations } from "./contentSlice";

const paths = {
  meta: "meta",
  meditations: "meditations",
};

const listeners: Record<string, () => void> = {};

export const startDatabaseListeners = () => (dispatch: AppDispatch) => {
  Object.entries(paths).forEach(([key, path]) => {
    const dbRef = ref(db, path);

    const handler = (snapshot: any) => {
      const data = snapshot.val() || {};
      switch (key) {
        case "meta":
          console.log(data);
          dispatch(setMeta(data));
          break;

        case "meditations":
          dispatch(setMeditations(data));
          break;
        default:
          break;
      }
    };

    const errorHandler = (err: any) => {
      console.log(err);
      // switch (key) {
      //   case "meta":
      //     dispatch(setMetaError(err));
      //     break;
      //   case "users":
      //     dispatch(setUsersError(err));
      //     break;
      //   case "settings":
      //     dispatch(setSettingsError(err));
      //     break;
      //   default:
      //     break;
      // }
    };

    onValue(dbRef, handler, errorHandler);
    listeners[key] = () => off(dbRef); // Store cleanup function
  });
};

export const stopDatabaseListeners = () => {
  Object.values(listeners).forEach((unsubscribe) => unsubscribe());
};
