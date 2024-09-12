import urllib.request
import orjson
import json
import os
import re
import sys


def read_urls_from_txt(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        urls = ['https://api.chess.com/pub/tournament/' + line.strip() for line in f.readlines()]
    return urls

def get_file_name():
    return './test.md'

def fetch_tournament_data(url):
    req = urllib.request.Request(url, method='GET')
    try:
        with urllib.request.urlopen(req) as response:
            return orjson.loads(response.read())
    except urllib.error.URLError as e:
        print(f"Error fetching tournament data from {url}: {e}")
        return {}

def parse_tournament_data(data):
    players = [player.get('username', 'N/A') for player in data.get('players', [])]
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

    parsed_data = {
        'name': data.get('name', 'N/A'),
        'url': data.get('url', 'N/A'),
        'type': data.get('settings', {}).get('type', 'N/A'),
        'rules': data.get('settings', {}).get('rules', 'N/A'),
        'total_rounds': data.get('settings', {}).get('total_rounds', 'N/A'),
        'time_class': data.get('settings', {}).get('time_class', 'N/A'),
        'time_control': total_minutes,
        'players': players
    }
    return parsed_data

def write_tournament_data_to_file(parsed_data):
    """Append the parsed tournament data into a Markdown file."""
    file_name = get_file_name()
    with open(file_name, 'w', encoding='utf-8') as f:
        f.write(f"""<a href="{parsed_data['url']}">{parsed_data['name']}</a>|{parsed_data['time_control']} """)

        if parsed_data['time_class'].lower() == 'bullet':
            f.write("Bullet, ")
        elif parsed_data['time_class'].lower() == 'blitz':
            f.write("Blitz, ")
        else:
            f.write("Rapid, ")

        if parsed_data['type'].lower() == 'standard':
            f.write("Arena")
        else:
            f.write(f"Swiss {parsed_data['total_rounds']} vòng")

        if parsed_data['rules'].lower() == 'chess960':
            f.write(" Chess960")
        elif parsed_data['rules'].lower() == 'kingofthehill':
            f.write(" KOTH")
        elif parsed_data['rules'].lower() == 'crazyhouse':
            f.write(" Crazyhouse")
        elif parsed_data['rules'].lower() == 'bughouse':
            f.write(" Bughouse")
        elif parsed_data['rules'].lower() == 'threecheck':
            f.write(" 3 Chiếu")
        else:
            f.write(" ")

        for player in parsed_data['players']:
            f.write(f"|{player}")

        f.write("\n")

    print(f"Data for {parsed_data['name']} written to {file_name}")


if __name__ == "__main__":
    try:
        url_file_path = 'urls.txt'
        urls = read_urls_from_txt(url_file_path)  # Read URLs from the file
        
        for url in urls:
            # Fetch the tournament data
            tournament_data = fetch_tournament_data(url)
            
            # Parse the relevant information
            parsed_data = parse_tournament_data(tournament_data)
            
            # Write the data into a markdown file
            write_tournament_data_to_file(parsed_data)

    except KeyboardInterrupt:
        print("Process interrupted.")
        sys.exit()
