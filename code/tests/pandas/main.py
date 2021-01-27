import matplotlib.pyplot as plt
import pandas as pd
import sys

# columns
# metric_name | timestamp | metric_value | check | error | error_code | group | method | name | proto | scenario |
# service | status | subproto | tls_version | url | extra_tags

# metric_name values
# http_reqs, http_req_duration, http_req_blocked, http_req_connecting_ http_req_tls_handshaking, http_req_receiving,
# data_sent, data_received, iteration_duration, iterations, vus, max_vus

# read csv result files from args
files = sys.argv[1:]

# names of the plot graphs
names = files

# read files
tables = [pd.read_csv(file) for file in files]

# create time column
for table in tables:
    table["time"] = table["timestamp"] - table["timestamp"][0]

# filter for request duration metric
tables = [table[table["metric_name"] == "http_req_duration"] for table in tables]

# only show time and metric value
tables = [table[["time", "metric_value"]] for table in tables]

# rename metric_value column to supplied name
tables = [table.rename(columns={"metric_value": name}) for table, name in zip(tables, names)]

# merge all tables together
col1Medians = tables[0].groupby("time").median().reset_index()
merge = col1Medians
for i in range(1, len(tables)):
    merge = pd.merge(merge, tables[i].groupby("time").median(), how="left", on="time")

col1Maxs = tables[0].groupby("time").max().reset_index().rename(columns={names[0]: f'{names[0]}-max'})
merge = pd.merge(merge, col1Maxs, how="left", on="time")

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
