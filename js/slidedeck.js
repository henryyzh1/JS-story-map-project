/**
 * Returns the style object for a point feature.
 * @param {object} feature The GeoJSON feature
 * @return {object} The Leaflet circle marker style
 */
function pointStyle(feature) {
  // Magnitude-based coloring logic
  let mag = feature.properties && feature.properties.magnitudo !== undefined ? feature.properties.magnitudo : null;
  let fillColor = "#ffefcf";
  if (mag !== null) {
    if (mag >= 9.0) {
      fillColor = "#da2d2d";
    } else if (mag >= 8.0) {
      fillColor = "#ff7a00";
    } else if (mag >= 7.0) {
      fillColor = "#f7fd04";
    }
  }
  return {
    radius: 2,
    fillColor: fillColor,
    color: "#000",
    weight: 0,
    opacity: 1,
    fillOpacity: 0.8,
  };
}

/**
 * A slide deck object
 */
class SlideDeck {
  /**
   * Constructor for the SlideDeck object.
   * @param {Node} container The container element for the slides.
   * @param {NodeList} slides A list of HTML elements containing the slide text.
   * @param {L.map} map The Leaflet map where data will be shown.
   * @param {object} slideOptions The options to create each slide's L.geoJSON
   *                              layer, keyed by slide ID.
   */
  constructor(container, slides, map, slideOptions = {}) {
    this.container = container;
    this.slides = slides;
    this.map = map;
    this.slideOptions = slideOptions;

    this.dataLayer = L.layerGroup().addTo(map);
    this.legend = L.control({ position: 'bottomright' });
    this.legend.onAdd = function(map) {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.background = "rgba(255,255,255,0.8)";
      div.style.padding = "6px 8px";
      div.style.borderRadius = "4px";
      div.style.fontSize = "12px";
      div.style.marginBottom = "40px";
      const labels = ["≥7.0", "≥8.0", "≥9.0"];
      const colors = ["#f7fd04", "#ff7a00", "#da2d2d"];
      for (let i = 0; i < labels.length; i++) {
        div.innerHTML +=
          '<i style="background:' + colors[i] +
          '; width:12px; height:12px; display:inline-block; margin-right:6px;"></i> ' +
          labels[i] + '<br>';
      }
      return div;
    };
    this.currentSlideIndex = 0;
  }

  /**
   * ### updateDataLayer
   *
   * The updateDataLayer function will clear any markers or shapes previously
   * added to the GeoJSON layer on the map, and replace them with the data
   * provided in the `data` argument. The `data` should contain a GeoJSON
   * FeatureCollection object.
   *
   * @param {object} data A GeoJSON FeatureCollection object
   * @param {object} options Options to pass to L.geoJSON
   * @return {L.GeoJSONLayer} The new GeoJSON layer that has been added to the
   *                          data layer group.
   */
  updateDataLayer(data, options) {
    this.dataLayer.clearLayers();

    const defaultOptions = {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, pointStyle(feature)),
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        const content = `
          <b>${props.place || 'Unknown Location'}</b><br>
          Magnitude: ${props.magnitudo || 'N/A'}<br>
          Depth: ${props.depth || 'N/A'} km<br>
          Date: ${(props.date || 'N/A').replace('T',' ').replace('Z','')}<br>
          Country/Region: ${props.state || 'N/A'}
        `;
        layer.bindPopup(content);
      },
    };
    const geoJsonLayer = L.geoJSON(data, options || defaultOptions)
        .bindTooltip((l) => l.feature.properties.label)
        .addTo(this.dataLayer);

    return geoJsonLayer;
  }

  /**
   * ### getSlideFeatureCollection
   *
   * Load the slide's features from a GeoJSON file.
   *
   * @param {HTMLElement} slide The slide's HTML element. The element id should match the key for the slide's GeoJSON file
   * @return {object} The FeatureCollection as loaded from the data file
   */
  async getSlideFeatureCollection(slide) {
    const resp = await fetch(`data/${slide.id}.json`);
    const data = await resp.json();
    return data;
  }

  /**
   * ### hideAllSlides
   *
   * Add the hidden class to all slides' HTML elements.
   *
   * @param {NodeList} slides The set of all slide elements, in order.
   */
  hideAllSlides() {
    for (const slide of this.slides) {
      slide.classList.add('hidden');
    }
  }

  /**
   * ### syncMapToSlide
   *
   * Go to the slide that mathces the specified ID.
   *
   * @param {HTMLElement} slide The slide's HTML element
   */
  async syncMapToSlide(slide) {
    const collection = await this.getSlideFeatureCollection(slide);
    const options = this.slideOptions[slide.id];
    const layer = this.updateDataLayer(collection, options);

    /**
     * Create a bounds object from a GeoJSON bbox array.
     * @param {Array} bbox The bounding box of the collection
     * @return {L.latLngBounds} The bounds object
     */
    const boundsFromBbox = (bbox) => {
      const [west, south, east, north] = bbox;
      const bounds = L.latLngBounds(
          L.latLng(south, west),
          L.latLng(north, east),
      );
      return bounds;
    };

    /**
     * Create a temporary event handler that will show tooltips on the map
     * features, after the map is done "flying" to contain the data layer.
     */
    const handleFlyEnd = () => {
      if (slide.showpopups) {
        layer.eachLayer((l) => {
          l.bindTooltip(l.feature.properties.label, { permanent: true });
          l.openTooltip();
        });
      }
      this.map.removeEventListener('moveend', handleFlyEnd);
    };

    this.map.addEventListener('moveend', handleFlyEnd);
    if (collection.bbox) {
      this.map.flyToBounds(boundsFromBbox(collection.bbox));
    } else {
      this.map.flyToBounds(layer.getBounds());
    }

    if (slide.id === "title-slide") {
      if (!this.map.hasLayer(this.legend)) {
        this.legend.addTo(this.map);
      }
    } else {
      if (this.map.hasLayer(this.legend)) {
        this.map.removeControl(this.legend);
      }
    }
  }

  /**
   * Show the slide with ID matched by currentSlideIndex. If currentSlideIndex is
   * null, then show the first slide.
   */
  syncMapToCurrentSlide() {
    const slide = this.slides[this.currentSlideIndex];
    this.syncMapToSlide(slide);
  }

  /**
   * Increment the currentSlideIndex and show the corresponding slide. If the
   * current slide is the final slide, then the next is the first.
   */
  goNextSlide() {
    this.currentSlideIndex++;

    if (this.currentSlideIndex === this.slides.length) {
      this.currentSlideIndex = 0;
    }

    this.syncMapToCurrentSlide();
  }

  /**
   * Decrement the currentSlideIndes and show the corresponding slide. If the
   * current slide is the first slide, then the previous is the final.
   */
  goPrevSlide() {
    this.currentSlideIndex--;

    if (this.currentSlideIndex < 0) {
      this.currentSlideIndex = this.slides.length - 1;
    }

    this.syncMapToCurrentSlide();
  }

  /**
   * ### preloadFeatureCollections
   *
   * Initiate a fetch on all slide data so that the browser can cache the
   * requests. This way, when a specific slide is loaded it has a better chance
   * of loading quickly.
   */
  preloadFeatureCollections() {
    for (const slide of this.slides) {
      this.getSlideFeatureCollection(slide);
    }
  }

  /**
   * Calculate the current slide index based on the current scroll position.
   */
  calcCurrentSlideIndex() {
    const scrollPos = window.scrollY - this.container.offsetTop;
    const windowHeight = window.innerHeight;

    let i;
    for (i = 0; i < this.slides.length; i++) {
      const slidePos =
        this.slides[i].offsetTop - scrollPos + windowHeight * 0.7;
      if (slidePos >= 0) {
        break;
      }
    }

    if (i !== this.currentSlideIndex) {
      this.currentSlideIndex = i;
      this.syncMapToCurrentSlide();
    }
  }
}

export { SlideDeck };
