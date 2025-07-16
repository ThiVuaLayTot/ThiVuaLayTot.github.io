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

def read_urls_from_url(url: str):
    response = requests.get(url)
    if response.status_code == 200:
        lines = response.text.splitlines()
        urls = ['https://api.chess.com/pub/tournament/' + line.strip() for line in lines if line.strip()]
    else:
        print(f"Failed to get content from {url}, status code: {response.status_code}")
        return []
    return urls

def fetch_data(url):
    req = urllib.request.Request(url, method='GET')
    try:
        with urllib.request.urlopen(req) as response:
            return orjson.loads(response.read())
    except urllib.error.URLError as e:
        print(f"Error fetching tournament data from {url}: {e}")
        return {}

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

def parse_tournament_data(data):
    players = [player.get('username', 'N/A') for player in data.get('players', [])][:6]
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
        'total_rounds': data.get('settings', {}).get('total_rounds', 'N/A'),
        'time_class': data.get('settings', {}).get('time_class', 'N/A'),
        'time_control': total_minutes,
        'players_count': data.get('settings', {}).get('registered_user_count', 'N/A'),
        'players': players
    }
    return parsed_data

def write_player_data(parse_data):
    player = parse_data['username']
    status = parse_data['status']
    if status == 'closed:abuse':
        new_line = f'|@#{player}'
    elif status == 'closed:fair_play_violations':
        new_line = f'|@!{player}'
    elif status == 'closed':
        new_line = f'|@/{player}'
    elif status == 'premium':
        followers = parse_data['followers']
        avatar = parse_data['avatar']
        new_line = f'|@&{player} {followers} {avatar}'
    else:
        followers = parse_data['followers']
        avatar = parse_data['avatar']
        new_line = f'|@{player} {followers} {avatar}'
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
    for player in parsed_data['players']:
        if player in special_players:
            if player in ['m_dinhhoangviet', 'tungjohn_playing_chess']:
                new_line += '|@*M-DinhHoangViet'
            elif player == 'thangthukquantrong':
                new_line += '|@*thangthukquantrong'

        else:
            if player in player_data_cache:
                parse_data = player_data_cache[player]
            else:
                player_url = f'https://api.chess.com/pub/player/{player}'
                player_data = fetch_data(player_url)
                parse_data = parse_player_data(player_data)
                player_data_cache[player] = parse_data
    
            new_line += write_player_data(parse_data)
            print(f'{player} info was written!')

    new_line += '\n'

    with open(md_filename, 'a', encoding='utf-8') as f:
        f.write(new_line)

    print(f"Data for {parsed_data['name']} written to {md_filename}")

if __name__ == "__main__":
    try:
        ids = requests.get(MAIN_URL).text.splitlines()
        if len(ids) == 1:
            id = ids.strip()
            for filename in events:
                file_url = f'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw/{id}/{filename}.txt'
                urls = read_urls_from_url(file_url)
                md_filename = f'events/tournaments/{filename}.md'
                if os.path.exists(md_filename):
                    os.remove(md_filename)

                for url in urls:
                    tournament_data = fetch_data(url)
                    if tournament_data:
                        parsed_data = parse_tournament_data(tournament_data)
                        write_tournament_data_to_file(parsed_data, md_filename)
                    else:
                        print(f"No data found for {url}. Skipping.")
        else:
            print(f'Get gist version failed. {ids}')

    except KeyboardInterrupt:
        print("Process interrupted.")
        sys.exit()