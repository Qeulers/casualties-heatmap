# Quick Start Guide

## Running Locally

1. **Install dependencies**:

```bash
npm install
```

2. **Set password** (already configured in `.env`):

```
VITE_APP_PASSWORD=demo123
```

3. **Start dev server**:

```bash
npm run dev
```

4. **Open browser**: http://localhost:5173

5. **Login**: Use password `demo123` (or whatever you set in `.env`)

## Using the App

### Login

- Enter the password configured in your `.env` file
- Click "Access Map"

### Map Controls

- **Zoom**: Scroll wheel or +/- buttons
- **Pan**: Click and drag
- **Click markers**: View incident details in popup

### Filters (Left Panel)

**Map Layers**:

- Toggle heatmap on/off
- Toggle individual incident markers on/off

**Date Range**:

- Set start and end dates to filter incidents
- Default shows all available data (2022-present)

**Casualty Types**:

- Check/uncheck types to show/hide
- Use "All" / "None" buttons for quick selection
- Each type has a unique color on the map

**Theme Toggle**:

- Click sun/moon icon to switch between light and dark mode
- Map style updates automatically

### Understanding the Visualization

**Heatmap**:

- Shows density of incidents
- Red = high concentration
- Blue = low concentration
- Dynamically updates based on active filters

**Individual Markers**:

- Circular areas (not precise points)
- Color-coded by casualty type
- Size represents uncertainty area
- Click for detailed information

**Incident Details** (in popup):

- Vessel name and type
- Casualty type and date
- Flag country
- Distance between first/last AIS positions
- Full incident description

## Data Notes

- **Total incidents**: ~8,700
- **Date range**: 2022-2025
- **Location accuracy**: Approximate (based on AIS positions)
- **Circular areas**: Represent uncertainty, not exact locations
- **Missing data**: Incidents without location data are excluded

## Tips

1. **Start broad**: View global heatmap first
2. **Zoom in**: Focus on specific regions
3. **Filter by type**: Analyze specific casualty types
4. **Compare periods**: Use date range to see trends
5. **Toggle layers**: Switch between heatmap and markers for different insights

## Keyboard Shortcuts

- **Shift + Drag**: Rotate map
- **Ctrl + Drag**: Tilt map (3D view)

## Performance

- Initial load: ~3-4 seconds (loading CSV)
- Filtering: Instant (client-side)
- Map rendering: Smooth up to ~5,000 visible incidents

## Troubleshooting

**Map not loading**:

- Check browser console for errors
- Verify internet connection (map tiles load from CDN)

**No incidents showing**:

- Check that at least one casualty type is selected
- Verify date range includes data
- Ensure both heatmap and markers aren't disabled

**Slow performance**:

- Disable heatmap if showing many incidents
- Zoom in to reduce visible markers
- Filter by date range or casualty type

## Next Steps

- See `README.md` for technical details
- See `DEPLOYMENT.md` for deployment instructions
- Modify `src/types.ts` to customize colors
- Edit `.env` to change password
