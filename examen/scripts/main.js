// UTILS
const main = async () => {
  const tabularData = await loadTabularFile("../data/tabular_data.csv");
  const presidentData = tabularData.filter((data) => data.cargo === "PRESIDENTE");
  await dropdownConstructor(tabularData);
  await barchartDrawer(presidentData);
}

main();