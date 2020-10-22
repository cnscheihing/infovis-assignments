// DATA PARSING
const dataParsing = (data) => ({
  id: data.NAME.replace(" ", "_"),
  name: data.NAME,
  club: data.CLUB,
  league: data.LEAGUE,
  tier: data.TIER,
  rating: data.RATING,
  stats:{
    "PAC": parseInt(data.PACE),
    "SHO": parseInt(data.SHOOTING),
    "PASS": parseInt(data.PASSING),
    "DRI": parseInt(data.DRIBBLING),
    "DEF": parseInt(data.DEFENDING),
    "PHY": parseInt(data.PHYSICAL),
  }
})

const testData = {
  id: "Lionel_Messi",
  club: "FC Barcelona",
  league: "Spain Primera Division",
  name: "Lionel Messi",
  rating: "95",
  stats: {
      DEF: 40,
      DRI: 97,
      PAC: 89,
      PASS: 93,
      PHY: 68,
      SHO: 93,
  }};

// CONSTANT VARIABLES: DIMENSIONS
const VIZ_WIDTH = 800;
const VIZ_HEIGHT = 600;
const CARD_WIDTH = 300;
const CARD_HEIGHT = 300;

const CHART_CENTER_X =  CARD_WIDTH / 2;
const CHART_CENTER_Y = CARD_HEIGHT / 2;
const MAX_RADIUS = (1/3) * CARD_HEIGHT;

// SCALE & COORDINATES
const radialScale = d3.scaleRadial()
                      .domain([1, 99])
                      .range([1, MAX_RADIUS]);

const getAngleFromIndex = index => (Math.PI / 2) + (2 * Math.PI * index / 6);

const getPolarCoordinates = (angle, radius) => {
  let x = Math.cos(angle) * radialScale(radius);
  let y = Math.sin(angle) * radialScale(radius);
  return {x: CHART_CENTER_X + x, y: CHART_CENTER_Y - y};
}

const getSpiderPath = stats => {
  const coordinates = [];
  for (let i = 0; i < stats.length; i++) {
    coordinates.push([
      getPolarCoordinates(getAngleFromIndex(i), stats[i]).x, 
      getPolarCoordinates(getAngleFromIndex(i), stats[i]).y
    ]);
  }
  return d3.line()(coordinates);
};

// prueba
const testSvg = d3.select("body")
                  .append("svg")
                  .attr("id", "test-svg")
                  .attr("width", CARD_WIDTH)
                  .attr("height", CARD_HEIGHT);

gTest = testSvg.append("g").attr("id", "Lionel_Messi");



const generateChart = (player) => {
  const g =  d3.select(`#${player.id}`);
  const statKeys = Object.keys(player.stats);

  // background circle
  g.append("circle")
    .attr("cx", CHART_CENTER_X)
    .attr("cy", CHART_CENTER_Y)
    .attr("r", MAX_RADIUS)
    .attr("fill", "cyan");

  // stat names
  g.selectAll("text")
    .data(statKeys)
    .join(
      enter => {
        // labels
        enter.append("text")
          .attr("x", (_, i) => getPolarCoordinates(getAngleFromIndex(i), 99).x)
          .attr("y", (_, i) => getPolarCoordinates(getAngleFromIndex(i), 99).y)
          .text(d => d)
          .style("font-size", 10);
        
        // outer line
        enter.append("line")
          .attr("x1", (_, i) => getPolarCoordinates(getAngleFromIndex(i), 99).x)
          .attr("y1", (_, i) => getPolarCoordinates(getAngleFromIndex(i), 99).y)
          .attr("x2", (_, i) => getPolarCoordinates(getAngleFromIndex(i + 1), 99).x)
          .attr("y2", (_, i) => getPolarCoordinates(getAngleFromIndex(i + 1), 99).y)
          .attr("stroke", "grey");
        
        // axes
        enter.append("line")
          .attr("x1", (_, i) => getPolarCoordinates(getAngleFromIndex(i), 99).x)
          .attr("y1", (_, i) => getPolarCoordinates(getAngleFromIndex(i), 99).y)
          .attr("x2", (_, i) => getPolarCoordinates(getAngleFromIndex(i + 3), 99).x)
          .attr("y2", (_, i) => getPolarCoordinates(getAngleFromIndex(i + 3), 99).y)
          .attr("stroke", "grey");
      }
    );
    
  // stats polygon
  g.append("path")
    .attr("d", getSpiderPath(Object.values(player.stats)))
    .attr("fill", "red");
}

generateChart(testData);

// testSvg.select
// const visualizationSvg = d3.select("#card-container")
//                   .append("svg")
//                   .attr("width", VIZ_WIDTH)
//                   .attr("height", VIZ_HEIGHT);

// const vizContainer = d3.select("body")
//                        .append("div")
//                        .attr("id", "viz-container")
//                        .attr("width", 800)
//                        .attr("height", 600);


// const cardContentDrawer = (player) => {
//   // d3.select(`${player.NAME}`)
// }

// const cardContainerDrawer = (dataArray) => {
//   d3.select("#viz-container")
//     .selectAll("div")
//     .data(dataArray)
//     .join(
//       enter => enter.append("div"),
//       update => update,
//       exit => exit.remove(),
//     )
//     .attr("id", (d) => (d.NAME))
//     .attr("class", "card-container")
//     .attr("height", CARD_HEIGHT)
//     .attr("width", CARD_WIDTH)
//     .style("background-color", "red");
//     // .attr("fill", "red");


// }


d3.csv("fifa_20_data.csv", dataParsing)
  .then((data) => {
    console.log(data);
    // cardContainerDrawer(data);
  })
  .catch((error) => console.log(error));