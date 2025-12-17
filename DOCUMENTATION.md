# Project Documentation

## Overview

This document provides technical details about the Government Effectiveness & Happiness Data Visualization project.

## Architecture

### Frontend Stack

- **D3.js v7**: Core visualization library for data manipulation and SVG rendering
- **Mapbox GL JS v3**: Interactive map rendering and geographic visualizations
- **Bootstrap 4**: Responsive grid system and UI components
- **jQuery**: DOM manipulation and event handling
- **Font Awesome 6**: Icon library for UI elements

### File Organization

```
src/
├── index.html                    # Landing/intro page
├── html/                         # Main application pages
│   ├── homepage.html            # Choropleth map visualization
│   └── individualCountry.html   # Country detail view
├── css/                         # Stylesheets
│   ├── homepage.css
│   └── individualCountry.css
├── js/                          # JavaScript modules
│   ├── config.js               # Configuration (gitignored)
│   ├── config.example.js       # Configuration template
│   ├── homepage/               # Homepage visualization modules
│   │   ├── chloropleth_map.js  # Map rendering and Mapbox integration
│   │   ├── colour_scale.js     # Color scale generation
│   │   ├── data_cleaning.js    # Data preprocessing and normalization
│   │   ├── map_event_handler.js # Map interaction handlers
│   │   └── animation_event_handlers.js # Timeline animation
│   └── individualCountry/      # Country detail page modules
│       ├── data_processing.js   # Data aggregation and filtering
│       ├── dataKeyHandling.js   # Data attribute management
│       ├── drawHelperFunctions.js # SVG drawing utilities
│       ├── individualCountry.js  # Main country page logic
│       └── infographics.js      # Infographic generation
└── data/                        # Datasets (CSV)
    ├── world_bank.csv
    ├── WorldHappinessRaw.csv
    └── wgidataset_stata/
```

## Data Processing Pipeline

### 1. Data Loading

Both datasets are loaded asynchronously using D3's `d3.csv()` method:

```javascript
let promises = [
  d3.csv(world_bank_data_path, worldBankFilter),
  d3.csv(happiness_data_path, happinessFilter),
];
Promise.all(promises).then(ready, error);
```

### 2. Data Filtering

Custom filter functions clean the data during load:

- Remove incomplete records
- Parse numeric values
- Standardize country names
- Convert dates

### 3. Data Normalization

All numeric attributes are normalized to [0,1] range:

```
normalized_value = (value - min) / (max - min)
```

This allows fair comparison between attributes with different scales.

### 4. Data Intersection

Only countries present in both datasets are included (approximately 128 countries).

### 5. Correlation Calculation

The key metric is calculated as:

```
correlation_value = government_effectiveness - life_ladder
```

Where both values are normalized. Result range: [-1, 1]

## Visualization Components

### Choropleth Map (Homepage)

**Technology**: Mapbox GL JS v3

**Features**:

- Dynamic layer coloring based on correlation values
- Hover tooltips showing country details
- Click navigation to detail page
- Search functionality (Mapbox Geocoder)
- Zoom and pan controls

**Color Scale**:

- Diverging scale (red → white → green)
- Red: negative correlation (-1)
- White: neutral (0)
- Green: positive correlation (+1)
- User-customizable via color pickers

**Map Projections**:

- Mercator (default): Better for detailed analysis
- Globe: Better for geographic context

**Animation System**:

- Timeline: 2005-2021
- Frame-by-frame updates
- Forward/backward controls
- Play/pause functionality

### Country Detail Page

**Components**:

1. **Infographics** (2x)

   - Compare country vs global average
   - Display normalized values for GE and LL
   - Visual indicators (above/below average)

2. **Circular Treemaps** (2x)

   - Interactive attribute selectors
   - Size encodes attribute value
   - One for happiness metrics, one for governance
   - Click to select attributes for line graph

3. **Line Graph**

   - Time series comparison
   - Dual-axis for different metrics
   - D3 line generator
   - Interactive legend

4. **Year Slider**
   - Filter treemap data by year
   - Range: 2005-2021
   - Does not affect line graph

## Key Algorithms

### Normalization Function

```javascript
function normaliseDataset(dataset, starting_elements_to_skip) {
  let columns_to_normalise = Object.keys(dataset[0]).slice(
    starting_elements_to_skip
  );

  columns_to_normalise.forEach((column_name) => {
    let extent = d3.extent(dataset, (d) => d[column_name]);
    let min = extent[0];
    let max = extent[1];
    let range = max - min;

    dataset.forEach((d_record) => {
      d_record[column_name] = (d_record[column_name] - min) / range;
    });
  });

  return dataset;
}
```

### Color Scale Generation

```javascript
function createColourScale(colour_map) {
  return d3.scaleLinear().domain([-1, 0, 1]).range(colour_map);
}
```

### Map Layer Creation

For each country, a Mapbox layer is created:

```javascript
mapBox.addLayer({
  id: country_name,
  source: "country_borders",
  "source-layer": "country_boundaries",
  type: "fill",
  filter: ["==", ["get", "iso_3166_1"], country_code],
  paint: {
    "fill-color": correlation_color,
    "fill-opacity": 0.7,
  },
});
```

## Event Handling

### Map Interactions

- **Hover**: Show tooltip with country name and correlation value
- **Click**: Navigate to country detail page with country name in URL parameter
- **Search**: Mapbox Geocoder integration for country lookup

### Animation Controls

- **Play/Pause**: Toggle animation state
- **Forward**: Increment year
- **Backward**: Decrement year
- **Auto-advance**: Timer-based progression (1 second intervals)

### Color Picker Events

- **Input**: Real-time color scale update
- Triggers full map re-render with new colors

## Data Attributes

### World Happiness Report

Key attributes used:

- `Life Ladder`: Primary happiness metric (0-10 scale)
- `Log GDP per capita`: Economic indicator
- `Social support`: Community strength
- `Healthy life expectancy`: Health metric
- `Freedom to make life choices`: Personal freedom
- `Generosity`: Charitable giving
- `Perceptions of corruption`: Trust in institutions

### World Governance Indicators

Key attributes used:

- `Government Effectiveness`: Primary governance metric
- `Voice and Accountability`: Democratic participation
- `Political Stability`: Absence of violence/terrorism
- `Regulatory Quality`: Policy quality
- `Rule of Law`: Legal system strength
- `Control of Corruption`: Transparency

## Performance Considerations

### Optimization Strategies

1. **Data Preprocessing**: Normalize once at load time
2. **Layer Management**: Reuse Mapbox layers where possible
3. **Event Throttling**: Debounce hover events
4. **Selective Rendering**: Only update changed elements

### Known Bottlenecks

- Initial data load (2 CSV files, ~500KB total)
- Map re-renders during animation
- Multiple layer creation (128+ layers)

## Browser Compatibility

### Supported

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features

- ES6 JavaScript
- CSS3
- SVG
- WebGL (for Mapbox)
- Fetch API
- Promises

## Security Notes

### API Keys

- Mapbox token required
- Stored in `config.js` (gitignored)
- Should have URL restrictions in production

### CORS

- Data files served from same origin
- No cross-origin requests except CDN libraries

### Content Security Policy

Recommended CSP headers for production:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://d3js.org https://api.mapbox.com https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://api.mapbox.com https://cdn.jsdelivr.net;
  img-src 'self' data: https://*.mapbox.com;
  connect-src 'self' https://api.mapbox.com;
```

## Future Enhancements

### Potential Improvements

1. **Unified Dashboard**: Combine both pages into single view
2. **Data Comparison**: Side-by-side country comparison
3. **Data Updates**: Integrate post-2021 data
4. **Export Features**: Download visualizations as PNG/SVG
5. **Sharing**: Generate shareable links with state
6. **Accessibility**: Enhanced keyboard navigation, ARIA labels
7. **Performance**: Web Workers for data processing
8. **Testing**: Automated unit and integration tests
9. **Mobile**: Touch-optimized interactions
10. **Analytics**: Track user interactions

### Technical Debt

- Repeated data processing across pages
- Global variable usage
- Limited error handling
- No state management system
- Manual DOM manipulation

## Development Workflow

### Local Development

1. Make changes to source files
2. Test in browser (Live Server auto-reloads)
3. Check console for errors
4. Test across different browsers
5. Commit changes with descriptive messages

### Deployment

For static hosting (GitHub Pages, Netlify, etc.):

1. Ensure `config.js` has production token
2. Set URL restrictions on Mapbox token
3. Test in production-like environment
4. Deploy files from `/src` directory
5. Monitor for console errors in production

## References

### Data Sources

- World Happiness Report: https://worldhappiness.report/
- World Governance Indicators: https://info.worldbank.org/governance/wgi/

### Libraries

- D3.js: https://d3js.org/
- Mapbox GL JS: https://docs.mapbox.com/mapbox-gl-js/
- Bootstrap: https://getbootstrap.com/
- Font Awesome: https://fontawesome.com/

### Design References

- Shneiderman's Information Seeking Mantra
- Munzner's Visualization Analysis Framework
- Choropleth map best practices
- Color theory for data visualization
