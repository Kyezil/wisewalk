import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';

const key = "AIzaSyD5ftrNaITjBREZD-D3naQhlfi1XEDaebM";

function getStops(types, coords) {
	const stops = [];
	types.forEach((type) => {
		const url = "https://crossorigin.me/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + coords.latitude +
		 "," + coords.longitude + "&rankby=distance&types=" + type + "&key="+key;
		$.getJSON(url).done((result) => {
			const one = result.results[0];
			stops.push({
        "Geometry": {
          "Latitude": one.geometry.location.lat,
          "Longitude": one.geometry.location.lng
        }
      });
			if (stops.length === types.length) {
				drawMap(stops, coords);
			}
		 });
	});
}

function drawMap(stops, coords) {
	const mapHTML = document.getElementById('map');
	const map = new window.google.maps.Map(mapHTML);
  // new up complex objects before passing them around
  const directionsDisplay = new window.google.maps.DirectionsRenderer();
  const directionsService = new window.google.maps.DirectionsService();
  // add current location
  const currentPos = {
  	"Geometry": {
  		"Latitude": coords.latitude,
  		"Longitude": coords.longitude
  	}
  };
  stops.unshift(currentPos);
  Tour_startUp(stops, coords);
  window.tour.loadMap(map, directionsDisplay);
  window.tour.fitBounds(map);
  if (stops.length > 1) {
  	window.tour.calcRoute(directionsService, directionsDisplay, stops);
  }
}

function Tour_startUp(stops, coords) {
	const lat = coords.latitude;
	const long = coords.longitude;
	if (!window.tour) window.tour = {
		updateStops: function(newStops) {
			stops = newStops;
		},
    // map: google map object
    // directionsDisplay: google directionsDisplay object (comes in empty)
    loadMap: function(map, directionsDisplay) {
    	const myOptions = {
    		zoom: 13,
        center: new window.google.maps.LatLng(lat, long), // default to London
        mapTypeId: window.google.maps.MapTypeId.ROADMAP
      };
      map.setOptions(myOptions);
      directionsDisplay.setMap(map);
    },
    fitBounds: function(map) {
    	const bounds = new window.google.maps.LatLngBounds();
      // extend bounds for each record
      jQuery.each(stops, function(key, val) {
      	const myLatlng = new window.google.maps.LatLng(val.Geometry.Latitude, val.Geometry.Longitude);
      	bounds.extend(myLatlng);
      });
      map.fitBounds(bounds);
    },
    calcRoute: function(directionsService, directionsDisplay, realStops) {
    	const batches = [];
      const itemsPerBatch = 10; // google API max = 10 - 1 start, 1 stop, and 8 waypoints
      let itemsCounter = 0;
      const stops = realStops;
      let wayptsExist = stops.length > 0;

      while (wayptsExist) {
      	const subBatch = [];
      	let subitemsCounter = 0;

      	for (let j = itemsCounter; j < stops.length; j++) {
      		subitemsCounter++;
      		subBatch.push({
      			location: new window.google.maps.LatLng(stops[j].Geometry.Latitude, stops[j].Geometry.Longitude),
      			stopover: true
      		});
      		if (subitemsCounter == itemsPerBatch)
      			break;
      	}

      	itemsCounter += subitemsCounter;
      	batches.push(subBatch);
      	wayptsExist = itemsCounter < stops.length;
        // If it runs again there are still points. Minus 1 before continuing to
        // start up with end of previous tour leg
        itemsCounter--;
      }
      // now we should have a 2 dimensional array with a list of a list of waypoints
      let combinedResults;
      const unsortedResults = [{}]; // to hold the counter and the results themselves as they come back, to later sort
      let directionsResultsReturned = 0;
      for (let k = 0; k < batches.length; k++) {
      	const lastIndex = batches[k].length - 1;
      	const start = batches[k][0].location;
      	const end = batches[k][lastIndex].location;
        // trim first and last entry from array
        let waypts = [];
        waypts = batches[k];
        waypts.splice(0, 1);
        waypts.splice(waypts.length - 1, 1);
        const request = {
        	origin: start,
        	destination: end,
        	waypoints: waypts,
        	optimizeWaypoints: true,
        	travelMode: window.google.maps.TravelMode.WALKING
        };
        (function(kk) {
        	directionsService.route(request, function(result, status) {
        		if (status == window.google.maps.DirectionsStatus.OK) {
        			const unsortedResult = {
        				order: kk,
        				result: result
        			};
        			unsortedResults.push(unsortedResult);
        			directionsResultsReturned++;
              if (directionsResultsReturned == batches.length) // we've received all the results. put to map
              {
                // sort the returned values into their correct order
                unsortedResults.sort(function(a, b) {
                	return parseFloat(a.order) - parseFloat(b.order);
                });
                let count = 0;
                for (let key in unsortedResults) {
                	if (unsortedResults[key].result != null) {
                		if (unsortedResults.hasOwnProperty(key)) {
                      if (count == 0) // first results. new up the combinedResults object
                      	combinedResults = unsortedResults[key].result;
                      else {
                        // only building up legs, overview_path, and bounds in my consolidated object. This is not a complete
                        // directionResults object, but enough to draw a path on the map, which is all I need
                        combinedResults.routes[0].legs = combinedResults.routes[0].legs.concat(unsortedResults[key].result.routes[0].legs);
                        combinedResults.routes[0].overview_path = combinedResults.routes[0].overview_path.concat(unsortedResults[key].result.routes[0].overview_path);
                        combinedResults.routes[0].bounds = combinedResults.routes[0].bounds.extend(unsortedResults[key].result.routes[0].bounds.getNorthEast());
                        combinedResults.routes[0].bounds = combinedResults.routes[0].bounds.extend(unsortedResults[key].result.routes[0].bounds.getSouthWest());
                      }
                      count++;
                    }
                  }
                }
                directionsDisplay.setDirections(combinedResults);
              }
            }
          });
})(k);
}
}
};
}

Template.path.onCreated(function pathOnCreated() {
	const types = Session.get('terms');
	if (!types || types.length === 0) {
		FlowRouter.go('home');
	}
	else { // get location
		navigator.geolocation.getCurrentPosition((position) => {
			pos = position.coords;
			getStops(types, pos);
		});
	}
});