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
BASE_URL = "https://api.chess.com/pub"
MAIN_URL = 'https://raw.githubusercontent.com/ThiVuaLayTot/sources/refs/heads/master/9c53a11fca709a656076bf6de7c118b0'
id = '9c53a11fca709a656076bf6de7c118b0'
sys.stdout.reconfigure(encoding='utf-8')  # type: ignore

def get_ids(url: str):
    response = requests.get(url)
    if response.status_code == 200:
        return [line.strip() for line in response.text.splitlines() if line.strip()]
    else:
        print(f"Failed to get IDs from {url}, status code: {response.status_code}")
        return []

Client.config["headers"]["User-Agent"] = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/123.0.0.0 Safari/537.36"
)

def fallback_get(path: str):
    url = f"{BASE_URL}/{path}"
    try:
        resp = requests.get(url, headers=Client.config["headers"], timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"[Fallback error] {url} -> {e}")
        return {}

def fetch_tournament_data(tour_id: str):
    try:
        return get_tournament_details(tour_id).json
    except ChessDotComClientError as e:
        print(f"[API error] tournament {tour_id} -> {e.status_code}, fallback")
        return fallback_get(f"tournament/{tour_id}")
    except Exception as e:
        print(f"[Unexpected error] {tour_id}: {e}, fallback")
        return fallback_get(f"tournament/{tour_id}")

def fetch_player_data(username: str):
    try:
        return get_player_profile(username).json
    except ChessDotComClientError as e:
        print(f"[API error] player {username} -> {e.status_code}, fallback")
        return fallback_get(f"player/{username}")
    except Exception as e:
        print(f"[Unexpected error] player {username}: {e}, fallback")
        return fallback_get(f"player/{username}")

def fetch_round_data(tour: str, tRound: int):
    try:
        return get_tournament_round(tour, tRound).json
    except ChessDotComClientError as e:
        print(f"[API error] {tour} round {tRound} -> {e.status_code}, fallback")
        return fallback_get(f"tournament/{tour}/{tRound}")
    except Exception as e:
        print(f"[Unexpected error] {tour} round {tRound}: {e}, fallback")
        return fallback_get(f"tournament/{tour}/{tRound}")

def parse_player_data(data):
    username = data.get('username', 'N/A')
    status = data.get('status', 'N/A')
    avatar = data.get('avatar', 'N/A')
    if status == 'closed' or status == 'closed:abuse' or status == 'closed:fair_play_violations':
        parse_data = {
            'username': username,
            'avatar': avatar,
            'status': status
        }

    else:
        parse_data = {
            'username': username,
            'status': status,
            'avatar': avatar,
            'followers': data.get('followers', 'N/A')
        }
    return parse_data

def sort_player(data):
    raw_players = []
    groups = data.get('players', [])
    for player in groups:
        username = player.get('username', 'N/A')
        points = player.get('points', 0)
        raw_players.append((username, points))

    sorted_players = sorted(raw_players, key=lambda x: -x[1])
    players = [p[0] for p in sorted_players][:7]
    points = [p[1] for p in sorted_players][:7]
    sorted_player = {
        'players': players,
        'points':points
    }
    return sorted_player

def parse_tournament_data(data, id):
    rounds = data.get('settings', {}).get('total_rounds', 'N/A')
    round_in4 = fetch_round_data(id, 1)
    if round_in4:
        sort_player_data = sort_player(round_in4)
        players = sort_player_data['players']
        points = sort_player_data['points']
        print(f'Sorted {id}')
    else:
        players = []
        points = []
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

    start_time_unix = data.get('start_time', 'N/A')
    if start_time_unix:
        start_time = datetime.utcfromtimestamp(start_time_unix).strftime('%d-%m-%Y')
    else:
        start_time = 'N/A'

    parsed_data = {
        'name': data.get('name', 'N/A'),
        'url': data.get('url', 'N/A'),
        'variant': data.get('settings', {}).get('rules', 'N/A'),
        'start_time': start_time,
        'total_rounds': rounds,
        'time_class': data.get('settings', {}).get('time_class', 'N/A'),
        'time_control': total_minutes,
        'players_count': data.get('settings', {}).get('registered_user_count', 'N/A'),
        'players': players,
        'points': points,
    }
    return parsed_data

def write_player_data(parse_data, pts):
    player = parse_data['username']
    status = parse_data['status']
    if status == 'closed:abuse':
        new_line = f'|@#{player} {pts}'
    elif status == 'closed:fair_play_violations':
        new_line = f'|@!{player} {pts}'
    elif status == 'closed':
        new_line = f'|@/{player} {pts}'
    elif status == 'premium':
        followers = parse_data['followers']
        avatar = parse_data['avatar']
        new_line = f'|@&{player} {followers} {avatar} {pts}'
    else:
        followers = parse_data['followers']
        avatar = parse_data['avatar']
        new_line = f'|@{player} {followers} {avatar} {pts}'
    return new_line

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
    players = parsed_data['players']
    points = parsed_data['points']
    for i, player in enumerate(players):
        player_points = points[i]
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