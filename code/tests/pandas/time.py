import os
import sys

import matplotlib.pyplot as plt
import pandas as pd

from utils import path_to_name

# columns
# metric_name | timestamp | metric_value | check | error | error_code | group | method | name | proto | scenario |
# service | status | subproto | tls_version | url | extra_tags

# metric_name values
# http_reqs, http_req_duration, http_req_blocked, http_req_connecting_ http_req_tls_handshaking, http_req_receiving,
# data_sent, data_received, iteration_duration, iterations, vus, max_vus

if len(sys.argv) <= 1:
    exit("You need to provide the path to the file or folder.")

# read csv result files from args
paths = sys.argv[1:]

# extract files from folders or just use files
tables = {}
for path in paths:
    if os.path.isfile(path) and path.endswith(".csv"):
        tables[path] = pd.read_csv(path)
    else:
        exit("You need to provide valid csv file paths.")

# names of the plot graphs
names = {}
for path in paths:
    names[path] = path_to_name(path)

# merge all tables together
merge = {}
for path, table in tables.items():
    # create time column
    table["time"] = table["timestamp"] - table["timestamp"][0]

    # filter for request duration metric
    table = table[table["metric_name"] == "http_req_duration"]

    # only show time and metric value
    table = table[["time", "metric_value"]]

    # rename metric_value column to supplied name
    table = table.rename(columns={"metric_value": names[path]})

    # add table grouped by median to merge table
    median_table = table.groupby("time").median().reset_index()
    # max_table = table.groupby("time").max().reset_index().rename(columns={names[path]: f'{names[path]}-max'})
    if len(merge) == 0:
        merge = median_table
        # merge = pd.merge(merge, max_table, how="left", on="time")
    else:
        merge = pd.merge(merge, median_table, how="left", on="time")

# set time column to be the index
merge = merge.set_index("time")
print(merge.describe())

# plot merged table
merge.plot(kind="line")
plt.xlabel("Zeit (s)")
plt.ylabel("Response Time (ms)")
plt.show()

# saves the plot under the given path
# plt.savefig('plot')
