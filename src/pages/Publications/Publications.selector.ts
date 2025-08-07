import { createSelector } from "@reduxjs/toolkit";
import { Like, Publication } from "../../models";

export const getPublicationsWithLikes = createSelector(
  (state) => state.content.publications,
  (state) => state.content.meta.LIKES,
  (publications: Publication[], likes: Like[]) => {
    const pubsWithLikes = publications.map((pub) => {
      const numLikes = likes.find((like: Like) => like.id === pub.sys.id)?.likes || 0;
      return { ...pub, likes: numLikes };
    });
    return pubsWithLikes.sort((a, b) => b.likes - a.likes);
  }
);
