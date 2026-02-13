import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;
    const couponId = process.env.STRIPE_COUPON_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!secretKey || !priceId || !couponId || !appUrl) {
      return NextResponse.json(
        {
          error:
            "Missing env vars. Need STRIPE_SECRET_KEY, STRIPE_PRICE_ID, STRIPE_COUPON_ID, NEXT_PUBLIC_APP_URL.",
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      discounts: [{ coupon: couponId }],
      success_url: `${appUrl}/success`,
      cancel_url: `${appUrl}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Stripe error" }, { status: 500 });
  }
}
