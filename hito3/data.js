const dataParser = (datum) => ({
  id: datum.ID,
  regionName: datum.NOM_REGION,
  provinciaName: datum.NOM_PROVIN,
  comunaName: datum.NOM_COMUNA,
  totalPopulation: parseInt(datum.TOTAL_PERS),
  masIndex: parseFloat(datum.INDICE_MAS),
  depJuIndex: parseFloat(datum.IND_DEP_JU),
  depVeIndex: parseFloat(datum.IND_DEP_VE)
});

const loadDataFile = async (path) => {
  const infoData = await d3.csv(path, dataParser);
  return infoData;
};

const loadMapFile = async (path) => {
  const mapData = await d3.json(path);
  return mapData;
};