const main = async () => {
  const mapData = await loadMapFile("../data/comunas.geojson");
  const infoData = await loadDataFile("../data/censo.csv");
  const map = await mapDrawer(mapData, infoData);
}

main();