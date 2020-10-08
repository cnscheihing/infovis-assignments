// DATA PARSING
const globalData = {
  setosa: [],
  versicolor: [],
  virginica: [],
}

var globalMeans;

const dataParsing = (data) => ({
    sepalLength: parseFloat(data.sepalLength),
    sepalWidth: parseFloat(data.sepalWidth),
    petalLength: parseFloat(data.petalLength),
    petalWidth: parseFloat(data.petalWidth),
    species: data.species,
})

const getMeans = (data) => {
  data.forEach(d => {
    globalData[d.species].push(d)
  });
  const means = {
    setosa: {
      sepalLength: d3.mean(globalData.setosa, d => (d.sepalLength)),
      sepalWidth: d3.mean(globalData.setosa, d => (d.sepalWidth)),
      petalLength: d3.mean(globalData.setosa, d => (d.petalLength)),
      petalWidth: d3.mean(globalData.setosa, d => (d.petalWidth)),
    },
    versicolor: {
      sepalLength: d3.mean(globalData.versicolor, d => (d.sepalLength)),
      sepalWidth: d3.mean(globalData.versicolor, d => (d.sepalWidth)),
      petalLength: d3.mean(globalData.versicolor, d => (d.petalLength)),
      petalWidth: d3.mean(globalData.versicolor, d => (d.petalWidth)),
    },
    virginica: {
      sepalLength: d3.mean(globalData.virginica, d => (d.sepalLength)),
      sepalWidth: d3.mean(globalData.virginica, d => (d.sepalWidth)),
      petalLength: d3.mean(globalData.virginica, d => (d.petalLength)),
      petalWidth: d3.mean(globalData.virginica, d => (d.petalWidth)),
    },
  };
  return means;
}

// DROPDOWN
const dropdown = document.getElementById("type-option");
dropdown.addEventListener("change", (event) => {
  joinData(globalMeans, event.target.value);
  secondJoinData(globalMeans, event.target.value);
});

// DATA VIZ
const WIDTH = 300;
const HEIGHT = 400;
const svg = d3.select("#svg-container")
              .append("svg").attr("width", WIDTH).attr("height", HEIGHT)
              .attr("id", "svg");
const sepalG = svg.append("g").attr("id", "sepal-g");
const petalG = svg.append("g").attr("id", "petal-g");

const svg2 = d3.select("#svg-container")
              .append("svg").attr("width", WIDTH).attr("height", HEIGHT)
              .attr("id", "svg");
const sepalG2 = svg2.append("g").attr("id", "sepal-g2");
const petalG2 = svg2.append("g").attr("id", "petal-g2");

function joinData (means, species) {
  const data = [means[species], means[species], means[species]];
  sepalG.selectAll("ellipse")
        .data(data)
        .join(
          enter => enter.append("ellipse"),
          update => update,
          exit => exit.remove()
        )
        .attr("rx", (d) => (d.sepalLength * 10))
        .attr("ry", (d) => (d.sepalWidth * 10))
        .attr("cx", (d) => ( WIDTH / 2 - d.sepalLength * 10))
        .attr("cy", HEIGHT / 2)
        .attr("fill", "#e690bc80")
        .attr("transform", (d, i) => `rotate(${120 * i + 150} ${WIDTH / 2 } ${HEIGHT / 2})`);

  petalG.selectAll("ellipse")
        .data(data)
        .join(
          enter => enter.append("ellipse"),
          update => update,
          exit => exit.remove()
        )
        .attr("rx", (d) => (d.petalLength * 10))
        .attr("ry", (d) => (d.petalWidth * 10))
        .attr("cx", (d) => (WIDTH / 2 - d.petalLength * 10))
        .attr("cy", HEIGHT / 2)
        .attr("fill", "#886eaa80")
        .attr("transform", (d, i) => `rotate(${120 * i + 90} ${WIDTH / 2 } ${HEIGHT / 2})`);
}


function secondJoinData (means, species) {
  const sepalRadius = Math.sqrt( means[species].sepalLength * 10 * means[species].sepalWidth * 10);
  const petalRadius = Math.sqrt( means[species].petalLength * 10 * means[species].petalWidth * 10);
  const totalRadius = Math.sqrt( means[species].sepalLength * 10 * means[species].sepalWidth * 10 +
                                 means[species].petalLength * 10 * means[species].petalWidth * 10 );
  const sepalData = [totalRadius, sepalRadius];
  const petalData = [totalRadius, petalRadius];

  var lineGenerator = d3.line() 
    .x((p) => p.x) 
    .y((p) => p.y) 
    .curve(d3.curveBasis);

  const sepalCoords = [
    {x: WIDTH / 2, y: HEIGHT},
    {x:  WIDTH / 2 - 80, y: HEIGHT / 2 - 80}
  ]

  const petalCoords = [
    {x: WIDTH / 2, y: HEIGHT},
    {x:  WIDTH / 2 + 10, y: HEIGHT / 4 + 20},
    {x:  WIDTH / 2 + 80, y: HEIGHT / 2 + 20}
  ]

  sepalG2.selectAll("circle")
         .data(sepalData)
         .join(
            enter => enter.append("circle"),
            update => update,
            exit => exit.remove()
         )
         .attr("cx", WIDTH / 2 - 80)
         .attr("cy", (_, i) => i == 0 ? HEIGHT / 2 - 80: HEIGHT / 2 + (totalRadius - sepalRadius) - 80 )
         .attr("r", (d) => (d))
         .attr("fill", (_, i) => i == 0 ? "#48214e" : "#F1BCD3");
  
  petalG2.selectAll("circle")
         .data(petalData)
         .join(
            enter => enter.append("circle"),
            update => update,
            exit => exit.remove()
          )
         .attr("cx", WIDTH / 2 + 80)
         .attr("cy", (_, i) => i == 0 ? HEIGHT / 2 + 20 : HEIGHT / 2 + (totalRadius - petalRadius) + 20)
         .attr("r", (d) => (d))
         .attr("fill", (_, i) => i == 0 ? "#48214e" : "#C3ABCA");

  sepalG2.append("path")
         .attr("d", lineGenerator((sepalCoords)))
         .attr("fill", "none") 
         .attr("stroke", "green"); 

  petalG2.append("path")
         .attr("d", lineGenerator((petalCoords)))
         .attr("fill", "none") 
         .attr("stroke", "green"); 
};

d3.json("iris.json", dataParsing)
  .then((data) => {
    const means = getMeans(data);
    console.log(means);
    globalMeans = means;
    joinData(means, "setosa");
    secondJoinData(means, "setosa");
  })
