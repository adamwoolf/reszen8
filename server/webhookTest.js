// webhookTest.js
import "dotenv/config";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testWebhook() {
  try {
    // 1️⃣ Create test customer
    const customer = await stripe.customers.create({
      email: "testuser@example.com",
      name: "Test User",
    });
    console.log("Customer created:", customer.id);

    // 2️⃣ Create test payment method using Stripe test token
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: { token: "tok_visa" }, // Stripe test token
    });

    // 3️⃣ Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });

    // 4️⃣ Set as default payment method for invoices/subscriptions
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethod.id },
    });

    // 5️⃣ Create subscription (with cancellation at period end)
    const priceId = "price_1SCjP9RpZB60VN5hWQdAoIwv"; // Replace with your test price ID
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      metadata: {
        uid: "testuser123",
        meditationCredits: "20",
        hasCompletedTrial: "true",
      },
      cancel_at_period_end: true, // simulate a cancellation at the end of term
      expand: ["latest_invoice.payment_intent"], // ensures invoice has payment_intent
    });
    console.log("Subscription created:", subscription.id);

    // 6️⃣ Retrieve the first invoice from the subscription
    const invoice = subscription.latest_invoice;
    console.log("Invoice ID:", invoice.id);

    // 7️⃣ Pay the invoice manually only if it's not already paid
    if (!invoice.paid) {
      const paidInvoice = await stripe.invoices.pay(invoice.id);
      console.log("Invoice paid:", paidInvoice.id);
    } else {
      console.log("Invoice already paid, webhook should have been triggered automatically.");
    }

    // 8️⃣ OPTIONAL: simulate subscription period ending immediately
    // This triggers customer.subscription.updated with cancel_at_period_end = true
    // so your Lambda can test setting active: false without waiting for the billing period
    const simulatedUpdate = await stripe.subscriptions.update(subscription.id, {
      metadata: { ...subscription.metadata, simulated_period_end: "true" },
      // No actual payment change; this just triggers the webhook for testing
    });
    console.log("Simulated subscription update:", simulatedUpdate.id);

    console.log("✅ Webhook should now handle resetting meditationCredits and checking subscription active status.");
  } catch (err) {
    console.error("Error testing webhook:", err);
  }
}

testWebhook();
