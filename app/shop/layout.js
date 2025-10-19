import Head from 'next/head';

export const metadata = {
  title: 'Shop Drops by Eklektik Mama | Abu Dhabi Mum Merch & UAE Mum Gifts',
  description: 'Shop Drops by Eklektik Mama — unapologetic merch for modern mums in the UAE. From funny tees to chaos-proof totes, it\'s motherhood with a wink (and no pastels in sight).',
  keywords: 'Eklektik Mama merch, Shop Drops by Eklektik Mama, Abu Dhabi mum merch, UAE mum gifts, Funny mum t-shirts UAE, Cool mum accessories, Motherhood merch UAE, Gifts for mums Abu Dhabi, Relatable mum merch, Eklektik Mama shop',
  openGraph: {
    type: 'website',
    url: 'https://eklektikmama.com/shop',
    title: 'Shop Drops by Eklektik Mama | Abu Dhabi Mum Merch & UAE Mum Gifts',
    description: 'Shop Drops by Eklektik Mama — unapologetic merch for modern mums in the UAE. From funny tees to chaos-proof totes, it\'s motherhood with a wink (and no pastels in sight).',
    images: [
      {
        url: 'https://eklektikmama.com/shop/headerBg.webp',
        width: 1200,
        height: 630,
        alt: 'Eklektik Mama Shop Drops',
      },
    ],
    siteName: 'Eklektik Mama',
    locale: 'en_AE',
  },
  twitter: {
    card: 'summary_large_image',
    url: 'https://eklektikmama.com/shop',
    title: 'Shop Drops by Eklektik Mama | Abu Dhabi Mum Merch & UAE Mum Gifts',
    description: 'Shop Drops by Eklektik Mama — unapologetic merch for modern mums in the UAE. From funny tees to chaos-proof totes, it\'s motherhood with a wink (and no pastels in sight).',
    images: ['https://eklektikmama.com/shop/headerBg.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  authors: [{ name: 'Eklektik Mama' }],
  creator: 'Eklektik Mama',
  publisher: 'Eklektik Mama',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://eklektikmama.com'),
  alternates: {
    canonical: '/shop',
  },
  other: {
    'geo.region': 'AE',
    'geo.placename': 'Abu Dhabi',
    'geo.position': '24.4539;54.3773',
    'ICBM': '24.4539, 54.3773',
  },
};

export default function ShopLayout({ children }) {
  return (
    <>
      <Head>
        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta name="author" content="Eklektik Mama" />
        <meta name="publisher" content="Eklektik Mama" />
        <meta name="copyright" content="Eklektik Mama" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="AE" />
        <meta name="geo.placename" content="Abu Dhabi" />
        <meta name="geo.position" content="24.4539;54.3773" />
        <meta name="ICBM" content="24.4539, 54.3773" />
        
        {/* Product Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            "name": "Eklektik Mama Shop",
            "description": "Shop Drops by Eklektik Mama — unapologetic merch for modern mums in the UAE. From funny tees to chaos-proof totes, it's motherhood with a wink (and no pastels in sight).",
            "url": "https://eklektikmama.com/shop",
            "logo": "https://eklektikmama.com/desktopLogo.png",
            "image": "https://eklektikmama.com/shop/headerBg.webp",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "AE",
              "addressLocality": "Abu Dhabi"
            },
            "sameAs": [
              "https://www.instagram.com/eklektikmama",
              "https://www.facebook.com/eklektikmama"
            ],
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "AED",
              "availability": "https://schema.org/InStock"
            },
            "keywords": "Eklektik Mama merch, Abu Dhabi mum merch, UAE mum gifts, Funny mum t-shirts UAE, Cool mum accessories, Motherhood merch UAE, Gifts for mums Abu Dhabi, Relatable mum merch, Eklektik Mama shop, honest motherhood merch, gifts for new mums UAE, motherhood apparel Abu Dhabi, mum slogan t-shirts, real talk motherhood gifts, UAE mum community, self-care gifts for mums UAE, mum-owned brand Abu Dhabi, modern motherhood store UAE, where to buy funny mum gifts UAE"
          })}
        </script>
        
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://eklektikmama.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Shop Drops",
                "item": "https://eklektikmama.com/shop"
              }
            ]
          })}
        </script>
        
        {/* FAQ Schema for Common Questions */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is Eklektik Mama merch?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Eklektik Mama merch is unapologetic merchandise for modern mums in the UAE. We offer funny t-shirts, cool accessories, and relatable gifts that celebrate motherhood with a wink and no pastels in sight."
                }
              },
              {
                "@type": "Question",
                "name": "Where can I buy funny mum gifts in Abu Dhabi?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can buy funny mum gifts and cool mum accessories directly from Eklektik Mama's online shop. We offer delivery across the UAE including Abu Dhabi, Dubai, and other Emirates."
                }
              },
              {
                "@type": "Question",
                "name": "What types of motherhood merch do you offer?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We offer a range of motherhood merchandise including funny mum t-shirts, chaos coordinator gear, BYOBaby merch, Eklektik AF membership gear, cool mum mugs, tote bags, and anti-perfect mum merch that celebrates real motherhood."
                }
              }
            ]
          })}
        </script>
      </Head>
      {children}
    </>
  );
}
