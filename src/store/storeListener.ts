// store/databaseListener.ts

import { AppDispatch } from "./reduxStore";
import { setMeta, setMeditations, setStaticMeditations } from "./contentSlice";
import { AWS_DB_ENDPOINT } from "../constants";

export async function getMeditationItemsREST() {
  const res = await fetch(`${AWS_DB_ENDPOINT}/bespokeMeditations`);
  const data = await res.json();
  return data.items;
}

export async function getStaticMeditationsREST() {
  const res = await fetch(`${AWS_DB_ENDPOINT}/staticMeditations`);
  const data = await res.json();
  return data.items;
}

export async function getAWSArticles() {
  const res = await fetch(`${AWS_DB_ENDPOINT}/getArticles`);
  const data = await res.json();
  return data.items;
}
