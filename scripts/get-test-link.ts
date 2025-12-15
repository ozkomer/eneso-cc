import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function getTestLink() {
  try {
    const link = await prisma.affiliateLink.findFirst({
      where: {
        isActive: true,
      },
      select: {
        shortUrl: true,
        originalUrl: true,
        title: true,
        clickCount: true,
      },
    });

    if (link) {
      console.log('\n✅ Test Link Bulundu:\n');
      console.log('Title:', link.title);
      console.log('Short URL:', link.shortUrl);
      console.log('Original URL:', link.originalUrl);
      console.log('Click Count:', link.clickCount);
      console.log('\n📍 Test URL:');
      console.log(`   http://localhost:4003/l/${link.shortUrl}`);
      console.log(`   https://eneso.cc/l/${link.shortUrl}`);
    } else {
      console.log('❌ Aktif link bulunamadı.');
    }
  } catch (error: any) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getTestLink();

