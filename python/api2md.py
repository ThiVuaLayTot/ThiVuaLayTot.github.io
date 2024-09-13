import urllib.request
import orjson
import os
import sys
from datetime import datetime


special_players = ['m_dinhhoangviet', 'tungjohn_playing_chess', 'thangthukquantrong']

def read_urls_from_txt(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        urls = ['https://api.chess.com/pub/tournament/' + line.strip() for line in f.readlines()]
    return urls

def last_6_lines(md_filename):
    if os.path.exists(md_filename):
        with open(md_filename, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            return lines[:2] if len(lines) < 3 else lines
    return []

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
            minutes = parts[0]
            seconds = parts[1]
            try:
                minutes = int(minutes)
                seconds = int(seconds)
                additional_secs = minutes / 60
                min = round(additional_secs)
                total_minutes = f'{min}+{seconds}'
            except ValueError:
                total_minutes = 'N/A'
        else:
            total_minutes = 'N/A'
    else:
        total_minutes = 'N/A'

    start_time_unix = data.get('start_time', 'N/A')
    if start_time_unix:
        start_time = datetime.utcfromtimestamp(start_time_unix).strftime('%D/%M/%Y')
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
    with open(md_filename, 'w', encoding='utf-8') as f:
        f.write('Tên giải|Ngày tổ chức🕗|Thể lệ♟️|Hạng nhất 🥇|Hạng nhì 🥈|Hạng ba 🥉|Hạng 4 🏅|Hạng 5 🎖️|Hạng 6 🌟\n')
        f.write(f"""<a href="{parsed_data['url']}">{parsed_data['name']}</a>|{parsed_data['start_time']}|{parsed_data['time_control']} """)
        if parsed_data['time_class'].lower() == 'bullet':
            f.write("Bullet, ")
        elif parsed_data['time_class'].lower() == 'blitz':
            f.write("Blitz")
        else:
            f.write("Rapid")

        if parsed_data['rules'].lower() == 'chess960':
            f.write(" Chess960, ")
        elif parsed_data['rules'].lower() == 'kingofthehill':
            f.write(" KOTH, ")
        elif parsed_data['rules'].lower() == 'crazyhouse':
            f.write(" Crazyhouse, ")
        elif parsed_data['rules'].lower() == 'bughouse':
            f.write(" Bughouse, ")
        elif parsed_data['rules'].lower() == 'threecheck':
            f.write(" 3 Chiếu, ")
        else:
            f.write(" ,")

        if parsed_data['type'].lower() == 'standard':
            f.write("Arena")
        else:
            f.write(f"Swiss {parsed_data['total_rounds']} vòng")

        for player in parsed_data['players']:
            if player in special_players:
                if player == 'm_dinhhoangviet':
                    f.write(f"|@M-DinhHoangViet")
                elif player == 'tungjohn_playing_chess':
                    f.write(f"|@M-DinhHoangViet")
                elif player == 'thangthukquantrong':
                    f.write(f"|@thangthukquantrong")
            else:
                f.write(f"|@{parsed_data['players']}")

        f.write("\n")

        for line in last_6_lines(md_filename):  # Call the function to get the last 6 lines
            f.write(line)

    print(f"Data for {parsed_data['name']} written to {md_filename}")

if __name__ == "__main__":
    try:
        for filename in os.listdir('events/tournaments'):
            if filename.endswith('.txt'):
                file_path = os.path.join('events/tournaments', filename)
                urls = read_urls_from_txt(file_path)
                
                # Generate corresponding .md filename
                md_filename = file_path.replace('.txt', '.md')

                for url in urls:
                    tournament_data = fetch_tournament_data(url)
                    
                    if tournament_data:  # Ensure that data is fetched successfully
                        parsed_data = parse_tournament_data(tournament_data)

                        write_tournament_data_to_file(parsed_data, md_filename)

    except KeyboardInterrupt:
        print("Process interrupted.")
        sys.exit()
