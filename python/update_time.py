from datetime import datetime
import os
import pytz

def time():
    tz_VI = pytz.timezone('Asia/Ho_Chi_Minh')
    datetime_VI = datetime.now(tz_VI)
    time = f'<p><i>Lần cuối cập nhật nội dung của Website lúc {datetime_VI.hour} giờ {datetime_VI.minute} phút, ngày {datetime_VI.day}/{datetime_VI.month}/{datetime_VI.year}</i>.</p>'
    return time

with open('_includes/updated.html', 'w', encoding='utf-8') as html_file:
    html_file.write(time())
