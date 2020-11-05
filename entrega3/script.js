// GLOBAL VARIABLES
const WIDTH = 500;
const HEIGHT = 650;
var mapProjectionGlobal;
const svg = d3.select("#map-container").append("svg").attr("width", "100%").attr("height", HEIGHT);
const globalG = svg.append("g").attr("width", "100%").attr("height", HEIGHT);
const mapG = globalG.append("g");
const pinG = globalG.append("g");

const ROOM_TYPES = {
 "Entire home/apt": "",
  "Private room": "",
  "Hotel room": "",
  "Shared room": "",
}

// DATA PARSER
const listingsDataParser = datum => ({
  ...datum,
  longitude: parseFloat(datum.longitude),
  latitude: parseFloat(datum.latitude),
  price: parseInt(datum.price),
  numberOfReviews: parseInt(datum.number_of_reviews),
});

// TOOLTIP
d3.select("body").append("div")
  .attr("id", "tooltip")
  .append("p").attr("id", "name");

const showTooltip = (event, d) => {
  d3.select("#tooltip")
  .style("left", (event.pageX) + 5 + "px")
  .style("top", (event.pageY) + 5 + "px")
  .transition()		
  .duration(200)
  .style("display", "flex")
  .style("opacity", .9);
  d3.select("#name").text(d.name);
}

// LEGEND
const legendDrawer = () => {
  const legendSvg = d3.select("#legend-container")
    .append("svg")
    .attr("height", 200);

  legendSvg
    .append("g").attr("id", "icon-legend")
    .selectAll("path")
    .data(Object.entries(ROOM_TYPES))
    .enter()
    .append("path")
    .attr("d", d => d[1])
    .attr("transform", (_, i) => `translate(0 ${i*30}) scale(0.6)`)
    .attr("fill", "white");

  d3.select("#icon-legend")
    .selectAll("text")
    .data(Object.entries(ROOM_TYPES))
    .enter()
    .append("text")
    .text(d => d[0])
    .attr("y", (_, i) => i*31 + 15)
    .attr("x", 40)
    .attr("fill", "white")
    .attr("font-family", "Source Sans Pro, sans-serif");

  const linearGradient = legendSvg.append("g")
    .attr("id", "color-legend")
    .append("linearGradient")
    .attr("id", "linear-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

    linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d3.interpolateYlOrRd(0)); //light blue

    linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", d3.interpolateYlOrRd(1)); //dark blue
  
  d3.select("#color-legend")
    .append("text")
    .text("Precio")
    .attr("fill", "white")
    .attr("font-family", "Source Sans Pro, sans-serif")
    .attr("y", -30)
    .attr("x", 25)
    .attr("font-weight", "bold")
    .attr("font-size", 18);
  
  d3.select("#color-legend").append("rect")
    .attr("width", 300)
    .attr("height", 20)
    .attr("y", -20)
    .style("fill", "url(#linear-gradient)");

  const legendScale = d3.scaleLinear()
    .domain([8, 5000])
    .range([0, 300]);

  const axisGenerator = d3.axisBottom()
    .scale(legendScale);
  
  d3.select("#color-legend")
    .call(axisGenerator)
    .attr("color", "white")
    .attr("transform",`translate(${0} ${180})`);
  }
// MAP DRAWER
const mapDrawer = data => {
  const mapProjection = d3.geoMercator().fitSize([WIDTH, HEIGHT], data);
  const geoPathGenerator = d3.geoPath().projection(mapProjection);
  mapG
    .selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("d", geoPathGenerator)
    .attr("fill", "lightblue")
    .attr("stroke", "#FDF4EB");
}

const pinsDrawer = data => {
  const colorScale = d3.scaleLog()
    .domain([d3.min(data, d => d.price), d3.max(data, d => d.price)])
    .range([0, 1]);

  pinG
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", d => ROOM_TYPES[d.room_type])
    .attr("fill", d => d3.interpolateYlOrRd(colorScale(d.price)))
    .attr("transform", d => `translate(${mapProjectionGlobal([d.longitude, d.latitude])[0]} ${mapProjectionGlobal([d.longitude, d.latitude])[1]}) scale(0.1)`)
    .on("mouseenter", function(event, d){
      d3.select(this).attr("fill", " #040f3c");
      showTooltip(event, d);
    })
    .on("mouseleave", function(_, d){
      d3.select(this).attr("fill", d => d3.interpolateYlOrRd(colorScale(d.price)));

      d3.select("#tooltip")
        .transition()		
        .duration(500)
        .style("opacity", 0)
        .style("display", "none");
    });
}

// ZOOM
const zoomHandler = (event) => {
  mapG.attr("transform", event.transform);
  pinG.attr("transform", event.transform);
}

const zoom = d3.zoom()
  .extent([
    [0, 0],
    [WIDTH, HEIGHT]
  ])
  .translateExtent([
    [-200, -200],
    [WIDTH + 200, HEIGHT + 200]
  ])
  .scaleExtent([1, 12])
  .on("zoom", zoomHandler);

globalG.call(zoom);

// EXTERNAL FILES HANDLING
const loadHomeIcon = async () => {
  await d3.xml("icons/home.svg")
  .then(data => {
    ROOM_TYPES["Entire home/apt"] = data.getElementsByTagName("path")[0].getAttribute("d");
  }).then()
}

const loadSharedIcon = async () => {
  await d3.xml("icons/shared.svg")
  .then(data => {
    ROOM_TYPES["Shared room"] = data.getElementsByTagName("path")[0].getAttribute("d");
  })
}

const loadHotelIcon = async () => {
  await d3.xml("icons/hotel.svg")
  .then(data => {
    ROOM_TYPES["Hotel room"] = data.getElementsByTagName("path")[0].getAttribute("d");
  })
}

const loadPrivateIcon = async () => {
  await d3.xml("icons/private.svg")
  .then(data => {
    ROOM_TYPES["Private room"] = data.getElementsByTagName("path")[0].getAttribute("d");
  })
}

const loadMap = async () => {
  await d3.json("data/neighbourhoods.geojson")
  .then(data => {
    mapDrawer(data);
    mapProjectionGlobal = d3.geoMercator().fitSize([WIDTH, HEIGHT], data);
  })
  .catch(error => console.log(error));
}

const loadListing = async () => {
  await d3.csv("data/listings.csv", listingsDataParser)
  .then(data => {
    pinsDrawer(data);
    legendDrawer();
  })
  .catch(error => console.log(error));
}

loadHomeIcon();
loadSharedIcon();
loadHotelIcon();
loadPrivateIcon();
loadMap();
loadListing();