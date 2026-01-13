import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Subscription } from "../models";
import { useDispatch } from "react-redux";
import { getAWSArticles, getMeditationItems, getStaticMeditations } from "../store/apiUtils";
import {
  setArticles,
  setMeditations,
  setStaticMeditations,
  setMembershipTiers,
  setCollectionImages,
} from "../store/contentSlice";
import useContentful from "../hooks/useContentful";
import { getMembershipTiers, getCollectionImages } from "../contentful";

const UserManager = ({ children }) => {
  const dispatch = useDispatch();
  const { currentUser, setCurrentUser } = useAuth();
  const [isActiveSub, setisActiveSub] = useState(false);

  const isSubscriptionActive = (subscription: Subscription): boolean => {
    const created = new Date(subscription.startDate); // already ms
    const expires = new Date(created.getTime() + subscription.duration * 24 * 60 * 60 * 1000);

    return Date.now() < expires.getTime();
  };

  useEffect(() => {
    getCollectionImages().then((data) => {
      dispatch(setCollectionImages(data));
    });
  }, []);

  useEffect(() => {
    // console.log(currentUser);
    if (currentUser && currentUser?.subscription?.subscription === "free-trial") {
      const isActive = isSubscriptionActive(currentUser?.subscription);
      setisActiveSub(isActive);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && isActiveSub !== currentUser?.subscription?.isActiveSub) {
      setCurrentUser({ ...currentUser, subscription: { ...currentUser.subscription, isActiveSub } });
    }
  }, [isActiveSub]); // Removed currentUser to prevent infinite loop

  useEffect(() => {
    getAWSArticles().then((data) => {
      dispatch(setArticles(data));
    });
    if (currentUser && currentUser.uid) {
      getMeditationItems(currentUser.uid).then((data) => {
        if (data) {
          dispatch(setMeditations(data));
        }
      });
    }
    getStaticMeditations().then((data) => {
      if (data) {
        dispatch(setStaticMeditations(data));
      }
    });
  }, [currentUser]);

  useEffect(() => {
    getMembershipTiers().then((data) => {
      const membershipObjects = data.reduce((acc, tier) => {
        if (tier.yearlyPriceId)
          acc = [
            ...acc,
            {
              priceId: tier.yearlyPriceId,
              meditationCredits: tier.yearlyMeditationCredits,
              id: tier.yearlyId,
              price: tier.yearlyPrice,
              title: tier.title,
              planName: tier.title,
              billing: tier.yearlyBilling,
              description: tier.description,
              planCredits: tier.yearlyMeditationCredits,
              subId: tier.id,
              size: tier.id,
              planId: tier.id,
            },
          ];
        return [
          ...acc,
          {
            ...tier,
            meditationCredits: tier.medCredits,
            subId: tier.id,
            planName: tier.title,
          },
        ];
      }, []);
      dispatch(setMembershipTiers(membershipObjects));
    });
  }, []);

  return <div>{children}</div>;
};

export default UserManager;
