import { createSelector } from "@reduxjs/toolkit";
import { Meditation, Like } from "../../models";
import { getMeditations, getMeditationLikes, getStaticMeditations } from "../../store/contentSelectors";
import { categoriser } from "../../Util";

export const getStaticMeds = createSelector(getStaticMeditations, (staticMs): Meditation[] => {
  if (!staticMs) return [];

  const staticMeds = Object.keys(staticMs).map((key: string) => {
    return {
      ...staticMs[key],
      contentType: "meditation",
      category: categoriser(`${staticMs[key].title}-${staticMs[key].content}`),
    };
  });

  return [...staticMeds].sort((a, b) => (b.likes || 0) - (a.likes || 0));
});
