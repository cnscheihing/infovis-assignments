// Basado en: https://bl.ocks.org/llad/3918637

const barchartDrawer = async (tabularData) => {
  tabularData.sort(function(a, b) {return d3.descending(a.gastos, b.gastos)});
  const maxSpendings = d3.max(tabularData, (d) => d.gastos);


  const barScale = d3.scaleLinear()
    .domain([0, maxSpendings])
    .range(["0%", "100%"]);

  const table = d3.select("#barchart-container").append("table");

  // const tr = table
  // .selectAll("tr")
  // .data(tabularData)
  // .join(
  //   (enter) => {
  //     enter
  //       .append("tr")
  //       .attr("class", "datarow");
  //   },
  //   (update) => update,
  //   (exit) => exit.remove()
  // );

  const tr = table
    .selectAll("tr")
    .data(tabularData)
    .enter()
    .append("tr")
    .attr("class", "datarow");

  tr.append("td")
    .text((d) => d.nombre);

  tr.append("td")
    .text((d) => d.gastos);

  tr.append("td")
    .attr("class", "td-bar")
    .append("div")
    .attr("class", "bar-div")
    .style("width", "0%")
    .style("background-color", "teal")
    .transition()
    .duration(500)
    .style("width", (d) => barScale(d.gastos));

}