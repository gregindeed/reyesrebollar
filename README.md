# Reyes Rebollar Properties LLC - Portfolio Management

A modern real estate asset portfolio management platform built with Next.js 16, TypeScript, and shadcn/ui components.

## Features

- **Portfolio Overview Dashboard**: Real-time metrics showing total value, investment, equity, and returns
- **Property Management**: Comprehensive property cards with detailed information
- **Asset Filtering**: Filter properties by status (Active, Under Contract, etc.)
- **Professional UI**: Clean, modern interface using shadcn/ui components
- **Responsive Design**: Mobile-first design that works on all devices
- **Type Safety**: Full TypeScript implementation for robust code

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Getting Started

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with Header/Footer
│   └── page.tsx           # Portfolio dashboard page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Header.tsx        # Navigation header
│   ├── Footer.tsx        # Footer component
│   ├── MetricsCard.tsx   # Portfolio metrics display
│   └── PropertyCard.tsx  # Individual property display
├── lib/                   # Utility functions
│   ├── data/             # Mock data
│   │   └── properties.ts # Property listings
│   ├── portfolio-utils.ts # Calculation utilities
│   └── utils.ts          # General utilities
├── types/                 # TypeScript type definitions
│   └── property.ts       # Property-related types
└── public/               # Static assets
    └── images/           # Logo and images
```

## Portfolio Metrics

The dashboard calculates and displays:
- **Total Properties**: Count of all active and under-contract properties
- **Portfolio Value**: Current market value of all properties
- **Total Investment**: Sum of all purchase prices
- **Total Equity**: Portfolio value minus investment
- **Monthly Net Income**: Total rental income minus expenses
- **Annual Return**: ROI percentage based on net income

## Customization

### Adding Properties

Edit `lib/data/properties.ts` to add or modify properties in the portfolio.

### Styling

The project uses Tailwind CSS v4. Customize theme settings in `app/globals.css`.

## License

© 2025 Reyes Rebollar Properties LLC. All rights reserved.

## Contact

**Email**: info@reyesrebollar.com
