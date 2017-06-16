var map = new L.Map('map').setView(new L.LatLng(53, -2.5), 6.5);;

// create the tile layer with correct attribution
var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

var osm = new L.TileLayer(osmUrl,
    { minZoom: 5, maxZoom: 18, attribution: osmAttrib }).addTo(map);
