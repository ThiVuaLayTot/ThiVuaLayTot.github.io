from datetime import datetime
import os
import pytz

def time():
    tz_VI = pytz.timezone('Asia/Ho_Chi_Minh')
    datetime_VI = datetime.now(tz_VI)
    time = f'<pre>Lần cuối cập nhật trang web: {datetime_VI.hour} giờ {datetime_VI.minute} phút, ngày {datetime_VI.day}/{datetime_VI.month}/{datetime_VI.year}.</pre>'
    return time

with open('_includes/update.htm', 'w', encoding='utf-8') as html_file:
    html_file.write(time())
