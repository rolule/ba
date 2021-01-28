import pandas as pd
import numpy as np
import sys

if len(sys.argv) <= 1:
    exit("You need to provide the path to the file or folder.")

file = sys.argv[1]

table = pd.read_csv(file)

# 7: method
# 8: name
# 9: proto
# 15: url
print(table.info())

# print(table.keys())
#
# for key in table.keys():
#     print(key)
#     print(table[key].unique())
#
#     print()

print()
print("ERRORS")
errors = table[~table["status"].isin([200, np.NaN])]

# only duration
errors = errors.loc[errors["metric_name"] == "http_req_duration", ["status"]]
for status in errors["status"].unique():
    status_count = len(errors[errors["status"] == status].index)
    print(f'{round(status)}: {status_count}')