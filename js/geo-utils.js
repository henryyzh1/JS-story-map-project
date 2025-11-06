/**
 * Duplicate features that lie east of the 0° meridian by shifting them west
 * 360°. This keeps the base GeoJSON in the standard -180°–180° range while
 * providing a mirrored copy around the Pacific so features are not split at
 * the antimeridian.
 * @param {object} geojson A GeoJSON Feature/FeatureCollection/Geometry
 * @return {object} The same object, tagged to avoid duplicate processing
 */
function toPacificCentric(geojson) {
  if (!geojson || typeof geojson !== "object" || geojson.__pacificShifted) {
    return geojson;
  }

  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  const forEachCoordinate = (geometry, callback) => {
    if (!geometry) {
      return;
    }
    const { type, coordinates, geometries } = geometry;
    switch (type) {
      case "Point":
        callback(coordinates);
        break;
      case "MultiPoint":
      case "LineString":
        (coordinates || []).forEach(callback);
        break;
      case "MultiLineString":
      case "Polygon":
        (coordinates || []).forEach((line) => (line || []).forEach(callback));
        break;
      case "MultiPolygon":
        (coordinates || []).forEach((poly) =>
          (poly || []).forEach((ring) => (ring || []).forEach(callback)),
        );
        break;
      case "GeometryCollection":
        (geometries || []).forEach((geom) => forEachCoordinate(geom, callback));
        break;
      default:
        break;
    }
  };

  const geometryHasPositiveLng = (geometry) => {
    let hasPositive = false;
    forEachCoordinate(geometry, (coord) => {
      if (Array.isArray(coord) && typeof coord[0] === "number" && coord[0] > 0) {
        hasPositive = true;
      }
    });
    return hasPositive;
  };

  const shiftGeometry = (geometry, delta) => {
    const clone = deepClone(geometry);
    forEachCoordinate(clone, (coord) => {
      if (Array.isArray(coord) && typeof coord[0] === "number") {
        coord[0] += delta;
      }
    });
    return clone;
  };

  const markShifted = (obj) => {
    Object.defineProperty(obj, "__pacificShifted", {
      value: true,
      enumerable: false,
      writable: true,
    });
    return obj;
  };

  const duplicateFeature = (feature) => {
    if (!feature) {
      return [];
    }
    if (feature.__pacificShifted) {
      return [feature];
    }
    if (feature.type !== "Feature") {
      return [markShifted(feature)];
    }

    const duplicates = [markShifted(feature)];

    if (geometryHasPositiveLng(feature.geometry)) {
      const shifted = {
        type: "Feature",
        properties: { ...feature.properties, __pacificDuplicate: true },
        geometry: shiftGeometry(feature.geometry, -360),
      };
      markShifted(shifted);
      duplicates.push(shifted);
    }

    return duplicates;
  };

  if (geojson.type === "FeatureCollection") {
    const expanded = [];
    for (const feature of geojson.features || []) {
      expanded.push(...duplicateFeature(feature));
    }
    geojson.features = expanded;
  } else if (geojson.type === "Feature") {
    const duplicates = duplicateFeature(geojson);
    if (duplicates.length > 1) {
      geojson.type = "FeatureCollection";
      geojson.features = duplicates;
    }
  } else if (geojson.type) {
    // Geometry only – nothing to duplicate, but still mark as shifted.
    markShifted(geojson);
  }

  return markShifted(geojson);
}

export { toPacificCentric };
