const DISTRICT_URL ="https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson";
const DEATHS_URL ="https://data.cdc.gov/api/views/xbxb-epbu/rows.json?accessType=DOWNLOAD";

const API_KEY ="AIzaSyDkBfoma7NvChlBTEcu0fZIuUs5lNKSQuI";

const HOUSING_URL ="https://data.cityofnewyork.us/api/views/hg8x-zxpr/rows.json?accessType=DOWNLOAD";

const NEIGHBOR_URL = "https://data.cityofnewyork.us/api/views/xyye-rtrs/rows.json?accessType=DOWNLOAD";

const CRIME_URL = "https://data.cityofnewyork.us/resource/9s4h-37hy.json?cmplnt_fr_dt=2015-12-31T00:00:00.000";

const MARKT_URL = "https://data.cityofnewyork.us/api/views/43hw-uvdj/rows.json?accessType=DOWNLOAD";

var map;
var university_coordinates={lat: 40.7291, lng: -73.9965};
var bro_coordinates={lat: 40.7291, lng: -73.949997};
var ny_marker;
var bro_marker;
var directionsService;
var directionsRenderer;
//COLOR
/*#F8EFFB*/
map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: university_coordinates
    });
ny_marker = new google.maps.Marker({
    position: university_coordinates,
    map: map,
    animation: google.maps.Animation.DROP
});

map.data.loadGeoJson(
          'https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson');
map.data.setStyle(function(feature) {
        return({
            fillColor: color(feature.getProperty('BoroCD')),
            fillOpacity: 0.5,      
            strokeColor: '#000000',
            strokeWeight: 1
          });
        });
        map.data.addListener('mouseover', function(event) {
            map.data.revertStyle();
            map.data.overrideStyle(event.feature, {strokeWeight: 2});
          });
        map.data.addListener('mouseout', function(event) {
            map.data.revertStyle();
        });
        map.data.addListener('click', function(event) {
            map.data.revertStyle();
            map.data.overrideStyle(event.feature, {strokeWeight: 2});
            infobox(event.feature.getProperty('BoroCD'));
          });
          
          
          
function color(BoroCD){
    if (BoroCD-100*parseInt(BoroCD/100)<20){
            if (parseInt(BoroCD/100) == 5){
                return '#FF0000';
            }else if (parseInt(BoroCD/100) == 4){
                return '#0000FF';
            }else if (parseInt(BoroCD/100) == 3){
                return '#01A9DB'; 
            }
            else if (parseInt(BoroCD/100) == 2){
                return '#BF00FF'
            }
            else if (parseInt(BoroCD/100) == 1){
                return '#FF8000';
            }
    }else{
        return '#00FF00';
    }
}

function infobox(BoroCD){
    if (BoroCD-100*parseInt(BoroCD/100)<20){
            document.getElementById('Informacion').style.display = 'block';
            document.getElementById('Informacion1').style.display = 'block';
            document.getElementById('B_Iconos').style.display = 'block';
            document.getElementById('Titulo2').style.display = 'block';
            document.getElementById('Titulo3').style.display = 'block';
            if (parseInt(BoroCD/100) == 5){
            document.getElementById('Titulo1').textContent="Staten Island";
            document.getElementById('Titulo1').style.color="#FF0000";
            }else if (parseInt(BoroCD/100) == 4){
            document.getElementById('Titulo1').textContent="Queens";
            document.getElementById('Titulo1').style.color="#0000FF";
            }else if (parseInt(BoroCD/100) == 3){
            document.getElementById('Titulo1').textContent="Brooklyn";
            document.getElementById('Titulo1').style.color="#01A9DB";
            }else if (parseInt(BoroCD/100) == 2){
            document.getElementById('Titulo1').textContent="Bronx";
            document.getElementById('Titulo1').style.color="#4C0B5F";
            }else if (parseInt(BoroCD/100) == 1){
            document.getElementById('Titulo1').textContent="Manhattan";
            document.getElementById('Titulo1').style.color="#FF8000";
            }
            var CD = parseInt(BoroCD/100)-1;
            document.getElementById('Titulo').style.fontSize="large";
            document.getElementById('Titulo2').textContent= "District Number: "+(BoroCD).toString();
            var neigh = "";
            var posicion = 0;
            for(var i=0;i<distritos[CD].length; i++) {
                if (distritos[CD][i][0] == BoroCD){
                    posicion = i;
                    neigh = distritos[CD][i][3].toString();
                }
                
            }
            console.log(distritos[CD][posicion]);
            document.getElementById('Titulo3').textContent= "Neighborhoods: "+neigh;
            document.getElementById('Ranking').textContent=(distritos[CD][posicion][6][1]).toString();
            document.getElementById('Safety').textContent=(distritos[CD][posicion][4][0]).toString()+" Pos "+(distritos[CD][posicion][4][1]).toString();
            document.getElementById('Distance').textContent=(distritos[CD][posicion][5][0]).toString()+" km Pos"+(distritos[CD][posicion][5][1]).toString();
            document.getElementById('Affordability').textContent=(distritos[CD][posicion][2][0]).toString()+" Pos "+(distritos[CD][posicion][2][1]).toString();
            getRoute(centros[CD][posicion]);
   }else{
       document.getElementById('Titulo1').style.color="#00FF00";
       document.getElementById('Titulo1').textContent="Green Area";
       document.getElementById('Informacion').style.display = 'none';
       document.getElementById('Informacion1').style.display = 'none';
       document.getElementById('B_Iconos').style.display = 'none';
       document.getElementById('Titulo2').style.display = 'none';
       document.getElementById('Titulo3').style.display = 'none';
   }
}

var distritos = [[],[],[],[],[]];
var polydistritos = [[],[],[],[],[]];
var centros = [[],[],[],[],[]];
function getDistritos(){
    var data = $.get(DISTRICT_URL,function(){
    })
    .done(function(){
        var json = JSON.parse(data.responseText);
        var dataRow = json.features;
        for (var i = 0; i < dataRow.length; i++) {
            var CD = dataRow[i].properties.BoroCD;
            var BO = parseInt(CD/100);
            if ((CD-(BO*100))<19){
                var coordenadas;
                if(dataRow[i].geometry.coordinates.length == 1){
                    coordenadas = [dataRow[i].geometry.coordinates];
                }else{
                    coordenadas = dataRow[i].geometry.coordinates;
                }
                reversa = [];
                var bounds = new google.maps.LatLngBounds();
                for (var k = 0; k < coordenadas.length; k++) {
                    for(var o = 0; o<coordenadas[k][0].length;o++){
                        var c= {lat: 0, lng: 0};
                        c.lat = coordenadas[k][0][o][1];
                        c.lng = coordenadas[k][0][o][0];
                        reversa.push(c);
                        bounds.extend(c);
                    }
                }
                centros[BO-1].push(bounds.getCenter());
                var Borough = "";
                if (BO== 2){
                    Borough= "Bronx"
                }else if(BO==3){
                    Borough = "Brooklyn"
                }else if(BO==4){
                    Borough = "Queens";
                }else if(BO== 5){
                    Borough = "Staten Island"
                }else if(BO== 1){
                    Borough = "Manhattan";
                }
                distritos[BO-1].push([CD,reversa,[0,0],[],[0,0,[]],[0,0],[0,0],Borough]);
                var Distrito = new google.maps.Polygon({
                paths: reversa
                });
                polydistritos[BO-1].push(Distrito);
            }
        }
    })
    .fail(function(error){
        console.log(error);
    });
}

var distrito = [];

setTimeout(function(){
    for (var i = 0; i < housing.length; i++) {
        var punto= housing[i][4];
        var CD = housing[i][5]-1;
        for(var j = 0; j<polydistritos[CD].length; j++){
            if  (google.maps.geometry.poly.containsLocation(punto,polydistritos[CD][j]) == true){
                    distritos[CD][j][2][0] = parseInt((distritos[CD][j][2][0]+housing[i][3])/2);
               j = polydistritos[CD].length;
            }
        }
    }},3000);
    
setTimeout(function(){
    for (var i = 0; i < neighborhood.length; i++) {
        var punto= neighborhood[i][0];
        var CD = neighborhood[i][2]-1;
        for(var j = 0; j<polydistritos[CD].length; j++){
            if  (google.maps.geometry.poly.containsLocation(punto,polydistritos[CD][j]) == true){
                    distritos[CD][j][3].push(neighborhood[i][1]);
               j = polydistritos[CD].length;
            }
        }
    }},3000);
setTimeout(function(){
    for (var i = 0; i < crimes.length; i++) {
        var punto= crimes[i][3];
        var CD = crimes[i][1]-1;
        for(var j = 0; j<polydistritos[CD].length; j++){
            if  (google.maps.geometry.poly.containsLocation(punto,polydistritos[CD][j]) == true){
                    distritos[CD][j][4][0] = distritos[CD][j][4][0] +1;
                    if (distritos[CD][j][4][2].indexOf(crimes[i][2]) ==-1){ 
                        distritos[CD][j][4][2].push(crimes[i][2]);
                    }
               j = polydistritos[CD].length;
            }
        }
    }
    console.log(distritos);
    
    
},3000);
var cra = 0.0;
setTimeout(function(){
    var service = new google.maps.DistanceMatrixService;
    service.getDistanceMatrix({
    origins: [university_coordinates],
    destinations: centros[0],
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false
  }, function(response, status) {
    if (status=='OK'){
      var originList = response.originAddresses;
      var destinationList = response.destinationAddresses;
      for (var k = 0; k < originList.length; k++) {
        var results = response.rows[k].elements;
         for (var j = 0; j < results.length; j++) {
                distritos[0][j][5][0] = results[j].distance.value/1000; 
        }
      }
    }
  });
  },2000);
setTimeout(function(){
    var service = new google.maps.DistanceMatrixService;
    service.getDistanceMatrix({
    origins: [university_coordinates],
    destinations: centros[1],
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false
  }, function(response, status) {
    if (status=='OK'){
      var originList = response.originAddresses;
      var destinationList = response.destinationAddresses;
      for (var k = 0; k < originList.length; k++) {
        var results = response.rows[k].elements;
         for (var j = 0; j < results.length; j++) {
                distritos[1][j][5][0] = results[j].distance.value/1000; 
        }
      }
    }
  });

  },2000);
setTimeout(function(){
    var service = new google.maps.DistanceMatrixService;
    service.getDistanceMatrix({
    origins: [university_coordinates],
    destinations: centros[2],
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false
  }, function(response, status) {
    if (status=='OK'){
      var originList = response.originAddresses;
      var destinationList = response.destinationAddresses;
      for (var k = 0; k < originList.length; k++) {
        var results = response.rows[k].elements;
         for (var j = 0; j < results.length; j++) {
                distritos[2][j][5][0] = results[j].distance.value/1000; 
        }
      }
    }
  });

  },2000);
setTimeout(function(){
    var service = new google.maps.DistanceMatrixService;
    service.getDistanceMatrix({
    origins: [university_coordinates],
    destinations: centros[3],
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false
  }, function(response, status) {
    if (status=='OK'){
      var originList = response.originAddresses;
      var destinationList = response.destinationAddresses;
      for (var k = 0; k < originList.length; k++) {
        var results = response.rows[k].elements;
         for (var j = 0; j < results.length; j++) {
                distritos[3][j][5][0] = results[j].distance.value/1000; 
        }
      }
    }
  });

  },2000);
setTimeout(function(){
    var service = new google.maps.DistanceMatrixService;
    service.getDistanceMatrix({
    origins: [university_coordinates],
    destinations: centros[4],
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false
  }, function(response, status) {
    if (status=='OK'){
      var originList = response.originAddresses;
      var destinationList = response.destinationAddresses;
      for (var k = 0; k < originList.length; k++) {
        var results = response.rows[k].elements;
         for (var j = 0; j < results.length; j++) {
                distritos[4][j][5][0] = results[j].distance.value/1000; 
        }
      }
    }
  });
  },2000);
var a = 1;
setTimeout(function(){
    for (var i = 0; i < distritos.length; i++) {
        for(var j = 0; j<distritos[i].length; j++){
            distrito.splice(distritos[i][j][0], 0,distritos[i][j]);
        }
    }
    distrito.sort(function(a, b){return b[2][0] - a[2][0]});
    for (var i = 0; i < distrito.length; i++) {
        distrito[i][2][1] = i+1;
        distrito[i][6][0] = distrito[i][2][1];
    }
    console.log(distrito);
    distrito.sort(function(a, b){return a[4][0] - b[4][0]});
    for (var i = 0; i < distrito.length; i++) {
        distrito[i][4][1] = i+1;
        distrito[i][6][0] = (distrito[i][6][0]+distrito[i][4][1]);
    }
    distrito.sort(function(a, b){return a[5][0] - b[5][0]});
    console.log(distrito);
    for (var i = 0; i < distrito.length; i++) {
        console.log(distrito[i][5][0])
        distrito[i][5][1] = i+1;
        distrito[i][6][0] = (distrito[i][6][0]+distrito[i][5][1])/3;
    }
    distrito.sort(function(a, b){return a[6][0] - b[6][0]});
    console.log(distrito);
    for (var i = 0; i < distrito.length; i++) {
        distrito[i][6][1] = i+1;
    }
    document.getElementById("Titulo").innerHTML = "Select a District";
    lista = ["District ID","Borough","Ranking"];
    a = 0;
    check();
    //generar_tabla(lista);
},10000);


function check(){

    var check_dis = [];
    var check_item = []
    $('.check:checked').each(
    function() {
        console.log("a");
        var op = parseInt($(this).val())
        if(op >4){
            if (op == 5){
                check_item.push(["Safety",4])
                
            }else if(op == 6){
                check_item.push(["Distance",5])
            }else if(op == 7){
                check_item.push(["Affordability",2])

            }
            
        }else{
            check_dis.push(op);
        }
       
    }
    
);
generar_tabla(check_item,check_dis)
}

function generar_tabla(lista,check_dis) {
  var tabla   = document.getElementById("table");
  var tblBody = document.getElementById("tableBody");
  var fila = document.createElement("tr");
  datos_tabla = [];
  for (var i = 0; i< check_dis.length; i++){
      for (var j = 0; j< distritos[check_dis[i]].length; j++){
          var dis = distritos[check_dis[i]][j];
          var e = [[0,0],dis[0],dis[7]];
          for (var k = 0; k< lista.length; k++){
              e.push(dis[lista[k][1]][0]);
              e[0][0] = (e[0][0]+dis[lista[k][1]][1]);    
               
              console.log(dis)
              console.log(dis[lista[k][1]][1]);
              console.log(e[0][0]);
          }
        e[0][0] = e[0][0]/lista.length;
        datos_tabla.push(e);
      }
       
  }
  lista2 = ["Ranking","District ID","Borough"]
  console.log(datos_tabla)
  datos_tabla.sort(function(a, b){return a[0][0] - b[0][0]});
  for (var j = 0; j < lista2.length; j++) {
      var columna = document.createElement("td");
      var texto = document.createTextNode(lista2[j]);
      columna.appendChild(texto);
      fila.appendChild(columna);
  }
  
  for (var j = 0; j < lista.length; j++) {
      var columna = document.createElement("td");
      var texto = document.createTextNode(lista[j][0]);
      columna.appendChild(texto);
      fila.appendChild(columna);
  }
      tblBody.appendChild(fila);
  
  
  
  for (var i = 0; i < datos_tabla.length; i++) {
    var hilera = document.createElement("tr");
 
    for (var j = 0; j < lista.length+lista2.length; j++) {
      var celda = document.createElement("td");
      var textoCelda;
      if (j==0){
          textoCelda =  document.createTextNode(String(i+1));
          
      }else{
      var textoCelda = document.createTextNode(String(datos_tabla[i][j]));
      }
      celda.appendChild(textoCelda);
      hilera.appendChild(celda);
    }
    tblBody.appendChild(hilera);
  }
  tabla.appendChild(tblBody);

    
}


var housing = [];
function getHousing(){
  var data = $.get(HOUSING_URL,function(){})
    .done(function(){
        var dataRow = data.responseJSON.data;
        for (var i = 0; i < dataRow.length; i++) {
            if(dataRow[i][23]!=null){
            if (dataRow[i][31]!=0){
                var borough = "";
                borough = dataRow[i][19][3]+dataRow[i][19][4];
                var c = new google.maps.LatLng(parseFloat(dataRow[i][23]),parseFloat(dataRow[i][24]));
                var Borough = dataRow[i][15];
                var BoroughCD = 0;
                if (Borough=="Bronx"){
                    BoroughCD = 2
                }else if(Borough=="Brooklyn"){
                    BoroughCD = 3
                }else if(Borough=="Queens"){
                    BoroughCD = 4
                }else if(Borough=="Staten Island"){
                    BoroughCD = 5
                }else if(Borough=="Manhattan"){
                    BoroughCD = 1
                }
            housing.push([dataRow[i][15],dataRow[i][23],dataRow[i][24],parseInt(dataRow[i][31]),c,BoroughCD]);
            }}
        }
    })
    .fail(function(error){
        console.log(error);
    });
}
/*
var origin1 = new google.maps.LatLng(55.930385, -3.118425);
var origin2 = 'Greenwich, England';
var destinationA = 'Stockholm, Sweden';
var destinationB = new google.maps.LatLng(50.087692, 14.421150);

var service = new google.maps.DistanceMatrixService();
service.getDistanceMatrix(
  {
    origins: [origin1, origin2],
    destinations: [destinationA, destinationB],
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false
  }, console.log("WW"));


*/
var neighborhood = [];
function getNeigh(){
  var data = $.get(NEIGHBOR_URL,function(){})
    .done(function(){
        var dataRow = data.responseJSON.data;
        for (var i = 0; i < dataRow.length; i++) {
            var punto = (dataRow[i][9].substr(7,(dataRow[i][9].length)-9)).split(" ");
            var c = new google.maps.LatLng(parseFloat(punto[1]),parseFloat(punto[0]));
            var Borough = dataRow[i][16];
                var BoroughCD = 0;
            if (Borough=="Bronx"){
                    BoroughCD = 2
                }else if(Borough=="Brooklyn"){
                    BoroughCD = 3
                }else if(Borough=="Queens"){
                    BoroughCD = 4
                }else if(Borough=="Staten Island"){
                    BoroughCD = 5
                }else if(Borough=="Manhattan"){
                    BoroughCD = 1
                }
            neighborhood.push([c,dataRow[i][10],BoroughCD]);
            }
    })
    .fail(function(error){
        console.log(error);
    });
}
var crimes = [];
function getCrimes(){
   $.ajax({
    url: CRIME_URL,
    type: "GET",
    data: {
      "$limit" : 5000,
    }
}).done(function(data) {
  for (var i = 0; i < data.length; i++) {
            if (data[i].lat_lon != null){
                var Borough= data[i].boro_nm;
                var BoroughCD = 0;
                if (Borough=="BRONX"){
                    BoroughCD = 2
                }else if(Borough=="BROOKLYN"){
                    BoroughCD = 3
                }else if(Borough=="QUEENS"){
                    BoroughCD = 4
                }else if(Borough=="STATEN ISLAND"){
                    BoroughCD = 5
                }else if(Borough=="MANHATTAN"){
                    BoroughCD = 1
                }
                var punto = data[i].lat_lon.coordinates;
                var c = new google.maps.LatLng(parseFloat(punto[1]),parseFloat(punto[0]));
                crimes.push([Borough,BoroughCD,data[i].ofns_desc,c,data[i].cmplnt_fr_dt]);
            }
    }
  console.log(crimes);
});
}
directionsService = new google.maps.DirectionsService();
directionsRenderer = new google.maps.DirectionsRenderer();


function getDistancia(a){
    var request = {
        origin: a,
        destination: university_coordinates,
        travelMode: 'DRIVING'
    }
    directionsService.route(request,function(result, status){
        if(status == "OK"){
            directionsRenderer.setDirections(result);
        }
        console.log(result.routes[0].legs[0].distance.value);
        cra = result.routes[0].legs[0].distance.value;
        return result;
    });
    setTimeout(function(){console.log(cra);
        return 0;
    },5000);
    console.log(cra);
}

function getRoute(a){
    var request = {
        origin: a,
        destination: university_coordinates,
        travelMode: 'DRIVING'
    }
    directionsRenderer.setMap(map);
    directionsService.route(request,function(result, status){
        if(status == "OK"){
            console.log(result);
            directionsRenderer.setDirections(result);
            console.log(result);
        }
        console.log(result.routes[0].legs[0].distance.value);
        return result;
    });
    
    //console.log(result);
}
/*
var markt = [];
function getMarkt(){
  var data = $.get(MARKT_URL,function(){})
    .done(function(){
        console.log(data);
        var json = JSON.parse(data.responseText);
        console.log(json);
        var dataRow = data.responseJSON.data;
        
    })
    .fail(function(error){
        console.log(error);
    });
}
*/

/*
var infoRows = [];
function getData(){
  var data = $.get(DEATHS_URL,function(){})
    .done(function(){
        var dataRow = data.responseJSON.data;
        for (var i = 0; i < dataRow.length; i++) {
          infoRows.push([dataRow[i][8],dataRow[i][13],dataRow[i][9]]);
        }
        var tableReference= $("#tableBody")[0];
        var newRow,state,deaths,year;
        for (var j = 0; j < infoRows.length; j++) {
          newRow = tableReference.insertRow(tableReference.rows.length);
          state = newRow.insertCell();
          deaths = newRow.insertCell();
          year = newRow.insertCell();
          state.innerHTML = infoRows[j][0];
          deaths.innerHTML = infoRows[j][1];
          year.innerHTML = infoRows[j][2];
        }
    })
    .fail(function(error){
        console.log(error);
    });
}
*/

$("document").ready(function(){
  getDistritos();
  getHousing();
  getNeigh();
  getCrimes();
  //getMarkt()
  //getDistancia(bro_coordinates);
  $("#getData").on("click",check)
  $("#exportData").click(function(){
  $("table").tableToCSV();
  });
  
});