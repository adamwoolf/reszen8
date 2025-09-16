import { AppDispatch } from "./reduxStore";
import { setMeta, setMeditations, setStaticMeditations } from "./contentSlice";
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
