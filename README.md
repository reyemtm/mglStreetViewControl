# Mapbox GL JS Street View Control

```JavaScript
  map.addControl(new cozMAP.mglStreetviewControl({
    mapillaryAlias: "COZ" //optional
    mapillaryLayerOptions: { //optional, defaults to City of Zanesville uploaded images and panormamic set to on
      userKey: "<MapillaryUserKey>",
      pano: 1 //1 or 0
    }
  }), 'top-right');
```
Mapbox GL JS Street View Control

This will add a button to open either Google Street View or Mapillary Street View once the user moves the added map pin. Check the license for Google and Mapillary to see if this plugin is suitable for your application.
