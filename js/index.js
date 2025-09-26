import { SlideDeck } from './slidedeck.js';

const map = L.map('map', {scrollWheelZoom: false}).setView([0, 0], 0);

// ## The Base Tile Layer
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/512/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoieXpoNzExIiwiYSI6ImNrbm9qeDN2YzE1Mzkyb3Fqa2QzdnRkOHEifQ.oBvJLn0dPTaxCuBgr5OHyQ', {
    minZoom: 2,
    maxZoom: 8,
    zoomOffset: -1,
    tileSize: 512,
    attribution: '© <a href="https://www.mapbox.com/">Mapbox</a>'
}).addTo(map);

// ## Interface Elements
const container = document.querySelector('.slide-section');
const slides = document.querySelectorAll('.slide');

const slideOptions = {
  'second-slide': {
    style: (feature) => {
      return {
        color: 'red',
        fillColor: 'green',
        fillOpacity: 0.5,
      };
    },
        onEachFeature: (feature, layer) => {
      layer.bindTooltip(feature.properties.label);
    },
  },
  'third-slide': {
    style: (feature) => {
      return {
        color: 'blue',
        fillColor: 'yellow',
        fillOpacity: 0.5,
      };
    },
        onEachFeature: (feature, layer) => {
      layer.bindTooltip(feature.properties.label);
    },    
  },
};

// ## The SlideDeck object
const deck = new SlideDeck(container, slides, map, slideOptions);

document.addEventListener('scroll', () => deck.calcCurrentSlideIndex());

deck.preloadFeatureCollections();
deck.syncMapToCurrentSlide();
