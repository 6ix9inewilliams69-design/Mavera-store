# MAVÉRA

Premium furniture and home-living storefront for the Kenyan market. Built with Next.js and Supabase.

## Features
- Editorial homepage with responsive black, white and beige visual identity
- Live product and category catalogue from Supabase
- Product order requests saved to `orders`
- Store/contact enquiries saved to `store_enquiries`
- Kenyan shilling price formatting

## Local setup
1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` using the Supabase project URL and publishable key.
4. Run `npm run dev`.

Never put a Supabase service-role or secret key in a `NEXT_PUBLIC_*` variable or browser code.

## Deploy on Vercel
Import this repository, select the Next.js preset, and add the two environment variables above for Production and Preview. Deploy after the GitHub files are committed.

Products only appear after a store administrator adds categories and marks products as published in Supabase. The website does not invent a physical store address or contact number.
