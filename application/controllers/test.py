import re
phone = "0925508117"
x = re.search("^(09|08|07|05|03)+[0-9]{8}", phone)

print(x)