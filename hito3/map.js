// CONSTANTS
const MAP_HEIGHT = 600;
const MAP_WIDTH = 400;

const PLOT_HEIGHT = 400;
const PLOT_WIDTH = 600;
const PLOT_MARGIN = {
  top: 30,
  bottom: 30,
  right: 30,
  left: 30,
};
const zoomHandler = (event) => {
  d3.select("#map-g").attr("transform", event.transform);
}

const zoom = d3
  .zoom()
  .extent([
    [0, 0],
    [MAP_WIDTH, MAP_HEIGHT],
  ])
  .translateExtent([
    [0, 0],
    [MAP_WIDTH, MAP_HEIGHT],
  ])
  .scaleExtent([1, 100])
  .on("zoom", zoomHandler);

// MAP
const mapDrawer = async (mapData, infoData) => {
  const mapSvg = d3.select("#map-container")
                 .append("svg")
                 .attr("height", MAP_HEIGHT)
                 .attr("width", MAP_WIDTH)
                 .attr("id", "map-svg");

  const colorScale  = d3.scaleSequential().domain([
      d3.min(infoData, d => (d.totalPopulation)),
      d3.max(infoData, d => (d.totalPopulation))])
    .interpolator(d3.interpolateYlGn)
    
  const mapProjection = d3.geoMercator().fitSize([MAP_WIDTH, MAP_HEIGHT], mapData);
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
        .attr("height", MAP_HEIGHT)
        .attr("width", MAP_WIDTH)
        .attr("stroke", "black")
        .attr("fill", "none");

  mapSvg.call(zoom);
};

// SCATTER PLOT
const scatterPlotDrawer = async (infoData) => {
  const plotSvg = d3
    .select("#plot-container")
    .append("svg")
    .attr("height", PLOT_HEIGHT)
    .attr("width", PLOT_WIDTH)
    .attr("id", "plot-svg");

  // SCALES
  const scaleX = d3.scaleLinear()
    .domain([0, d3.max(infoData, d => d.masIndex)])
    .range([0, PLOT_WIDTH - PLOT_MARGIN.left - PLOT_MARGIN.right]);

  const scaleY = d3.scaleLinear()
    .domain([0, d3.max(infoData, d => d.depJuIndex)])
    .range([PLOT_HEIGHT - PLOT_MARGIN.bottom - PLOT_MARGIN.top, 0]);

  // CONTAINERS
  const pointsG = plotSvg
    .append("g")
    .attr("transform", `translate(${PLOT_MARGIN.left} ${PLOT_MARGIN.top})`);
  
  const xAxisG = plotSvg
    .append("g")
    .attr("transform", `translate(${PLOT_MARGIN.left} ${PLOT_HEIGHT - PLOT_MARGIN.top})`)
    .call(d3.axisBottom(scaleX));

  const yAxisG = plotSvg
    .append("g")
    .attr("transform", `translate(${PLOT_MARGIN.left} ${PLOT_MARGIN.top})`)
    .call(d3.axisLeft(scaleY));
  
  

  // AXIS
  


  // POINTS
  pointsG
    .selectAll("circle")
    .data(infoData)
    .join(
      enter => enter.append("circle"),
      update => update,
      exit => exit.remove(),
    )
    .attr("r", 2)
    .attr("cx", (d) => scaleX(d.masIndex))
    .attr("cy", (d) => scaleY(d.depJuIndex));
};
