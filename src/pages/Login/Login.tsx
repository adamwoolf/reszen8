import React from "react";
import LoginForm from "../../components/LoginForm/LoginForm";
import "./LoginStyles.css";
import { useAuth } from "react-oidc-context";
import { useAuth as useAuthContext } from "../../contexts/AuthContext";
import "@aws-amplify/ui-react/styles.css";
import { Authenticator } from "@aws-amplify/ui-react";
import LoadingScene from "../../components/LoadingScene/LoadingScene";

const Login = () => {
  // <div className='login-container'>
  //   <LoginForm />
  // </div>
  const auth = useAuth();
  const { currentUser, setCurrentUser, signOutRedirect } = useAuthContext();
  console.log(import.meta.env.VITE_BASE_URL);

  if (auth.isLoading) {
    return <LoadingScene />;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    console.log(auth);
    return (
      <div>
        <pre>
          {" "}
          Hello: {auth.user?.profile.email}, {auth.user?.profile.given_name}, {auth.user?.profile.family_name}{" "}
        </pre>
        <pre> ID Token: {auth.user?.id_token} </pre>
        <pre> Access Token: {auth.user?.access_token} </pre>
        <pre> Refresh Token: {auth.user?.refresh_token} </pre>

        <button onClick={() => auth.removeUser()}>Sign out</button>
      </div>
    );
  }

  return (
    <div className='login-cta-container'>
      <button onClick={() => auth.signinPopup()}>Sign in</button>
      <button onClick={() => signOutRedirect()}>Sign out</button>
    </div>
  );
};

export default Login;
