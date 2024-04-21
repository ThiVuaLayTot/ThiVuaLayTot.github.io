import csv
import pandas as pd
import logging
import logging.handlers
import os
import os.path
import re
import subprocess
import sys


css_styles = """<!DOCTYPE html>
<html lang="vi">

<head>
    <title>Các câu nói nổi tiếng về cờ vua</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway">
    <link rel="stylesheet" href="https://thivualaytot.github.io/css/main.css">
    <link rel="stylesheet" href="https://thivualaytot.github.io/css/listwinner.css">
    <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">
    <link rel="icon" href="https://raw.githubusercontent.com/ThiVuaLayTot/ThiVuaLayTot.github.io/main/images/favicon.ico" type="image/x-icon">
</head>

<body>
    {% include navbar.html %}

"""

footer_style = """
    {% include footer.html %}
    <script src="https://thivualaytot.github.io/js/main.js"></script>
</body>

</html>

"""

# Định nghĩa lớp Quote
class Quote:
    def __init__(self, text, author):
        self.text = text
        self.author = author

# Đọc tệp .csv
df = pd.read_csv('quote/quotes.csv')

# Chuyển DataFrame thành danh sách các đối tượng Quote
quotes = [Quote(text, author) for text, author in zip(df['text'], df['author'])]

# Tạo tệp .html
with open('quotes.html', 'w') as f:
    for quote in quotes:
        f.write(f'''{css_styles}
<p>{quote.text} - {quote.author}</p>\n
{footer_style}''')
