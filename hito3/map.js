// CONSTANTS
const MAP_HEIGHT = 500;
const MAP_WIDTH = 400;

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
const zoomMapHandler = (event) => {
  d3.select("#map-g").attr("transform", event.transform);
}

const zoomMap = d3
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
  .on("zoom", zoomMapHandler);

const mapDrawer = async (mapData, infoData) => {
  const mapSvg = d3.select("#map-container")
                 .append("svg")
                 .attr("height", MAP_HEIGHT)
                 .attr("width", MAP_WIDTH)
                 .attr("id", "map-svg");

  const colorScale = d3.scaleSequential().domain([
      0,
      // d3.min(infoData, d => (d.totalPopulation)),
      d3.max(infoData, d => (d.totalPopulation))])
    .interpolator(d3.interpolateBlues)
  
  // const colorScale = d3.scaleQuantize()
  //   .domain([0, d3.max(infoData, d => (d.totalPopulation))])
  //   .range([colorScale2(d3.max(infoData, d => (d.totalPopulation))*1/5),
  //     colorScale2(d3.max(infoData, d => (d.totalPopulation))*2/5),
  //     colorScale2(d3.max(infoData, d => (d.totalPopulation))*3/5),
  //     colorScale2(d3.max(infoData, d => (d.totalPopulation))*4/5),
  //     colorScale2(d3.max(infoData, d => (d.totalPopulation))*5/5)])
    
  const mapProjection = d3.geoMercator().fitSize([MAP_WIDTH, MAP_HEIGHT], mapData);
  const geoPathGenerator = d3.geoPath().projection(mapProjection);
  mapSvg
    .append("g")
    .attr("id", "map-g")
    .selectAll("path")
    .data(mapData.features)
    .enter()
    .append("path")
    .attr("d", geoPathGenerator)
    .attr("fill", (d) => colorScale(infoData.filter(infoDatum => infoDatum.id == d.id)[0].totalPopulation))
    .attr("stroke", colorScale(d3.max(infoData, d => (d.totalPopulation))))
    .attr("stroke-width", 0.02)
    .attr("selected", "false")
    .on("mouseenter", function (event, d) {
      d3.select(this).style("opacity", "0.5");
      showTooltip(event, "map", infoData.filter((infoDatum) => infoDatum.id == d.id)[0].comunaName);
    })
    .on("mouseleave", function (_, d) {
      d3.select(this).style("opacity", "1");
      hideTooltip("map");
    })
    .on("click", function(_, d) {
      if(d3.select(this).attr("selected") == "false") {
        d3.select(this).attr("selected", "true");
        d3.select(this).attr("fill", "#f55c41");
        d3.select(`#p-${d.id}`).attr("fill", "#f55c41");
      } else {
        d3.select(this).attr("selected", "false");
        d3.select(this).attr("fill", (d) =>
          colorScale(infoData.filter(infoDatum => infoDatum.id == d.id)[0].totalPopulation)
        );
        d3.select(`#p-${d.id}`).attr("fill", "#123b75");
      }
    });

  mapSvg.append("rect")
        .attr("height", MAP_HEIGHT)
        .attr("width", MAP_WIDTH)
        .attr("stroke", "#123b75")
        .attr("fill", "none");

  mapSvg.call(zoomMap);
};

// SCATTER PLOT
// CONSTANTS
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

  plotSvg
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", PLOT_WIDTH - PLOT_MARGIN.right - PLOT_MARGIN.left)
    .attr("height", PLOT_HEIGHT - PLOT_MARGIN.top - PLOT_MARGIN.bottom);
    // .attr("transform", `translate(${PLOT_MARGIN.left} ${PLOT_MARGIN.top})`);
    // .attr("x", PLOT_MARGIN.left)
    // .attr("y", PLOT_MARGIN.top);

  // SCALES
  const scaleX = d3.scaleLinear()
    .domain([0, d3.max(infoData, d => d.womenRate)])
    .range([0, PLOT_WIDTH - PLOT_MARGIN.left - PLOT_MARGIN.right]);

  const scaleY = d3.scaleLinear()
    .domain([0, d3.max(infoData, d => d.depJuIndex)])
    .range([PLOT_HEIGHT - PLOT_MARGIN.bottom - PLOT_MARGIN.top, 0]);

  // AXIS
  const xAxis = d3.axisBottom(scaleX);
  const yAxis = d3.axisLeft(scaleY);

  // CONTAINERS
  const pointsG = plotSvg
    .append("g")
    .attr("transform", `translate(${PLOT_MARGIN.left} ${PLOT_MARGIN.top})`)
    .attr("clip-path", "url(#clip)")
  
  const xAxisG = plotSvg
    .append("g")
    .attr("transform", `translate(${PLOT_MARGIN.left} ${PLOT_HEIGHT - PLOT_MARGIN.top})`)
    .call(xAxis);

  const yAxisG = plotSvg
    .append("g")
    .attr("transform", `translate(${PLOT_MARGIN.left} ${PLOT_MARGIN.top})`)
    .call(yAxis);

  // POINTS
  const points = pointsG
    .selectAll("circle")
    .data(infoData)
    .join(
      enter => enter.append("circle"),
      update => update,
      exit => exit.remove(),
    )
    .attr("r", 2.5)
    .attr("cx", (d) => scaleX(d.womenRate))
    .attr("cy", (d) => scaleY(d.depJuIndex))
    .attr("id", (d) => `p-${d.id}`)
    .attr("fill", "#123b75")
    .on("mouseenter", function (event, d) {
      d3.select(this).attr("opacity", "0.5");
      showTooltip(event, "plot", d.comunaName);
    })
    .on("mouseleave", function (_, d) {
      d3.select(this).attr("opacity", "1");
      hideTooltip("plot");
    });

  // ZOOM
  const plotZoomHandler = (event) => {
    pointsG.attr("transform", event.transform);
    const scaleX2 = event.transform.rescaleX(scaleX);
    const scaleY2 = event.transform.rescaleY(scaleY);
    points.attr("cx", (d) => scaleX2(d.womenRate));
    points.attr("cy", (d) => scaleY2(d.depJuIndex));
    xAxisG.call(xAxis.scale(scaleX2));
    yAxisG.call(yAxis.scale(scaleY2));
  };

  const plotZoom = d3
    .zoom()
    .extent([
      [0, 0],
      [PLOT_WIDTH, PLOT_HEIGHT],
    ])
    .translateExtent([
      [0, 0],
      [PLOT_WIDTH, PLOT_HEIGHT],
    ])
    .scaleExtent([1, 4])
    .on("zoom", plotZoomHandler);

  plotSvg.call(plotZoom);
};
