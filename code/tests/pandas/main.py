import matplotlib.pyplot as plt
import pandas as pd

# columns
# metric_name | timestamp | metric_value | check | error | error_code | group | method | name | proto | scenario |
# service | status | subproto | tls_version | url | extra_tags

# metric_name values
# http_reqs, http_req_duration, http_req_blocked, http_req_connecting_ http_req_tls_handshaking, http_req_receiving,
# data_sent, data_received, iteration_duration, iterations, vus, max_vus


# csv result files
files = ['../debug/fargate/a/128/light-load/0126-1236.csv', '../debug/fargate/a/128/test/0125-1704.csv',
         '../debug/fargate/a/128/test/0125-1711.csv']

# names of the plot graphs
names = ["Fargate 1", "Fargate 2", "Fargate 3"]

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
merge = tables[0]
for i in range(1, len(tables)):
    merge = pd.merge(merge, tables[i], how="left", on="time")

# set time column to be the index
merge = merge.set_index("time")
print(merge.describe())

# plot merged table
merge.plot()
plt.xlabel("Zeit (s)")
plt.ylabel("Response Time (ms)")
plt.show()

# saves the plot under the given path
# plt.savefig('plot')
