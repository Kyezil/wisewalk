import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';

function iconize(prop) {
	return 'map-icon-'+prop.replace(/_/g, '-');
}

/**
 * Map Icons created by Scott de Jonge
 *
 * @version 3.0.0
 * @url http://map-icons.com
 *
 */

// Define Marker Shapes
const MAP_PIN = 'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z';
const SQUARE_PIN = 'M22-48h-44v43h16l6 5 6-5h16z';
const SHIELD = 'M18.8-31.8c.3-3.4 1.3-6.6 3.2-9.5l-7-6.7c-2.2 1.8-4.8 2.8-7.6 3-2.6.2-5.1-.2-7.5-1.4-2.4 1.1-4.9 1.6-7.5 1.4-2.7-.2-5.1-1.1-7.3-2.7l-7.1 6.7c1.7 2.9 2.7 6 2.9 9.2.1 1.5-.3 3.5-1.3 6.1-.5 1.5-.9 2.7-1.2 3.8-.2 1-.4 1.9-.5 2.5 0 2.8.8 5.3 2.5 7.5 1.3 1.6 3.5 3.4 6.5 5.4 3.3 1.6 5.8 2.6 7.6 3.1.5.2 1 .4 1.5.7l1.5.6c1.2.7 2 1.4 2.4 2.1.5-.8 1.3-1.5 2.4-2.1.7-.3 1.3-.5 1.9-.8.5-.2.9-.4 1.1-.5.4-.1.9-.3 1.5-.6.6-.2 1.3-.5 2.2-.8 1.7-.6 3-1.1 3.8-1.6 2.9-2 5.1-3.8 6.4-5.3 1.7-2.2 2.6-4.8 2.5-7.6-.1-1.3-.7-3.3-1.7-6.1-.9-2.8-1.3-4.9-1.2-6.4z';
const ROUTE = 'M24-28.3c-.2-13.3-7.9-18.5-8.3-18.7l-1.2-.8-1.2.8c-2 1.4-4.1 2-6.1 2-3.4 0-5.8-1.9-5.9-1.9l-1.3-1.1-1.3 1.1c-.1.1-2.5 1.9-5.9 1.9-2.1 0-4.1-.7-6.1-2l-1.2-.8-1.2.8c-.8.6-8 5.9-8.2 18.7-.2 1.1 2.9 22.2 23.9 28.3 22.9-6.7 24.1-26.9 24-28.3z';
const SQUARE = 'M-24-48h48v48h-48z';
const SQUARE_ROUNDED = 'M24-8c0 4.4-3.6 8-8 8h-32c-4.4 0-8-3.6-8-8v-32c0-4.4 3.6-8 8-8h32c4.4 0 8 3.6 8 8v32z';

// Function to do the inheritance properly
// Inspired by: http://stackoverflow.com/questions/9812783/cannot-inherit-google-maps-map-v3-in-my-custom-class-javascript
const inherits = function(childCtor, parentCtor) {
	/** @constructor */
	function tempCtor() {};
	tempCtor.prototype = parentCtor.prototype;
	childCtor.superClass_ = parentCtor.prototype;
	childCtor.prototype = new tempCtor();
	childCtor.prototype.constructor = childCtor;
};

function Marker(options){
	google.maps.Marker.apply(this, arguments);

	if (options.map_icon_label) {
		this.MarkerLabel = new MarkerLabel({
			map: this.map,
			marker: this,
			text: options.map_icon_label
		});
		this.MarkerLabel.bindTo('position', this, 'position');
	}
}

// Apply the inheritance
inherits(Marker, google.maps.Marker);

// Custom Marker SetMap
Marker.prototype.setMap = function() {
	google.maps.Marker.prototype.setMap.apply(this, arguments);
	(this.MarkerLabel) && this.MarkerLabel.setMap.apply(this.MarkerLabel, arguments);
};

// Marker Label Overlay
const MarkerLabel = function(options) {
	const self = this;
	this.setValues(options);

	// Create the label container
	this.div = document.createElement('div');
	this.div.className = 'map-icon-label';

	// Trigger the marker click handler if clicking on the label
	google.maps.event.addDomListener(this.div, 'click', function(e){
		(e.stopPropagation) && e.stopPropagation();
		google.maps.event.trigger(self.marker, 'click');
	});
};

// Create MarkerLabel Object
MarkerLabel.prototype = new google.maps.OverlayView;

// Marker Label onAdd
MarkerLabel.prototype.onAdd = function() {
	const pane = this.getPanes().overlayImage.appendChild(this.div);
	const self = this;

	this.listeners = [
		google.maps.event.addListener(this, 'position_changed', function() { self.draw(); }),
		google.maps.event.addListener(this, 'text_changed', function() { self.draw(); }),
		google.maps.event.addListener(this, 'zindex_changed', function() { self.draw(); })
	];
};

// Marker Label onRemove
MarkerLabel.prototype.onRemove = function() {
	this.div.parentNode.removeChild(this.div);

	for (let i = 0, I = this.listeners.length; i < I; ++i) {
		google.maps.event.removeListener(this.listeners[i]);
	}
};

// Implement draw
MarkerLabel.prototype.draw = function() {
	const projection = this.getProjection();
	const position = projection.fromLatLngToDivPixel(this.get('position'));
	const div = this.div;

	this.div.innerHTML = this.get('text').toString();

	div.style.zIndex = this.get('zIndex'); // Allow label to overlay marker
	div.style.position = 'absolute';
	div.style.display = 'block';
	div.style.left = (position.x - (div.offsetWidth / 2)) + 'px';
	div.style.top = (position.y - div.offsetHeight) + 'px';
};


const key = "AIzaSyD5ftrNaITjBREZD-D3naQhlfi1XEDaebM";

function getStops(types, coords) {
	const stops = [];
	const mapHTML = document.getElementById('map');
	const map = new window.google.maps.Map(mapHTML);
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
      const marker = new Marker({
				map: map,
				position: new google.maps.LatLng(one.geometry.location.lat, one.geometry.location.lng),
				icon: {
					path: MAP_PIN,
					fillColor: '#ee9149',
					fillOpacity: 1,
					strokeColor: '',
					strokeWeight: 0
				},
				map_icon_label: `<span class="map-icon ${iconize(type)}"></span>`
			});
			if (stops.length === types.length) {
				drawMap(stops, coords, map);
			}
		 });
	});
}

function drawMap(stops, coords, map) {
	const marker = new Marker({
		map: map,
		position: new google.maps.LatLng(coords.latitude, coords.longitude),
		icon: {
			path: SQUARE_PIN,
			fillColor: '#49c33c',
			fillOpacity: 1,
			strokeColor: '',
			strokeWeight: 0
		},
		map_icon_label: '<span class="map-icon map-icon-walking"></span>'
	});

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
      			stopover: false
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
