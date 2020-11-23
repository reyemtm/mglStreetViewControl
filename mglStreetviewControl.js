class mglStreetviewControl {
  /**
   * 
   * @param {NewType} options 
   */
  constructor(options) {
    this._mapillaryAlias = (!options || !options.mapillaryAlias) ? "Mapillary" : options.mapillaryAlias;
    this._mapillaryLayerOptions = (!options || !options.mapillaryLayerOptions) ? {
      userKey: "WpzhyQeWLPnZ_TwvxcdU_w",
      pano: 1
    } : options.mapillaryLayerOptions
  }

  onAdd (map) {
    const _mapillaryAlias = this._mapillaryAlias

    //TODO does this need to exist or can we just use map
    const _map = this._map = map;

    //button element
    this._btn = document.createElement('button');
    this._btn.innerHTML = streetViewIcon();
    this._btn.type = 'button';
    this._btn['aria-label'] = 'Open Streetview';
    this._btn['title'] = 'Open Streetview';

    //spectre css only
    //TODO add option to put this on right if control is set to the right
    this._btn.classList = "tooltip tooltip-left";
    this._btn.dataset.tooltip = "Open Streetview"

    //add mapillary points and lines
    showLoading()
    const _mapillaryLayers = mapillaryLayers(this._mapillaryLayerOptions);
    _mapillaryLayers.map(l => {
      this._map.addLayer(l);
    });
    hideLoading()

    const _mapMinZoom = this._map.getMinZoom();

    //add global marker
    const _marker = new mapboxgl.Marker({
      draggable: true
    });

    this._btn.onclick = function () {

      //if layers are already showing, reset and return
      if (_map.getLayoutProperty(_mapillaryLayers[0].id, "visibility") === "visible") {
        reset(_marker);
        return;
      }

      //set latlng and show marker
      _marker.setLngLat(map.getCenter())
        .addTo(map)
        .on('dragend', onDragEnd);

      //map set min zoom to 14 and set zoom to 14 is below 14
      _map.setMinZoom(14);
      if (_map.getZoom() < 14)
        _map.setZoom(14);

      //show mapillary imagery points and lines
      _mapillaryLayers.forEach(l => {
        _map.setLayoutProperty(l.id, "visibility", "visible");
      });

      //show toast, spectre css only
      if (!document.getElementById("streetviewControlToast")) {
        const toast = document.createElement("div");
        toast.id = "streetviewControlToast";
        toast.classList.add("toast");
        toast.style.backgroundColor = "firebrick";
        toast.innerHTML = "Drag the marker to a location on the street. The selected street view option will open in a new window.";
        document.body.appendChild(toast);
      } else {
        document.getElementById("streetviewControlToast").style.display = "block";
      }

      //listener for 'dragend' event
      async function onDragEnd() {

        //show loading
        showLoading()

        //get latlng
        const lngLat = this.getLngLat();
        const lng = Number(lngLat.lng.toFixed(8));
        const lat = Number(lngLat.lat.toFixed(8));

        //see if mapillary imags are available
        const bboxClickTargetSize = 40;
        const point = _map.project(lngLat)
        const bbox = [
          [point.x - bboxClickTargetSize / 2, point.y - bboxClickTargetSize / 2],
          [point.x + bboxClickTargetSize / 2, point.y + bboxClickTargetSize / 2]
        ]
        const mapillaryLayerIds = _mapillaryLayers.reduce((i, l) => [...i, l.id], []);
        const mapillaryImages = _map.queryRenderedFeatures(bbox, { layers: mapillaryLayerIds });
        const mapillaryExists = (!mapillaryImages.length) ? false : true;

        //compile url
        const imgSource = (!mapillaryExists) ? "google" : (confirm(_mapillaryAlias + " Street View Imagery is avalable at this location.\n\nClick 'OK' to use " + _mapillaryAlias + " Street View Imagery\n--OR--\n'Cancel' to use Google Street View Imagery")) ? "mapillary" : "google";
        let url = "";
        if (imgSource === "mapillary") {
          url = "https://www.mapillary.com/app/?z=16&lat=" + lat + "&lng=" + lng + "&focus=photo&panos=true&pKey=" + mapillaryImages[0].properties.key;
        } else {
          url = "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=".concat(lngLat.lat, ",").concat(lngLat.lng);
        }

        console.log(url);
        reset(this);
        window.open(url);

      }

      function reset(marker) {

        //TODO fix this hack of getting rid of the event listeners
        //remove marker and listener
        marker._listeners = [];
        marker.off('dragend', onDragEnd);
        marker.remove();

        //reset map minzoom
        _map.setMinZoom(_mapMinZoom);

        //hide mapillary points and lines
        _mapillaryLayers.forEach(l => {
          _map.setLayoutProperty(l.id, "visibility", "none");
        });

        //hide toast message
        if (document.querySelector("#streetviewControlToast")) {
          document.getElementById("streetviewControlToast").style.display = "none";
        }

        //hide loading
        hideLoading()
      }
    };

    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

    this._container.appendChild(this._btn);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

export {
  mglStreetviewControl
};


function showLoading() {
  if (document.querySelector("#loading")) {
    document.querySelector("#loading").classList.add("loading");
  }
}

function hideLoading() {
  if (document.querySelector("#loading")) {
    document.querySelector("#loading").classList.remove("loading");
  }
}

/**
 * these options are supplied in the global config object of the plugin
 * @param {*} options abject with a mapillary userKey and panamoramic boolean option  1 or 0
 */
function mapillaryLayers(options) {
  const {userKey, pano} = options
  return JSON.parse(`[{
    "id": "svcMapillaryLinesOuter",
    "type": "line",
    "source": {
      "type": "vector",
      "tiles": [
        "https://tiles3.mapillary.com/v0.1/{z}/{x}/{y}.mvt"
      ],
      "minzoom": 0,
      "maxzoom": 14,
      "promoteId": "key"
    },
    "source-layer": "mapillary-sequences",
    "paint": {
      "line-opacity": 0.9,
      "line-color": "white",
      "line-gap-width": 3,
      "line-width": 2
    },
    "layout": {
      "visibility": "none",
      "line-cap": "round",
      "line-join": "round"
    },
    "filter": [
      "all",
      ${(!userKey) ? ""  : `[
        "==",
        [
          "get",
          "userkey"
        ],
        "${userKey}"
      ],`}
      [
        "==",
        [
          "get",
          "pano"
        ],
        ${pano}
      ]
    ]
  },
  {
    "id": "svcMapillaryLinesInner",
    "type": "line",
    "source": {
      "type": "vector",
      "tiles": [
        "https://tiles3.mapillary.com/v0.1/{z}/{x}/{y}.mvt"
      ],
      "minzoom": 0,
      "maxzoom": 14,
      "promoteId": "key"
    },
    "source-layer": "mapillary-sequences",
    "paint": {
      "line-opacity": 0.6,
      "line-color": "#05CB63",
      "line-width": 3
    },
    
    "layout": {
      "visibility": "none",
      "line-cap": "round",
      "line-join": "round"
    },
    "filter": [
      "all",
      ${(!userKey) ? ""  : `[
        "==",
        [
          "get",
          "userkey"
        ],
        "${userKey}"
      ],`}
      [
        "==",
        [
          "get",
          "pano"
        ],
        ${pano}
      ]
    ]
  },
  {
    "id": "svcMapillaryPoints",
    "type": "circle",
    "source": {
      "type": "vector",
      "tiles": [
        "https://tiles3.mapillary.com/v0.1/{z}/{x}/{y}.mvt"
      ],
      "minzoom": 0,
      "maxzoom": 14,
      "promoteId": "key"
    },
    "source-layer": "mapillary-images",
    "paint": {
      "circle-color": "#05CB63",
      "circle-stroke-color": "white",
      "circle-stroke-width": 1,
      "circle-pitch-scale": "map",
      "circle-pitch-alignment": "map"
    },
    "layout": {
      "visibility": "none"
    },
    "filter": [
      "all",
      ${(!userKey) ? ""  : `[
        "==",
        [
          "get",
          "userkey"
        ],
        "${userKey}"
      ],`}
      [
        "==",
        [
          "get",
          "pano"
        ],
        ${pano}
      ]
    ]
  }]`)
}

//see https://material.io/resources/icons/?icon=person_pin_circle&style=baseline

/**
 * returns a material design street view svg icon
 */
function streetViewIcon() {
  return '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24"viewBox="0 0 24 24"><g><rect fill="none" height="24" width="24"/></g><g><g><g><path d="M12,2C8.14,2,5,5.14,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.14,15.86,2,12,2z M12,4c1.1,0,2,0.9,2,2c0,1.11-0.9,2-2,2 s-2-0.89-2-2C10,4.9,10.9,4,12,4z M12,14c-1.67,0-3.14-0.85-4-2.15c0.02-1.32,2.67-2.05,4-2.05s3.98,0.73,4,2.05 C15.14,13.15,13.67,14,12,14z"/></g></g></g></svg>'
}


/**
 * Use this to show the bounding box for debug purposes
 * @param {*} map instance of Mapbox map object
 * @param {*} bbox bounding box
 */
function showBoundingBox(map, bbox) {
  var bboxCoords = [map.unproject(bbox[0]), map.unproject(bbox[1])]

  var poly = [
    [bboxCoords[0].lng, bboxCoords[0].lat],
    [bboxCoords[1].lng, bboxCoords[0].lat],
    [bboxCoords[1].lng, bboxCoords[1].lat],
    [bboxCoords[0].lng, bboxCoords[1].lat],
    [bboxCoords[0].lng, bboxCoords[0].lat]
  ]

  var number = Math.random()

  map.addLayer({
    'id': 'bbox' + number,
    'type': 'fill',
    'source': {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'geometry': {
          'type': 'Polygon',
          'coordinates': [poly]
        }
      }
    },
    'layout': {},
    'paint': {
      'fill-color': 'firebrick',
      'fill-opacity': 0.5
    }
  });
}
