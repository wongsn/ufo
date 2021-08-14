let geocoder;
let map;

function initMap() {
  geocoder = new google.maps.Geocoder();
  const componentForm = [
    'location',
    'locality',
    'administrative_area_level_1',
    'country',
    'postal_code',
  ];
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: { lat: 37.4221, lng: -122.0841 },
    mapTypeControl: false,
    fullscreenControl: true,
    zoomControl: true,
    streetViewControl: true,
  });

  const image = '../static/ufo.png';

  const marker = new google.maps.Marker({ map, draggable: true, icon: image });
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
      locality: 'long_name',
      administrative_area_level_1: 'short_name',
      country: 'long_name',
      postal_code: 'short_name',
    };

    const getAddressComp = function (type) {
      for (const component of place.address_components) {
        if (component.types[0] === type) {
          return component[addressNameFormat[type]];
        }
      }
      return '';
    };

    document.getElementById('location').value = `${getAddressComp('street_number')} ${
      getAddressComp('route')}`;
    for (const component of componentForm) {
      // Location field is handled separately above as it has different logic.
      if (component !== 'location') {
        document.getElementById(component).value = getAddressComp(component);
      }
    }
  }

  function renderAddress(place) {
    map.setCenter(place.geometry.location);
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
  }

  function geocodePosition(pos) {
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({
      latLng: pos,
    }, (responses) => {
      if (responses && responses.length > 0) {
        document.getElementById('location').value = responses[0].formatted_address;
      } else {
        document.getElementById('location').value = 'Cannot determine address at this location.';
      }
    });
  }

  google.maps.event.addListener(marker, 'dragend', () => {
    geocodePosition(marker.getPosition());
  });
}

function getCodeAddress() {
  const address = document.getElementById('location').value;
  geocoder.geocode({ address }, (results, status) => {
    if (status == 'OK') {
      // get the data from here
      console.log(JSON.stringify(results[0].geometry.location));
      // map.setCenter(results[0].geometry.location);
      // const marker = new google.maps.Marker({
      //   map,
      //   position: results[0].geometry.location,
      // });
    } else {
      alert(`Geocode was not successful for the following reason: ${status}`);
    }
  });
}

function geocodeLatLng(geocoder, map, infowindow) {
  const input = document.getElementById('latlng').value;
  const latlngStr = input.split(',', 2);
  const latlng = {
    lat: parseFloat(latlngStr[0]),
    lng: parseFloat(latlngStr[1]),
  };
  geocoder
    .geocode({ location: latlng })
    .then((response) => {
      if (response.results[0]) {
        map.setZoom(11);
        const marker = new google.maps.Marker({
          position: latlng,
          map,
        });
        infowindow.setContent(response.results[0].formatted_address);
        infowindow.open(map, marker);
      } else {
        window.alert('No results found');
      }
    })
    .catch((e) => window.alert(`Geocoder failed due to: ${e}`));
}
