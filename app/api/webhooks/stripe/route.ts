import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { userSubscription } from "@/db/schema";
import db from "@/db/drizzle";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;
    
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!,
        );
        
        console.log("=== WEBHOOK RECEIVED ===");
        console.log("Event type:", event.type);
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Webhook error:", errorMessage);
        return new NextResponse(`Webhook error: ${errorMessage}`, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            
            if (!session?.metadata?.userId) {
                console.error("No userId in session metadata");
                return new NextResponse("User ID is required", { status: 400 });
            }

            // Fix: Use type assertion for subscription
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            ) as Stripe.Subscription;
            
            // Use camelCase property names (currentPeriodEnd, not current_period_end)
            const currentPeriodEnd = (subscription as any).current_period_end;
            // Debug log
            console.log("Subscription period end:", {
                currentPeriodEnd: currentPeriodEnd,
                as_date: new Date(currentPeriodEnd * 1000),
                as_string: new Date(currentPeriodEnd * 1000).toISOString()
            });
            
            await db.insert(userSubscription).values({
                userId: session.metadata.userId,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: subscription.items.data[0]?.price.id,
                stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
                isActive: true,
            }).onConflictDoUpdate({
                target: userSubscription.userId,
                set: {
                    stripeSubscriptionId: subscription.id,
                    stripeCustomerId: subscription.customer as string,
                    stripePriceId: subscription.items.data[0]?.price.id,
                    stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
                    isActive: true,
                }
            });
            
            console.log("Subscription created/updated for user:", session.metadata.userId);
            break;
        }
        
        case "invoice.payment_succeeded": {
            const invoice = event.data.object as Stripe.Invoice;
            
            const subscriptionId = (invoice as any).subscription;
            if (!subscriptionId) {
                console.error("No subscription ID in invoice");
                break;
            }
            
            const subscription = await stripe.subscriptions.retrieve(
                subscriptionId as string
            ) as Stripe.Subscription;
            
            const currentPeriodEnd = (subscription as any).current_period_end;
            await db.update(userSubscription)
                .set({
                    stripePriceId: subscription.items.data[0]?.price.id,
                    stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
                })
                .where(eq(userSubscription.stripeSubscriptionId, subscription.id));
            
            console.log("Invoice payment succeeded for subscription:", subscription.id);
            break;
        }
        
        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            
            await db.update(userSubscription)
                .set({
                    isActive: false,
                })
                .where(eq(userSubscription.stripeSubscriptionId, subscription.id));
            
            console.log("Subscription deleted:", subscription.id);
            break;
        }
        
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}