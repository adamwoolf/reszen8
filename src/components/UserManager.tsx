import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Subscription, User } from "../models";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getAWSArticles, getMeditationItems, getStaticMeditations } from "../store/apiUtils";
import { setArticles, setMeditations, setStaticMeditations, setMembershipTiers } from "../store/contentSlice";
import useContentful from "../hooks/useContentful";
import { getMembershipTiers } from "../contentful";

const UserManager = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();
  const [isActiveSub, setisActiveSub] = useState(false);
  const membershipTiers = useContentful(getMembershipTiers)?.content?.items;

  const isSubscriptionActive = (subscription: Subscription): boolean => {
    const created = new Date(subscription.startDate); // already ms
    const expires = new Date(created.getTime() + subscription.duration * 24 * 60 * 60 * 1000);

    return Date.now() < expires.getTime();
  };

  useEffect(() => {
    console.log(currentUser);
    if (currentUser && currentUser?.subscription?.subscription === "free-trial") {
      const isActive = isSubscriptionActive(currentUser?.subscription);
      setisActiveSub(isActive);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && isActiveSub !== currentUser?.subscription?.isActiveSub) {
      setCurrentUser({ ...currentUser, subscription: { ...currentUser.subscription, isActiveSub } });
    }
  }, [isActiveSub, currentUser]);

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
    if (membershipTiers) {
      const membershipObjects = membershipTiers.reduce((acc, tier) => {
        if (tier.fields.yearlyPriceId)
          acc = [
            ...acc,
            {
              priceId: tier.fields.yearlyPriceId,
              meditationCredits: tier.fields.yearlyMeditationCredits,
              id: tier.fields.yearlyId,
              price: tier.fields.yearlyPrice,
              title: tier.fields.title,
              planName: tier.fields.title,
              billing: tier.fields.yearlyBilling,
              description: tier.fields.description,
            },
          ];
        return [
          ...acc,
          {
            ...tier.fields,
            meditationCredits: tier.fields.medCredits,
            subId: tier.fields.id,
            planName: tier.fields.title,
          },
        ];
      }, []);
      console.log(membershipObjects);
      dispatch(setMembershipTiers(membershipObjects));
    }
  }, [membershipTiers]);

  return <div>{children}</div>;
};

export default UserManager;
