const tabularParser = (datum) => ({
  ...datum,
  gastos: parseInt(datum.gastos),
  ingresos: parseInt(datum.ingresos),
  votos: parseInt(datum.votos),
})

const loadTabularFile = async (path) => {
  const tabularData = d3.csv(path, tabularParser);
  return tabularData;
}