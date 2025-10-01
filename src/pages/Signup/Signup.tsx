import { useState } from "react";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import "./SignupStyles.scss";
import { useAuth } from "react-oidc-context";
import ThreeDotsLoader from "../../components/ThreeDotsLoads";
import { AWS_DB_ENDPOINT } from "../../constants";
import { loadStripe } from "@stripe/stripe-js";

const client = new CognitoIdentityProviderClient({ region: "eu-north-1" });

export default function Signup({ planId, tier, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"signup" | "confirm">("signup");
  const [message, setMessage] = useState("");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [userName, setUserName] = useState("");
  const auth = useAuth();
  const [waiting, setWaiting] = useState(false);
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

  const handleSignup = async (e: React.FormEvent) => {
    setWaiting(true);
    e.preventDefault();
    try {
      const command = new SignUpCommand({
        ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
        Username: userName,
        Password: password,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "username", Value: userName },
          { Name: "given_name", Value: givenName },
          { Name: "family_name", Value: familyName },
        ],
      });
      const response = await client.send(command);
      console.log("Signup response:", response);

      if (response.UserConfirmed) {
        setMessage("Signup successful! You can log in now.");
        // optional: redirect to login or start subscription
      } else {
        setStep("confirm"); // show confirmation code input
        setMessage("Check your email for the confirmation code.");
        setWaiting(false);
      }
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Signup failed.");
      setWaiting(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    setWaiting(true);

    e.preventDefault();
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
        Username: userName,
        ConfirmationCode: code,
      });
      await client.send(command);
      setMessage("Logging you in");
      onSuccess?.();
      maybeSavePlanIdAndLogin();
      setWaiting(false);
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Confirmation failed.");
      setWaiting(false);
    }
  };

  const maybeSavePlanIdAndLogin = async () => {
    if (planId !== "free-trial") {
      sessionStorage.setItem("pendingPlan", planId);
    }
    // free trial - nothing to buy so just log in
    auth.signinPopup({
      extraQueryParams: {
        login_hint: userName, // pre-fill the username/email
      },
    });
  };

  return (
    <div className='signup'>
      <h2 className=''>{step === "signup" ? "Create Account" : "Confirm Account"}</h2>

      <form className='signup-form' onSubmit={step === "signup" ? handleSignup : handleConfirm}>
        {step === "signup" && (
          <>
            <label className='signup-form-label'>Username </label>
            <input
              className='signup-form__input'
              placeholder='Enter username'
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            <label className='signup-form-label'>Email </label>

            <input
              className='signup-form__input'
              type='email'
              placeholder='Enter Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className='signup-form-label'>First Name </label>

            <input
              className='signup-form__input'
              placeholder='Enter First Name'
              value={givenName}
              onChange={(e) => setGivenName(e.target.value)}
              required
            />
            <label className='signup-form-label'>Family Name </label>

            <input
              className='signup-form__input'
              placeholder='Enter Family Name'
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              required
            />
            <label className='signup-form-label'>Password </label>

            <input
              className='signup-form__input'
              type='password'
              placeholder='Enter Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </>
        )}

        {step === "confirm" && (
          <>
            <label className='signup-form-label'>Confirmation Code </label>

            <input
              type='text'
              placeholder='Enter Confirmation Code'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className='signup-form__input'
            />
          </>
        )}

        <button className='signup-form__cta' type='submit'>
          {step === "signup" ? "Sign Up" : "Confirm"}
          {waiting && <ThreeDotsLoader />}
        </button>
      </form>
      <p className='signup-legal'>
        RESZEN8 is for ages 16 and up. By signing up, you confirm you meet this requirement. Please refer to our{" "}
        <a href='https://reszen8.com/terms-and-conditions' target='_blank'>
          Terms and Conditions
        </a>
      </p>
      {message && <p className=''>{message}</p>}
    </div>
  );
}
