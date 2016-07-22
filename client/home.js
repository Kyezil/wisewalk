import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

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



const terms = [
	{ value: "atm", text: 'Atm' },
	{ value: "bakery", text: 'Bakery'},
	{ value: "bank", text: 'Bank'},
	{ value: "book_store", text: 'Book store'},
	{ value: "bus_station", text: 'Bus station'},
	{ value: "cafe", text: 'Café'},
	{ value: "convenience_store", text: 'Convenience store'},
	{ value: "gas_station", text: 'Gas station'},
	{ value: "grocery_or_supermarket", text: 'Supermarket'},
	{ value: "library", text: 'Library'},
	{ value: "park", text: 'Park'},
	{ value: "parking", text: 'Parking'},
	{ value: "pharmacy", text: 'Pharmacy'},
	{ value: "shopping_mall", text: 'Shopping mall'},
	{ value: "subway_station", text: 'Subway station'},
	{ value: "hospital", text: 'Hospital'},
	{ value: 'police', text: 'Police'},
	{ value: 'post_office', text: 'Post Office'}
];

Template.home.helpers({
	buttons: () => terms
});

Template.home.events({
	'click #generate-walk': function clickGenerate(event, templateInstance) {
		const terms = templateInstance.findAll('.term');
		const newTerms = terms.filter((el) => el.checked).map((el) => el.name);
		if (newTerms.length > 0) {
			Session.set('terms', newTerms);
			FlowRouter.go('path');
		}
	}
});

Template.termButton.helpers({
	icon: (prop) => 'map-icon-'+prop.replace(/_/g, '-')
});
