import { createSelector } from "@reduxjs/toolkit";
import { Meditation, Like } from "../../models";
import { getMeditations, getMeditationLikes } from "../../store/contentSelectors";
import { categoriser } from "../../Util";
export const getMeditationsWithLikes = createSelector(
  getMeditations,
  (state) => state.content.staticMeditations,
  (meditations: any[], staticMs): Meditation[] => {
    if (!meditations && !staticMs) return [];

    const normalized = Object.values(meditations).map((med: Meditation) => {
      return {
        ...med,
        contentType: "meditation",
        category: categoriser(`${med.title}-${med.content}`),
      };
    });
    const staticMeds = Object.keys(staticMs).map((key: string) => {
      return {
        ...staticMs[key],
        contentType: "meditation",
        category: categoriser(`${staticMs[key].title}-${staticMs[key].content}`),
      };
    });

    return [...staticMeds, ...normalized].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }
);
