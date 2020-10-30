
// GLOBAL VARIABLES
const WIDTH = 800;
const HEIGHT = 600;
var mapProjectionGlobal;
const svg = d3.select("body").append("svg").attr("width", WIDTH).attr("height", HEIGHT);
const globalG = svg.append("g").attr("width", WIDTH).attr("height", HEIGHT);
// DATA PARSER
const listingsDataParser = datum => ({
  // id,name,latitude,longitude,price,room_type,number_of_reviews
  ...datum,
  longitude: parseFloat(datum.longitude),
  latitude: parseFloat(datum.latitude),
  price: parseInt(datum.price),
  numberOfReviews: parseInt(datum.number_of_reviews),
});

// MAP SCALE AND PROJECTION
const mapDrawer = data => {
  // console.log(data.features);
  const mapProjection = d3.geoMercator().fitSize([WIDTH, HEIGHT], data);
  const geoPathGenerator = d3.geoPath().projection(mapProjection);

  const mapG = globalG.append("g")
    .selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("d", geoPathGenerator)
    .attr("fill", "#FD710F")
    .attr("stroke", "#FDF4EB");
}

const pinsDrawer = data => {
  const pinG = globalG.append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", 2)
    .attr("fill", "red")
    .attr("cx", d => mapProjectionGlobal([d.longitude, d.latitude])[0])
    .attr("cy", d => mapProjectionGlobal([d.longitude, d.latitude])[1]);

  // console.log(data);
}

// ZOOM
const zoomHandler = (event) => {
  globalG.attr("transform", event.transform);
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
  .scaleExtent([1, 2])
  .on("zoom", zoomHandler);

globalG.call(zoom);

d3.json("data/neighbourhoods.geojson")
  .then( data => {
    mapDrawer(data);
    mapProjectionGlobal = d3.geoMercator().fitSize([WIDTH, HEIGHT], data);
  })
  .catch(error => console.log(error));

d3.csv("data/listings.csv", listingsDataParser)
  .then(data => {
    pinsDrawer(data);
  })
  // .catch(error => console.log(error));