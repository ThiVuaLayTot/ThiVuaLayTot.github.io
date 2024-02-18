from datetime import datetime
import pytz
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
    <title>Các thành viên đạt giải</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway">
    <link rel="stylesheet" href="https://thi-vua-lay-tot.github.io/css/main.css">
    <link rel="stylesheet" href="https://thi-vua-lay-tot.github.io/css/topwinner.css">
    <link rel='stylesheet' href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css'>
    <link rel="icon" href="https://raw.githubusercontent.com/Thi-Vua-Lay-Tot/Thi-Vua-Lay-Tot.github.io/main/images/favicon.ico" type="image/x-icon" />
</head>
<body>
    <header class="container">
        <div class="page-header">
		    <div class="logo">
                    <a href="https://thi-vua-lay-tot.github.io"><img src="https://raw.githubusercontent.com/Thi-Vua-Lay-Tot/Thi-Vua-Lay-Tot.github.io/main/images/favicon.ico" title="Thí Vua Lấy Tốt"></a>
            </div>
                  <ul class="navbar-nav">
                    <li>
                      <a href="https://thi-vua-lay-tot.github.io">Trang chủ</a>
                    </li>
                    <li>
                      <a href="https://thi-vua-lay-tot.github.io/blogs">Blog</a>
                    </li>
                    <li>
                      <a href="https://thi-vua-lay-tot.github.io/vlogs">Vlog</a>
                    </li>
                    <li>
                      <a href="https://thi-vua-lay-tot.github.io/webs">Các trang mạng</a>
                    </li>
                    <li>
                      <a href="https://thi-vua-lay-tot.github.io/game">Trò chơi</a>
                    </li>
                    <li>
                      <a href="https://thi-vua-lay-tot.github.io/list">Danh sách</a>
                    </li>
                    <li>
                      <a href="https://thi-vua-lay-tot.github.io/team">Mods</a>
                    </li>
                  </ul>
		    <div>
                <label class="mode">
                    <input type="checkbox" id="darkModeToggle">
                    <i id="moon" class="bx bxs-moon" title="Bật/Tắt chế độ tối"></i>
        		    <a id="back2top" class="bx bxs-to-top" href="#top" title="Trở lại đầu trang này"></a>
                </label>
		    </div>
        </div>
    </header>
"""

footer_style = """
    <div class="footer">
        <div class="container">
            <div class="footer-container">
                <div class="footer-nav">
                  <h3><a href="https://thi-vua-lay-tot.github.io">Thí Vua Lấy Tốt</a></h3>
                    <p><a href="https://thi-vua-lay-tot.github.io/webs">Các trang mạng</a></p>
                    <p><a href="https://thi-vua-lay-tot.github.io/blogs">Các Blog</a></p>
                    <p><a href="https://thi-vua-lay-tot.github.io/vlogs">Các Vlog</a></p>
                    <p><a href="https://thi-vua-lay-tot.github.io/game">Trò chơi</a></p>
                    <p><a href="https://thi-vua-lay-tot.github.io/list">Danh sách</a></p>
                    <p><a href="https://thi-vua-lay-tot.github.io/team">Ban cán sự của TVLT</a></p>
                </div>
                <div class="footer-nav">
                  <h3><a href="https://thi-vua-lay-tot.github.io/webs">Các trang mạng</a></h3>
                    <a href="https://www.youtube.com/@TungJohnPlayingChess" target="_blank"><img src="https://img.shields.io/badge/-Youtube-EA4335?style=flat-square&logo=Youtube&logoColor=white"></a></li>
                    <a href="https://clubs.chess.com/GkQy" target="_blank"><img width="88" src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/NathanielGreen/php0hWd9E.png"></a></li>
                    <a href="https://lichess.org/team/thi-vua-lay-tot-tungjohn-playing-chess" target="_blank"><img src="https://img.shields.io/badge/-Lichess-050505?style=flat-square&logo=Lichess&logoColor=white"></a></li>
                    <a href="https://lishogi.org/team/thi-vua-lay-tot-tungjohn-playing-shogi" target="_blank"><img src="https://img.shields.io/badge/-Lishogi-050505?style=flat-square&logo=Lishogi&logoColor=white"></a></li>
                    <a href="https://lidraughts.org/team/thi-vua-lay-quan-tungjohn-playing-draughts" target="_blank"><img src="https://img.shields.io/badge/-Lidraughts-050505?style=flat-square&logo=Lidraughts&logoColor=white"></a></li>
                    <a href="https://playstrategy.org/team/thi-vua-lay-tot-tungjohn-playing-chess" target="_blank"><img src="https://img.shields.io/badge/-PlayStrategy-050505?style=flat-square&logo=PlayStrategy&logoColor=white"></a></li>
                    <a href="https://www.facebook.com/TungJohn2005" target="_blank"><img src="https://img.shields.io/badge/-Facebook-00B2FF?style=flat-square&logo=Facebook&logoColor=white"></a></li>
                    <a href="https://discord.gg/WUhW5Cs9gB" target="_blank"><img src="https://dcbadge.vercel.app/api/server/WUhW5Cs9gB?style=flat"></a></li>
                </div>
                <div>
                    <br><br>
                    <p>Web được xây dựng bởi QTV <a href="https://thi-vua-lay-tot.github.io/team">Đinh Hoàng Việt</a>.</p>
                    <p>Mã nguồn trên <a href="https://github.com/Thi-Vua-Lay-Tot/Thi-Vua-Lay-Tot.github.io"><img class="github-logo" src="https://github.com/fluidicon.png" alt="GitHub Icon"></a></p>
                    <label>
        	        	<a id="back2top" class="bx bxs-to-top" href="#top" title="Trở lại đầu trang này"></a>
                    </label>
                </div>
            </div>
        </div>
    </div>
    <script src="https://thi-vua-lay-tot.github.io/js/main.js"></script>
</body>

</html>

"""

information = """
      <p>  Nếu trước tên người dùng có: ❓ nghĩa là người chơi này có khả năng không được đạt giải hoặc đạt giải khác và đang chờ xác thực,<img class="unverified" src="https://s3.vio.edu.vn/assets/img/wrong_icon_2.png"> là người chơi đã nhận phần thưởng nhưng sau đó đã xác nhận là gian lận.</p>
      <p>  Và nếu tài khoản đó bị đóng do gian lận thì chuyển giải sang người đứng thứ hạng phía sau.</p>
"""

def generate_h1_tag(filename):
    title = os.path.splitext(filename)[0]
    tz_VI = pytz.timezone('Asia/Ho_Chi_Minh')
    datetime_VI = datetime.now(tz_VI)
    h1_tag = f"""    <h1 align="center">Các kỳ thủ đạt giải {title}</h1>
        <h2 align="center">Bạn có thể xem danh sách các kỳ thủ đạt giải {title} <a href="https://thi-vua-lay-tot.github.io/tournament-winner/list-winner/{title}">Ở đây</a>.</h2>
        <p align="right"><i>Lần cuối cập nhật: {datetime_VI.hour}:{datetime_VI.minute}:{datetime_VI.second}, ngày {datetime_VI.day} tháng {datetime_VI.month} năm {datetime_VI.year}</i></p>"""
    return h1_tag

def markdown_table_to_html(markdown_table):
    chesscom = f'https://www.chess.com'
    lichess = f'https://lichess.org'
    verified_icon = f'https://s3.vio.edu.vn/assets/img/correct_icon_2.png'
    unverified_icon = f'https://s3.vio.edu.vn/assets/img/wrong_icon_2.png'
    rows = markdown_table.strip().split('\n')
    html_table = '      <table class="styled-table">\n'
    for i, row in enumerate(rows):
        if '---|---|---' in row:
            continue

        tag = 'th' if i == 0 else 'td'
        cells = re.split(r'\s*\|\s*', row)

        if len(cells) == 1 and cells[0] == '':
            continue
        
        html_table += '         <tr>\n'
        for cell in cells:
            # Dành cho dòng đầu tiên
            if cell.endswith('Hạng'):
                text = cell[0:]
                cell_content = f'       <{tag} class="stt">{text}</{tag}>'
            elif cell.endswith('👑'):
                text = cell[0:]
                cell_content = f'       <{tag} class="winner">{text}</{tag}>'
            elif cell.endswith('Đạt giải trong'):
                text = cell[0:]
                cell_content = f'       <{tag} class="winner-in-tour">{text}</{tag}>'
            # Dành cho tài khoản trên Chess.com
            elif cell.startswith('? @'):
                username = cell[3:]
                cell_content = f'       <{tag}><a href="{chesscom}/member/{username}" title="Xem tài khoản Chess.com của {username}" target="_blank">{username}</a>❓</{tag}>'
            elif cell.startswith('! @'):
                username = cell[3:]
                cell_content = f'       <{tag}><a href="{chesscom}/member/{username}" title="Xem tài khoản Chess.com của {username}" target="_blank">{username} <img class="unverified" src="{unverified_icon}" title="Tài khoản gian lận"></a></{tag}>'
            elif cell.startswith('@'):
                username = cell[1:]
                cell_content = f'       <{tag}><a href="{chesscom}/member/{username}" title="Xem tài khoản Chess.com của {username}" target="_blank">{username}</a></{tag}>'
            # Dành cho tài khoản trên Lichess
            elif cell.startswith('$'):
                username = cell[1:]
                cell_content = f'       <{tag}><a href="{lichess}/@/{username}" title="Xem tài khoản Lichess của {username}" target="_blank">{username}</a></{tag}>'
            # Dành cho các ô/dòng còn lại
            else:
                cell_content = f'       <{tag}>{cell}</{tag}>'
            html_table += f'    {cell_content}\n'
        html_table += '         </tr>\n'
    html_table += '''   </table>
        <br><br><hr>
    '''
    return html_table

directories = ['tournament-winner/top']

for directory in directories:
    for filename in os.listdir(directory):
        if filename.endswith('.md'):
            with open(os.path.join(directory, filename), 'r') as md_file:
                h1_tag = generate_h1_tag(filename)
                
                markdown_table = md_file.read()
                html_table = markdown_table_to_html(markdown_table)

                styled_html_table = css_styles + h1_tag + information + html_table + footer_style

                html_filename = os.path.splitext(filename)[0] + '.html'
                with open(os.path.join(directory, html_filename), 'w') as html_file:
                    html_file.write(styled_html_table)
