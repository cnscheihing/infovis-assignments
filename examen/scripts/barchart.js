// Basado en: https://bl.ocks.org/llad/3918637

const table = d3.select("#barchart-container").append("table");


const getPositions = (tabularData) => {
  return [...new Set(tabularData.map((d) => d.cargo)), "Todos"];
} 

const dropdownFilter = (dataArray, value) => {
  if (value === "Todos") return dataArray;
  return dataArray.filter((data) => data.cargo === value);
}

const dropdownConstructor = (tabularData) => {
  const positions = getPositions(tabularData);
  const select = d3.select("#position-filter");
  select.selectAll("option")
      .data(positions)
      .enter()
      .append("option")
      .attr("value", d => d)
      .text(d => d);

  select.on("change", async function(){
    const filteredData = dropdownFilter(tabularData, this.value);
    await barchartDrawer (filteredData);
  });
}


const barchartDrawer = async (tabularData) => {
  tabularData.sort(function(a, b) {return d3.descending(a.gastos, b.gastos)});

  const coalitions = [...new Set(tabularData.map((d) => d.coalicion))].sort();
  
  const colormap = d3.scaleOrdinal()
      .domain(coalitions)
      .range(d3.schemeTableau10);

    const showTooltip = (event, datum) => {
      d3.select("#tooltip")
        .style("left", event.pageX + 5 + "px")
        .style("top", event.pageY + 5 + "px")
        .style("position", "absolute")
        .style("background-color", colormap(datum.coalicion))
        .transition()
        .duration(200)
        .style("display", "flex")
        .style("opacity", 0.9);
      d3.select("#tt-name").text(datum.nombre);
      d3.select("#tt-position").text(`Cargo: ${datum.cargo}`);
      d3.select("#tt-territory").text(`Territorio: ${datum.territorio}`);
      d3.select("#tt-party").text(`Partido: ${datum.partido}`);
      d3.select("#tt-coalition").text(`Coalición: ${datum.coalicion}`);
    };
    
    const hideTooltip = () => {
      d3.select("#tooltip")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .style("display", "none");
    }
      
  const maxSpendings = d3.max(tabularData, (d) => d.gastos);

  const table = d3.select("#barchart-table");

  const barScale = d3.scaleLinear()
    .domain([0, maxSpendings])
    .range(["0%", "100%"]);

  const tdDrawer = (selection) => {
    const tr = selection
      .append("tr")
      .attr("class", "datarow");

      tr.append("td")
      .attr("class", "td-name")
      .text((d) => d.nombre)
      .on("click", function(_, d) {
        console.log("lodash");
        console.log(d);
        sankeyDrawer(`Candidato: ${d.nombre}`);
      });
    
      tr.append("td")
        .attr("class", "td-spending")
        .text((d) => d3.format(".0d")(d.gastos/100000) + "M");
        
      tr.append("td")
        .attr("class", "td-bar")
        .append("div")
        .attr("class", "bar-div")
        .style("width", "0%")
        .style("background-color", (d) => colormap(d.coalicion))
        .on("mouseenter", function (event, d) {
          d3.select(this).style("opacity", "0.5");
          showTooltip(event, d);
        })
        .on("mouseleave", function (_, d) {
          d3.select(this).style("opacity", "1");
          hideTooltip();
        })  
        .transition()
        .duration(500)
        .style("width", (d) => barScale(d.gastos))   
  }

  const tdUpdate = (selection) => {
    selection.select(".td-name").text((d) => d.nombre);
    selection.select(".td-spending").text((d) => d3.format(",.0d")(d.gastos/100000) + "M");
    selection.select(".td-bar")
      .select(".bar-div")
      .style("width", "0%")
      .style("background-color", (d) => colormap(d.coalicion))
      .transition()
      .duration(500)
      .style("width", (d) => barScale(d.gastos));
  }

  const tr = table
  .selectAll("tr")
  .data(tabularData)
  .join(
    (enter) => { tdDrawer(enter); },
    (update) => { tdUpdate(update); },
    (exit) => exit.remove()
  );

}