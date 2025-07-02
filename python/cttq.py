import requests
import orjson
from datetime import datetime
import urllib.request
import urllib.error
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')  # type: ignore

MAIN_URL = 'https://gist.githubusercontent.com/M-DinhHoangViet/0ae047855007aacfc63886f9d60bc03d/raw/e2c74811ac31cb3d63f29cfcc0d078a3505b2ff1/cttq.txt'

player_points_per_month = defaultdict(lambda: defaultdict(int))
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

def parse_tournament_data(data, dt):
    players = [player.get('username', 'N/A') for player in dt.get('players', [])]
    points = [player.get('points', 0) for player in dt.get('players', [])]

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

def update_player_points(players, points, month_year):
    for username, pts in zip(players, points):
        player_points_per_month[month_year][username] += pts

def fetch_player_details(username):
    if username in player_followers:
        return
    url = f'https://api.chess.com/pub/player/{username}'
    data = fetch_data(url)
    followers = data.get('followers', 0)
    avatar = data.get('avatar', '')
    player_followers[username] = followers
    player_avatars[username] = avatar

def write_summary_top5(month_year, md_filename):
    month, year = month_year.split('-')
    points = player_points_per_month[month_year]
    sorted_players = sorted(points.items(), key=lambda x: -x[1])[:6]
    summary = f"<b><a href='//chess.com/forum/view/link-giai-chien-truong-thi-quan#{month}-{year}'>Chiến Trường Thí Quân tháng {month} năm {year}</a></b>|Các ngày|Arena|{len(points)}"
    for username, pts in sorted_players:
        fetch_player_details(username)
        fl = player_followers.get(username, 0)
        ava = player_avatars.get(username, '')
        summary += f"|@{username} {fl} {ava} {pts}"
    summary += "\n"

    with open(md_filename, 'a', encoding='utf-8') as f:
        f.write(summary)
    print(f"Top 6 summary written for {month_year}!")

def write_tournament_to_md(parsed, md_filename):
    line = f"<a href='{parsed['url']}'>{parsed['name']}</a>|{parsed['start_time']}|{parsed['time_control']} {parsed['time_class']}|{len(parsed['players'])}"
    for player in parsed['players']:
        fetch_player_details(player)
        fl = player_followers[player]
        ava = player_avatars[player]
        line += f"|@{player} {fl} {ava}"
    line += "\n"

    with open(md_filename, 'a', encoding='utf-8') as f:
        f.write(line)
    print(f"Tournament {parsed['name']} written!")

if __name__ == "__main__":
    md_file = 'events/tournaments/cttq.md'
    try:
        if os.path.exists(md_file):
            os.remove(md_file)
        ids = requests.get(MAIN_URL).text.splitlines()
        for line in ids:
            id = line.strip()
            if not id:
                continue
            print(f"Processing month: {id}")

            file_url = f'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw/2294437cdcc0f053904990fa7b5bd59ccd81a4e7/{id}.txt'
            urls = read_urls_from_url(file_url)

            month_events = []
            for api_url, web_url in urls:
                tournament_data = fetch_data(api_url)
                player_data = fetch_data(web_url)
                if tournament_data and player_data:
                    parsed = parse_tournament_data(tournament_data, player_data)
                    update_player_points(parsed['players'], parsed['points'], id)
                    month_events.append(parsed)

            write_summary_top5(id, md_file)

            for parsed in month_events:
                write_tournament_to_md(parsed, md_file)

    except KeyboardInterrupt:
        print("Process interrupted.")
        sys.exit()
