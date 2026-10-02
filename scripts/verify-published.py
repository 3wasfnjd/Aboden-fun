"""HTTP smoke test of the freshly deployed approved directory, not gameplay."""
import json
import os
import hashlib
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError
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


def removed(path):
    try:
        with urlopen(BASE + path + '?revision=' + revision, timeout=30) as response:
            raise AssertionError('Removed resource still publicly available: ' + path)
    except HTTPError as error:
        assert error.code == 404, (path, error.code)
    print('VERIFIED removed resource:', path)


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
assert parser.cards == len(projects) == 8
assert 'ar-shooter' not in home.lower() and 'الرماية بالواقع المعزز' not in home
for project in projects:
    assert project['liveUrl'] in parser.links, project['slug']
    detail = get('projects/' + project['slug'] + '/').decode()
    assert project['liveUrl'] in detail and project['title'] in detail
    cover = get(project['cover'])
    assert cover[:4] == b'RIFF' and cover[8:12] == b'WEBP', project['slug']
    if project['slug'] == 'hajwala':
        assert project['cover'] == 'assets/projects/hajwala-shas.webp'
        assert project['cover'] in home and project['cover'] in detail
        assert hashlib.sha256(cover).digest() == hashlib.sha256(Path('public', project['cover']).read_bytes()).digest()
    print('VERIFIED approved project:', project['repository'])
for path in ['assets/catalog.css', 'assets/credits/motri.txt', 'assets/credits/hajwala.txt', 'licenses/']:
    data = get(path)
    if path == 'licenses/':
        assert 'ar-shooter' not in data.decode().lower()
        assert 'الرماية بالواقع المعزز' not in data.decode()
for path in ['projects/ar-shooter/', 'projects/ar-shooter/index.html', 'assets/projects/ar-shooter.webp']:
    removed(path)
print('VERIFIED eight approved projects, removed AR-Shooter page and original Hajwala menu cover.')
