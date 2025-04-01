import logging
import logging.handlers
import os
import os.path
import re
import subprocess
import sys
import requests
from bs4 import BeautifulSoup
import urllib.error

sys.stdout.reconfigure(encoding='utf-8')  # type: ignore


head_content = """<!DOCTYPE html>
<html lang="vi">

<head>
    <title>Bảng thống kê các giải</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://w3schools.com/w3css/4/w3.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway">
    <link rel="stylesheet" href="/css/main.css">
    <link rel="stylesheet" href="/css/animation.css">
    <link rel="stylesheet" href="/css/eventwinner.css">
    <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="icon" href="https://raw.githubusercontent.com/ThiVuaLayTot/ThiVuaLayTot.github.io/main/images/favicon.ico" type="image/x-icon">
</head>
"""

def nav_content():
    with open('_includes/navbar.html', 'r', encoding='utf-8') as file:
        return file.read()

def footer_content():
    with open('_includes/footer.html', 'r', encoding='utf-8') as file:
        return file.read()

information = """
    <p>Các điều quan trọng trong bảng phía dưới: Nếu người chơi có ô màu đỏ và có biểu tượng <span class="fa fa-ban closed"></span> thì tài khoản đó đã bị đóng do gian lận (có thể không gian lận ở giải đó), nếu chỉ có <span class="fa fa-remove closed"></span> thì tài khoản đó bị đóng do lăng mạ hoặc lý do khác, nếu có <span class="fa fa-check special"></span> thì người chơi đó mặc dù bị đóng tài khoản nhưng xác nhận được giải.</p>
    <b>Nếu phát hiện tài khoản của ai đó đạt giải nhưng không ở trong đây thì hãy báo cáo với <a href="leaders">các quản trị viên</a> để chúng tôi chỉnh sửa.</b>
    <i>Nếu có vấn đề thì xin hãy liên hệ <a href="leaders#admins">quản trị viên</a>.</i>
"""

def generate_h1_tag(filename):
    namefile = os.path.splitext(filename)[0]
    titles = {
        'tvlt': 'Thí Vua Lấy Tốt',
        'cbtt': 'Cờ Bí Thí Tốt',
        'cttq': 'Chiến Trường Thí Quân',
        'dttv': 'Đấu Trường Thí Vua'
    }
    title = titles.get(namefile)
    h1_tag = f"""<h1 align="center">Các kỳ thủ đạt giải {title}</h1>
    <h2 align="center">Bạn có thể xem các kỳ thủ đạt giải {title} nhiều nhất <a href="events/bestplayers/{namefile}">ở đây</a>.</h2>
    <ul class="tab"><li><a href="tvlt">Thí Vua Lấy Tốt</a></li> <li><a href="cbtt">Cờ Bí Thí Tốt</a></li> <li><a href="cttq">Chiến Trường Thí Quân</a></li> <li><a href="dttv">Đấu Trường Thí Vua</a></li></ul>

    """
    return h1_tag

def get_chesscom_status(username):
    url = f'https://chess.com/member/{username}'
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        if 'Closed: Abuse' in soup.text:
            print(f'Tài khoản {username} đã bị đóng: Abuse')
            return 'Abuse'
        if 'Closed: Fair Play' in soup.text:
            print(f'Tài khoản {username} đã bị đóng: Fair Play')
            return 'Fair Play'
        else:
            print(f'Tài khoản {username} vẫn hoạt động')
            return 'Tài khoản vẫn hoạt động'
    except requests.HTTPError as e:
        print(f'Không tìm thấy trang cho {username}, có thể tài khoản không tồn tại')
        return 'Không tìm thấy trang, có thể tài khoản không tồn tại'
    except Exception as e:
        print(f'Đã xảy ra lỗi khi kiểm tra tài khoản {username}: {e}')
        return 'Đã xảy ra lỗi'

def markdown_table_to_html(markdown_table):
    chesscom = 'https://chess.com'
    lichess = 'https://lichess.org'
    rows = markdown_table.strip().split('\n')
    html_table = '''<input type="text" id="searchInput" class="search-bar" onkeyup="searchTable()" placeholder="Tìm kiếm"><script src="/js/search-events.js"></script>
    <div style="overflow-x:auto;">
        <table class="styled-table">\n'''
    for i, row in enumerate(rows):
        if '---|---|---|---|---|---|---|---|---' in row:
            continue

        tag = 'th' if i == 0 else 'td'
        cells = re.split(r'\s*\|\s*', row)

        if len(cells) == 1 and cells[0] == '':
            continue

        html_table += f'<tr>\n'

        for cell in cells:
            # Dành cho dòng đầu tiên
            if cell.endswith('Tên giải'):
                text = cell[0:]
                cell_content = f'<{tag} class="name-tour">{text}</{tag}>'
            elif cell.endswith('🕗'):
                text = cell[0:]
                cell_content = f'<{tag} class="organization-day">{text}</{tag}>'
            elif cell.endswith('♟️'):
                text = cell[0:]
                cell_content = f'<{tag} class="rules">{text}</{tag}>'
            elif cell.endswith('🥇') or cell.endswith('🥈') or cell.endswith('🥉') or cell.endswith('🏅') or cell.endswith('🎖️') or cell.endswith('🌟'):
                text = cell[0:]
                cell_content = f'<{tag} class="winner">{text}</{tag}>'
            # Dành cho tài khoản trên Chess.com
            elif cell.startswith('@'):
                username = cell[1:]
                status = get_chesscom_status(username)
                if status == 'Fair Play':
                    cell_content = f'<{tag}><a href="{chesscom}/member/{username}" target="_blank" class="closed">{username}</a><span class="fa fa-ban"></span></{tag}>'
                elif status == 'Abuse':
                    cell_content = f'<{tag}><a href="{chesscom}/member/{username}" target="_blank" class="closed">{username} <span class="fa fa-remove"></span></a></{tag}>'
                else:
                    cell_content = f'<{tag}><a href="{chesscom}/member/{username}" target="_blank">{username}</a></{tag}>'
            elif cell.startswith('!@'):
                username = cell[2:]
                cell_content = f'<{tag}><a href="{chesscom}/member/{username}" target="_blank">{username} <span class="fa fa-check special"></span></a></{tag}>'
            # Dành cho tài khoản trên Lichess
            elif cell.startswith('$'):
                username = cell[1:]
                cell_content = f'<{tag}><a href="{lichess}/{username}" target="_blank">{username}</a></{tag}>'
            elif cell.startswith('- $'):
                username = cell[3:]
                cell_content = f'<{tag}><a href="{lichess}/{username}" target="_blank">{username} <span class="fa fa-check special"></span></a></{tag}>'
            elif cell.startswith('! $'):
                username = cell[3:]
                cell_content = f'<{tag}><a href="{lichess}/{username}" target="_blank" class="closed">{username} <span class="fa fa-ban"></span></a></{tag}>'
            # Dành cho các ô/dòng còn lại
            else:
                cell_content = f'<{tag}>{cell}</{tag}>'
            html_table += f'{cell_content}\n'
        html_table += '</tr>\n'
        if i == 0:
            html_table += '</thead><tbody>'
    html_table += '''</tbody></table>
        <br><br><hr>
        <button id="back-to-top" title="Go to top"><span class="bx bxs-to-top"></span></button>
        <script src="/js/main.js"></script>
    '''
    return html_table

directories = ['events/tournaments']

for directory in directories:
    for filename in os.listdir(directory):
        if filename.endswith('.md'):
            with open(os.path.join(directory, filename), 'r', encoding='utf-8') as md_file:
                h1_tag = generate_h1_tag(filename)
                markdown_table = md_file.read()
                html_table = markdown_table_to_html(markdown_table)
                styled_html_table = head_content + nav_content() + h1_tag + information + html_table + footer_content()
                html_filename = os.path.splitext(filename)[0] + '.html'
                with open(os.path.join(directory, html_filename), 'w', encoding='utf-8') as html_file:
                    html_file.write(styled_html_table)
