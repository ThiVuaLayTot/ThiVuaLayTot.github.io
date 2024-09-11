import urllib.request
import orjson
import json
import os
import sys

def types():
    """Specify the types of information we want to extract from the tournament."""
    return [
        'type',          # Tournament type
        'rules',         # Rules of the tournament
        'total_rounds',  # Total number of rounds
        'time_control'   # Time control settings
    ]

def get_file_name():
    """Return the output file name where the data will be saved."""
    return './test.md'

def fetch_tournament_data():
    """Fetch tournament data from Chess.com API."""
    url = 'https://api.chess.com/pub/tournament/th-vua-ly-tt-thng-42024---king-of-the-hill-4689591'
    
    req = urllib.request.Request(url, method='GET')
    try:
        with urllib.request.urlopen(req) as response:
            return orjson.loads(response.read())
    except urllib.error.URLError as e:
        print(f"Error fetching tournament data: {e}")
        return {}

def parse_tournament_data(data):
    """Extract key information from the fetched tournament data."""
    players = [player.get('username', 'N/A') for player in data.get('players', [])]  # List of usernames
    """Extract key information from the fetched tournament data."""
    parsed_data = {
        'name': data.get('name', 'N/A'),
        'url': data.get('url', 'N/A'),
        'type': data.get('settings', {}).get('type', 'N/A'),
        'rules': data.get('settings', {}).get('rules', 'N/A'),
        'total_rounds': data.get('settings', {}).get('total_rounds', 'N/A'),
        'time_control': data.get('settings', {}).get('time_control', 'N/A'),
        'players': players
    }
    return parsed_data

def write_tournament_data_to_file(parsed_data):
    """Write the parsed tournament data into a Markdown file."""
    file_name = get_file_name()
    with open(file_name, 'w', encoding='utf-8') as f:
        f.write("# Tournament Information\n\n")
        f.write(f"**Name**: {parsed_data['name']}\n")
        f.write(f"**URL**: [Link to tournament]({parsed_data['url']})\n")
        f.write(f"**Type**: {parsed_data['type']}\n")
        f.write(f"**Rules**: {parsed_data['rules']}\n")
        f.write(f"**Total Rounds**: {parsed_data['total_rounds']} vòng|")
        f.write(f"**Time Control**: {parsed_data['time_control']}\n")

        for player in parsed_data['players']:
            f.write(f"- {player}")

    print(f"Data written to {file_name}")

if __name__ == "__main__":
    try:
        # Fetch the tournament data
        tournament_data = fetch_tournament_data()
        
        # Parse the relevant information
        parsed_data = parse_tournament_data(tournament_data)
        
        # Write the data into a markdown file
        write_tournament_data_to_file(parsed_data)

    except KeyboardInterrupt:
        print("Process interrupted.")
        sys.exit()
