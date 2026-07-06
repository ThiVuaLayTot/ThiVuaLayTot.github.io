import os
import re

def stitch(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # Simple Jekyll parser
    if content.startswith('---'):
        _, front_matter, body = content.split('---', 2)
    else:
        body = content

    # Get includes
    def replace_include(match):
        inc_file = match.group(1).strip()
        path = os.path.join('_includes', inc_file)
        if os.path.exists(path):
            with open(path, 'r') as f:
                return f.read()
        return f"<!-- INCLUDE {inc_file} NOT FOUND -->"

    # Minimal template stitching
    template = """
    <!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="/css/variables.css">
        <link rel="stylesheet" href="/css/main.css">
        <link rel="stylesheet" href="/css/home.css">
        <link rel="stylesheet" href="/css/eventwinner.css">
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    </head>
    <body class="dark-glass">
        <div id="section-page">
            <div class="container">
                {body}
            </div>
        </div>
    </body>
    </html>
    """

    full_html = template.format(body=body)
    full_html = re.sub(r'\{%\s*include\s+(.*?)\s*%\}', replace_include, full_html)

    # Fix paths for local viewing
    full_html = full_html.replace('href="/', 'href="')
    full_html = full_html.replace('src="/', 'src="')

    with open(filename.replace('.md', '.html').split('/')[-1], 'w') as f:
        f.write(full_html)

stitch('events/tournaments/cttq.md')
stitch('events/tournaments/tvlt.md')
