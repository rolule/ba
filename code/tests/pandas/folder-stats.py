import os
import sys

import pandas as pd

# columns
# metric_name | timestamp | metric_value | check | error | error_code | group | method | name | proto | scenario |
# service | status | subproto | tls_version | url | extra_tags

# metric_name values
# http_reqs, http_req_duration, http_req_blocked, http_req_connecting_ http_req_tls_handshaking, http_req_receiving,
# data_sent, data_received, iteration_duration, iterations, vus, max_vus

if len(sys.argv) <= 1:
    exit("You need to provide the path to the folder.")

# read csv result files or folders from stdin
paths = sys.argv[1:]

files = {}
for path in paths:
    if os.path.isdir(path):
        files[path] = [os.path.join(path, file) for file in os.listdir(path) if file.endswith(".csv")]
    elif os.path.isfile(path) and path.endswith(".csv"):
        files[path] = [path]
    else:
        exit("You need to provide a valid folder path.")

# names of the plot graphs
names = [f'Lauf {i}' for i in range(1, len(files) + 1)]

print(files)
# read files
tables = {}
for path, file_list in files.items():
    tables[path] = [pd.read_csv(file) for file in file_list]

# concat all
concats = {}
for path, table_list in tables.items():
    concats[path] = table_list[0]
    for i in range(1, len(table_list)):
        concats[path] = pd.concat([concats[path], table_list[i]], axis=0)

# filter for request duration metric
for path, concat in concats.items():
    concats[path] = concats[path][concats[path]["metric_name"] == "http_req_duration"]

    # only show metric value
    concats[path] = concats[path]["metric_value"]

    print(f'Path {path}')
    print(round(concats[path].describe(), 2))
    print(round(concats[path].quantile(q=[0.9, 0.95]), 2))
    print()