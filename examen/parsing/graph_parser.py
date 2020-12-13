import csv

data = {}

nodes = []
aportantes = []
candidatos = []
links = []


def process_row(data, row_dict, minimum):

    if int(row_dict["value"]) < minimum:
        return
    if row_dict["source"] == "" or row_dict["\ufefftarget"] == "":
        return
    if row_dict["source"] == row_dict["\ufefftarget"]:
        return
    if row_dict["source"].split(" ")[0] == row_dict["\ufefftarget"].split()[0]:
        return
    if "PARTIDO" in row_dict["source"]:
        return
    if "BANCO" in row_dict["source"]:
        return
    if "FORMULARIO" in row_dict["source"]:
        return
    if "SOCIALISTA" in row_dict["source"]:
        return
    if "UNION" in row_dict["source"]:
        return
    if "RENOVACION" in row_dict["source"]:
        return
    if "CIUDADANOS" in row_dict["source"]:
        return
    if "COMUNISTA" in row_dict["source"]:
        return
    if "DEMOCRACIA" in row_dict["source"]:
        return
    if "MIGUEL JUAN" in row_dict["source"]:
        return
    if "VARIOS" in row_dict["source"]:
        return
    if "REEMBOLSO" in row_dict["source"]:
        return
    if "UDI" in row_dict["source"]:
        return
    if (row_dict["source"], row_dict["\ufefftarget"]) not in data.keys():
        data[(row_dict["source"], row_dict["\ufefftarget"])] = {
            "source": "Aportante: " + row_dict["source"],
            "target": "Candidato: " + row_dict["\ufefftarget"],
            "value": int(row_dict["value"])
        }
    else:
        data[(row_dict["source"], row_dict["\ufefftarget"])
             ]["value"] += int(row_dict["value"])


def store_person(nodes_aportante, nodes_candidato, row_dict):
    if row_dict["NOMBRE_APORTANTE"] not in nodes_candidato:
        nodes_candidato.append(row_dict["NOMBRE_APORTANTE"])
    if row_dict["NOMBRE_CANDIDATO"] not in nodes_candidato:
        nodes_candidato.append(row_dict["NOMBRE_CANDIDATO"])


def store_link(nodes_aportante, nodes_candidato, links):
    pass


with open('ingresos_conexiones.csv', newline='',  encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    # for row in reader:
    #     store_person(aportantes, candidatos, row)
    # aportantes_quantity = len(aportantes)
    # # nodes_aportante = [{"node": aportantes.index(i), "name": i } for i in aportantes]
    # # nodes_candidato = [{"node": candidatos.index(i) + aportantes_quantity, "name": i } for i in candidatos]
    # nodes_aportante = {aportantes.index(i): i for i in aportantes}
    # nodes_candidato = {candidatos.index(
    #     i) + aportantes_quantity: i for i in candidatos}

    for row in reader:
        # print(row)
        process_row(data, row, 10000000)

with open('network_data_10000000_name.csv', 'w',  encoding='utf-8') as csvfile:
    headers = ["source", "target", "value"]
    writer = csv.DictWriter(csvfile, fieldnames=headers)
    writer.writeheader()
    for income in data.values():
        writer.writerow(income)

print(len(data.keys()))
