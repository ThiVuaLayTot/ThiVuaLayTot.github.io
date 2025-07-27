import requests
import orjson
import os
import os.path
from datetime import datetime
import urllib.request
import urllib.error
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')  # type: ignore

MAIN_URL = 'https://raw.githubusercontent.com/ThiVuaLayTot/sources/refs/heads/master/0ae047855007aacfc63886f9d60bc03d'
round_tournament = 0
player_points_per_month = defaultdict(lambda: defaultdict(int))
player_followers = {}
player_avatars = {}
player_status = {}

def read_urls_from_url(url: str):
    global round_tournament
    response = requests.get(url)
    urls = []
    if response.status_code == 200:
        lines = response.text.splitlines()
        round_tournament = 0
        for line in lines:
            id = line.strip()
            if id:
                urls.append([
                    f'https://api.chess.com/pub/tournament/{id}',
                    f'https://api.chess.com/pub/tournament/{id}/1'
                ])
                round_tournament += 1
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
    raw_players = []

    groups = dt.get('players', [])
    for player in groups:
        username = player.get('username', 'N/A')
        points = player.get('points', 0)
        raw_players.append((username, points))

    sorted_players = sorted(raw_players, key=lambda x: -x[1])
    players = [p[0] for p in sorted_players]
    points = [p[1] for p in sorted_players]
    time_control = data.get('settings', {}).get('time_control', 'N/A')

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
        total_minutes = f'{int(parts[0])/60}'

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
    player_followers[username] = data.get('followers', 0)
    player_avatars[username] = data.get('avatar', 'N/A')
    player_status[username] = data.get('status', 'N/A')

def write_summary_top5(month_year, md_filename):
    month, year = month_year.split('-')
    points = player_points_per_month[month_year]
    round = round_tournament
    sorted_players = sorted(points.items(), key=lambda x: -x[1])[:7]
    summary = f"<b><a href='//chess.com/forum/view/link-giai-chien-truong-thi-quan#{month}-{year}' target='_blank'>Chiến Trường Thí Quân tháng {month} năm {year}</a></b>|{round} ngày|Đấu trường Arena {round} vòng|{len(points)}"
    for username, pts in sorted_players:
        fetch_player_details(username)
        fl = player_followers.get(username, 0)
        ava = player_avatars.get(username, 'N/A')
        status = player_status.get(username, 'N/A')
        if status == 'closed' or status == 'closed:abuse' or status == 'closed:fair_play_violations':
            summary += f"|@!{username} {fl} {ava} {pts}"
        else:
            summary += f"|@{username} {fl} {ava} {pts}"
    summary += "\n"

    with open(md_filename, 'a', encoding='utf-8') as f:
        f.write(summary)
    print(f"Top 6 summary written for {month_year}!")

def write_tournament_to_md(parsed, md_filename):
    line = f"<a href='{parsed['url']}' target='_top'>{parsed['name']}</a>|{parsed['start_time']}|{parsed['time_control']} {parsed['time_class']}|{len(parsed['players'])}"
    players = parsed_data['players']
    points = parsed_data['points']
    for i, player in enumerate(players):
        fetch_player_details(player)
        fl = player_followers[player]
        ava = player_avatars[player]
        status = player_status[player]
        pts = points[i]
        if status == 'closed' or status == 'closed:abuse' or status == 'closed:fair_play_violations':
            line += f"|@!{player} {fl} {ava} {pts}"
        else:
            line += f"|@{player} {fl} {ava} {pts}"
    line += "\n"

    with open(md_filename, 'a', encoding='utf-8') as f:
        f.write(line)
    print(f"Tournament {parsed['name']} written!")

if __name__ == "__main__":
    md_file = 'events/tournaments/cttq.md'
    ver_id = '9c53a11fca709a656076bf6de7c118b0'
    main_url = 'https://raw.githubusercontent.com/ThiVuaLayTot/sources/refs/heads/master/9c53a11fca709a656076bf6de7c118b0'
    try:
        if os.path.exists(md_file):
            os.remove(md_file)
        ids = requests.get(main_url).text.splitlines()
        if len(ids) == 1:
            ver_id = ids[0].strip()
        ids = requests.get(MAIN_URL).text.splitlines()
        for line in ids:
            id = line.strip()
            if not id:
                continue
            print(f"Processing month: {id}")

            file_url = f'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw/{ver_id}/{id}.txt'
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
