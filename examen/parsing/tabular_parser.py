import csv


data = {}


def get_coalicion(partido):
    coaliciones = {
        "Frente Amplio": ["PODER", "REVOLUCION DEMOCRATICA", "PARTIDO LIBERAL DE CHILE", "PARTIDO HUMANISTA", "PARTIDO IGUALDAD"],
        "Chile Vamos": ["RENOVACION NACIONAL", "UNION DEMOCRATA INDEPENDIENTE", "PARTIDO EVOLUCION POLITICA"],
        "Nueva Mayoría": ["PARTIDO DEMOCRATA CRISTIANO", "PARTIDO POR LA DEMOCRACIA", "PARTIDO SOCIALISTA DE CHILE", "PARTIDO RADICAL SOCIALDEMOCRATA", "PARTIDO COMUNISTA DE CHILE"],
        "Independiente": ["INDEPENDIENTE"],
        "Sumemos": ["AMPLITUD", "PARTIDO CIUDADANOS"],
        "Yo Marco por el Cambio": ["PARTIDO PROGRESISTA", "DEMOCRACIA REGIONAL PATAGONICA", "PARTIDO PAIS", "FEDERACION REGIONALISTA VERDE SOCIAL"],
        "Partido Todos (sin coalición)": ["TODOS"],
        "Partido Unión Patriótica (sin coalición)": ["UNION PATRIOTICA"],
    }
    for coalicion, partidos in coaliciones.items():
        if partido in partidos:
            return coalicion
    return "Sin información"


def spending_row_parser(data, row_dict):
    if row["NOMBRE_DEL_CANDIDATO"] not in data.keys():
        data[row["NOMBRE_DEL_CANDIDATO"]] = {
            "nombre": row["NOMBRE_DEL_CANDIDATO"].lower().title(),
            "gastos": int(row["MONTO"].strip().replace(",", "")),
            "cargo": row["\ufeffeleccion"].lower().title(),
            "region": row["REGION"].lower().title(),
            "territorio": row["TERRITORIO_ELECTORAL"].lower().title(),
            "partido": row["NOMBRE_PARTIDO"].lower().title(),
            "votos": 0,
            "ingresos": 0,
            "coalicion": get_coalicion(row["NOMBRE_PARTIDO"]).lower().title()
        }
    else:
        data[row["NOMBRE_DEL_CANDIDATO"]
             ]["gastos"] += int(row["MONTO"].strip().replace(",", ""))


def income_row_parser(data, row_dict):
    if row["\ufeffNOMBRE_DEL_CANDIDATO"] in data.keys():
        data[row["\ufeffNOMBRE_DEL_CANDIDATO"]
             ]["ingresos"] += int(row["MONTO"].strip().replace(",", ""))


with open('gastos.csv', newline='',  encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        spending_row_parser(data, row)

with open('ingresos.csv', newline='',  encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        income_row_parser(data, row)

with open('data.csv', 'w',  encoding='utf-8') as csvfile:
    headers = ["nombre", "gastos", "cargo", "region",
               "territorio", "partido", "votos", "ingresos", "coalicion"]
    writer = csv.DictWriter(csvfile, fieldnames=headers)
    writer.writeheader()
    for candidate in data.values():
        writer.writerow(candidate)
