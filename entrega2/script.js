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
});

// DATA VIZ
const WIDTH = 600;
const HEIGHT = 400;
const svg = d3.select("#viz-container")
              .append("svg").attr("width", WIDTH).attr("height", HEIGHT);
const sepalG = svg.append("g").attr("id", "sepal-g");
const petalG = svg.append("g").attr("id", "petal-g");

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
        .attr("cx", WIDTH / 2)
        .attr("cy", HEIGHT / 2)
        .attr("fill", "rgb(255, 0, 0, 0.5)")
        .attr("transform", (d, i) => `rotate(${120 * i + 150} ${WIDTH / 2 - d.sepalLength * 10} ${HEIGHT / 2})`);

  petalG.selectAll("ellipse")
        .data(data)
        .join(
          enter => enter.append("ellipse"),
          update => update,
          exit => exit.remove()
        )
        .attr("rx", (d) => (d.petalLength * 10))
        .attr("ry", (d) => (d.petalWidth * 10))
        .attr("cx", (d) => (WIDTH / 2 - (d.sepalLength * 10 - d.petalLength * 10)))
        .attr("cy", HEIGHT / 2)
        .attr("fill", "rgb(0, 255, 255, 0.5)")
        .attr("transform", (d, i) => `rotate(${120 * i + 90} ${WIDTH / 2 - d.sepalLength * 10 } ${HEIGHT / 2})`);
}

d3.json("iris.json", dataParsing)
  .then((data) => {
    const means = getMeans(data);
    console.log(means);
    globalMeans = means;
    joinData(means, "setosa");
  })
