mapboxgl.accessToken =
	"pk.eyJ1IjoiaHptIiwiYSI6ImNsY3FjMTNhZDAyNWkzb3AzOGl3OGl4dWIifQ.YvRmfyUvojKRDf696nYhkg";
const darkmap = "mapbox://styles/hzm/cle3123bh005r01qmgcbh070d";
const lightmap = "mapbox://styles/hzm/cldtd7omv008d01sewt8yvh1y";

const map = new mapboxgl.Map({
	container: "map", // container element id
	style: lightmap,
	center: [-4.256, 55.863],
	zoom: 12.9
});

const data_url =
	"https://api.mapbox.com/datasets/v1/hzm/clduerygg1vns28pnxqkwectj/features?access_token=pk.eyJ1IjoiaHptIiwiYSI6ImNsY3FjMTNhZDAyNWkzb3AzOGl3OGl4dWIifQ.YvRmfyUvojKRDf696nYhkg";

var addPoint_contrl=false;//Is it possible to click to added marked points
var mark_arr = []; //All marked points
function initMapLayer(){
	map.addLayer({
		id: "barPoints",
		type: "symbol",
		source: {
			type: "geojson",
			data: data_url
		},
		layout: {
			"icon-image": "Beer1",
			"icon-size": ["interpolate", ["linear"],
				["zoom"], 11, 0.05, 22, 0.4
			],
			// "icon-image": "pe-national-3",
			// "icon-size": ["interpolate", ["linear"],
			// 	["zoom"], 11, 1, 22, 1
			// ],
			"icon-allow-overlap": true
		},
		paint: {}
	});
	addmark();
}

//mark points
function addmark() {
	var features = [];
	for (var x in mark_arr) {
		features.push({
			"type": "Feature",
			"geometry": {
				"type": "Point",
				"coordinates": mark_arr[x]
			},
			"properties": {
				"id": x
			}
		})
	}
	console.log(features)
	//if markers' layer is not exist
	if (!map.getSource("markers")) {
		map.addSource("markers", {
			"type": "geojson",
			"data": {
				"type": "FeatureCollection",
				"features": features
			}
		});
		map.addLayer({
			"id": "markers",
			"type": "symbol",
			"source": "markers",
			"layout": {
				"icon-image": "pe-national-2",
				"icon-size": ["interpolate", ["linear"],
					["zoom"], 11, 1, 22, 1
				],
				"icon-allow-overlap": true
			}
		});
	} else {
		//if it exist we change the value of source
		map.getSource("markers").setData({
			"type": "FeatureCollection",
			"features": features
		})
	}



}
map.on("load", () => {
	// Add the image to the map style.
initMapLayer()
	


	/*
Add an event listener that runs
 when a user clicks on the map element.
*/
	map.on("click", (event) => {
		const features = map.queryRenderedFeatures(event.point, {
			layers: ["barPoints", "markers"] // replace with your layer name
		});
	//If you click beyond the marker
		if(addPoint_contrl){
			if (!features.length) {
				mark_arr.push([event.lngLat.lng, event.lngLat.lat])
				addmark()
				return;
			}
			const feature = features[0];
			if(feature.source=="markers"){
				//if we click the point
				//delete it
				mark_arr.splice(feature.properties.id,1)
				addmark();
			}
		}
	});

	map.on("click", "barPoints", (event) => {
		const features = map.queryRenderedFeatures(event.point, {
			layers: ["barPoints"] // replace with your layer name
		});

		console.log(features)
		const feature = features[0];
		/*
		Create a popup, specify its options
		and properties, and add it to the map.
		*/
		const popup = new mapboxgl.Popup({
				offset: [0, -15],
				className: "my-popup"
			})
			.setLngLat(feature.geometry.coordinates)
			.setHTML(
				`<h3>Location: ${feature.properties.Location}</h3>
		   <p>Open Time: ${feature.properties.Time}</p>
		   <p>Url:<a href="https:${feature.properties.url}" > ${feature.properties.url}</a></p>`
			)
			.addTo(map);
	});

	// If the user clicked on one of your markers, get its information.

	map.on("mouseenter", "barPoints", (e) => {
		// Change the cursor style as a UI indicator.
		map.getCanvas().style.cursor = "pointer";

		// Copy coordinates array.
		const coordinates = e.features[0].geometry.coordinates.slice();
		const feature = e.features[0];
		// Ensure that if the map is zoomed out such that multiple
		// copies of the feature are visible, the popup appears
		// over the copy being pointed to.
		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}

		// Populate the popup and set its coordinates
		// based on the feature found.
		const popup = new mapboxgl.Popup({
			offset: [0, -15],
			className: "my-popup2",
			closeButton: false,
			closeOnClick: false
		});
		popup
			.setLngLat(coordinates)
			.setHTML(`<h3>${feature.properties.Name}</h3>`)
			.addTo(map);

		map.on("mouseleave", "barPoints", () => {
			map.getCanvas().style.cursor = "";
			popup.remove();
		});
		map.on("click", (e) => {
			popup.remove();
		});
	});
	window.addEventListener('resize',()=>{
		setTimeout(()=>{
			map.resize()
		},500)
	})
});
const body = document.querySelector("body");
const sidebar = body.querySelector("nav");
const toggle = body.querySelector(".toggle");
const searchBtn = body.querySelector("#mysearch-box");
const modeSwitch = body.querySelector(".toggle-switch");
const modeText = body.querySelector(".mode-text");

const geocoder = new MapboxGeocoder({
	// Initialize the geocoder
	accessToken: mapboxgl.accessToken, // Set the access token
	mapboxgl: mapboxgl, // Set the mapbox-gl instance
	marker: false, // Do not use the default marker style
	placeholder: "Search for places in Glasgow", // Placeholder text for the search bar
	proximity: {
		longitude: 55.8642,
		latitude: 4.2518
	} // Coordinates of Glasgow center
});
var isControlAdded = false;

toggle.addEventListener("click", () => {
	sidebar.classList.toggle("close");
});

searchBtn.addEventListener("click", () => {
	sidebar.classList.remove("close");
	if (isControlAdded == false) {
		map.addControl(geocoder, "top-left");
		isControlAdded = true;
	} else {
		map.removeControl(geocoder);
		isControlAdded = false;
	}
});

//change mode
modeSwitch.addEventListener("click", () => {
	body.classList.toggle("dark");
	if (body.classList.contains("dark")) {
		modeText.innerText = "Light mode";
		map.setStyle(darkmap);
	} else {
		modeText.innerText = "Dark mode";
		map.setStyle(lightmap);
	}
	setTimeout(()=>{
		initMapLayer()
	},1000)
	
});

function showInstruction() {
	init();
	//show popbpx
	document.querySelector('.popbox').classList.remove('hide')
}

function closepop() {
	//close popbox
	document.querySelector('.popbox').classList.add('hide')
}

function showslide() {
	init();
	//show slide bar popbox
	document.querySelector('.range').classList.remove('hide')
	sliderChange()
}

function hideslide() {
	//close slide bar popbox
	document.querySelector('.range').classList.add('hide')
}

function Mark_init(){
	init();
	addPoint_contrl=true;
}

var isfull=false;
function full(){
	if(!isfull){
		if(document.documentElement.RequestFullScreen){
				document.documentElement.RequestFullScreen();
		 }
		 //full screen for firefox
		 console.log(document.documentElement.mozRequestFullScreen)
		 if(document.documentElement.mozRequestFullScreen){
				document.documentElement.mozRequestFullScreen();
		 }
		 //full screen for chrome
		 if(document.documentElement.webkitRequestFullScreen){
				document.documentElement.webkitRequestFullScreen();
		 }
		 //full screen for IE
		 if(document.documentElement.msRequestFullscreen){
				document.documentElement.msRequestFullscreen();
		 }
	}else{
		if(document.exitFullScreen){
		  document.exitFullscreen()
		}
		//for firefox
		console.log(document.mozExitFullScreen)
		if(document.mozCancelFullScreen){
		  document.mozCancelFullScreen()
		}
		//for chrome
		if(document.webkitExitFullscreen){
		  document.webkitExitFullscreen()
		}
		//for IE
		if(document.msExitFullscreen){
		  document.msExitFullscreen()
		}
	}
	setTimeout(()=>{
		map.resize();
	},500)
	isfull=!isfull;
}




function cbChange() {
	//Get all the values after the checkbox is checked
	var selected_arr = [];
	document.querySelectorAll('input[name="cb"]:checked').forEach(item => {
		// console.log(item.value)
		selected_arr.push(item.value)

		//selection filter
		var filter_arr = [];
		for (var x in selected_arr) {
			filter_arr.push(["==", ["get", selected_arr[x]], " 1"])
		}

		// map.setFilter('barPoints', [ "all",  ["==", ["get", "name"], "name1"], ["!=", ["get", "name"], "name2"] ]);
		map.setFilter('barPoints', ["all", ...filter_arr]);
	})
}

//slider change
function sliderChange() {
	// console.log(document.querySelector('#slider').value)
	document.querySelector('#slider_value').innerHTML = "Reviews Higher Than：" + document.querySelector('#slider').value
	map.setFilter('barPoints', ['>=', ['get', 'mark'], ' ' + document.querySelector('#slider').value]);
}

//click toggle close side bar
//click other button remove slider popup
function init() {
	addPoint_contrl=false;
	sidebar.classList.remove("close");
	if (isControlAdded) {
		map.removeControl(geocoder);
		isControlAdded = false;
	}
	closepop()
	hideslide()
}