# Mapbox GL JS Street View Control

[Demo](https://reyemtm.github.io/mglStreetViewControl/demo.html#16.8/39.940531/-82.012707)

This plugin will add a button to open either Google Street View or Mapillary at the desired location. When the button is clicked a map marker is added to the map. Once the user moves the added map pin to the desired location, the plugin will check for a valid mapillary image, and if so, show a prompt to either open Mapillary or Google Street View. If no Mapillary image is found, it simply opens Google Street View.

```JavaScript
  map.addControl(new mglStreetViewControl({
    mapillaryAlias: "COZ" //optional
    mapillaryLayerOptions: { //optional, defaults to City of Zanesville uploaded images and panormamic set to on
      userKey: "<MapillaryUserKey>",
      pano: 1 //1 or 0
    }
  }), 'top-right');
```

> The plugin should be added *after* the `map.load` event, as it adds mapillary layers to the map.

Check the license for Google and Mapillary to see if this plugin is suitable for your application.


*A project by [Malcolm Meyer | getBounds](https://www.getBounds.com).*
