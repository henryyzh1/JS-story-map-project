import { SlideDeck, pointStyle } from "./slidedeck.js";

let plateLayer = null;

(async () => {
  const resp = await fetch("data/plate_boundaries.geojson");
  const boundaries = await resp.json();
  plateLayer = L.geoJSON(boundaries, {
    style: {
      color: "#4dc8fc",
      weight: 2,
      opacity: 0.8
    },
    onEachFeature: (feature, layer) => {
      const props = feature.properties;
      if (props && props.Name) {
        const nameFormatted = props.Name.replace(":", " & ");
        layer.bindPopup(`<b>${nameFormatted}</b>`);
      }
    }
  });
})();

const map = L.map("map", {
  scrollWheelZoom: false,
  maxBounds: [[-85, -180], [85, 180]], // clamp to world extent
  maxBoundsViscosity: 1.0,              // hard clamp
  worldCopyJump: false,
  noWrap: true,
  minZoom: 2.5,
  maxZoom: 8
}).setView([15, 160], 3); // Pacific-centered

// ## The Base Tile Layer
L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/512/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoieXpoNzExIiwiYSI6ImNrbm9qeDN2YzE1Mzkyb3Fqa2QzdnRkOHEifQ.oBvJLn0dPTaxCuBgr5OHyQ", {
  minZoom: 2.5,
  maxZoom: 8,
  zoomOffset: -1,
  tileSize: 512,
  noWrap: true,
  bounds: [[-85, -180], [85, 180]],
  attribution: "© <a href=\"https://www.mapbox.com/\">Mapbox</a>"
}).addTo(map);

map.on("moveend", () => {
  map.panInsideBounds(map.options.maxBounds, { animate: true });
});

// ## Interface Elements
const container = document.querySelector(".slide-section");
const slides = document.querySelectorAll(".slide");

const slideOptions = {
  "second-slide": {
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, pointStyle(feature)),
    onAdd: (map, dataLayer) => {
      if (plateLayer) {
        map.addLayer(plateLayer);
        map._plateLayer = plateLayer;
      }
    },
    onRemove: (map) => {
      if (map._plateLayer) {
        map.removeLayer(map._plateLayer);
        map._plateLayer = null;
      }
    },
    onEachFeature: (feature, layer) => {
      const props = feature.properties;
      const content = `
        <b>${props.place || "Unknown Location"}</b><br>
        Magnitude: ${props.magnitudo || "N/A"}<br>
        Depth: ${props.depth || "N/A"} km<br>
        Date: ${(props.date || "N/A").replace("T"," ").replace("Z","")}<br>
        Territory: ${props.state || "N/A"}
      `;
      layer.bindPopup(content);
    },
  },
  "third-slide": {
    pointToLayer: (feature, latlng) => {
      const props = feature.properties;
      const radius = Math.max(2, Math.sqrt(props.significance || 0) / 7);
      const style = pointStyle(feature);
      return L.circleMarker(latlng, {
        ...style,
        radius: radius
      });
    },
    onAdd: (map, dataLayer) => {
      if (plateLayer) {
        map.addLayer(plateLayer);
        map._plateLayer = plateLayer;
      }
    },
    onRemove: (map) => {
      if (map._plateLayer) {
        map.removeLayer(map._plateLayer);
        map._plateLayer = null;
      }
    },
    onEachFeature: (feature, layer) => {
      const props = feature.properties;
      const content = `
        <b>${props.place || "Unknown Location"}</b><br>
        Magnitude: ${props.magnitudo || "N/A"}<br>
        Depth: ${props.depth || "N/A"} km<br>
        Date: ${(props.date || "N/A").replace("T"," ").replace("Z","")}<br>
        Territory: ${props.state || "N/A"}<br>
        Tsunami: ${props.tsunami === 1 ? "Generated" : "Not generated"}<br>
        Significance: ${props.significance || "N/A"}
      `;
      layer.bindPopup(content);
    }
  },
};

// ## The SlideDeck object
const deck = new SlideDeck(container, slides, map, slideOptions);

document.addEventListener("scroll", () => deck.calcCurrentSlideIndex());

deck.preloadFeatureCollections();
deck.syncMapToCurrentSlide();
