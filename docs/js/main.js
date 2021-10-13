var sidebar = new ol.control.Sidebar({ element: 'sidebar', position: 'right' });
var jsonFiles, filesLength, fileKey = 0;

var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(20);
var matrixIds = new Array(20);
for (var z = 0; z < 20; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}
var sidebarTitle = document.getElementById('sidebarTitle');
var content = document.getElementById('sidebarContent');

var appView = new ol.View({
  center: ol.proj.fromLonLat([120.721507, 23.700694]),
  zoom: 9
});

function tdxStyle(f) {
  var p = f.getProperties();
  var color = 'rgba(255,255,255,0.5)';
  var strokeWidth = 1;
  var strokeColor = 'rgba(0,0,0,0.3)';
  var textColor = '#000000';
  if(p.dead > 0) {
    color = 'rgba(255,0,0,0.8)';
  } else if(p.hurt > 40) {
    color = 'rgba(255,255,0,0.8)';
  }
  var baseStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: strokeColor,
      width: strokeWidth
    }),
    fill: new ol.style.Fill({
      color: color
    })
  });
  return baseStyle;
}

var baseLayer = new ol.layer.Tile({
  source: new ol.source.WMTS({
    matrixSet: 'EPSG:3857',
    format: 'image/png',
    url: 'https://wmts.nlsc.gov.tw/wmts',
    layer: 'EMAP',
    tileGrid: new ol.tilegrid.WMTS({
      origin: ol.extent.getTopLeft(projectionExtent),
      resolutions: resolutions,
      matrixIds: matrixIds
    }),
    style: 'default',
    wrapX: true,
    attributions: '<a href="http://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲</a>'
  }),
  opacity: 0.8
});

var tdx = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'map.json',
    format: new ol.format.GeoJSON({
      featureProjection: appView.getProjection()
    })
  }),
  style: tdxStyle,
  zIndex: 50
});

var tdxPoints = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'points.json',
    format: new ol.format.GeoJSON({
      featureProjection: appView.getProjection()
    })
  }),
  zIndex: 50
});

var map = new ol.Map({
  layers: [baseLayer, tdx, tdxPoints],
  target: 'map',
  view: appView
});

map.addControl(sidebar);

map.on('singleclick', function (evt) {
  content.innerHTML = '';
  pointClicked = false;
  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    if (false === pointClicked) {
      pointClicked = true;
      var p = feature.getProperties();
      for(k in p) {
        if(k !== 'geometry') {
          content.innerHTML += k + ': ' + p[k] + '<br />';
        }
      }
      sidebar.open('home');
    }
  });
});