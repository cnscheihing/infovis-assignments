const main = async () => {
  const mapData = await loadMapFile("../data/comunas.geojson");
  const infoData = await loadDataFile("../data/censo.csv");
  await mapDrawer(mapData, infoData);
  await scatterPlotDrawer(infoData);
}

main();