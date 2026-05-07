/** @type {import('next').NextConfig} */
// Configure DNS to prefer IPv4 for MongoDB Atlas connections
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

const nextConfig = {
    images: {
        domains: ['images.pexels.com', 'images.ctfassets.net', 'res.cloudinary.com', 'cdn.shopify.com']
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    }
                ]
            }
        ];
    },
    async redirects() {
        return [
            {
                source: '/local-edit',
                destination: '/the-local-edit',
                permanent: true
            },
            {
                source: '/local-edit/:slug',
                destination: '/the-local-edit/:slug',
                permanent: true
            }
        ];
    }
};

export default nextConfig;
