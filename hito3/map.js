// CONSTANTS
const MAP_HEIGHT = 600;
const MAP_WIDTH = 400;

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

// MAP TOOLTIP
d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "map-tooltip")
  .append("p")
  .attr("id", "map-tooltip-name");

const showTooltip = (event, type, name) => {
  d3.select(`#${type}-tooltip`)
    .style("left", event.pageX + 5 + "px")
    .style("top", event.pageY + 5 + "px")
    .style("position", "fixed")
    .transition()
    .duration(200)
    .style("display", "flex")
    .style("opacity", 0.9);
  d3.select(`#${type}-tooltip-name`).text(name);
};

const hideTooltip = (type) => {
  d3.select(`#${type}-tooltip`)
    .transition()
    .duration(500)
    .style("opacity", 0)
    .style("display", "none");
}

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
    .attr("fill", (d) => colorScale(infoData.filter(infoDatum => infoDatum.id == d.id)[0].totalPopulation))
    .attr("stroke", colorScale(d3.max(infoData, d => (d.totalPopulation))))
    .attr("stroke-width", 0.02)
    .on("mouseenter", function (event, d) {
      d3.select(this).attr("fill", " #040f3c");
      showTooltip(event, "map", infoData.filter((infoDatum) => infoDatum.id == d.id)[0].comunaName);
    })
    .on("mouseleave", function (_, d) {
      d3.select(this).attr("fill", (d) =>
        colorScale(infoData.filter(infoDatum => infoDatum.id == d.id)[0].totalPopulation)
      );
      hideTooltip("map");
    });

  mapSvg.append("rect")
        .attr("height", MAP_HEIGHT)
        .attr("width", MAP_WIDTH)
        .attr("stroke", "black")
        .attr("fill", "none");

  mapSvg.call(zoom);
};

// SCATTER PLOT

const PLOT_HEIGHT = 400;
const PLOT_WIDTH = 600;
const PLOT_MARGIN = {
  top: 30,
  bottom: 30,
  right: 30,
  left: 30,
};

d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "plot-tooltip")
  .append("p")
  .attr("id", "plot-tooltip-name");


const scatterPlotDrawer = async (infoData) => {
  const plotSvg = d3
    .select("#plot-container")
    .append("svg")
    .attr("height", PLOT_HEIGHT)
    .attr("width", PLOT_WIDTH)
    .attr("id", "plot-svg");

  // SCALES
  const scaleX = d3.scaleLinear()
    .domain([0, d3.max(infoData, d => d.womenRate)])
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
  
  // POINTS
  pointsG
    .selectAll("circle")
    .data(infoData)
    .join(
      enter => enter.append("circle"),
      update => update,
      exit => exit.remove(),
    )
    .attr("r", 3)
    .attr("cx", (d) => scaleX(d.womenRate))
    .attr("cy", (d) => scaleY(d.depJuIndex))
    .on("mouseenter", function (event, d) {
      d3.select(this).attr("fill", " #040f3c");
      showTooltip(event, "plot", d.comunaName);
    })
    .on("mouseleave", function (_, d) {
      d3.select(this).attr("fill", (d) =>
        colorScale(d.totalPopulation)
      );
      hideTooltip("plot");
    });
};
