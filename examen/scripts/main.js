// UTILS
const main = async () => {
  const tabularData = await loadTabularFile("../data/tabular_data.csv");
  const presidentData = tabularData.filter((data) => data.cargo === "PRESIDENTE");
  await dropdownConstructor(tabularData);
  console.log(presidentData);
  await barchartDrawer(presidentData);
}

main();