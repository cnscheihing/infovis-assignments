// DATA PARSING
var globalData;
let id = 0;
const dataParsing = (data) => {
  id++;
  return ({
    id: `player${id}`, 
    position: data.POSITION,
    rating: data.RATING,
    club: data.CLUB,
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
const MAX_RADIUS = (1/5) * CARD_HEIGHT;

// SCALE & COORDINATES
const radialScale = d3.scaleLinear()
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
  if (rating == 0) return "#DB3340";
  else if (rating >= 75) return "#FDD703";
  else if (rating >= 65) return "#C0C0C0";
  else return "#CD7F33";
};

const chartColor = position => {
  const categories = {
    defense: ["CB", "RB", "LB", "LWB", "RWB"],
    midfielder: ["CM", "CAM", "CDM", "LM", "RM"],
    forward: ["LF", "CF", "RF", "ST", "RW", "LW"]
  };
  if (categories.defense.includes(position)) return "#28ABE3";
  else if (categories.midfielder.includes(position)) return "#1FDA9A";
  else if (categories.forward.includes(position)) return "#DB3340"; 
  else return "#FDD703";
};

// CARD DRAWER
const cardDrawer = (dataArray, containerId) => {
  d3.select(`#${containerId}`).selectAll("div").remove();
  
  d3.select(`#${containerId}`)
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
            .attr("class", "card-svg")
            .style("background-color", d => cardColor(d.rating));
        
        svg.append("g")
            .attr("id", (d) => `${d.id}_info`)
            .selectAll("text")
            .data((d) => d.info)
            .join( enter => enter.append("text") )
            .text(d => d.key == "rating" ? `Rating: ${d.value}` : d.value)
            .attr("class", d => `${d.key} info-text`)
            .attr("y", (_, i) => 15 * (i + 1) + 15)
            .attr("x", 15);
        
        const gChart = svg.append("g").attr("id", (d) => `${d.id}_chart`);
        // background circle
        gChart.append("circle")
          .attr("cx", CHART_CENTER_X)
          .attr("cy", CHART_CENTER_Y)
          .attr("r", MAX_RADIUS + 20)
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
                .attr("x", getPolarCoordinates(getAngleFromIndex(0), 99).x - 7)
                .attr("y", getPolarCoordinates(getAngleFromIndex(0), 99).y - 7)
                .attr("transform", (_, i) => `rotate (${(-60)*i} ${CHART_CENTER_X} ${CHART_CENTER_Y})`)
                .text(d => d)
                .attr("class", "chart-label");
              
              // outer line
              enter.append("line")
                .attr("x1", (_, i) => getPolarCoordinates(getAngleFromIndex(i), 99).x)
                .attr("y1", (_, i) => getPolarCoordinates(getAngleFromIndex(i), 99).y)
                .attr("x2", (_, i) => getPolarCoordinates(getAngleFromIndex(i + 1), 99).x)
                .attr("y2", (_, i) => getPolarCoordinates(getAngleFromIndex(i + 1), 99).y)
                .attr("stroke", "lightgrey");
              
              // axes
              enter.append("line")
                .attr("x1", (_, i) => getPolarCoordinates(getAngleFromIndex(i), 99).x)
                .attr("y1", (_, i) => getPolarCoordinates(getAngleFromIndex(i), 99).y)
                .attr("x2", (_, i) => getPolarCoordinates(getAngleFromIndex(i + 3), 99).x)
                .attr("y2", (_, i) => getPolarCoordinates(getAngleFromIndex(i + 3), 99).y)
                .attr("stroke", "lightgrey");
              
              svg.on("mouseenter", (_, d) => {
                if (d.id != "average") {
                  svg.filter(datum => datum.club == d.club).style("background-color", "#28ABE3");
                }
              });
            
              svg.on("mouseleave", (_, d) => {
                if (d.id != "average") {
                  svg.filter(datum => datum.club == d.club).style("background-color", d => cardColor(d.rating));
                }
              });
            },
            update => update,
            exit => exit.remove(),
          );     
      },
      update => update,
      exit => exit.remove(),
    );
}

// AVERAGE CARD
const getAverageStats = (dataArray) => (
  {
    id: "average",
    rating: 0,
    position: "average",
    info: dataArray.length > 0 ? [
      {key: "name", value: "Resumen de Jugadores"},
      {key:"", value: `Velocidad: ${parseInt(d3.mean(dataArray, d => (d.stats.PAC)))}`},
      {key:"", value: `Tiros: ${parseInt(d3.mean(dataArray, d => (d.stats.SHO)))}`},
      {key:"", value: `Pases: ${parseInt(d3.mean(dataArray, d => (d.stats.PAS)))}`},
      {key:"", value: `Regate: ${parseInt(d3.mean(dataArray, d => (d.stats.DRI)))}`},
      {key:"", value: `Defensa: ${parseInt(d3.mean(dataArray, d => (d.stats.DEF)))}`},
      {key:"", value: `Físico: ${parseInt(d3.mean(dataArray, d => (d.stats.PHY)))}`},
    ] : [{key: "name", value: "Resumen de Jugadores"}, {key:"", value:"No hay jugadores"}],
    stats: {
      PAC: d3.mean(dataArray, d => (d.stats.PAC)),
      SHO: d3.mean(dataArray, d => (d.stats.SHO)),
      PAS: d3.mean(dataArray, d => (d.stats.PAS)),
      DRI: d3.mean(dataArray, d => (d.stats.DRI)),
      DEF: d3.mean(dataArray, d => (d.stats.DEF)),
      PHY: d3.mean(dataArray, d => (d.stats.PHY)),
    }
  }
);

// BONUS: FILTERS
const dropdownLeagueFilter = (dataArray, value) => {
  if (value === "Todos") return dataArray;
  return dataArray.filter(data => data.info[2].value === value);
}

const dropdownClubFilter = (dataArray, value) => {
  if (value === "Todos") return dataArray;
  return dataArray.filter(data => data.info[1].value === value);
}

const minRatingFilter = (dataArray, value) => {
  return dataArray.filter(data => parseInt(data.rating) >= value);
}

const maxRatingFilter = (dataArray, value) => {
  return dataArray.filter(data => parseInt(data.rating) <= value);
}

const getClubs = dataArray => {
  return ["Todos", ...new Set(dataArray.map((d) => d.info[1].value))];
}

const getLeagues = dataArray => {
  return ["Todos", ...new Set(dataArray.map((d) => d.info[2].value))];
}

const dropdownLeagueConstructor = dataArray => {
  const leagues = getLeagues(dataArray);
  const select = d3.select("#league-filter");
  select.selectAll("option")
      .data(leagues)
      .enter()
      .append("option")
      .attr("value", d => d)
      .text(d => d);
  
  select.on("change", function(){
    const filteredData = dropdownLeagueFilter(globalData, this.value);
    d3.select("#total-cards").text(`Cantidad de jugadores: ${filteredData.length}`);
    cardDrawer(filteredData, "viz-container");
    cardDrawer([getAverageStats(filteredData)], "player_average_div");
  });

}

const dropdownClubConstructor = dataArray => {
  const clubs = getClubs(dataArray);
  const select = d3.select("#club-filter");
  select.selectAll("option")
      .data(clubs)
      .enter()
      .append("option")
      .attr("value", d => d)
      .text(d => d);

  select.on("change", function(){
    const filteredData = dropdownClubFilter(globalData, this.value);
    d3.select("#total-cards").text(`Cantidad de jugadores: ${filteredData.length}`);
    cardDrawer(filteredData, "viz-container");
    cardDrawer([getAverageStats(filteredData)], "player_average_div");
  });
}

d3.select("#min-range-filter")
  .on("input", function(){
    d3.select("#min-label").text(`Rating mínimo: ${this.value}`);
    const filteredData = minRatingFilter(globalData, this.value);
    d3.select("#total-cards").text(`Cantidad de jugadores: ${filteredData.length}`);
    cardDrawer(filteredData, "viz-container");
    cardDrawer([getAverageStats(filteredData)], "player_average_div");
  });

d3.select("#max-range-filter")
  .on("input", function(){
    d3.select("#max-label").text(`Rating máximo: ${this.value}`);
    const filteredData = maxRatingFilter(globalData, this.value);
    d3.select("#total-cards").text(`Cantidad de jugadores: ${filteredData.length}`);
    cardDrawer(filteredData, "viz-container");
    cardDrawer([getAverageStats(filteredData)], "player_average_div");
  })

// DATA LOADING
d3.csv("fifa_20_data.csv", dataParsing)
  .then((data) => {
    globalData = data;
    d3.select("#total-cards").text(`Cantidad de jugadores: ${data.length}`);
    cardDrawer(data, "viz-container");
    cardDrawer([getAverageStats(data)], "player_average_div");
    dropdownLeagueConstructor(data);
    dropdownClubConstructor(data);
    
  })
  .catch((error) => console.log(error));
