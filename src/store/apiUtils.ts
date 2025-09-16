import { AWS_DB_ENDPOINT } from "../constants";

export async function getMeditationItems(userId: string) {
  const res = await fetch(`${AWS_DB_ENDPOINT}/bespokeMeditations?user_id=${encodeURIComponent(userId)}`);
  const data = await res.json();
  return data.items;
}

export async function getStaticMeditations() {
  const res = await fetch(`${AWS_DB_ENDPOINT}/staticMeditations`);
  const data = await res.json();
  return data.items;
}

export async function getAWSArticles() {
  const res = await fetch(`${AWS_DB_ENDPOINT}/getArticles`);
  const data = await res.json();
  return data.items;
}

export const deleteBespokeMed = async (userId: string, uid: string) => {
  await fetch(`${AWS_DB_ENDPOINT}/deleteBespokeMed`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, uid }),
  });
};

// utils/meditations.ts
export const updateMeditationDeleteStatus = async (userId: string, uid: string, markForDeletion: boolean) => {
  try {
    const response = await fetch(`${AWS_DB_ENDPOINT}/updateMeditationDeleteStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include auth token if your API requires it
        // "Authorization": `Bearer ${userToken}`
      },
      body: JSON.stringify({
        user_id: userId,
        uid,
        action: markForDeletion ? "mark" : "recover",
      }),
    });

    const data = await response.json();
    console.log(data);
    if (!response.ok) {
      throw new Error(data.error || "Failed to update meditation delete status");
    }
    await getMeditationItems(userId);
    console.info("retrieved bespoke meditations");
    return data; // usually contains confirmation info
  } catch (err) {
    console.error("updateMeditationDeleteStatus error:", err);
    throw err;
  }
};
