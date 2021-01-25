import pandas as pd
import matplotlib.pyplot as plt

# pip install pandas matplotlib openpyxl

data = pd.read_csv('test.csv')
#data.info()

# columns
# metric_name | timestamp | metric_value | check | error | error_code | group | method | name | proto | scenario |
# service | status | subproto | tls_version | url | extra_tags

# metric_name values
# http_reqs, http_req_duration, http_req_blocked, http_req_connecting_ http_req_tls_handshaking, http_req_receiving,
# data_sent, data_received, iteration_duration, iterations, vus, max_vus


reqs = data.loc[data['metric_name'] == 'http_req_duration', ['timestamp', 'metric_value']]
# print(reqs['metric_value'].describe())

min = reqs['metric_value'].min()
median = reqs['metric_value'].median()
max = reqs['metric_value'].max()

print(f'Min: {min}')
print(f'Median: {median}')
print(f'Max: {max}')

reqs.plot(x='timestamp', y="metric_value", title="Response time", kind="box")
plt.xlabel("Time (s)")
plt.ylabel("Response Time (ms)")
plt.show()
#plt.savefig('plot')

#reqs.to_excel('test.xlsx')