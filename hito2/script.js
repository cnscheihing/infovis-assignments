// DATA PARSING
let id = 0;
const dataParsing = (data) => {
  id++;
  return ({
  id: `player${id}`, 
  position: data.POSITION,
  rating: data.RATING,
  stats:{
    PAC: parseInt(data.PACE),
    SHO: parseInt(data.SHOOTING),
    PAS: parseInt(data.PASSING),
    DRI: parseInt(data.DRIBBLING),
    DEF: parseInt(data.DEFENDING),
    PHY: parseInt(data.PHYSICAL),
  },
  info: [
    {key: "name", value: data.NAME},
    {key: "club", value: data.CLUB},
    {key: "league", value: data.LEAGUE},
    {key: "rating", value: data.RATING},
  ]
}
)}

// CONSTANT VARIABLES: DIMENSIONS
const CARD_WIDTH = 200;
const CARD_HEIGHT = 1.618 * CARD_WIDTH;
const CHART_CENTER_X =  CARD_WIDTH / 2;
const CHART_CENTER_Y =  (2/3) * CARD_HEIGHT;
const MAX_RADIUS = (1/4) * CARD_HEIGHT;

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

const cardColor = rating => {
  if (rating >= 75) return "#FDD703";
  else if (rating >= 65) return "#C0C0C0";
  else return "#CD7F33";
};

const chartColor = position => {
  const categories = {
    defense: ["CB", "RB", "LWB", "RWB"],
    midfielder: ["CM", "CAM", "CDM", "LM", "RM"],
    forward: ["LF", "CF", "RF", "ST", "RW", "LW"]
  };
  if (categories.defense.includes(position)) return "blue";
  else if (categories.midfielder.includes(position)) return "green";
  else return "red"; 
};

const cardDrawer = (dataArray) => {
  d3.select("#viz-container")
    .selectAll("div")
    .data(dataArray)
    .join(
      enter => {
        const svg = enter.append("div")
            .attr("id", (d) => (`${d.id}_div`))
            .attr("class", "card-container")
            .append("svg")
            .attr("id", (d) => (`${d.id}_svg`))
            .attr("width", CARD_WIDTH)
            .attr("height", CARD_HEIGHT)
            .style("background-color", d => cardColor(d.rating));
        
        svg.append("g")
            .attr("id", (d) => `${d.id}_info`)
            .selectAll("text")
            .data((d) => d.info)
            .join( enter => enter.append("text") )
            .text(d => d.value)
            .attr("class", d => d.key)
            .attr("y", (_, i) => 15 * (i + 1));
        
        const gChart = svg.append("g").attr("id", (d) => `${d.id}_chart`);
        // background circle
        gChart.append("circle")
          .attr("cx", CHART_CENTER_X)
          .attr("cy", CHART_CENTER_Y)
          .attr("r", MAX_RADIUS + 10)
          .attr("fill", "white");

        // stats polygon
        gChart.append("path")
          .attr("d", d => getSpiderPath(Object.values(d.stats)))
          .attr("fill", d => chartColor(d.position));

        // stat names
        gChart.selectAll("text")
          .data(d => Object.keys(d.stats))
          .join(
            enter => {
              // labels
              enter.append("text")
                .attr("x", (_, i) => getPolarCoordinates(getAngleFromIndex(i), 99).x)
                .attr("y", (_, i) => getPolarCoordinates(getAngleFromIndex(i), 99).y)
                .text(d => d)
                .style("font-size", 8);
              
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
      },
      update => update,
      exit => exit.remove(),
    );
}

d3.csv("fifa_20_data.csv", dataParsing)
  .then((data) => {
    cardDrawer(data);
  })
  .catch((error) => console.log(error));
