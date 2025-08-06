import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import useFirebasedatabase from "../hooks/useFirestoreCollection";
import { Subscription, User } from "../models";
import { useNavigate } from "react-router-dom";
import useFirebaseDatabase from "../hooks/useFirestoreCollection";

const UserManager = ({ children }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addOrUpdate, data: users } = useFirebasedatabase("USERS");
  const [isActiveSub, setisActiveSub] = useState(false);

  const isSubscriptionActive = (subscription: Subscription): boolean => {
    const created = new Date(subscription?.startDate);
    const expires = new Date(created);
    expires.setDate(created.getDate() + subscription?.duration);

    const now = new Date();
    return now < expires;
  };

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
