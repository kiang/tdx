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
  center: ol.proj.fromLonLat([120.721507, 24.200694]),
  zoom: 12
});

function tdxStyle(f) {
  var p = f.getProperties();
  var color = 'rgba(255,255,255,0.5)';
  var strokeWidth = 1;
  var strokeColor = 'rgba(0,0,0,0.3)';
  var textColor = '#000000';
  if(filterDead && p.dead <= 0) {
    return null;
  }
  if(filterHurt && p.hurt <= 50) {
    return null;
  }
  if(filterHurtRate && p.rateHurt <= 10) {
    return null;
  }
  if(currentFeature === f) {
    strokeWidth = 5;
  }
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

var currentFeature = false;
map.on('singleclick', function (evt) {
  content.innerHTML = '';
  pointClicked = false;
  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    if (false === pointClicked) {
      var message = '<table class="table table-dark">';
      pointClicked = true;
      var p = feature.getProperties();
      if(p.VILLCODE) {
        $.getJSON('cunli/' + p.VILLCODE + '.json', function(c) {
          var tdxSource = tdxPoints.getSource();
          var jsonFormat = new ol.format.GeoJSON({
            featureProjection: appView.getProjection()
          });
          tdxSource.clear();
          tdxSource.addFeatures(jsonFormat.readFeatures(c));
        });
        currentFeature = feature;
        tdx.getSource().refresh();
        sidebarTitle = p.COUNTYNAME + p.TOWNNAME + p.VILLNAME;
        message += '<tbody>';
        message += '<tr><th scope="row" style="width: 100px;">村里</th><td>' + p.COUNTYNAME + p.TOWNNAME + p.VILLNAME + '</td></tr>';
        message += '<tr><th scope="row" style="width: 100px;">事故死亡</th><td>' + p.dead + '</td></tr>';
        message += '<tr><th scope="row" style="width: 100px;">事故受傷</th><td>' + p.hurt + '</td></tr>';
        message += '<tr><th scope="row" style="width: 100px;">死亡率(每千人口)</th><td>' + p.rateDead + '</td></tr>';
        message += '<tr><th scope="row" style="width: 100px;">受傷率(每千人口)</th><td>' + p.rateHurt + '</td></tr>';
        message += '</tbody></table>';
      } else {
        var message = '<table class="table table-dark">';
        message += '<tbody>';
        message += '<tr><th scope="row" style="width: 100px;">事故死亡</th><td>' + p.dead + '</td></tr>';
        message += '<tr><th scope="row" style="width: 100px;">事故受傷</th><td>' + p.hurt + '</td></tr>';
        message += '</tbody></table>';
      }
      
      content.innerHTML = message;
      sidebar.open('home');
    }
  });
});

var filterDead = false;
var filterHurt = false;
var filterHurtRate = false;
$('#btnShowDead').click(function(e) {
  e.preventDefault();
  filterDead = true;
  filterHurt = false;
  filterHurtRate = false;
  tdx.getSource().refresh();
});

$('#btnShowAll').click(function(e) {
  e.preventDefault();
  filterDead = false;
  filterHurt = false;
  filterHurtRate = false;
  tdx.getSource().refresh();
});

$('#btnShowHurt').click(function(e) {
  e.preventDefault();
  filterHurt = true;
  filterDead = false;
  filterHurtRate = false;
  tdx.getSource().refresh();
});

$('#btnShowHurtRate').click(function(e) {
  e.preventDefault();
  filterDead = false;
  filterHurt = false;
  filterHurtRate = true;
  tdx.getSource().refresh();
});