import { createSelector } from "@reduxjs/toolkit";
import { Like, Publication } from "../../models";
import { getPublications, getPublicationLikes } from "../../store/contentSelectors";
import { categoriser } from "../../Util";

export const getPublicationsWithLikes = createSelector(
  getPublications,
  (state) => state?.meta?.LIKES,
  (publications: Publication[], likes: Like[]) => {
    const pubsWithLikes = publications.map((pub) => {
      const category = categoriser(`${pub.title} - ${pub.body}`);
      // console.log(category?.[0]);
      return { ...pub, category: category };
    });
    return pubsWithLikes.sort((a, b) => b.likes - a.likes);
  }
);
