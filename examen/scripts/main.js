// UTILS
const main = async () => {
  const tabularData = await loadTabularFile("../data/tabular_data.csv");
  await dropdownConstructor(tabularData);
  await barchartDrawer(tabularData);
}

main();