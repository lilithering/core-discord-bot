import pandas
import sys

dataframe = pandas.read_csv(sys.stdin, encoding='utf-8')
dataframe.set_index(dataframe.columns[0]).isna('C').to_json(sys.stdout, force_ascii=False)