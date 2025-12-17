import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Function to get geolocation data from IP address
async function getGeolocationFromIP(ipAddress: string) {
  try {
    // Skip geolocation for localhost or private IPs
    if (ipAddress === "unknown" || ipAddress.startsWith("127.") || ipAddress.startsWith("192.168.") || ipAddress.startsWith("10.")) {
      return { country: null, city: null };
    }

    // Use ip-api.com free service (45 requests per minute limit)
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,city`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      return { country: null, city: null };
    }

    const data = await response.json();
    
    if (data.status === "success") {
      return {
        country: data.country || null,
        city: data.city || null,
      };
    }

    return { country: null, city: null };
  } catch (error) {
    console.error("Error fetching geolocation:", error);
    return { country: null, city: null };
  }
}

// Function to detect device type from user agent
function detectDevice(userAgent: string): string | null {
  if (!userAgent || userAgent === "unknown") return null;
  
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

// Function to detect browser from user agent
function detectBrowser(userAgent: string): string | null {
  if (!userAgent || userAgent === "unknown") return null;
  
  const ua = userAgent.toLowerCase();
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("edg")) return "Edge";
  if (ua.includes("opera") || ua.includes("opr")) return "Opera";
  return "Other";
}

// GET - Smart redirect: automatically detect if it's a product detail or affiliate link
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Case-sensitive search for the link by shortUrl
    // PostgreSQL'de case-sensitive arama için BINARY veya exact match kullanılır
    // Prisma'da case-sensitive arama için exact match kullanıyoruz
    
    // Case-sensitive search for the link by shortUrl
    // PostgreSQL'de case-sensitive arama için exact match kullanıyoruz
    const link = await prisma.affiliateLink.findFirst({
      where: { 
        shortUrl: slug, // Exact match (case-sensitive in PostgreSQL)
        isActive: true,
      },
      select: {
        id: true,
        shortUrl: true,
        originalUrl: true,
      },
    });

    if (!link) {
      return NextResponse.redirect(new URL("/not-found", request.url), { status: 302 });
    }

    // Get client IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded
      ? forwarded.split(",")[0].trim()
      : request.headers.get("x-real-ip") || "unknown";

    // Get user agent
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Get referrer
    const referrer = request.headers.get("referer") || request.headers.get("referrer") || null;

    // Get geolocation data (async, but don't wait for it to redirect)
    const geolocationPromise = getGeolocationFromIP(ipAddress);
    const device = detectDevice(userAgent);
    const browser = detectBrowser(userAgent);

    // Get geolocation data
    const { country, city } = await geolocationPromise;

    // Create click record (async, don't wait for it)
    prisma.click
      .create({
        data: {
          linkId: link.id,
          ipAddress,
          userAgent,
          referrer,
          country,
          city,
          device,
          browser,
        },
      })
      .catch((error) => {
        console.error("Error creating click record:", error);
      });

    // Increment click count (async, don't wait for it)
    prisma.affiliateLink
      .update({
        where: { id: link.id },
        data: { clickCount: { increment: 1 } },
      })
      .catch((error) => {
        console.error("Error incrementing click count:", error);
      });

    // Smart redirect logic (geni.us style):
    // Always redirect to product detail page if frontend URL is configured
    // This matches the geni.us/EfAPH pattern where all links go to product pages
    const frontendBaseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL;
    
    if (frontendBaseUrl) {
      // Redirect to product detail page (like geni.us)
      const productUrl = `${frontendBaseUrl}/product/${link.shortUrl}`;
      return NextResponse.redirect(productUrl, { status: 302 });
    } else {
      // Fallback: redirect to original affiliate URL if frontend not configured
      return NextResponse.redirect(link.originalUrl, { status: 302 });
    }
  } catch (error: any) {
    console.error("Error processing redirect:", error);
    // Redirect to not-found page on error
    return NextResponse.redirect(new URL("/not-found", request.url), { status: 302 });
  }
}

