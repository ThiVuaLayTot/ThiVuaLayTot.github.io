from collections import defaultdict
import re
import os
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
    <link rel="stylesheet" href="/css/main.css">
    <link rel="stylesheet" href="/css/eventwinner.css">
    <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">
    <link rel="icon" href="https://raw.githubusercontent.com/ThiVuaLayTot/ThiVuaLayTot.github.io/main/images/favicon.ico" type="image/x-icon">
</head>
<body>
"""

def nav_content():
    with open('_includes/navbar.html', 'r', encoding='utf-8') as file:
        return file.read()

def footer_content():
    with open('_includes/footer.html', 'r', encoding='utf-8') as file:
        return file.read()

def generate_h1_tag(filename):
    namefile = os.path.splitext(filename)[0]
    if namefile == 'tvlt':
        title = 'Thí Vua Lấy Tốt'
    elif namefile == 'cbtt':
        title = 'Cờ Bí Thí Tốt'
    elif namefile == 'cttq':
        title = 'Chiến Trường Thí Quân'
    elif namefile == 'dttv':
        title = 'Đấu Trường Thí Vua'
    else:
        title = '<span class="loader"></span>'
    h1_tag = f"""<h1 align="center">Những kỳ thủ đạt giải {title} nhiều nhất</h1>
    <h2 align="center">Bạn có thể xem tổng hợp các giải {title} <a href="{namefile}">ở đây</a>.</h2>
    <ul class="tab"><li><a href="tvlt">Thí Vua Lấy Tốt</a></li> <li><a href="cbtt">Cờ Bí Thí Tốt</a></li> <li><a href="cttq">Chiến Trường Thí Quân</a></li> <li><a href="dttv">Đấu Trường Thí Vua</a></li></ul>
    <button onclick="topFunction()" id="myBtn" title="Trở lại đầu trang này"><i id="back2top" class="fa fa-to-top"></span></button>
    <i>Tất cả thông tin phía dưới được sắp xếp tự động, sẽ có một số kỳ thủ bị đóng tài khoản nhưng không phải vi phạm không được hiển thị ở đây. Nếu muốn chính xác hơn, hãy đối chiếu với bảng thống kê các giải <a href="/events/tournaments/{namefile}">{title}</a>.</i>
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

def find_non_violating_player(index, substitutes):
    for j in range(index, len(substitutes)):
        potential_replacement = substitutes[j].strip()
        if potential_replacement and not potential_replacement.startswith('@'):
            return potential_replacement, j
        elif potential_replacement.startswith('@'):
            status = get_chesscom_status(potential_replacement[1:])
            if status != "Fair Play":
                return potential_replacement, j
    return None, -1

def parse_markdown_table(markdown_table):
    players = defaultdict(lambda: {"gold": 0, "silver": 0, "bronze": 0, "achievements": [], "status": "Active"})
    rows = markdown_table.strip().split('\n')

    for row in rows[2:]:
        cells = re.split(r'\s*\|\s*', row)
        if len(cells) < 9:
            continue

        event_date = cells[0]
        gold_player, silver_player, bronze_player = cells[3:6]
        rank4, rank5, rank6 = cells[6:9]
        player_list = [gold_player, silver_player, bronze_player]
        substitutes = [rank4, rank5, rank6]

        for i, player in enumerate(player_list):
            if not player or not player.startswith('@'):
                continue

            username = player[1:]
            status = get_chesscom_status(username)
            
            while status == "Fair Play":
                replacement, index = find_non_violating_player(i + 3, substitutes)
                if replacement:
                    print(f"Thay thế {player} bằng {replacement}")
                    player_list[i] = replacement
                    substitutes[index] = ""
                    status = get_chesscom_status(replacement[1:])
                else:
                    print(f"Không tìm thấy người thay thế cho {player}")
                    player_list[i] = ""
                    break

        for i, player in enumerate(player_list):
            if player.startswith('@'):
                username = player[1:]
                players[username]["status"] = get_chesscom_status(username)
                rank = ['🥇', '🥈', '🥉'][i]
                if not isinstance(players[username]["achievements"], list):
                    players[username]["achievements"] = []

                players[username]["achievements"].append(f"{rank}({event_date})")
                if rank == '🥇':
                    players[username]["gold"] += 3
                elif rank == '🥈':
                    players[username]["silver"] += 2
                elif rank == '🥉':
                    players[username]["bronze"] += 1

    return players

def sort_players(players):
    player_list = []
    for player, data in players.items():
        total_points = data["gold"] + data["silver"] + data["bronze"]
        player_list.append((player, total_points, data["achievements"]))

    player_list.sort(key=lambda x: -x[1])

    return player_list

def generate_html_output(rankings):
    html_output = """
    <input type="text" id="searchInput" class="search-bar" onkeyup="searchTable()" placeholder="Tìm kiếm kỳ thủ hoặc tên giải đấu (Càng chi tiết càng tốt)"><script src="/js/search-events.js"></script>
    <table class="styled-table">
        <thead>
            <tr>
                <th class="stt">Hạng</th>
                <th class="winner">Kỳ thủ</th>
                <th>Các lần đạt giải</th>
            </tr>
        </thead>
        <tbody>
    """
    rank = 1
    for player, achievements in rankings:
        achievements_display = ', '.join(achievements)
        html_output += f"""
        <tr>
            <td>#{rank}</td>
            <td><a href="https://chess.com/member/{player}">{player}</a></td>
            <td>{achievements_display}</td>
        </tr>
        """
        rank += 1

    html_output += """
        </tbody>
    </table>
    """
    return html_output

def markdown_table_to_html(markdown_table):
    players = parse_markdown_table(markdown_table)
    sorted_players = sort_players(players)
    html_table = generate_html_output(sorted_players)
    return html_table

input_directory = 'events/tournaments'
output_directory = 'events/bestplayers'

os.makedirs(output_directory, exist_ok=True)

files = os.listdir(input_directory)

for filename in files:
    if filename.endswith('.md'):
        with open(os.path.join(input_directory, filename), 'r', encoding='utf-8') as input_file:
            markdown_content = input_file.read()

        html_content = css_styles + nav_content() + generate_h1_tag(filename) + markdown_table_to_html(markdown_content) + footer_content()

        output_filename = filename.replace('.md', '.html')
        with open(os.path.join(output_directory, output_filename), 'w', encoding='utf-8') as output_file:
            output_file.write(html_content)

        print(f"Đã chuyển đổi {filename} thành HTML thành công!")
