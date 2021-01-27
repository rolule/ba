
def path_to_name(path):
    values = path.split('/')

    name = ""
    start_index = -1
    if "lambda" in values:
        start_index = values.index("lambda")
        name += "Lambda"
    elif "fargate" in values:
        start_index = values.index("fargate")
        name += "Fargate"

    # use case
    use_case = values[start_index + 1]
    name += " UC-" + use_case.upper()

    # memory
    memory = values[start_index + 2]
    name += " " + memory + "MB"

    return name