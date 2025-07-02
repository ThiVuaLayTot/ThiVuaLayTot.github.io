import requests
import orjson
from datetime import datetime
import urllib.request
import urllib.error
import sys

sys.stdout.reconfigure(encoding='utf-8')  # type: ignore

MAIN_URL = 'https://gist.githubusercontent.com/M-DinhHoangViet/0ae047855007aacfc63886f9d60bc03d/raw/0ccea68a88539b801dde5770498c64c707bdce80/cttq.txt'

# Lưu dữ liệu players toàn cục
player_points = {}
player_followers = {}
player_avatars = {}

def read_urls_from_url(url: str):
    response = requests.get(url)
    urls = []
    if response.status_code == 200:
        lines = response.text.splitlines()
        for line in lines:
            id = line.strip()
            if id:
                urls.append([
                    f'https://api.chess.com/pub/tournament/{id}',
                    f'https://www.chess.com/tournament/{id}/1'
                ])
    else:
        print(f"Failed to get content from {url}, status code: {response.status_code}")
    return urls

def fetch_data(url):
    req = urllib.request.Request(url, method='GET')
    try:
        with urllib.request.urlopen(req) as response:
            return orjson.loads(response.read())
    except urllib.error.URLError as e:
        print(f"Error fetching data from {url}: {e}")
        return {}

def parse_tournament_data(data):
    players = [player.get('username', 'N/A') for player in data.get('players', [])]
    points = [player.get('points', 0) for player in data.get('players', [])]

    time_control = data.get('settings', {}).get('time_control', 'N/A')
    if isinstance(time_control, str) and '+' in time_control:
        parts = time_control.split('+')
        if len(parts) == 2:
            try:
                minutes_seconds = int(parts[0])
                seconds = int(parts[1])
                minutes = round(minutes_seconds / 60)
                total_minutes = f'{minutes}+{seconds}'
            except ValueError:
                total_minutes = 'N/A'
        else:
            total_minutes = 'N/A'
    else:
        total_minutes = 'N/A'

    start_time_unix = data.get('start_time', 0)
    start_time = datetime.utcfromtimestamp(start_time_unix).strftime('%d-%m-%Y') if start_time_unix else 'N/A'

    parsed = {
        'name': data.get('name', 'N/A'),
        'url': data.get('url', 'N/A'),
        'variant': data.get('settings', {}).get('rules', 'N/A'),
        'start_time': start_time,
        'time_class': data.get('settings', {}).get('time_class', 'N/A'),
        'time_control': total_minutes,
        'players': players,
        'points': points
    }
    return parsed

def update_player_points(players, points):
    for username, pts in zip(players, points):
        if username not in player_points:
            player_points[username] = 0
        player_points[username] += pts

def fetch_player_details(username):
    url = f'https://api.chess.com/pub/player/{username}'
    data = fetch_data(url)
    followers = data.get('followers', 0)
    avatar = data.get('avatar', '')
    player_followers[username] = followers
    player_avatars[username] = avatar

def write_tournament_to_md(parsed, md_filename):
    line = f"<a href='{parsed['url']}'>{parsed['name']}</a>|{parsed['start_time']}|{parsed['time_control']} {parsed['time_class']}|{len(parsed['players'])}"
    for player in parsed['players']:
        if player not in player_followers:
            fetch_player_details(player)
        fl = player_followers[player]
        ava = player_avatars[player]
        line += f"|@{player} {fl} {ava}"
    line += "\n"

    with open(md_filename, 'a', encoding='utf-8') as f:
        f.write(line)
    print(f"Tournament {parsed['name']} written!")

def write_summary_top5(month, year, md_filename):
    sorted_players = sorted(player_points.items(), key=lambda x: -x[1])[:5]
    summary = f"<a href='https://www.chess.com/forum/view/link-giai-chien-truong-thi-quan#{month}-{year}'>Chiến Trường Thí Quân tháng {month} năm {year}</a>|Các ngày|Arena|{len(player_points)}"
    for username, pts in sorted_players:
        fl = player_followers.get(username, 0)
        ava = player_avatars.get(username, '')
        summary += f"|{username} {pts} {fl} {ava}"
    summary += "\n"

    with open(md_filename, 'a', encoding='utf-8') as f:
        f.write(summary)
    print(f"Top 5 summary written for {month}-{year}!")

if __name__ == "__main__":
    md_file = 'events/tournaments/cttq.md'
    try:
        ids = requests.get(MAIN_URL).text.splitlines()
        for line in ids:
            id = line.strip()
            if not id:
                continue

            file_url = f'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw/acca2ddde6ace721809a15e5d1bcaf8b03b55867/{id}.txt'
            urls = read_urls_from_url(file_url)
            for api_url, web_url in urls:
                tournament_data = fetch_data(api_url)
                if tournament_data:
                    parsed = parse_tournament_data(tournament_data)
                    update_player_points(parsed['players'], parsed['points'])
                    write_tournament_to_md(parsed, md_file)

        m, y = line.split('-')[0], line.split('-')[1]
        write_summary_top5(m, y, md_file)

    except KeyboardInterrupt:
        print("Process interrupted.")
        sys.exit()
