import urllib.request
import orjson
import os
import os.path
import sys
from datetime import datetime
import urllib.error

special_players = ['m_dinhhoangviet', 'tungjohn_playing_chess', 'thangthukquantrong']
sys.stdout.reconfigure(encoding='utf-8')  # type: ignore

def read_urls_from_txt(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        urls = ['https://api.chess.com/pub/tournament/' + line.strip() for line in f.readlines()]
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
    status = data.get('status', 'N/A')
    if status == 'closed' or status == 'closed:abuse' or status == 'closed:fair_play_violations':
        parse_data = {
            'username': data.get('username', 'N/A'),
            'status': status
        }

    else:
        parse_data = {
            'username': data.get('username', 'N/A'),
            'status': status,
            'avatar': data.get('avatar', 'N/A'),
            'folowers': data.get('folower', 'N/A')
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
        total_minutes = f'{int(parts[0])}'

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
    followers = parse_data['followers']
    avatar = parse_data['avatar']
    status = parse_data['status']
    if status == 'closed:abuse':
        new_line = f'|@#{player}'
    elif status == 'closed:fair_play_violations':
        new_line = f'|@!{player}'
    elif status == 'closed':
        new_line = f'|@/{player}'
    elif status == 'premium':
        new_line = f'|@&{player} {followers}'
    else:
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

    new_line = f'<a href="{url}">{name}</a>|{start_time}|{time_control} '
    
    if time_class == 'bullet':
        new_line += 'Bullet'
    elif time_class == 'blitz':
        new_line += 'Blitz'
    else:
        new_line += 'Rapid'

    if rule == 'chess960':
        new_line += ' Chess960, '
    elif rule == 'kingofthehill':
        new_line += ' KOTH, '
    elif rule == 'crazyhouse':
        new_line += ' Crazyhouse, '
    elif rule == 'bughouse':
        new_line += ' Bughouse, '
    elif rule == 'threecheck':
        new_line += ' 3 Chiếu, '
    else:
        new_line += ','

    if rounds == 1:
        new_line += 'Arena'
    else:
        new_line += f'Swiss {rounds} vòng'

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
                player_data = player_data_cache[player]
            else:
                player_info = parse_player_data(fetch_data(f'https://api.chess.com/pub/player/{player}'))
                player_data_cache[player] = player_data

            new_line += write_player_data(player_data)
            print(f'{player} info has written!')

    new_line += '\n'

    with open(md_filename, 'a', encoding='utf-8') as f:
        f.write(new_line)

    print(f"Data for {parsed_data['name']} written to {md_filename}")

if __name__ == "__main__":
    try:
        for filename in os.listdir('events/tournaments'):
            if filename.endswith('.txt'):
                file_path = os.path.join('events/tournaments', filename)
                urls = read_urls_from_txt(file_path)
                
                md_filename = file_path.replace('.txt', '.md')

                if os.path.exists(md_filename):
                    os.remove(md_filename)

                for url in urls:
                    tournament_data = fetch_data(url)
                    
                    if tournament_data:
                        parsed_data = parse_tournament_data(tournament_data)

                        write_tournament_data_to_file(parsed_data, md_filename)

    except KeyboardInterrupt:
        print("Process interrupted.")
        sys.exit()
