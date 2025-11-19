# Maritime Casualties Heatmap

A proof-of-concept web application for visualizing maritime casualty incidents on an interactive map with heatmap and individual incident markers.

## Features

- **Interactive Map**: MapLibre GL JS with free OpenStreetMap tiles
- **Heatmap Visualization**: Aggregated view of incident density
- **Individual Markers**: Color-coded by casualty type with detailed popups
- **Advanced Filtering**:
  - Date range selection
  - Multi-select casualty type filters
  - Toggle between heatmap and marker views
- **Light/Dark Mode**: Seamless theme switching
- **Simple Authentication**: Password-protected access
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Fast build tool
- **TailwindCSS** - Styling
- **MapLibre GL JS** - Free mapping library
- **PapaParse** - CSV parsing
- **Lucide React** - Icons

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` and set your password:

```
VITE_APP_PASSWORD=your_secure_password
```

3. Run development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Deployment to Render.com

1. Create a new **Static Site** on Render.com
2. Connect your repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_APP_PASSWORD` with your password
6. Deploy!

## Data

The application uses a 3.4MB CSV file (`merged.csv`) containing ~8,700 maritime casualty incidents. Each incident includes:

- Vessel information (name, IMO, flag, type)
- Casualty details (type, date, description)
- Location data (first and last AIS positions of the day)

Incidents without location data are automatically filtered out. The app calculates midpoints between first/last positions and displays circular areas to reflect positional uncertainty.

## Casualty Types

The app supports 15 casualty types, each with distinct colors:

- Other, Mechanical Fault, Engine Fault
- Collision, Beached/Grounded, Fire
- Medical Emergency, Sank, Detained/Arrested
- War Damage, Piracy, Cargo Loss
- Capsize, Electrical Fault, Man Overboard
