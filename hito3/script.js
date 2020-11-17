// CONSTANTS
const HEIGHT = 600;
const WIDTH = 400;

const dataParser = (datum) => ({
  id: datum.id,
  regionName: datum.NOM_REGION,
  provinciaName: datum.NOM_PROVIN,
  comunaName: datum.NOM_COMUNA,
  totalPopulation: parseInt(datum.TOTAL_PERS),
  masIndex: parseFloat(datum.INDICE_MAS),
  depJuIndex: parseFloat(datum.INDICE_DEP_JU),
  depVeIndex: parseFloat(datum.INDICE_DEP_VE)
})

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
    [-10, -10],
    [WIDTH + 10, HEIGHT + 10],
  ])
  .scaleExtent([1, 100])
  .on("zoom", zoomHandler);

// MAP
const mapDrawer = async (mapData, infoData) => {
  // console.log(d3.min(infoData, d => (d.totalPopulation)));
  console.log(infoData);
  const mapSvg = d3.select("#map-container")
                 .append("svg")
                 .attr("height", HEIGHT)
                 .attr("width", WIDTH)
                 .attr("id", "map-svg");

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
    .attr("fill", "lightblue")
    .attr("stroke", "white")
    .attr("stroke-width", 0.02);

  mapSvg.append("rect")
        .attr("height", HEIGHT)
        .attr("width", WIDTH)
        .attr("stroke", "black")
        .attr("fill", "none");

  mapSvg.call(zoom);
};

const loadDataFile = async path => {
  return await d3.csv(path, dataParser)
    .then((data) => {
      console.log(data);
    });
}

const loadMapFile = async path => {
  await d3.json(path)
    .then((data) => {
      console.log(data);
      const censoData = loadDataFile("data/censo.csv");
      mapDrawer(data, censoData);
    });
}

loadMapFile("data/comunas.geojson");1