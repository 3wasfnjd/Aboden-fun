"""HTTP smoke test of the freshly deployed approved directory, not gameplay."""
import json
import os
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import urlopen

BASE = 'https://3wasfnjd.github.io/Aboden-fun/'
revision = os.environ['GITHUB_SHA']
projects = json.loads(Path('src/data/catalog.json').read_text())


def get(path):
    with urlopen(BASE + path + '?revision=' + revision, timeout=30) as response:
        assert response.status == 200, path
        data = response.read()
    assert data, path
    return data


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = set()
        self.cards = 0
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a': self.links.add(attrs.get('href'))
        if 'data-project' in attrs: self.cards += 1


assert json.loads(get('build-info.json'))['source'] == revision
home = get('').decode()
parser = Links()
parser.feed(home)
assert parser.cards == len(projects) == 9
for project in projects:
    assert project['liveUrl'] in parser.links, project['slug']
    detail = get('projects/' + project['slug'] + '/').decode()
    assert project['liveUrl'] in detail and project['title'] in detail
    cover = get(project['cover'])
    assert cover[:4] == b'RIFF' and cover[8:12] == b'WEBP', project['slug']
    print('VERIFIED approved project:', project['repository'])
for path in ['assets/catalog.css', 'assets/credits/motri.txt', 'assets/credits/hajwala.txt', 'licenses/']:
    get(path)
print('VERIFIED nine approved project cards, routes, launch links and original images.')
