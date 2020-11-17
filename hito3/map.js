// CONSTANTS
const HEIGHT = 600;
const WIDTH = 400;

const zoomHandler = (event) => {
  d3.select("#map-g").attr("transform", event.transform);
}

const zoom = d3
  .zoom()
  .extent([
    [0, 0],
    [WIDTH, HEIGHT],
  ])
  .translateExtent([
    [0, 0],
    [WIDTH, HEIGHT],
  ])
  .scaleExtent([1, 100])
  .on("zoom", zoomHandler);

// MAP
const mapDrawer = async (mapData, infoData) => {
  console.log(d3.max(infoData, d => (d.totalPopulation)));
  const mapSvg = d3.select("#map-container")
                 .append("svg")
                 .attr("height", HEIGHT)
                 .attr("width", WIDTH)
                 .attr("id", "map-svg");


  const colorScale  = d3.scaleSequential().domain([
      d3.min(infoData, d => (d.totalPopulation)),
      d3.max(infoData, d => (d.totalPopulation))])
    .interpolator(d3.interpolateYlGn)
    
  const mapProjection = d3.geoMercator().fitSize([WIDTH, HEIGHT], mapData);
  const geoPathGenerator = d3.geoPath().projection(mapProjection);
  mapSvg
    .append("g")
    .attr("id", "map-g")
    .attr("stroke", "black")
    .selectAll("path")
    .data(mapData.features)
    .enter()
    .append("path")
    .attr("d", geoPathGenerator)
    .attr("fill", d => colorScale(infoData.filter(infoDatum => infoDatum.id == d.id)[0].totalPopulation))
    .attr("stroke", colorScale(d3.max(infoData, d => (d.totalPopulation))))
    .attr("stroke-width", 0.02);

  mapSvg.append("rect")
        .attr("height", HEIGHT)
        .attr("width", WIDTH)
        .attr("stroke", "black")
        .attr("fill", "none");

  mapSvg.call(zoom);
};