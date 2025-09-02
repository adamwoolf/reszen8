import { createSelector } from "@reduxjs/toolkit";
import { Meditation, Like } from "../../models";
import { getMeditations, getMeditationLikes } from "../../store/contentSelectors";
import { categoriser } from "../../Util";
export const getMeditationsWithLikes = createSelector(
  getMeditations,
  getMeditationLikes,
  (state) => state.content.staticMeditations,
  (meditations: any[], likes: Like[], staticMs): Meditation[] => {
    if (!meditations && !staticMs) return [];

    const normalized = Object.values(meditations)
      .reverse()
      ?.map((med: Meditation) => {
        return {
          ...med,
          contentType: "meditation",
          id: med.audioUrl,
          likes: likes?.find((l) => l.id === med.audioUrl)?.likes || 0,
          category: categoriser(`${med.title}-${med.body}`),
        };
      });
    const staticMeds = Object.keys(staticMs)
      .reverse()
      ?.map((key: string) => {
        return {
          ...staticMs[key],
          contentType: "meditation",
          id: staticMs[key].audioUrl,
          likes: likes?.find((l) => l.id === staticMs[key].audioUrl)?.likes || 0,
          category: categoriser(`${staticMs[key].title}-${staticMs[key].body}`),
          firebaseId: key,
        };
      });

    return [...staticMeds, ...normalized].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }
);
