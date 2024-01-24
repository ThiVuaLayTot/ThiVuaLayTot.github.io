import datetime
import logging
import logging.handlers
import os
import os.path
import re
import subprocess
import sys


css_styles = """---
layout: default
title: Những kì thủ đạt giải
---

"""

information = """
    <p><strong>Ghi chú:</strong> Nếu <img class="verified" src="https://s3.vio.edu.vn/assets/img/correct_icon_2.png" title="Chính thức"> nghĩa là giải chính thức được tổ chức bởi chủ sở hữu/quản lí giải đấu, còn <img class="unverified" src="https://s3.vio.edu.vn/assets/img/wrong_icon_2.png" title="Không chính thức"> là giải tạo bởi một Admin khác.</p>
    <p> Nếu trước tên tài khoản có: ❓ nghĩa là người chơi này có khả năng không được đạt giải và đang chờ xác thực, <img class="verified" src="https://s3.vio.edu.vn/assets/img/correct_icon_2.png"> là người dùng bị đóng tài khoản nhưng vẫn được xác minh được nhận giải, <img class="unverified" src="https://s3.vio.edu.vn/assets/img/wrong_icon_2.png"> là người chơi bị đóng tài khoản và xác nhận là gian lận.</p>
"""

def generate_h1_tag(filename):
    title = os.path.splitext(filename)[0].capitalize()
    utc_datetime = datetime.datetime.utcnow()
    h1_tag = f"""   <h1 align="center">Bảng xếp hạng {title}</h1>
        <p align="right"><i>Lần cuối cập nhật: {utc_datetime.hour}:{utc_datetime.minute}:{utc_datetime.second} UTC, ngày {utc_datetime.day} tháng {utc_datetime.month} năm {utc_datetime.year}</i></p>"""
    return h1_tag

def markdown_table_to_html(markdown_table):
    chesscom = f'https://www.chess.com'
    lichess = f'https://lichess.org'
    rows = markdown_table.strip().split('\n')
    html_table = '  <table class="styled-table">\n'
    for i, row in enumerate(rows):
        if '---|---|---|---|---|---|---|---' in row:
            continue

        tag = 'th' if i == 0 else 'td'
        cells = re.split(r'\s*\|\s*', row)

        if len(cells) == 1 and cells[0] == '':
            continue
        
        html_table += '  <tr>\n'
        for cell in cells:
            if cell.startswith('?'):
                username = cell[2:]
                cell_content = f'<{tag}><a href="{chesscom}/member/{username}" title="Xem tài khoản Chess.com của {username}">{username}</a>❓</{tag}>'
            elif cell.startswith('@'):
                username = cell[1:]
                cell_content = f'<{tag}><a href="{chesscom}/member/{username}" title="Xem tài khoản Chess.com của {username}">{username}</a></{tag}>'
            elif cell.startswith('$'):
                username = cell[1:]
                cell_content = f'<{tag}><a href="{lichess}/@/{username}" title="Xem tài khoản Lichess của {username}">{username}</a></{tag}>'
            elif cell.startswith('%'):
                link = cell[1:]
                cell_content = f'<{tag}><a href="{lichess}/{link}" title="Nhấn để xem kết quả của giải này">Link!</a></{tag}>'
            elif cell.startswith('/'):
                idlink = cell[1:]
                cell_content = f'<{tag}><a href="{chesscom}/play/{idlink}" title="Nhấn để xem kết quả của giải này">Link!</a></{tag}>'
            elif cell.startswith('*'):
                name = cell[2:]
                cell_content = f'<{tag}>{name}<img class="verified" src="https://s3.vio.edu.vn/assets/img/correct_icon_2.png" title="Giải chính thức"></{tag}>'
            elif cell.startswith('`'):
                name = cell[2:]
                cell_content = f'<{tag}>{name}<img class="unverified" src="https://s3.vio.edu.vn/assets/img/wrong_icon_2.png" title="Giải không chính thức"></{tag}>'
            else:
                cell_content = f'<{tag}>{cell}</{tag}>'
            html_table += f'    {cell_content}\n'
        html_table += '  </tr>\n'
    html_table += '</table>'
    return html_table

directories = ['tournament-leaderboard/leaderboard', 'tournament-leaderboard/top']

for directory in directories:
    for filename in os.listdir(directory):
        if filename.endswith('.md'):
            with open(os.path.join(directory, filename), 'r') as md_file:
                h1_tag = generate_h1_tag(filename)
                
                markdown_table = md_file.read()
                html_table = markdown_table_to_html(markdown_table)

                styled_html_table = css_styles + h1_tag + information + html_table

                html_filename = os.path.splitext(filename)[0] + '.html'
                with open(os.path.join(directory, html_filename), 'w') as html_file:
                    html_file.write(styled_html_table)
