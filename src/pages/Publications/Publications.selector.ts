import { createSelector } from "@reduxjs/toolkit";
import { Like, Publication } from "../../models";
import { getPublications, getPublicationLikes } from "../../store/contentSelectors";

export const getPublicationsWithLikes = createSelector(
  getPublications,
  (state) => state?.meta?.LIKES,
  (publications: Publication[], likes: Like[]) => {
    const pubsWithLikes = publications.map((pub) => {
      const numLikes = likes?.find((like: Like) => like.id === pub.sys.id)?.likes || 0;
      return { ...pub, likes: numLikes };
    });
    return pubsWithLikes.sort((a, b) => b.likes - a.likes);
  }
);
