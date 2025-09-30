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
  const { currentUser } = useAuth();
  const [isActiveSub, setisActiveSub] = useState(false);
  const membershipTiers = useContentful(getMembershipTiers)?.content?.items;

  const isSubscriptionActive = (subscription: Subscription): boolean => {
    const created = new Date(subscription?.startDate);
    const expires = new Date(created);
    expires.setDate(created.getDate() + subscription?.duration);

    const now = new Date();
    return now < expires;
  };

  useEffect(() => {
    if (currentUser && currentUser?.subscription?.subscription === "free-trial") {
      const isActive = isSubscriptionActive(currentUser?.subscription);
      setisActiveSub(isActive);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isActiveSub !== currentUser?.subscription?.isActiveSub) {
      // update currentUser and updateUser

      console.log(isActiveSub);
      console.log(currentUser?.subscription?.isActiveSub);
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
              ...tier,
              priceId: tier.fields.yearlyPriceId,
              medCredits: tier.fields.yearlyMeditationCredits,
              id: tier.fields.yearlyId,
              price: tier.fields.yearlyPrice,
              title: tier.fields.title,
              billing: tier.fields.yearlyBilling,
            },
          ];
        return [...acc, tier.fields];
      }, []);
      dispatch(setMembershipTiers(membershipObjects));
    }
  }, [membershipTiers]);

  return <div>{children}</div>;
};

export default UserManager;
