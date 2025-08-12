import React from "react";
// import { getAudioDownloadUrl } from "./firebaseAudio";

import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../firebase"; // your firebase init

export async function getAudioDownloadUrl(path) {
  const audioRef = ref(storage, path); // e.g. "meditations/file.mp3"
  return await getDownloadURL(audioRef);
}

export default function MakeAvailableOfflineButton({ path }) {
  const handleClick = async () => {
    try {
      // 1. Get correct URL from Firebase Storage
      const url = await getAudioDownloadUrl(path);

      // 2. Send message to SW to cache it
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "CACHE_URL",
          url,
        });
      }

      alert("Audio is now available offline!");
    } catch (err) {
      console.error("Error making audio offline:", err);
      alert("Failed to make offline");
    }
  };

  return <button onClick={handleClick}>Make Available Offline</button>;
}
