import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/LoginForm/LoginForm";
import "./LoginStyles.css";
import { useAuth } from "react-oidc-context";
import { useAuth as useAuthContext } from "../../contexts/AuthContext";
import "@aws-amplify/ui-react/styles.css";
import { Authenticator } from "@aws-amplify/ui-react";
import LoadingScene from "../../components/LoadingScene/LoadingScene";

const Login = () => {
  const auth = useAuth();
  const { currentUser, setCurrentUser, signOutRedirect } = useAuthContext();
  const navigate = useNavigate();

  // Redirect after successful authentication
  useEffect(() => {
    if (auth.isAuthenticated && currentUser) {
      const redirectPath = sessionStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath);
      } else {
        navigate("/journey");
      }
    }
  }, [auth.isAuthenticated, currentUser, navigate]);

  if (auth.isLoading) {
    return <LoadingScene />;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    // Show loading while redirecting
    return <LoadingScene />;
  }

  return (
    <div className='login-cta-container'>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
      <button onClick={() => signOutRedirect()}>Sign out</button>
    </div>
  );
};

export default Login;
