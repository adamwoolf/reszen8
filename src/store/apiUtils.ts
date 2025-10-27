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
    if (!response.ok) {
      throw new Error(data.error || "Failed to update meditation delete status");
    }
    await getMeditationItems(userId);
    return data; // usually contains confirmation info
  } catch (err) {
    console.error("updateMeditationDeleteStatus error:", err);
    throw err;
  }
};

export async function createCheckoutSession(uid, priceId, mode = "subscription", metadata = {}) {
  const res = await fetch(`${AWS_DB_ENDPOINT}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, priceId, mode, metadata }),
  });
  const data = await res.json();
  return data; // contains Stripe sessionId
}

export async function switchSubscription(uid, newPriceId, updates) {
  const res = await fetch(`${AWS_DB_ENDPOINT}/switch-subscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, newPriceId, updates }),
  });
  console.log(res);
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Failed to switch subscription");
  }
  return res.json();
}

export async function cancelSubscription(uid, cancelAtPeriodEnd = true) {
  const res = await fetch(`${AWS_DB_ENDPOINT}/cancel-subscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, cancelAtPeriodEnd }),
  });
  return res.json();
}

export const getUser = async (id: string) => {
  const res = await fetch(`${AWS_DB_ENDPOINT}/GetUser?uid=${id}`);
  const json = res.json();
  return json;
};
