import { createSelector } from "@reduxjs/toolkit";
import { Like, Publication } from "../../models";
import { getPublications, getPublicationLikes } from "../../store/contentSelectors";
import { categoriser } from "../../Util";

export const getPublicationsWithLikes = createSelector(
  getPublications,
  (state) => state?.meta?.LIKES,
  (publications: Publication[], likes: Like[]) => {
    const pubsWithLikes = publications.map((pub) => {
      const category = categoriser(`${pub.fields.title} - ${pub.fields.body}`);
      // console.log(category?.[0]);
      const numLikes = likes?.find((like: Like) => like.id === pub.sys.id)?.likes || 0;
      return { ...pub, likes: numLikes, category: category };
    });
    return pubsWithLikes.sort((a, b) => b.likes - a.likes);
  }
);
