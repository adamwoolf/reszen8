import { AWS_DB_ENDPOINT } from "../constants";
import { Meditation, Publication, User } from "../models";

interface ApiResponse<T> {
  items?: T[];
  error?: string;
}

export async function getMeditationItems(userId: string): Promise<Meditation[]> {
  const res = await fetch(`${AWS_DB_ENDPOINT}/bespokeMeditations?user_id=${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch meditations: ${res.statusText}`);
  }
  const data: ApiResponse<Meditation> = await res.json();
  return data.items || [];
}

export async function getStaticMeditations(): Promise<Meditation[]> {
  const res = await fetch(`${AWS_DB_ENDPOINT}/staticMeditations`);
  if (!res.ok) {
    throw new Error(`Failed to fetch static meditations: ${res.statusText}`);
  }
  const data: ApiResponse<Meditation> = await res.json();
  return data.items || [];
}

export async function getAWSArticles(): Promise<Publication[]> {
  const res = await fetch(`${AWS_DB_ENDPOINT}/getArticles`);
  if (!res.ok) {
    throw new Error(`Failed to fetch articles: ${res.statusText}`);
  }
  const data: ApiResponse<Publication> = await res.json();
  return data.items || [];
}

export const deleteBespokeMed = async (userId: string, uid: string): Promise<void> => {
  const res = await fetch(`${AWS_DB_ENDPOINT}/deleteBespokeMed`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, uid }),
  });

  if (!res.ok) {
    throw new Error(`Failed to delete meditation: ${res.statusText}`);
  }
};

interface UpdateStatusResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const updateMeditationDeleteStatus = async (
  userId: string,
  uid: string,
  markForDeletion: boolean
): Promise<UpdateStatusResponse> => {
  const response = await fetch(`${AWS_DB_ENDPOINT}/updateMeditationDeleteStatus`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      uid,
      action: markForDeletion ? "mark" : "recover",
    }),
  });

  const data: UpdateStatusResponse = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to update meditation delete status");
  }
  await getMeditationItems(userId);
  return data;
};

interface CheckoutSessionResponse {
  sessionId: string;
  url?: string;
  error?: string;
}

export async function createCheckoutSession(
  uid: string,
  priceId: string,
  mode: "subscription" | "payment" = "subscription",
  metadata: Record<string, string> = {}
): Promise<CheckoutSessionResponse> {
  const res = await fetch(`${AWS_DB_ENDPOINT}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, priceId, mode, metadata }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create checkout session: ${res.statusText}`);
  }

  const data: CheckoutSessionResponse = await res.json();
  return data;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmailSES(data: {
  email: string;
  subject: string;
  message: string;
}): Promise<EmailResponse> {
  const { email, subject, message } = data;
  const res = await fetch(`${AWS_DB_ENDPOINT}/ses-mail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: email,
      subject,
      message,
    }),
  });

  const result: EmailResponse = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to send email");
  return result;
}

interface SubscriptionUpdates {
  meditationCredits?: number;
  extraBespokeMeditationCredits?: number;
  [key: string]: unknown;
}

interface SubscriptionResponse {
  success: boolean;
  subscription?: unknown;
  error?: string;
}

export async function switchSubscription(
  uid: string,
  newPriceId: string,
  updates: SubscriptionUpdates
): Promise<SubscriptionResponse> {
  const res = await fetch(`${AWS_DB_ENDPOINT}/switch-subscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, newPriceId, updates }),
  });

  if (!res.ok) {
    const errData: SubscriptionResponse = await res.json();
    throw new Error(errData.error || "Failed to switch subscription");
  }

  return res.json();
}

export async function cancelSubscription(
  uid: string,
  cancelAtPeriodEnd = true
): Promise<SubscriptionResponse> {
  const res = await fetch(`${AWS_DB_ENDPOINT}/cancel-subscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, cancelAtPeriodEnd }),
  });

  if (!res.ok) {
    throw new Error(`Failed to cancel subscription: ${res.statusText}`);
  }

  return res.json();
}

export const getUser = async (id: string): Promise<User> => {
  const res = await fetch(`${AWS_DB_ENDPOINT}/GetUser?uid=${id}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch user: ${res.statusText}`);
  }

  const json: User = await res.json();
  return json;
};
