import { NextRequest, NextResponse } from "next/server";

// In-memory storage for demo (replace with database in production)
const subscribers = new Map<string, { email: string; name?: string; subscribedAt: Date; active: boolean }>();

// POST /api/newsletter - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if already subscribed
    if (subscribers.has(email.toLowerCase())) {
      const existing = subscribers.get(email.toLowerCase());
      
      if (existing?.active) {
        return NextResponse.json({
          success: true,
          message: "Already subscribed!",
          data: {
            email,
            subscribedAt: existing.subscribedAt,
          },
        });
      }
      
      // Reactivate
      existing.active = true;
      existing.subscribedAt = new Date();
      
      return NextResponse.json({
        success: true,
        message: "Welcome back! Your subscription has been reactivated.",
        data: { email, subscribedAt: existing.subscribedAt },
      });
    }

    // Add new subscriber
    subscribers.set(email.toLowerCase(), {
      email: email.toLowerCase(),
      name: name || undefined,
      subscribedAt: new Date(),
      active: true,
    });

    // In production, you would:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Add to email service (SendGrid, Mailchimp, etc.)

    console.log(`[Newsletter] New subscriber: ${email}${name ? ` (${name})` : ""}`);

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to FaceLove newsletter!",
      data: {
        email,
        subscribedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[Newsletter] Subscription error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/newsletter - Get subscriber info or check subscription status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (email) {
    // Check specific email subscription status
    const subscriber = subscribers.get(email.toLowerCase());
    
    if (!subscriber) {
      return NextResponse.json({
        success: true,
        data: { subscribed: false },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        subscribed: true,
        active: subscriber.active,
        subscribedAt: subscriber.subscribedAt,
      },
    });
  }

  // Return public stats (no sensitive data)
  const totalSubscribers = Array.from(subscribers.values()).filter(s => s.active).length;
  
  return NextResponse.json({
    success: true,
    stats: {
      totalSubscribers,
    },
  });
}

// DELETE /api/newsletter - Unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const subscriber = subscribers.get(email.toLowerCase());
    
    if (subscriber) {
      subscriber.active = false;
      
      return NextResponse.json({
        success: true,
        message: "Successfully unsubscribed from FaceLove newsletter.",
      });
    }

    return NextResponse.json({
      success: false,
      error: "Email not found in subscribers list.",
    }, { status: 404 });
  } catch (error) {
    console.error("[Newsletter] Unsubscription error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
