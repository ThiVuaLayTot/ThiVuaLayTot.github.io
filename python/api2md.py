from chessdotcom import Client, get_player_profile, get_tournament_details, get_tournament_round
from datetime import datetime
import orjson
import os
import os.path
import requests
import sys
import urllib.error
import urllib.request

events = ['tvlt', 'cbtt', 'dttv']
special_players = ['m_dinhhoangviet', 'tungjohn_playing_chess', 'thangthukquantrong']
MAIN_URL = 'https://raw.githubusercontent.com/ThiVuaLayTot/sources/refs/heads/master/9c53a11fca709a656076bf6de7c118b0'
id = '9c53a11fca709a656076bf6de7c118b0'
sys.stdout.reconfigure(encoding='utf-8')  # type: ignore

Client.request_config["headers"]["User-Agent"] = "ThiVuaLayTotBot/1.0 (contact: your_email@example.com)"

def get_ids(url: str):
    response = requests.get(url)
    if response.status_code == 200:
        return [line.strip() for line in response.text.splitlines() if line.strip()]
    else:
        print(f"Failed to get IDs from {url}, status code: {response.status_code}")
        return []


def fetch_tournament_data(tour_id: str):
    try:
        resp = get_tournament_details(tour_id)
        data = resp.json
        print(f"Tournament {tour_id} response: {data}")
        return data
    except Exception as e:
        print(f"Error fetching {tour_id}: {e}")
        return {}


def fetch_player_data(username: str):
    try:
        resp = get_player_profile(username)
        data = resp.json
        print(f"Player {username} response: {data}")
        return data
    except Exception as e:
        print(f"Error fetching @{username}: {e}")
        return {}


def fetch_round_data(tour: str, round_num: int):
    try:
        resp = get_tournament_round(tour, round_num)
        data = resp.json
        print(f"Tournament round {round_num} response: {data}")
        return data
    except Exception as e:
        print(f"Error fetching {tour}: {e}")
        return {}


def sort_player(tour_players, round_data):
    points_map = {p.get("username"): p.get("points", 0) for p in round_data.get("players", [])}

    players, points = [], []
    for username in tour_players[:7]:
        players.append(username)
        points.append(points_map.get(username, 0))

    return {"players": players, "points": points}


def parse_player_data(data):
    username = data.get('username', 'N/A')
    status = data.get('status', 'N/A')
    avatar = data.get('avatar', 'N/A')
    if status in ('closed', 'closed:abuse', 'closed:fair_play_violations'):
        return {'username': username, 'avatar': avatar, 'status': status}
    else:
        return {
            'username': username,
            'status': status,
            'avatar': avatar,
            'followers': data.get('followers', 'N/A')
        }


def parse_tournament_data(data, id):
    if not isinstance(data, dict) or not data:
        print(f"[parse_tournament_data] Invalid data for {id}: {data}")
        return {
            'name': 'N/A', 'url': 'N/A', 'variant': 'N/A', 'start_time': 'N/A',
            'total_rounds': 'N/A', 'time_class': 'N/A', 'time_control': 'N/A',
            'players_count': 'N/A', 'players': [], 'points': []
        }

    if 'tournament' in data and isinstance(data['tournament'], dict):
        data = data['tournament']

    rounds = data.get('settings', {}).get('total_rounds', 'N/A')
    rounds_int = int(rounds) if rounds != 'N/A' else 0

    if rounds_int:
        round_in4 = fetch_round_data(id, rounds_int)
    else:
        round_in4 = {}

    place_sorted = [p.get("username") for p in data.get("players", []) if isinstance(p, dict)]

    if round_in4:
        sort_player_data = sort_player(place_sorted, round_in4)
        players = sort_player_data['players']
        points = sort_player_data['points']
        print(f'Sorted {id}')
    else:
        players, points = [], []

    time_control = data.get('settings', {}).get('time_control', 'N/A')
    parts = time_control.split('+')
    if time_control != 'N/A':
        try:
            parts = time_control.split('+')
            if len(parts) == 2:
                minutes_seconds = int(parts[0]) // 60 
                seconds = int(parts[1])
                time_control = f"{minutes_seconds}+{seconds}"
            else:
                time_control = f"{(int(parts[0]) // 60)}+0"
        except Exception:
            pass

    start_time_unix = data.get("start_time")
    if isinstance(start_time_unix, (int, float)):
        start_time = datetime.utcfromtimestamp(start_time_unix).strftime('%d-%m-%Y')
    else:
        try:
            start_time = datetime.utcfromtimestamp(int(start_time_unix)).strftime('%d-%m-%Y')
        except (TypeError, ValueError):
            start_time = "N/A"

    return {
        'name': data.get('name', 'N/A'),
        'url': data.get('url', 'N/A'),
        'variant': data.get('settings', {}).get('rules', 'N/A'),
        'start_time': start_time,
        'total_rounds': rounds,
        'time_class': data.get('settings', {}).get('time_class', 'N/A'),
        'time_control': time_control,
        'players_count': data.get('settings', {}).get('registered_user_count', 'N/A'),
        'players': players,
        'points': points,
    }


def parse_player_data(data):
    username = data.get('username') or 'N/A'
    status = data.get('status') or 'N/A'
    avatar = data.get('avatar') or ''
    followers = data.get('followers') or 0

    return {
        'username': username,
        'status': status,
        'avatar': avatar,
        'followers': followers
    }


def write_player_data(parse_data, pts):
    player = parse_data['username']
    status = parse_data['status']
    avatar = parse_data['avatar']
    followers = parse_data['followers']

    if status == 'closed:abuse':
        return f'|@#{player} {pts}'
    elif status == 'closed:fair_play_violations':
        return f'|@!{player} {pts}'
    elif status == 'closed':
        return f'|@/{player} {pts}'
    elif status == 'premium':
        return f'|@&{player} {followers} {avatar} {pts}'
    else:
        if followers or avatar:
            return f'|@{player} {followers} {avatar} {pts}'
        else:
            return f'|@{player} {pts}'


def write_tournament_data_to_file(parsed_data, md_filename):
    rule = parsed_data['variant'].lower()
    time_class = parsed_data['time_class'].lower()
    url = parsed_data['url']
    start_time = parsed_data['start_time']
    time_control = parsed_data['time_control']
    name = parsed_data['name'].replace('||', '-').replace('|', '-')
    rounds = parsed_data['total_rounds']
    player_count = parsed_data['players_count']

    new_line = f'<a href="{url}" target="_top">{name}</a>|{start_time}|{time_control} '

    if time_class == 'bullet':
        new_line += 'Bullet'
    elif time_class == 'blitz':
        new_line += 'Blitz'
    else:
        new_line += 'Rapid'

    if rule == 'chess960':
        new_line += ' Chess960,'
    elif rule == 'kingofthehill':
        new_line += ' KOTH,'
    elif rule == 'crazyhouse':
        new_line += ' Crazyhouse,'
    elif rule == 'bughouse':
        new_line += ' Bughouse,'
    elif rule == 'threecheck':
        new_line += ' 3 Chiếu, '
    else:
        new_line += ','

    if rounds == 1:
        new_line += ' Arena'
    else:
        new_line += f' Swiss {rounds} vòng'

    new_line += f'|{player_count}'

    player_data_cache = {}
    for i, player in enumerate(parsed_data['players']):
        player_points = parsed_data['points'][i]
        if player in special_players:
            if player in ['m_dinhhoangviet', 'tungjohn_playing_chess']:
                new_line += '|@*M-DinhHoangViet'
            elif player == 'thangthukquantrong':
                new_line += '|@*thangthukquantrong'
        else:
            if player in player_data_cache:
                parse_data = player_data_cache[player]
            else:
                player_data = fetch_player_data(player)
                parse_data = parse_player_data(player_data)
                player_data_cache[player] = parse_data

            new_line += write_player_data(parse_data, player_points)
            print(f'{player} info was written!')

    new_line += '\n'

    os.makedirs(os.path.dirname(md_filename), exist_ok=True)
    with open(md_filename, 'a', encoding='utf-8') as f:
        f.write(new_line)

    print(f"Data for {parsed_data['name']} written to {md_filename}")


if __name__ == "__main__":
    try:
        for filename in events:
            file_url = f'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw/{filename}.txt'
            ids = get_ids(file_url)
            md_filename = f'events/tournaments/{filename}.md'
            if os.path.exists(md_filename):
                os.remove(md_filename)

            for id_tournament in ids:
                tournament_data = fetch_tournament_data(id_tournament)
                if tournament_data:
                    parsed_data = parse_tournament_data(tournament_data, id_tournament)
                    write_tournament_data_to_file(parsed_data, md_filename)
                else:
                    print(f"No data found for {id_tournament}. Skipping.")

    except KeyboardInterrupt:
        print("Process interrupted.")
        sys.exit()
