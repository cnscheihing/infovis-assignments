import csv

nodes = []
aportantes = []
candidatos = []
links = []


def store_person(nodes_aportante, nodes_candidato, row_dict):
    if row_dict["NOMBRE_APORTANTE"] not in nodes_candidato:
        nodes_candidato.append(row_dict["NOMBRE_APORTANTE"])
    if row_dict["NOMBRE_CANDIDATO"] not in nodes_candidato:
        nodes_candidato.append(row_dict["NOMBRE_CANDIDATO"])


def store_link(nodes_aportante, nodes_candidato, links):
    pass


with open('ingresos_conexiones.csv', newline='',  encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        store_person(aportantes, candidatos, row)
    aportantes_quantity = len(aportantes)
    # nodes_aportante = [{"node": aportantes.index(i), "name": i } for i in aportantes]
    # nodes_candidato = [{"node": candidatos.index(i) + aportantes_quantity, "name": i } for i in candidatos]
    nodes_aportante = {aportantes.index(i): i for i in aportantes}
    nodes_candidato = {candidatos.index(
        i) + aportantes_quantity: i for i in candidatos}

    for row in reader:
        store_link(nodes_aportante, nodes_candidato, links)
