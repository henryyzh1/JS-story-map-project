# Earthquake Story Map

## Project Overview
This project is an interactive story map that visualizes global earthquakes of magnitude **6.0 and above** from 1990 to 2023.  
The map highlights the relationship between **earthquake epicenters** and **tectonic plate boundaries**, providing context to the distribution of seismic activity across the Pacific "Ring of Fire" and beyond.  

The story is divided into slides:
1. **Title Slide** – Introduces the dataset of global 6.0+ magnitude earthquakes.  
2. **Second Slide** – Shows the spatial relationship between earthquake epicenters and tectonic plate boundaries.  
3. **Third Slide** – Focuses on the most significant 7.5+ magnitude earthquakes, with marker radius scaled by significance and tsunami information included.  

## Data Sources
- **USGS Earthquake Catalog** (1990–2023, filtered by magnitude ≥ 6.0)  
  [https://www.kaggle.com/datasets/alessandrolobello/the-ultimate-earthquake-dataset-from-1990-2023/data](https://www.kaggle.com/datasets/alessandrolobello/the-ultimate-earthquake-dataset-from-1990-2023/data)  
- **USGS Plate Boundaries Dataset** – Extracted from KMZ and converted to GeoJSON  
  [https://earthquake.usgs.gov/learn/plate-boundaries.kmz](https://earthquake.usgs.gov/learn/plate-boundaries.kmz)  

## Technical Details
- Built with **Leaflet.js** for interactive mapping  
- **Mapbox Dark Monotone Basemap** for background tiles  
- Custom GeoJSON layers for earthquakes and tectonic plate boundaries  
- Popups provide earthquake details including date, magnitude, location, and tsunami occurrence  
- Legends dynamically adapt to the slide content (magnitude ranges and plate boundaries)  
- Deployed via **GitHub Pages**  

## How to Run
1. Clone this repository:  
   ```bash
   git clone https://github.com/your-username/JS-story-map-project.git
   cd JS-story-map-project
   ```
2. Open `index.html` in a web browser.  
3. Scroll through the story map to explore each slide.  

## Deployment
- The project is deployed via GitHub Pages.  
- Repository Settings → Pages → Source → `main` branch, root folder.  

## Acknowledgments
- Data provided by **USGS Earthquake Hazards Program**.  
- Built as part of **CPLN 6920: Java Script Programming for Planners and Designers** at the University of Pennsylvania.  