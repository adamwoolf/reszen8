import { createSelector } from "@reduxjs/toolkit";
import { Publication, Like } from "../models";
import { AudioObject } from "./contentSlice";

export const getPublications = createSelector(
  (state) => state.content,
  (pubs: Publication[]): Publication[] => pubs.publications
);

export const getMeditations = createSelector(
  (state) => state.content,
  (meds) => meds.meditations
);

export const getStaticMeditations = createSelector(
  (state) => state.content,
  (meds) => meds.staticMeditations
);

export const getMeta = createSelector(
  (state) => state.content,
  (meta) => meta.meta
);

export const getCurrentAudio = createSelector(
  (state) => state.content,
  (audio): AudioObject => audio.currentAudio
);

export const getPublicationLikes = createSelector(getMeta, (meta): Like[] => meta.LIKES);
export const getMeditationLikes = createSelector(getMeta, (meta): Like[] => meta.meditationLIKES);

export const getPlanById = createSelector(
  (state) => state.content.membershipTiers,
  (state, id: string) => id,
  (tiers: [], id: string) => tiers.find((t) => t.id === id)
);
