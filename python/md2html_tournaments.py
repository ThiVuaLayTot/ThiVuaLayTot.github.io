from datetime import datetime
import pytz
import logging
import logging.handlers
import os
import os.path
import re
import subprocess
import sys
import requests
from bs4 import BeautifulSoup


css_styles = """<!DOCTYPE html>
<html lang="vi">

<head>
    <title>Các kỳ thủ đạt giải nhiều nhất</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://w3schools.com/w3css/4/w3.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway">
    <link rel="stylesheet" href="https://thivualaytot.github.io/css/main.css">
    <link rel="stylesheet" href="https://thivualaytot.github.io/css/eventwinner.css">
    <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">
    <link rel="icon" href="https://raw.githubusercontent.com/ThiVuaLayTot/ThiVuaLayTot.github.io/main/images/favicon.ico" type="image/x-icon">
</head>

<body>
    <nav class="page-header">
        <div class="logo">
            <a href="https://thivualaytot.github.io"><img src="/images/favicon.ico"></a>
        </div>
        <div class="topnav">
                <a href="https://thivualaytot.github.io"><i class="bx bxs-home"></i></a>
                <a href="https://thivualaytot.github.io/blog">
                    <i class="bx bxs-news"></i>Thông báo/Tin tức
                </a>
                <a href="https://thivualaytot.github.io/vlogs">
                    <i class="bx bx-play-circle"></i>Vlogs
                </a>
                <div class="dropdown">
                    <a class="dropbtn" href="https://thivualaytot.github.io/social">
                        <i class="bx bx-link"></i>Truyền thông <i class="bx bx-caret-down"></i>
                    </a>
                    <div class="dropdown-content">
                        <a href="https://thivualaytot.github.io/social#social">Các tài khoản MXH của TungJohn</a>
                        <a href="https://thivualaytot.github.io/social#chat">Các đoạn chat của Thí Vua Lấy Tốt</a>
                        <a href="https://thivualaytot.github.io/social#group">Các nhóm/CLB/máy chủ của Thí Vua Lấy Tốt</a>
                    </div>
                </div>
                <div class="dropdown">
                    <a class="dropbtn" href="https://thivualaytot.github.io/lists" title="Các danh sách/bảng quan trọng">
                        <i class="bx bx-list-plus"></i>Danh sách/Tài liệu <i class="bx bx-caret-down"></i>
                    </a>
                    <div class="dropdown-content">
                        <a href="https://thivualaytot.github.io/events">Danh sách tổng hợp các giải đấu</a>
                        <a href="https://thivualaytot.github.io/libot-leaderboard">Bảng xếp hạng các Bot trên Lichess</a>
                        <a href="https://chess.com/forum/view/quy-dinh-co-ban-cua-clb-tungjohn-playing-chess" target="_blank">Danh sách các tài khoản vi phạm</a>
                    </div>
                </div>
                <div class="dropdown">
                    <a class="dropbtn" href="https://thivualaytot.github.io/leaders" title="Ban cán sự của Thí Vua Lấy Tốt">
                        <i class="bx bx-shield-quarter"></i>Leaders <i class="bx bx-caret-down"></i>
                    </a>
                    <div class="dropdown-content">
                        <a href="https://thivualaytot.github.io/leaders#admins">Administrators/Các Quản trị viên</a>
                        <a href="https://thivualaytot.github.io/leaders#mods">Moderators/Các điều hành viên</a>
                        <a href="https://thivualaytot.github.io/leaders#sponsors">Các nhà tài trợ/hợp tác với giải</a>
                    </div>
                </div>
                <div class="dropdown">
                    <a class="dropbtn" href="https://thivualaytot.github.io/contact-donate">
                        <i class="bx bx-donate-blood"></i>Liên hệ & Ủng hộ<i class="bx bx-caret-down"></i>
                    </a>
                    <div class="dropdown-content">
                        <a href="https://thivualaytot.github.io/contact-donate#contact">Liên hệ</a>
                        <a href="https://thivualaytot.github.io/contact-donate#donate">Ủng hộ</a>
                    </div>
                </div>
                <a href="javascript:void(0);" class="icon" onclick="toggleMenu()"><i class="bx bx-menu"></i></a></li>
        </div>
        <div>
            <label class="mode">
                <input type="checkbox" id="darkModeToggle">
                <i id="moon" class="bx bxs-moon" title="Bật/Tắt chế độ tối"></i>
            </label> 
        </div>
    </nav>

"""

footer_style = """
<div class="footer">
    <div class="footer-container">
        <div>
            <h3><strong><a href="https://thivualaytot.github.io" title="Trang web Thí Vua Lấy Tốt">Thí Vua Lấy Tốt</a></strong></h3>
            <p><a href="https://thivualaytot.github.io/social" title="Social media links">Các trang mạng/truyền thông</a></p>
            <p><a href="https://thivualaytot.github.io/blog" title="Các bài Blog quan trọng của TVLT">Các thông báo & tin tức</a></p>
            <p><a href="https://thivualaytot.github.io/vlogs" title="Các Video quan trọng của TVLT">Các Vlog</a></p>
            <p><a href="https://thivualaytot.github.io/game" title="Các trò chơi đơn giản">Các trò chơi đơn giản</a></p>
            <p><a href="https://thivualaytot.github.io/lists" title="Các danh sách/bảng quan trọng">Danh sách/Tài liệu</a></p>
            <p><a href="https://thivualaytot.github.io/leaders" title="Ban cán sự của TVLT">Ban cán sự của TVLT</a></p>
        </div>
        <div>
            <h3 align="center"><a href="https://thivualaytot.github.io/social">Social meadia links</a></h3>
            <strong><a href="https://thivualaytot.github.io/social#social">Các tài khoản MXH của TungJohn</a></strong>
            <div class="button">
                <a href="https://youtube.com/channel/UCvNW1NAWWjblgrP6JQI4MbQ" target="_blank" title="Kênh Youtube của TungJohn"><i class="bx bxl-youtube"></i></a>
                <a href="https://facebook.com/TungJohn2005" target="_blank" title="Trang Facebook của TungJohn"><i class="bx bxl-facebook"></i></a>
                <a href="https://twitch.tv/tungjohnplayingchess" target="_blank" title="Kênh Twitch của TungJohn"><i class="bx bxl-twitch"></i></a>
                <a href="https://tiktok.com/@tungjohn2005" target="_blank" title="Tài khoản Tiktok của TungJohn"><i class="bx bxl-tiktok"></i></a>
                <a href="https://chess.com/member/tungjohn2005" target="_blank" title="Tài khoản Chess.com của TungJohn"><img src="https://images.chesscomfiles.com/uploads/v1/user/33.862d5ff1.160x160o.578dc76c0662.png"></a>
                <a href="https://lichess.org/Tungjohn2005" target="_blank" title="Tài khoản Lichess của TungJohn"><img src="/images/lichesslogo.png"></a>
                <a href="https://shopee.vn/tungjohn2005" target="_blank" title="Shop cờ vua của TungJohn trên Shopee"><i class="bx bxs-shopping-bag"></i></a>
            </div>
            <hr>
            <strong><a href="https://thivualaytot.github.io/social#group">Các Nhóm, Câu Lạc Bộ, Máy Chủ Của Thí Vua Lấy Tốt</a></strong>
            <div class="button">
                <a href="https://link.chess.com/club/0CVQh6" target="_blank"><img width="22" src="https://images.chesscomfiles.com/uploads/v1/user/33.862d5ff1.160x160o.578dc76c0662.png"></a>
                <a href="https://lichess.org/team/thi-vua-lay-tot-tungjohn-playing-chess" target="_blank" title="Đội Thí Vua Lấy Tốt trên Lichess"><img width="22" src="/images/lichesslogo.png"></a>
                <a href="https://facebook.com/groups/586909589413729" target="_blank" title="Nhóm Facebook của Thí Vua Lấy Tốt"><i class="bx bxl-facebook"></i></a>
                <a href="https://discord.gg/Fc9MBSMbBM" target="_blank" title="Máy chủ Discord của Thí Vua Lấy Tốt"><i class="bx bxl-discord"></i></a>
                <a href="https://zalo.me/g/zhrwtn779" title="Nhóm chat Thí Vua Lấy Tốt trên Zalo"><img width="14" src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"></a>
            </div>
        </div>
        <div>
            <br><br>
            <p>Web được xây dựng bởi Quản trị viên <a href="https://thivualaytot.github.io/leaders#admins" title="Các quản trị viên">Đinh Hoàng Việt</a>.</p>
            <p>Mã nguồn trên <a href="https://github.com/ThiVuaLayTot/ThiVuaLayTot.github.io" title="Mã nguồn của web trên Github"><i class="bx bxl-github"></i></a></p>
        </div>
    </div>
</div>
    <script src="https://thivualaytot.github.io/js/main.js"></script>
</body>

</html>

"""

information = """
    <p>Các điều quan trọng trong bảng phía dưới: Nếu người chơi có ô màu đỏ và có biểu tượng <span class="closed">✕</span> thì tài khoản đó đã bị đóng do gian lận (có thể không gian lận ở giải đó), nếu chỉ có <span class="closed">✕</span> thì tài khoản đó bị đóng do lăng mạ hoặc lý do khác, nếu có <span class="special">✓</span></a> thì người chơi đó mặc dù bị đóng tài khoản nhưng xác nhận được giải.</p>
    <b>Bạn có thể tìm kiếm một kỳ thủ đạt giải trong đây bằng cách sử dụng tổ hợp phím Ctrl+F (trên máy tính). Nếu phát hiện tài khoản của ai đó đạt giải nhưng không ở trong đây hay đã đổi tên tài khoản thì hãy báo cáo với <a href="/leaders">các quản trị viên</a> để chúng tôi chỉnh sửa.</b>
    <i>Nếu có vấn đề thì xin hãy liên hệ <a href="/leaders#admins">Admin</a></i>
"""

def generate_h1_tag(filename):
    title = os.path.splitext(filename)[0]
    if title == 'tvlt':
        title = 'Thí Vua Lấy Tốt'
    elif title == 'cbtt':
        title = 'Cờ Bí Thí Tốt'
    elif title == 'cttq':
        title 'Chiến Trường Thí Quân'
    elif title == 'tvlt':
        title 'Đấu Trường Thí Vua'
    else:
        title 'được tổ chức trên Lichess'
    tz_VI = pytz.timezone('Asia/Ho_Chi_Minh')
    datetime_VI = datetime.now(tz_VI)
    h1_tag = f"""<h1 align="center">Các kỳ thủ đạt giải {title}</h1>
    <h2 align="center">Bạn có thể xem các kỳ thủ đạt giải {title} nhiều nhất <a href="https://thivualaytot.github.io/events/bestplayers/{title}">ở đây</a>.</h2>
    <p align="right"><i>Lần cuối cập nhật: {datetime_VI.hour}:{datetime_VI.minute}:{datetime_VI.second}, ngày {datetime_VI.day} tháng {datetime_VI.month} năm {datetime_VI.year}</i></p>
    <button onclick="topFunction()" id="myBtn" title="Trở lại đầu trang này"><i id="back2top" class="bx bxs-to-top"></i></button>"""
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
    html_table = '      <table class="styled-table">\n'
    for i, row in enumerate(rows):
        if '---|---|---|---|---|---|---|---|---' in row:
            continue

        tag = 'th' if i == 0 else 'td'
        cells = re.split(r'\s*\|\s*', row)

        if len(cells) == 1 and cells[0] == '':
            continue
        
        html_table += f'         <tr>\n'

        for cell in cells:
            # Dành cho dòng đầu tiên
            if cell.endswith('Tên giải'):
                text = cell[0:]
                cell_content = f'       <{tag} class="name-tour">{text}</{tag}>'
            elif cell.endswith('🕗'):
                text = cell[0:]
                cell_content = f'       <{tag} class="organization-day">{text}</{tag}>'
            elif cell.endswith('♟️'):
                text = cell[0:]
                cell_content = f'       <{tag} class="rules">{text}</{tag}>'
            elif cell.endswith('🥇') or cell.endswith('🥈') or cell.endswith('🥉') or cell.endswith('🏅') or cell.endswith('🎖️') or cell.endswith('🌟'):
                text = cell[0:]
                cell_content = f'       <{tag} class="winner">{text}</{tag}>'
            # Dành cho tài khoản trên Chess.com
            elif cell.startswith('@'):
                username = cell[1:]
                status = get_chesscom_status(username)
                if status == 'Fair Play':
                    cell_content = f'       <{tag} class="ban"><a href="{chesscom}/member/{username}" target="_blank">{username}</a><span class="closed">✕</span></{tag}>'
                elif status == 'Abuse':
                    cell_content = f'       <{tag}><a href="{chesscom}/member/{username}" target="_blank">{username} <span class="closed">✕</span></a></{tag}>'
                else:
                    cell_content = f'       <{tag}><a href="{chesscom}/member/{username}" target="_blank">{username}</a></{tag}>'
            elif cell.startswith('!@'):
                username = cell[2:]
                cell_content = f'       <{tag}><a href="{chesscom}/member/{username}" target="_blank">{username} <span class="special">✓</span></a></{tag}>'
            # Dành cho tài khoản trên Lichess
            elif cell.startswith('$'):
                username = cell[1:]
                cell_content = f'       <{tag}><a href="{lichess}/{username}" target="_blank">{username}</a></{tag}>'
            elif cell.startswith('- $'):
                username = cell[3:]
                cell_content = f'       <{tag}><a href="{lichess}/{username}" target="_blank">{username} <span class="special">✓</span></a></{tag}>'
            elif cell.startswith('! $'):
                username = cell[3:]
                cell_content = f'       <{tag}><a href="{lichess}/{username}" target="_blank">{username} <span class="closed">✕</span></</a></{tag}>'
            # Dành cho các link giải
            elif cell.startswith('%'):
                link = cell[1:]
                cell_content = f'       <{tag}><a href="{lichess}/{link}" target="_blank">Link!</a></{tag}>'
            # Dành cho các ô/dòng còn lại
            else:
                cell_content = f'       <{tag}>{cell}</{tag}>'
            html_table += f'    {cell_content}\n'
        html_table += '         </tr>\n'
    html_table += '''   </table>
        <br><br><hr>
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
                styled_html_table = css_styles + h1_tag + information + html_table + footer_style
                html_filename = os.path.splitext(filename)[0] + '.html'
                with open(os.path.join(directory, html_filename), 'w', encoding='utf-8') as html_file:
                    html_file.write(styled_html_table)
