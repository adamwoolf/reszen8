import React, { useState } from "react";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import "./SignupStyles.scss";
import { useAuth } from "react-oidc-context";
import ThreeDotsLoader from "../../components/ThreeDotsLoads";
import { trackCTA } from "../../utils/analytics";
import Checkbox from "../../components/Checkbox/Checkbox";

const client = new CognitoIdentityProviderClient({ region: "eu-north-1" });

interface SignupProps {
  planId?: string;
  tier?: any;
  onSuccess?: () => void;
}

export default function Signup({ planId, tier, onSuccess }: SignupProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"signup" | "confirm">("signup");
  const [message, setMessage] = useState("");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const auth = useAuth();
  const [waiting, setWaiting] = useState(false);
  const [country, setCountry] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    trackCTA("Sign Up New User");
    e.preventDefault();
    setWaiting(true);

    try {
      const command = new SignUpCommand({
        ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
        Username: email, // use email as username
        Password: password,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "given_name", Value: givenName },
          { Name: "family_name", Value: familyName },
          { Name: "custom:country", Value: country },
        ],
      });

      const response = await client.send(command);
      console.log("Signup response:", response);

      if (response.UserConfirmed) {
        setMessage("Signup successful! You can log in now.");
      } else {
        setStep("confirm"); // show confirmation code input
        setMessage("Check your email for the confirmation code.");
      }
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Signup failed.");
    } finally {
      setWaiting(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaiting(true);
    trackCTA("New User Confirm Email");

    try {
      const command = new ConfirmSignUpCommand({
        ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
        Username: email, // email is username
        ConfirmationCode: code,
      });
      await client.send(command);

      setMessage("Logging you in");
      onSuccess?.();
      maybeSavePlanIdAndLogin();
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Confirmation failed.");
    } finally {
      setWaiting(false);
    }
  };

  console.log(planId);
  console.log(tier);
  const maybeSavePlanIdAndLogin = async () => {
    if (planId) {
      sessionStorage.setItem("pendingPlan", planId);
    }

    auth.signinRedirect({
      extraQueryParams: {
        login_hint: email, // pre-fill email
      },
    });
  };

  const handleCountryCheck = () => {
    setCountry(!country ? "GB" : "");
  };
  const passwordsNotTheSame = password !== password2 && password2 && password;

  return (
    <div className='signup'>
      <h2>{step === "signup" ? "Create Account" : "Confirm Account"}</h2>

      <form className='signup-form' onSubmit={step === "signup" ? handleSignup : handleConfirm}>
        {step === "signup" && (
          <>
            <div className='signup-form__country'>
              <label className='signup-form-label'>I live in the UK</label>
              <Checkbox checked={country === "GB"} size={32} onChange={handleCountryCheck} />
            </div>
            <label className='signup-form-label'>Email</label>
            <input
              className='signup-form__input'
              type='email'
              placeholder='Enter Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className='signup-form-label'>First Name</label>
            <input
              className='signup-form__input'
              placeholder='Enter First Name'
              value={givenName}
              onChange={(e) => setGivenName(e.target.value)}
              required
            />

            <label className='signup-form-label'>Family Name</label>
            <input
              className='signup-form__input'
              placeholder='Enter Family Name'
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              required
            />

            <label className='signup-form-label'>Password</label>
            <input
              className='signup-form__input'
              type='password'
              placeholder='Enter Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className='signup-form-label'>Confirm Password</label>
            <input
              className='signup-form__input'
              type='password'
              placeholder='Confirm Password'
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
            {passwordsNotTheSame && <span className='signup-form-message'>passwords do not match</span>}
          </>
        )}

        {step === "confirm" && (
          <>
            <label className='signup-form-label'>Confirmation Code</label>
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

        <button disabled={!!passwordsNotTheSame || !country} className='signup-form__cta' type='submit'>
          {step === "signup" ? "Sign Up" : "Confirm"}
          {waiting && <ThreeDotsLoader />}
        </button>
      </form>

      <p className='signup-legal'>
        RESZEN8 is for ages 16 and up. By signing up, you confirm you meet this requirement. Please refer to our{" "}
        <a href='https://reszen8.com/terms-and-conditions' target='_blank' rel='noreferrer'>
          Terms and Conditions
        </a>
      </p>

      {message && <p>{message}</p>}
    </div>
  );
}
