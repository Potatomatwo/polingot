"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscription } from "@/db/queries";

export const createStripeUrl = async () => {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        throw new Error("Unauthorized");
    }

    const returnURL = absoluteUrl("/shop");
    
    // Validate the URL before using it with Stripe
    
    try {
        new URL(returnURL);
    } catch (error) {
        console.error("Invalid URL generated:", returnURL);
        throw new Error(`Invalid return URL: ${returnURL}`);
    }

    const userSubscription = await getUserSubscription();

    if (userSubscription && userSubscription.stripeCustomerId) {
        const stripeSession = await stripe.billingPortal.sessions.create({
            customer: userSubscription.stripeCustomerId,
            return_url: returnURL,
        });
        return { data: stripeSession.url };
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
        throw new Error("User has no email address");
    }

    const stripeSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: userEmail,
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: "USD",
                    product_data: {
                        name: "Lingo Pro",
                        description: "Unlimited Hearts",
                    },
                    unit_amount: 2000,
                    recurring: {
                        interval: "month",
                    },
                },
            },
        ],
        metadata: {
            userId,
        },
        success_url: returnURL,
        cancel_url: returnURL,
    });

    if (!stripeSession.url) {
        throw new Error("No session URL returned from Stripe");
    }

    return { data: stripeSession.url };
};
