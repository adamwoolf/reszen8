import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Subscription, User } from "../models";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getAWSArticles, getMeditationItems, getStaticMeditations } from "../store/apiUtils";
import { setArticles, setMeditations, setStaticMeditations } from "../store/contentSlice";

const UserManager = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isActiveSub, setisActiveSub] = useState(false);

  const isSubscriptionActive = (subscription: Subscription): boolean => {
    const created = new Date(subscription?.startDate);
    const expires = new Date(created);
    expires.setDate(created.getDate() + subscription?.duration);

    const now = new Date();
    return now < expires;
  };

  useEffect(() => {
    const isActive = isSubscriptionActive(currentUser?.subscription);
    setisActiveSub(isActive);
    // if (currentUser && !isActive) navigate("/members");
  }, [currentUser]);

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

  return <div>{children}</div>;
};

export default UserManager;
