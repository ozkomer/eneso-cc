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
    
    // Try to find as AffiliateLink first
    let link = await prisma.affiliateLink.findFirst({
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

    // If not found as AffiliateLink, try case-insensitive search
    if (!link) {
      console.log(`AffiliateLink not found with case-sensitive search for slug: ${slug}, trying case-insensitive...`);
      const linkArray = await prisma.$queryRaw<Array<{ id: string; shortUrl: string; originalUrl: string }>>`
        SELECT id, "shortUrl", "originalUrl"
        FROM "AffiliateLink"
        WHERE LOWER("shortUrl") = LOWER(${slug})
        AND "isActive" = true
        LIMIT 1
      `;
      if (linkArray && linkArray.length > 0) {
        link = linkArray[0];
      }
    }

    // If still not found, try to find as CuratedList (case-sensitive first)
    if (!link) {
      console.log(`AffiliateLink not found, trying CuratedList for slug: ${slug}`);
      try {
        let list = await prisma.$queryRaw<Array<{ id: string; shortUrl: string; slug: string }>>`
          SELECT id, "shortUrl", slug
          FROM "CuratedList"
          WHERE "shortUrl" = ${slug}
          LIMIT 1
        `;

        // If not found, try case-insensitive
        if (!list || list.length === 0) {
          list = await prisma.$queryRaw<Array<{ id: string; shortUrl: string; slug: string }>>`
            SELECT id, "shortUrl", slug
            FROM "CuratedList"
            WHERE LOWER("shortUrl") = LOWER(${slug})
            LIMIT 1
          `;
        }

        if (list && list.length > 0) {
          // Found a list, track click and redirect to frontend list page
          const listId = list[0].id;
          
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

          // Create list click record (async, don't wait for it)
          prisma.listClick
            .create({
              data: {
                listId: listId,
                ipAddress,
                userAgent,
                referrer,
                country,
                city,
                device,
                browser,
                converted: false,
              },
            })
            .catch((error: any) => {
              console.error("Error creating list click record:", error);
            });

          // Increment list click count (async, don't wait for it)
          prisma.curatedList
            .update({
              where: { id: listId },
              data: { clickCount: { increment: 1 } },
            })
            .catch((error: any) => {
              console.error("Error incrementing list click count:", error);
            });

          const frontendBaseUrl = "https://enesozen.com";
          const listUrl = `${frontendBaseUrl}/list/${list[0].slug}`;
          console.log(`CuratedList found: ${listId}, redirecting to: ${listUrl}`);
          return NextResponse.redirect(listUrl, { status: 302 });
        }
      } catch (error: any) {
        console.error("Error querying CuratedList:", error.message);
        // Continue to 404 if CuratedList query fails
      }
    }

    if (!link) {
      console.log(`Link/List not found for slug: ${slug}`);
      // Return 404 instead of redirect to avoid redirect loops
      return new NextResponse(null, { status: 404 });
    }

    console.log(`AffiliateLink found: ${link.id}, shortUrl: ${link.shortUrl}, originalUrl: ${link.originalUrl ? 'exists' : 'null'}`);

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
      

    // Smart redirect logic:
    // Always redirect to product detail page (geni.us style)
    // This allows users to see product details before going to e-commerce site
    const frontendBaseUrl = "https://enesozen.com";
    
    // Safety check: ensure link has shortUrl
    if (!link.shortUrl) {
      console.error(`Link found but shortUrl is missing: ${link.id}`);
      return new NextResponse(null, { status: 404 });
    }
    
    // Always redirect to product detail page
    const productUrl = `${frontendBaseUrl}/product/${link.shortUrl}`;
    console.log(`Redirecting to product page: ${productUrl}`);
    return NextResponse.redirect(productUrl, { status: 302 });
  } catch (error: any) {
    console.error("Error processing redirect:", error);
    // Return 500 instead of redirect to avoid redirect loops
    return new NextResponse(null, { status: 500 });
  }
}

