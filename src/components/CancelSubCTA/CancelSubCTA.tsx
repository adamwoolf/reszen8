import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { AWS_DB_ENDPOINT } from "../../constants";

function CancelSubCTA() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { currentUser } = useAuth();

  const handleCancel = async () => {
    // if (!window.confirm("Are you sure you want to cancel your subscription?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${AWS_DB_ENDPOINT}/cancel-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: "include", // so Cognito cookies/JWT are sent
        body: JSON.stringify({
          userUid: currentUser.uid, // for DB later
          subscriptionId: currentUser?.subscription?.subscriptionId, // for Stripe lookup
        }),
      });

      if (!res.ok) throw new Error("Failed to cancel subscription");
      const data = await res.json();
      console.log(data);
      setMessage("Subscription canceled successfully.");
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button disabled={loading} onClick={handleCancel}>
        {loading ? "Cancelling..." : "Cancel Subscription"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CancelSubCTA;
