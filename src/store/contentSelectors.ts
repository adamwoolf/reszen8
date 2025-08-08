import { createSelector } from "@reduxjs/toolkit";
import { Publication, Like } from "../models";

export const getPublications = createSelector(
  (state) => state.content.publications,
  (pubs: Publication[]): Publication[] => pubs
);

export const getMeditations = createSelector(
  (state) => state.content.meditations,
  (meds) => meds
);

export const getStaticMeditations = createSelector(
  (state) => state.content.staticMeditations,
  (meds) => meds
);

export const getMeta = createSelector(
  (state) => state.content.meta,
  (meta) => meta
);

export const getCurrentAudio = createSelector(
  (state) => state.content.currentAudio,
  (audio): string => audio
);

export const getPublicationLikes = createSelector(getMeta, (meta): Like[] => meta.LIKES);
export const getMeditationLikes = createSelector(getMeta, (meta): Like[] => meta.meditationLIKES);
