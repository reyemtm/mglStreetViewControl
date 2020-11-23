# Mapbox GL JS Street View Control

[Demo](https://reyemtm.github.io/mglStreetViewControl/demo.html#16.8/39.940531/-82.012707)

This plugin will add a button to open either Google Street View or Mapillary at the desired location. When the button is clicked a map marker is added to the map. Once the user moves the added map pin to the desired location, the plugin will check for a valid mapillary image, and if so, show a prompt to either open Mapillary or Google Street View. If no Mapillary image is found, it simply opens Google Street View.

```JavaScript
  map.addControl(new mglStreetViewControl({
    mapillaryAlias: "COZ" //optional
    mapillaryLayerOptions: {
      userKey: "<MapillaryUserKey>", //optional - default to City of Zanesville imagery, can be cleared by setting to false or only setting the pano setting
      pano: 1 //1 or 0 //defaults to 1
    }
  }), 'top-right');
```

Available options include setting the ``pano`` setting to true or false (1 or 0), and filtering the Mapillary images by a Mapillary ``userKey``. By default the 

> The plugin should be added *after* the `map.load` event, as it adds mapillary layers to the map.

*Check the license for Google and Mapillary to see if this plugin is suitable for your application.*

---

A project by [getBounds](https://www.getBounds.com).

&copy; 2020 Malcolm Meyer (MIT)
