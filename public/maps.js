/* eslint-disable no-alert */
let geocoder;
let map;

function initMap() {
  geocoder = new google.maps.Geocoder();

  const latValue = +document.getElementById('lat').value;
  const lngValue = +document.getElementById('long').value;
  let defaultLocation;

  if (latValue !== 0 && lngValue !== 0) {
    defaultLocation = { lat: latValue, lng: lngValue };
  } else {
    defaultLocation = { lat: 37.2431, lng: -115.7930 };
  }

  geocoder
    .geocode({ location: defaultLocation })
    .then((response) => {
      if (response.results[0]) {
        document.getElementById('location').value = response.results[0].formatted_address;
      } else {
        window.alert('No results found');
      }
    })
    .catch((e) => window.alert(`Geocoder failed due to: ${e}`));

  const componentForm = [
    'location',
    'administrative_area_level_1',
    // 'country',
  ];

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: defaultLocation,
    mapTypeControl: false,
    fullscreenControl: true,
    zoomControl: true,
    streetViewControl: true,
  });

  const styles = {
    retro: [
      { elementType: 'geometry', stylers: [{ color: '#ebe3cd' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#523735' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f1e6' }] },
      {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#c9b2a6' }],
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#dcd2be' }],
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#ae9e90' }],
      },
      {
        featureType: 'landscape.natural',
        elementType: 'geometry',
        stylers: [{ color: '#dfd2ae' }],
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#dfd2ae' }],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#93817c' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry.fill',
        stylers: [{ color: '#a5b076' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#447530' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#f5f1e6' }],
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{ color: '#fdfcf8' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#f8c967' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#e9bc62' }],
      },
      {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry',
        stylers: [{ color: '#e98d58' }],
      },
      {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#db8555' }],
      },
      {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#806b63' }],
      },
      {
        featureType: 'transit.line',
        elementType: 'geometry',
        stylers: [{ color: '#dfd2ae' }],
      },
      {
        featureType: 'transit.line',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#8f7d77' }],
      },
      {
        featureType: 'transit.line',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#ebe3cd' }],
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [{ color: '#dfd2ae' }],
      },
      {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [{ color: '#b9d3c2' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#92998d' }],
      },
    ],
  };

  map.setOptions({ styles: styles.retro });
  const image = '/static/ufo.png';
  const marker = new google.maps.Marker({
    position: defaultLocation, map, draggable: true, icon: image,
  });

  const autocompleteInput = document.getElementById('location');
  const autocomplete = new google.maps.places.Autocomplete(autocompleteInput);
  autocomplete.addListener('place_changed', () => {
    marker.setVisible(false);
    const place = autocomplete.getPlace();
    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert(`No details available for input: '${place.name}'`);
      return;
    }
    renderAddress(place);
    fillInAddress(place);
  });

  function fillInAddress(place) { // optional parameter
    const addressNameFormat = {
      street_number: 'short_name',
      route: 'long_name',
      administrative_area_level_1: 'short_name',
      // country: 'long_name',
    };

    const getAddressComp = (type) => {
      for (const component of place.address_components) {
        if (component.types[0] === type) {
          return component[addressNameFormat[type]];
        }
      }
      return '';
    };

    document.getElementById('location').value = `${getAddressComp('street_number')} ${getAddressComp('route')}`;

    for (const component of componentForm) {
      // Location field is handled separately above as it has different logic.
      if (component !== 'location') {
        document.getElementById(component).value = getAddressComp(component);

        const latlong = JSON.stringify(marker.getPosition());
        const latvalue = latlong.match(/-?\d*\.\d*/g)[0];
        const longvalue = latlong.match(/-?\d*\.\d*/g)[1];
        document.getElementById('lat').value = latvalue;
        document.getElementById('long').value = longvalue;
      }
    }
  }

  function renderAddress(place) {
    map.setCenter(place.geometry.location);
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
  }

  function geocodePosition(pos) {
    geocoder.geocode({
      latLng: pos,
    }, (responses) => {
      if (responses && responses.length > 0) {
        document.getElementById('location').value = responses[0].formatted_address;
        console.log(responses);
        const latlong = JSON.stringify(marker.getPosition());
        const latvalue = latlong.match(/-?\d*\.\d*/g)[0];
        const longvalue = latlong.match(/-?\d*\.\d*/g)[1];
        document.getElementById('lat').value = latvalue;
        document.getElementById('long').value = longvalue;
      } else {
        document.getElementById('location').value = 'Cannot determine address at this location.';
      }
    });
  }

  google.maps.event.addListener(marker, 'dragend', () => {
    geocodePosition(marker.getPosition());
    map.setCenter(marker.getPosition());
  });
}
