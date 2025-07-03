import logging
import logging.handlers
import os
import os.path
import re

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
    <script type="text/javascript" src="/js/main.js"></script>
</head>
<body>
"""

def nav_content():
    with open('_includes/navbar.html', 'r', encoding='utf-8') as file:
        return file.read()

def footer_content():
    with open('_includes/footer.html', 'r', encoding='utf-8') as file:
        return file.read()

def last_update():
    with open('_includes/update.htm', 'r', encoding='utf-8') as f:
        return f.read()

information = """
    <i>Nếu có vấn đề thì xin hãy liên hệ <a href="leaders#admins" target="_top">quản trị viên</a>.</i>
"""

def generate_h1_tag(filename):
    namefile = os.path.splitext(filename)[0]
    updated_time = last_update()
    titles = {
        'tvlt': 'Thí Vua Lấy Tốt',
        'cbtt': 'Cờ Bí Thí Tốt',
        'cttq': 'Chiến Trường Thí Quân',
        'dttv': 'Đấu Trường Thí Vua'
    }
    title = titles.get(namefile)
    h1_tag = f"""<h1 align="center">Các kỳ thủ đạt giải {title}</h1>
    <h2 align="center">Bạn có thể xem các kỳ thủ đạt giải {title} nhiều nhất <a href="/events/bestplayers/{namefile}">ở đây</a>.</h2>
    <ul class="tab"><li><a href="tvlt">Thí Vua Lấy Tốt</a></li> <li><a href="cbtt">Cờ Bí Thí Tốt</a></li> <li><a href="cttq">Chiến Trường Thí Quân</a></li> <li><a href="dttv">Đấu Trường Thí Vua</a></li></ul>
    {updated_time}"""
    return h1_tag

def markdown_table_to_html(markdown_table):
    cc = '//chess.com'
    lc = '//liches.org'
    rows = markdown_table.strip().split('\n')
    html_table = '''<input type="text" id="searchInput" class="search-bar" onkeyup="searchTable()" placeholder="Tìm kiếm"><script src="/js/search-events.js"></script>
    <div class="table">
        <table class="styled-table">
            <thead>
            <tr>
                <th class="name-tour">Tên giải</th>
                <th class="organization-day"><span class="bx bx-calendar-event"></span> Ngày tổ chức</th>
                <th class="rules"><span class="bx bxs-chess"></span> Thể lệ</th>
                <th class="players"><span class="fa fa-users"></span> Số kỳ thủ</th>
                <th class="winner">&#x1F947; Top 1</th>
                <th class="winner">&#x1F948; Top 2</th>
                <th class="winner">&#x1F949; Top 3</th>
                <th class="winner">&#x1F396;&#xFE0F; Top 4</th>
                <th class="winner">&#x1F3C5; Top 5</th>
                <th class="winner">&#x1F31F; Top 6</th>
            </tr>
            </thead>
            <tbody>\n''' 

    for i, row in enumerate(rows):
        cells = re.split(r'\s*\|\s*', row)

        if len(cells) == 1 and cells[0] == '':
            continue

        html_table += f'<tr>\n'

        for cell in cells:
            # For Chess.com accounts
            if cell.startswith('@'):
                user = cell[1:]
                username = cell[2:]
                if user.startswith('!'):
                    splited_username = username.split()
                    avatar = splited_username[2] if len(splited_username) > 2 and splited_username[2] != 'N/A' else f'{cc}/bundles/web/images/user-image.007dad08.svg'
                    cell_content = f'''<td><div class="post-user-component">
    <a class="cc-avatar-component post-user-avatar">
      <img class="cc-avatar-img" src="{avatar}" height="50" width="50">
    </a>
    <div class="post-user-details">
        <div class="user-tagline-component">
            <a class="user-username-component user-tagline-username" href="{cc}/member/{username}" target="_top">{username}</a>
        </div>
        <div class="post-user-status">
            <span><div class="user-badges-component"><div class="user-badges-badge user-badges-closed"><span class="user-badges-icon-fair"></span> <span> Closed: Gian lận</span></div></div></span>
        </div>
    </div>
</div></td>'''
                elif user.startswith('#'):
                    splited_username = username.split()
                    avatar = splited_username[2] if len(splited_username) > 2 and splited_username[2] != 'N/A' else f'{cc}/bundles/web/images/user-image.007dad08.svg'
                    cell_content = f'''<td><div class="post-user-component">
    <a class="cc-avatar-component post-user-avatar">
      <img class="cc-avatar-img" src="{avatar}" height="50" width="50">
    </a>
    <div class="post-user-details">
        <div class="user-tagline-component">
            <a class="user-username-component user-tagline-username" href="{cc}/member/{username}" target="_top">{username}</a>
        </div>
        <div class="post-user-status">
            <span><div class="user-badges-component"><div class="user-badges-badge user-badges-closed"><span class="user-badges-icon-abuse"></span> <span> Closed: Abuse</span></div></div></span>
        </div>
    </div>
</div></td>'''
                elif user.startswith('*'):
                    splited_username = username.split()
                    followers = splited_username[1] if len(splited_username) > 1 else 'N/A'
                    avatar = splited_username[2] if len(splited_username) > 2 and splited_username[2] != 'N/A' else f'{cc}/bundles/web/images/user-image.007dad08.svg'
                    cell_content = f'''<td><div class="post-user-component">
    <a class="cc-avatar-component post-user-avatar">
      <img class="cc-avatar-img" src="{avatar}" height="50" width="50">
    </a>
    <div class="post-user-details">
        <div class="user-tagline-component">
            <a class="user-username-component user-tagline-username" href="{cc}/member/{username}" target="_top">{username}</a>
        </div>
        <div class="post-user-status">
            <span><span class="bx bx-user-check">{followers} người theo dõi</span>
        </div>
    </div>
</div></td>'''
                elif user.startswith('/'):
                    splited_username = username.split()
                    avatar = splited_username[2] if len(splited_username) > 2 and splited_username[2] != 'N/A' else f'{cc}/bundles/web/images/user-image.007dad08.svg'
                    cell_content = f'''<td><div class="post-user-component">
    <a class="cc-avatar-component post-user-avatar">
      <img class="cc-avatar-img" src="{avatar}" height="50" width="50">
    </a>
    <div class="post-user-details">
        <div class="user-tagline-component">
            <a class="user-username-component user-tagline-username" href="{cc}/member/{username}" target="_top">{username}</a>
        </div>
        <div class="post-user-status">
            <span><div class="user-badges-component"><div class="user-badges-badge user-badges-inactive"><span class="user-badges-icon-inactive"></span> <span> Closed: Inactive</span></div></div></span>
        </div>
    </div>
</div></td>'''
                elif user.startswith('&'):
                    splited_username = username.split()
                    name = splited_username[0]
                    followers = splited_username[1] if len(splited_username) > 1 else 'N/A'
                    avatar = splited_username[2] if len(splited_username) > 2 and splited_username[2] != 'N/A' else f'{cc}/bundles/web/images/user-image.007dad08.svg'
                    cell_content = f'''<td><div class="post-user-component">
    <a class="cc-avatar-component post-user-avatar">
      <img class="cc-avatar-img" src="{avatar}" height="50" width="50">
    </a>
    <div class="post-user-details">
        <div class="user-tagline-component">
            <a class="user-username-component user-tagline-username" href="{cc}/member/{name}" target="_top">{name}</a>
        </div>
        <div class="post-user-status">
            <span><div class="user-badges-component"><div class="user-badges-badge user-badges-premium"><span class="user-badges-icon-premium"></span> <span> Chess.com Membership</span></div></div></span>
            <span class="post-view-meta-separator"></span>
            <span><span class="bx bx-user-check">{followers} người theo dõi</span>
        </div>
    </div>
</div></td>'''
                else:
                    splited_username = user.split()
                    name = splited_username[0]
                    followers = splited_username[1] if len(splited_username) > 1 else 'N/A'
                    avatar = splited_username[2] if len(splited_username) > 2 and splited_username[2] != 'N/A' else f'{cc}/bundles/web/images/user-image.007dad08.svg'
                    points = splited_username[3] if len(splited_username) > 3 else 'N/A'
                    cell_content = f'''<td><div class="post-user-component">
    <a class="cc-avatar-component post-user-avatar">
    <img class="cc-avatar-img" src="{avatar}" height="50" width="50">
    </a>
    <div class="post-user-details">
        <div class="user-tagline-component">
            <a class="user-username-component user-tagline-username" href="{cc}/member/{name}" target="_top" title="{points} điểm">{name}</a>
        </div>
        <div class="post-user-status">
            <span><span class="bx bx-user-check">{followers} người theo dõi</span>
        </div>
    </div>
</div></td>'''
            # For Lichess accounts
            elif cell.startswith('$'):
                user = cell[1:]
                username = cell[2:]
                if user.startswith('*'):
                    cell_content = f'<td><a href="{lc}/{username}" target="_blank">{username} <span class="fa fa-check special"></span></a></td>'
                elif user.startswith('!'):
                    cell_content = f'<td><a href="{lc}/{username}" target="_blank" class="closed">{username} <span class="fa fa-ban"></span></a></td>'
                else:
                    cell_content = f'<td><a href="{lc}/{username}" target="_blank">{user}</a></td>'
            # Other rows, cell
            else:
                cell_content = f'<td>{cell}</td>'
            html_table += f'{cell_content}\n'
        html_table += '</tr>\n'
    html_table += '''</tbody></table>
        <br><br><hr>
        <button id="back-to-top" title="Go to top"><span class="bx bxs-to-top"></span></button>
        <script src="/js/main.js"></script>
        </body>
        </html>
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
                styled_html_table = head_content + nav_content() + '<div id="section-page"><div class="container">' + h1_tag + information + html_table + '</div></div>' + footer_content()
                html_filename = os.path.splitext(filename)[0] + '.html'
                with open(os.path.join(directory, html_filename), 'w', encoding='utf-8') as html_file:
                    html_file.write(styled_html_table)
                
                print(f"Convered {filename} to HTML successful!")
