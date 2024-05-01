import os
from datetime import datetime
import pytz

def time():
    tz_VI = pytz.timezone('Asia/Ho_Chi_Minh')
    datetime_VI = datetime.now(tz_VI)
    time = f'<p align="right"><i>Lần cuối cập nhật nội dung của website: {datetime_VI.hour}:{datetime_VI.minute}:{datetime_VI.second}, ngày {datetime_VI.day}/{datetime_VI.month}/{datetime_VI.year}</i>.</p>'
    return time

with open('_includes/updated.html', 'w', encoding='utf-8') as html_file:
    html_file.write(time())
