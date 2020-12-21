// Basado en: https://bl.ocks.org/llad/3918637

const table = d3.select("#barchart-container").append("table");

const getPositions = (tabularData) => {
  return [...new Set(tabularData.map((d) => d.cargo)), "TODOS"];
} 

const dropdownFilter = (dataArray, value) => {
  if (value === "TODOS") return dataArray;
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
  console.log([...new Set(tabularData.map((d) => d.partido))]);

  const coalitions = [...new Set(tabularData.map((d) => d.coalicion))];
  
  const colormap = d3.scaleOrdinal()
      .domain(coalitions)
      .range(d3.schemeTableau10);
      
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
      .text((d) => d.nombre);
    
      tr.append("td")
        .attr("class", "td-spending")
        .text((d) => d3.format(".0d")(d.gastos/100000) + "M");
        
      tr.append("td")
        .attr("class", "td-bar")
        .append("div")
        .attr("class", "bar-div")
        .style("width", "0%")
        .style("background-color", (d) => colormap(d.coalicion))
        .transition()
        .duration(500)
        .style("width", (d) => barScale(d.gastos));        
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