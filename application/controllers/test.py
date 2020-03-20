day_of_week = 5
hour_of_day = 16777215

List_day_of_week=[]
List_hour_of_day=[]

for i in range(0,24):
    if 2**i & hour_of_day:
        List_hour_of_day.append(i)
print('List_hour_of_day',List_hour_of_day)
for i in range(0,7):
    if 2 **i & day_of_week:
        List_day_of_week.append(i)
print('List_day_of_week',List_day_of_week)
