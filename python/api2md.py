from chessdotcom import Client, get_player_profile, get_tournament_details, get_tournament_round
from datetime import datetime
import os, sys, requests

EVENTS = ['tvlt', 'cbtt', 'dttv']
SPECIAL_PLAYERS = {
    'm_dinhhoangviet': '@*M-DinhHoangViet',
    'tungjohn_playing_chess': '@*M-DinhHoangViet',
    'thangthukquantrong': '@*thangthukquantrong'
}

sys.stdout.reconfigure(encoding='utf-8') # type: ignore
Client.request_config["headers"]["User-Agent"] = "ThiVuaLayTotBot/1.0 (contact: your_email@example.com)"

def get_ids(url: str):
    try:
        resp = requests.get(url)
        resp.raise_for_status()
        return [line.strip() for line in resp.text.splitlines() if line.strip()]
    except Exception as e:
        print(f"[get_ids] Error: {e}")
        return []

def fetch_tournament_data(tour_id: str):
    try:
        return get_tournament_details(tour_id).json
    except Exception as e:
        print(f"[fetch_tournament_data] {tour_id}: {e}")
        return {}

def fetch_round_data(tour_id: str, round_num: int):
    try:
        return get_tournament_round(tour_id, round_num).json
    except Exception as e:
        print(f"[fetch_round_data] {tour_id} round {round_num}: {e}")
        return {}

def fetch_player_data(username: str):
    try:
        return get_player_profile(username).json
    except Exception as e:
        print(f"[fetch_player_data] {username}: {e}")
        return {}

def sort_player(players_order, round_data):
    points_map = {p.get("username"): p.get("points", 0) for p in round_data.get("players", [])}
    players, points = [], []
    for username in players_order[:7]:
        players.append(username)
        points.append(points_map.get(username, 0))
    return players, points

def parse_player_data(data: dict):
    return {
        "username": data.get("username", "unknown"),
        "status": data.get("status", "N/A"),
        "avatar": data.get("avatar", "N/A"),
        "followers": data.get("followers", 0)
    }

def parse_tournament_data(data: dict, tour_id: str):
    if not data: 
        return {}

    if "tournament" in data:
        data = data["tournament"]

    rounds = int(data.get("settings", {}).get("total_rounds", 0))
    round_info = fetch_round_data(tour_id, rounds) if rounds else {}

    players_order = [p.get("username") for p in data.get("players", []) if isinstance(p, dict)]
    players, points = sort_player(players_order, round_info) if round_info else ([], [])

    tc_raw = data.get("settings", {}).get("time_control", "0")
    try:
        base, inc = (tc_raw.split("+") + ["0"])[:2]
        time_control = f"{int(base)//60}+{int(inc)}"
    except Exception:
        time_control = tc_raw

    try:
        start_time = datetime.utcfromtimestamp(int(data.get("start_time", 0))).strftime("%d-%m-%Y")
    except Exception:
        start_time = "N/A"

    return {
        "name": data.get("name", "N/A"),
        "url": data.get("url", "N/A"),
        "variant": data.get("settings", {}).get("rules", "N/A"),
        "start_time": start_time,
        "total_rounds": rounds,
        "time_class": data.get("settings", {}).get("time_class", "N/A"),
        "time_control": time_control,
        "players_count": data.get("settings", {}).get("registered_user_count", "N/A"),
        "players": players,
        "points": points
    }

def write_player(parse_data, pts):
    u, st, av, fl = parse_data["username"], parse_data["status"], parse_data["avatar"], parse_data["followers"]

    if st == "closed:abuse": return f"|@#{u} {pts}"
    if st == "closed:fair_play_violations": return f"|@!{u} {pts}"
    if st == "closed": return f"|@/{u} {pts}"
    if st == "premium": return f"|@&{u} {fl} {av} {pts}"

    return f"|@{u} {pts}" if not (fl or av) else f"|@{u} {fl} {av} {pts}"

def write_tournament(parsed, md_filename):
    if not parsed: return

    name, rule, time_class = parsed['name'].replace('||', '-').replace('|', '-'), parsed["variant"].lower(), parsed["time_class"].lower()
    new_line = f'<a href="{parsed["url"]}" target="_top">{name}</a>|{parsed["start_time"]}|{parsed["time_control"]} '

    new_line += "Bullet" if time_class == "bullet" else "Blitz" if time_class == "blitz" else "Rapid"

    rule_map = {"chess960": " Chess960,", "kingofthehill": " KOTH,", "crazyhouse": " Crazyhouse,", 
                "bughouse": " Bughouse,", "threecheck": " 3 Chiếu, "}
    new_line += rule_map.get(rule, ",")

    new_line += " Arena" if parsed["total_rounds"] == 1 else f' Swiss {parsed["total_rounds"]} vòng'
    new_line += f'|{parsed["players_count"]}'

    player_cache = {}
    for username, pts in zip(parsed["players"], parsed["points"]):
        if username in SPECIAL_PLAYERS:
            new_line += f'|{SPECIAL_PLAYERS[username]}'
        else:
            if username not in player_cache:
                raw = fetch_player_data(username)
                pdata = parse_player_data(raw if isinstance(raw, dict) else {})
                player_cache[username] = pdata
            new_line += write_player(player_cache[username], pts)

    with open(md_filename, "a", encoding="utf-8") as f:
        f.write(new_line + "\n")
    print(f"[write_tournament] {parsed['name']} -> {md_filename}")


if __name__ == "__main__":
    try:
        for ev in EVENTS:
            file_url = f'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw/{ev}.txt'
            ids = get_ids(file_url)
            md_filename = f"events/tournaments/{ev}.md"
            os.makedirs(os.path.dirname(md_filename), exist_ok=True)
            if os.path.exists(md_filename): os.remove(md_filename)

            for tid in ids:
                parsed = parse_tournament_data(fetch_tournament_data(tid), tid)
                write_tournament(parsed, md_filename)
    except KeyboardInterrupt:
        print("Process interrupted.")
        sys.exit()
