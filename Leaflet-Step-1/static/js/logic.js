// Store our API endpoint inside queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "<hr></p> Magnitude: " + feature.properties.mag);
  }

  //function to increase circle size for magnitudes
  function magRadius (magnitude) {
      return magnitude *10;
  }

  //function to change circle colors based on magnitude
  function magColor(magnitude) {
      if (magnitude < 1) {
          return "#7cff00"
        }
      else if (magnitude < 2) {
        return "#c2ff00"
        }
        else if (magnitude < 3) {
            return "#fff600"
        }
        else if (magnitude < 4) {
            return "#ffd300"
        }
        else if (magnitude < 5) {
            return "#ff8c00"
        }
        else if (magnitude < 6) {
            return "#ff4600"
        }
        else {
            return "#ff0000"
        }
    }

    //function to change color opacity based on magnitude
    function magOpacity(magnitude) {
        if (magnitude <= 2) {
            return 0.4
        }
        else if (magnitude <= 4) {
        return 0.6
        }
        else if (magnitude <= 6) {
            return 0.8
        }
        else {
            return 1.0
        }
    }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  let earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function(earthquakeData, latlng){
          return L.circleMarker(latlng, {
              radius: magRadius(earthquakeData.properties.mag),
              color: magColor(earthquakeData.properties.mag),
              fillOpacity: magOpacity(earthquakeData.properties.mag)
          });
      },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define lightmap and darkmap layers
  let lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  let baseMaps = {
    "Light Map": lightmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

 // Set up the legend
 let legend = L.control({ position: "bottomright" });
 legend.onAdd = function() {
   let div = L.DomUtil.create("div", "info legend");
   let limits = [0,1,2,3,4,5,6];
   var colors = ["#7cff00", "#c2ff00", "#fff600", "#ffd300", "#ff8c00", "#ff4600", "#ff0000"];
   var labels = ["<1", "1-2", "2-3", "3-4", "4-5", "5-6", ">6"];

   // Add min & max
   var legendInfo = "<h2>Earthquake Magnitude</h2>"

   div.innerHTML = legendInfo;

   limits.forEach(function(index) {
     div.innerHTML += "<li style=\"background-color: " + colors[index] + "\"></li>" + labels[index];
    });

    
    return div;
 };

 // Adding legend to the map
 legend.addTo(myMap);
}
