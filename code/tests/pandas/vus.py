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

names = {path: path_to_name(path) for path in paths}
if len(set(names.values())) < len(names):
    names = {path: path_to_name(path, showTest=True) for path in paths}

# extract files from folders or just use files
tables = {}
for path in paths:
    if os.path.isfile(path) and path.endswith(".csv"):
        tables[path] = pd.read_csv(path)
    else:
        exit("You need to provide valid csv file paths.")

# merge all tables together
merge = {}
for path, table in tables.items():
    # create time column
    table["time"] = table["timestamp"] - table["timestamp"][0]

    # filter for vus metric
    vus = table[table["metric_name"] == "vus"]

    # only show time and metric value
    vus = vus[["time", "metric_value"]]

    # rename metric_value column to supplied name
    vus = vus.rename(columns={"metric_value": "VUs"})

    # filter for request duration metric
    reqd = table[table["metric_name"] == "http_req_duration"]

    # only show time and metric value
    reqd = reqd[["time", "metric_value"]]

    # group req_duration by max
    reqd_max = reqd.rename(columns={"metric_value": names[path] + "-max"}).groupby("time").max().reset_index()
    reqd_med = reqd.rename(columns={"metric_value": names[path] + "-min"}).groupby("time").min().reset_index()

    # rename metric_value column to supplied name
    reqd = reqd.rename(columns={"metric_value": names[path]})

    # groupe req_duration by median
    reqd = reqd.groupby("time").median().reset_index()

    # merge tables
    if len(merge) == 0:
        merge = pd.merge(vus, reqd, how="left", on="time")
        #merge = pd.merge(merge, reqd_max, how="left", on="time")
        #merge = pd.merge(merge, reqd_med, how="left", on="time")
    else:
        merge = pd.merge(merge, reqd, how="left", on="time")

# set time column to be the index
merge = merge.set_index("time")
print(merge.describe())

# plot merged table
ax = merge.plot(kind="line", grid=True)
for i, l in enumerate(ax.lines):
    plt.setp(l, linewidth=0.5)
plt.xlabel("Zeit (s)")
plt.ylabel("Anzahl der VUs / Antwortzeit (ms)")
plt.show()

# saves the plot under the given path
# plt.savefig('plot')
