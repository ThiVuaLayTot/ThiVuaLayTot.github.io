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
    <title>Các kỳ thủ đạt giải nhiều nhất</title>
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
    <header class="container">
    <div class="page-header">
        <div class="logo">
            <a href="https://thivualaytot.github.io" title="Thí Vua Lấy Tốt"><img src="/images/favicon.ico" title="Thí Vua Lấy Tốt"></a>
        </div>
        <ul class="navbar-nav">
            <li>
                <a href="https://thivualaytot.github.io" title="Trang chủ"><i class="bx bxs-home"></i></a>
            </li>
            <li>
                <a href="https://thivualaytot.github.io/blog" title="Các thông báo/bài đăng quan trọng của TVLT">
                    <i class="bx bxs-news"></i>Thông báo/Tin tức
                </a>
            </li>
            <li>
                <a href="https://thivualaytot.github.io/vlogs" title="Các Video quan trọng của TVLT">
                    <i class="bx bx-play-circle"></i>Vlogs
                </a>
            </li>
            <li>
                <div class="dropdown">
                    <a class="dropbtn" href="https://thivualaytot.github.io/social" title="Social media links">
                        <i class="bx bx-link"></i>Xã hội <i class="bx bx-caret-down"></i>
                    </a>
                    <div class="dropdown-content">
                        <a href="https://thivualaytot.github.io/social#social">Các tài khoản MXH của TungJohn</a>
                        <a href="https://thivualaytot.github.io/social#chat">Các đoạn chat của Thí Vua Lấy Tốt</a>
                        <a href="https://thivualaytot.github.io/social#group">Các nhóm/CLB/máy chủ của Thí Vua Lấy Tốt</a>
                    </div>
                </div>
            </li>
            <li>
                <div class="dropdown">
                    <a class="dropbtn" href="https://thivualaytot.github.io/game" title="Các trò chơi đơn giản">MiniGames
                      <i class="bx bx-caret-down"></i>
                    </a>
                    <div class="dropdown-content">
                        <a href="https://thivualaytot.github.io/game/caro">Cờ Caro 3x3</a>
                        <a href="https://thivualaytot.github.io/game/chesspursuit">ChessPursuit</a>
                        <a href="https://thivualaytot.github.io/game/sliding">Shogi Sliding-Puzzles</a>
                        <a href="https://thivualaytot.github.io/game/2048">2048</a>
                    </div>
                </div>
            </li>
            <li>
                <div class="dropdown">
                    <a class="dropbtn, active" href="https://thivualaytot.github.io/lists" title="Các danh sách/bảng quan trọng">
                        <i class="bx bx-list-plus"></i>Danh sách/Tài liệu <i class="bx bx-caret-down"></i>
                    </a>
                    <div class="dropdown-content">
                        <a href="https://thivualaytot.github.io/tournaments">Danh sách tổng hợp các giải đấu</a>
                        <a href="https://thivualaytot.github.io/libot-leaderboard">Bảng xếp hạng các Bot trên Lichess</a>
                        <a href="https://chess.com/clubs/forum/view/quy-dinh-co-ban-cua-clb-tungjohn-playing-chess">Danh sách các tài khoản vi phạm</a>
                    </div>
                </div>
            </li>
            <li>
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
            </li>
        </ul>
        <div>
            <label class="mode">
                <input type="checkbox" id="darkModeToggle">
                <i id="moon" class="bx bxs-moon" title="Bật/Tắt chế độ tối"></i>
            </label>
        </div>
    </div>
    </header>

"""

footer_style = """
<div class="footer">
    <div class="footer-container">
        <div>
            <h3><a href="https://thivualaytot.github.io" title="Trang web Thí Vua Lấy Tốt">Thí Vua Lấy Tốt</a></h3>
            <p><a href="https://thivualaytot.github.io/social" title="Social media links">Các trang mạng</a></p>
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
                <a href="https://lichess.org/@/Tungjohn2005" target="_blank" title="Tài khoản Lichess của TungJohn"><img src="/images/lichesslogo.png"></a>
                <a href="https://shopee.vn/tungjohn2005" target="_blank" title="Shop cờ vua của TungJohn trên Shopee"><i class="bx bxs-shopping-bag"></i></a>
            </div>
            <strong><a href="https://thivualaytot.github.io/social#group">Các Nhóm, Câu Lạc Bộ, Máy Chủ Của Thí Vua Lấy Tốt</a></strong>
            <div class="button">
                <a href="https://zalo.me/g/zhrwtn779" title="Nhóm chat Thí Vua Lấy Tốt trên Zalo"><img width="14" src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"></a>
                <a href="https://clubs.chess.com/GkQy" target="_blank"><img width="22" src="https://images.chesscomfiles.com/uploads/v1/user/33.862d5ff1.160x160o.578dc76c0662.png"></a>
                <a href="https://lichess.org/team/thi-vua-lay-tot-tungjohn-playing-chess" target="_blank" title="Đội Thí Vua Lấy Tốt trên Lichess"><img width="22" src="/images/lichesslogo.png"></a>
                <a href="https://facebook.com/groups/586909589413729" target="_blank" title="Nhóm Facebook của Thí Vua Lấy Tốt"><i class="bx bxl-facebook"></i></a>
                <a href="https://discord.gg/WUhW5Cs9gB" target="_blank" title="Máy chủ Discord của Thí Vua Lấy Tốt"><i class="bx bxl-discord"></i></a>
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
      <p><strong>Ghi chú:</strong> Nếu <img class="verified" src="https://s3.vio.edu.vn/assets/img/correct_icon_2.png" title="Chính thức"> nghĩa là giải chính thức được tổ chức bởi chủ sở hữu/quản lí giải đấu, còn <img class="verified" src="https://s3.vio.edu.vn/assets/img/wrong_icon_2.png" title="Không chính thức"> là giải tạo bởi một Admin khác.</p>
      <p> Nếu sau tên người dùng có: <span class="loader"></span> nghĩa là người chơi này có khả năng không được đạt giải và đang chờ xác thực, <img class="verified" src="https://s3.vio.edu.vn/assets/img/correct_icon_2.png"> là người dùng bị đóng tài khoản nhưng vẫn được xác minh được nhận giải, <img class="verified" src="https://s3.vio.edu.vn/assets/img/wrong_icon_2.png"> là người chơi bị đóng tài khoản và xác nhận là gian lận.</p>
      <p> Và nếu tài khoản đó bị đóng do gian lận thì chuyển giải sang người đứng thứ hạng phía sau.</p>
      <b> Bạn có thể tìm kiếm một kỳ thủ đạt giải trong đây bằng cách sử dụng tổ hợp phím Ctrl+F (trên máy tính). Nếu phát hiện tài khoản của ai đó đạt giải nhưng không ở trong đây hay đã đổi tên tài khoản thì hãy báo cáo với <a href="/leaders">các quản trị viên</a> để chúng tôi chỉnh sửa.</b>
"""

def generate_h1_tag(filename):
    title = os.path.splitext(filename)[0]
    tz_VI = pytz.timezone('Asia/Ho_Chi_Minh')
    datetime_VI = datetime.now(tz_VI)
    h1_tag = f"""    <h1 align="center">Các kỳ thủ đạt giải {title}</h1>
    <h2 align="center">Bạn có thể xem các kỳ thủ đạt giải {title} nhiều nhất <a href="https://thivualaytot.github.io/tournament/bestplayers/{title}">Ở đây</a>.</h2>
    <p align="right"><i>Lần cuối cập nhật: {datetime_VI.hour}:{datetime_VI.minute}:{datetime_VI.second}, ngày {datetime_VI.day} tháng {datetime_VI.month} năm {datetime_VI.year}</i></p>"""
    return h1_tag

def markdown_table_to_html(markdown_table):
    chesscom = 'https://chess.com'
    lichess = 'https://lichess.org'
    verified_icon = 'https://s3.vio.edu.vn/assets/img/correct_icon_2.png'
    unverified_icon = 'https://s3.vio.edu.vn/assets/img/wrong_icon_2.png'
    rows = markdown_table.strip().split('\n')
    html_table = '      <table class="styled-table">\n'
    for i, row in enumerate(rows):
        if '---|---|---|---|---|---|---|---|---|---' in row:
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
            elif cell.endswith('Link giải'):
                text = cell[0:]
                cell_content = f'       <{tag} class="link">{text}</{tag}>'
            elif cell.endswith('Số kì thủ'):
                text = cell[0:]
                cell_content = f'       <{tag} class="players">{text}</{tag}>'
            # Dành cho tài khoản trên Chess.com
            elif cell.startswith('? @'):
                username = cell[3:]
                cell_content = f'       <{tag}><a href="{chesscom}/member/{username}" title="Xem tài khoản Chess.com của {username}" target="_blank">{username}</a> <span class="loader"></span></{tag}>'
            elif cell.startswith('@'):
                username = cell[1:]
                cell_content = f'       <{tag}><a href="{chesscom}/member/{username}" title="Xem tài khoản Chess.com của {username}" target="_blank">{username}</a></{tag}>'
            elif cell.startswith('! @'):
                username = cell[3:]
                cell_content = f'       <{tag}><a href="{chesscom}/member/{username}" title="Xem tài khoản Chess.com của {username}" target="_blank">{username} <img class="verified" src="{unverified_icon}" title="Tài khoản gian lận"></a></{tag}>'
            elif cell.startswith('- @'):
                username = cell[3:]
                cell_content = f'       <{tag}><a href="{chesscom}/member/{username}" title="Xem tài khoản Chess.com của {username}" target="_blank">{username} <img class="verified" src="{verified_icon}" title="Tài khoản không gian lận"></a></{tag}>'
            # Dành cho tài khoản trên Lichess
            elif cell.startswith('$'):
                username = cell[1:]
                cell_content = f'       <{tag}><a href="{lichess}/@/{username}" title="Xem tài khoản Lichess của {username}" target="_blank">{username}</a></{tag}>'
            elif cell.startswith('- $'):
                username = cell[3:]
                cell_content = f'       <{tag}><a href="{lichess}/@/{username}" title="Xem tài khoản Lichess của {username}" target="_blank">{username} <img class="verified" src="{verified_icon}" title="Tài khoản không gian lận"></a></{tag}>'
            elif cell.startswith('! $'):
                username = cell[3:]
                cell_content = f'       <{tag}><a href="{lichess}/@/{username}" title="Xem tài khoản Lichess của {username}" target="_blank">{username} <img class="verified" src="{unverified_icon}" title="Tài khoản gian lận"></a></{tag}>'
            # Dành cho các link giải
            elif cell.startswith('%'):
                link = cell[1:]
                cell_content = f'       <{tag}><a href="{lichess}/{link}" title="Nhấn để xem kết quả của giải này" target="_blank">Link!</a></{tag}>'
            elif cell.startswith('/'):
                idlink = cell[1:]
                cell_content = f'       <{tag}><a href="{chesscom}/tournament/live/redirect-to/{idlink}" title="Nhấn để xem kết quả của giải này" target="_blank">Link!</a></{tag}>'
            elif cell.startswith('/arena'):
                idlink = cell[6:]
                cell_content = f'       <{tag}><a href="{chesscom}/tournament/live/arena/redirect-to/{idlink}" title="Nhấn để xem kết quả của giải này" target="_blank">Link!</a></{tag}>'
            elif cell.startswith('*'):
                name = cell[2:]
                cell_content = f'       <{tag} title="Thí Vua Lấy Tốt {name}">{name} <img class="verified" src="{verified_icon}" title="Giải chính thức"></{tag}>'
            elif cell.startswith('_'):
                name = cell[2:]
                cell_content = f'       <{tag} title="Thí Vua Lấy Tốt {name}">{name}<img class="verified" src="{unverified_icon}" title="Giải không chính thức"></{tag}>'
            # Dành cho các ô/dòng còn lại
            else:
                cell_content = f'       <{tag}>{cell}</{tag}>'
            html_table += f'    {cell_content}\n'
        html_table += '         </tr>\n'
    html_table += '''   </table>
        <br><br><hr>
    '''
    return html_table

directories = ['tournaments/tournaments']

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
