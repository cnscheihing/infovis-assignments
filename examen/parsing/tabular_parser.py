import csv

data = {}


def spending_row_parser(data, row_dict):
    if row["NOMBRE_DEL_CANDIDATO"] not in data.keys():
        data[row["NOMBRE_DEL_CANDIDATO"]] = {
            "nombre": row["NOMBRE_DEL_CANDIDATO"],
            "gastos": int(row["MONTO"].strip().replace(",", "")),
            "cargo": row["\ufeffeleccion"],
            "region": row["REGION"],
            "territorio": row["TERRITORIO_ELECTORAL"],
            "partido": row["NOMBRE_PARTIDO"],
            "votos": 0,
            "ingresos": 0
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
               "territorio", "partido", "votos", "ingresos"]
    writer = csv.DictWriter(csvfile, fieldnames=headers)
    writer.writeheader()
    for candidate in data.values():
        writer.writerow(candidate)
