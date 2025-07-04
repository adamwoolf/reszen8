import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import useFirebasedatabase from "../hooks/useFirestoreCollection";
import { Subscription, User } from "../models";
import { useNavigate } from "react-router-dom";

const UserManager = ({ children }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addOrUpdate, data: users } = useFirebasedatabase("USERS");
  const [isActiveSub, setisActiveSub] = useState(false);
  const [hasInitUser, setHasIniUser] = useState(false);
  // useEffect(() => {
  //   // MOVE THIS TO USER CONTEXT

  //   if (users && currentUser && !hasInitUser) {
  //     const allDetails: User | any = Object.values(users).find((u) => u.email === currentUser.email) || {};
  //     setCurrentUser({ ...currentUser, ...allDetails });
  //     setHasIniUser(true);
  //   }
  // }, [users, currentUser]);

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
    if (currentUser && !isActive) navigate("/members");
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser?.firebaseId) {
      addOrUpdate(currentUser.firebaseId, {
        ...currentUser,
        subscription: { ...currentUser?.subscription, isActiveSub },
      });
    }
  }, [isActiveSub]);

  return <div>{children}</div>;
};

export default UserManager;
