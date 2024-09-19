import urllib.request
import orjson
import os
import sys
from datetime import datetime

special_players = ['m_dinhhoangviet', 'tungjohn_playing_chess', 'thangthukquantrong']
sys.stdout.reconfigure(encoding='utf-8')  # type: ignore

def read_urls_from_txt(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        urls = ['https://api.chess.com/pub/tournament/' + line.strip() for line in f.readlines()]
    return urls

def fetch_tournament_data(url):
    req = urllib.request.Request(url, method='GET')
    try:
        with urllib.request.urlopen(req) as response:
            return orjson.loads(response.read())
    except urllib.error.URLError as e:
        print(f"Error fetching tournament data from {url}: {e}")
        return {}

def parse_tournament_data(data):
    players = [player.get('username', 'N/A') for player in data.get('players', [])][:6]
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

    start_time_unix = data.get('start_time', 'N/A')
    if start_time_unix:
        start_time = datetime.utcfromtimestamp(start_time_unix).strftime('%d-%m-%Y')
    else:
        start_time = 'N/A'

    parsed_data = {
        'name': data.get('name', 'N/A'),
        'url': data.get('url', 'N/A'),
        'type': data.get('settings', {}).get('type', 'N/A'),
        'rules': data.get('settings', {}).get('rules', 'N/A'),
        'start_time': start_time,
        'total_rounds': data.get('settings', {}).get('total_rounds', 'N/A'),
        'time_class': data.get('settings', {}).get('time_class', 'N/A'),
        'time_control': total_minutes,
        'players': players
    }
    return parsed_data

def write_tournament_data_to_file(parsed_data, md_filename):
    rule = parsed_data['rules'].lower()
    time_class = parsed_data['time_class'].lower()
    name = parsed_data["name"].replace(' |', '-')

    if os.path.exists(md_filename):
        with open(md_filename, 'r', encoding='utf-8') as f:
            existing_content = f.read()
    else:
        existing_content = ""

    new_line = f'<a href="{parsed_data["url"]}">{name}</a>|{parsed_data["start_time"]}|{parsed_data["time_control"]} '
    
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

    if parsed_data['type'].lower() == 'standard':
        new_line += 'Arena'
    else:
        new_line += f'Swiss {parsed_data["total_rounds"]} vòng'

    for player in parsed_data['players']:
        if player in special_players:
            if player in ['m_dinhhoangviet', 'tungjohn_playing_chess']:
                new_line += '|@M-DinhHoangViet'
            elif player == 'thangthukquantrong':
                new_line += '|@thangthukquantrong'
        else:
            new_line += f'|@{player}'

    new_line += '\n'

    if new_line.strip() in existing_content:
        print(f"Data for {parsed_data['name']} already exists in {md_filename}. Skipping.")
        return

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

                for url in urls:
                    tournament_data = fetch_tournament_data(url)
                    
                    if tournament_data:
                        parsed_data = parse_tournament_data(tournament_data)

                        write_tournament_data_to_file(parsed_data, md_filename)

    except KeyboardInterrupt:
        print("Process interrupted.")
        sys.exit()
