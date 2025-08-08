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

    const staticMeds: Meditation[] = staticMs?.map(({ fields, sys }: Meditation) => ({
      audioUrl: fields.audioFile.fields.file.url,
      type: fields.type,
      title: fields.title,
      id: sys.id,
      likes: likes?.find((l) => l.id === sys.id)?.likes,
      content: fields.content,
      category: categoriser(`${fields.title}`),
    }));
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
    return [...staticMeds, ...normalized].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }
);
