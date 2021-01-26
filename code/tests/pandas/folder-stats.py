import os
import sys

import matplotlib.pyplot as plt
import pandas as pd

# columns
# metric_name | timestamp | metric_value | check | error | error_code | group | method | name | proto | scenario |
# service | status | subproto | tls_version | url | extra_tags

# metric_name values
# http_reqs, http_req_duration, http_req_blocked, http_req_connecting_ http_req_tls_handshaking, http_req_receiving,
# data_sent, data_received, iteration_duration, iterations, vus, max_vus


# csv result files
folder = ""
try:
    folder = sys.argv[1]
except IndexError:
    exit("You need to provide the path to the folder.")

files = []
if os.path.isdir(folder):
    files = [os.path.join(folder, file) for file in os.listdir(folder) if file.endswith(".csv")]
else:
    exit("You need to provide a valid folder path.")

# names of the plot graphs
names = [f'Lauf {i}' for i in range(1, len(files) + 1)]

# read files
tables = [pd.read_csv(file) for file in files]

concat = tables[0]
for i in range(1, len(tables)):
    concat = pd.concat(tables, tables[i])

# filter for request duration metric
concat = concat[concat["metric_name"] == "http_req_duration"]

# only show metric value
concat = concat["metric_value"]

print(concat.describe())