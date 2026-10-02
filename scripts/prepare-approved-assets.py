"""Prepare local cover art only for explicitly approved catalog entries."""
import hashlib
import io
import json
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
load = lambda name: json.loads((ROOT / 'src/data' / name).read_text())
projects = {p['slug']: p for p in load('catalog.json')}
approved = {a['repository'] for a in load('approvals.json')}


def image(source, repository):
    url = source['url']
    parsed = urlparse(url)
    if parsed.scheme != 'https' or parsed.netloc != 'raw.githubusercontent.com' or not parsed.path.startswith('/' + repository + '/'):
        raise ValueError('Source is not in the approved repository')
    with urlopen(Request(url, headers={'User-Agent': 'Aboden-cover-preparer'}), timeout=30) as response:
        data = response.read(12_000_001)
    if len(data) > 12_000_000:
        raise ValueError('Original artwork exceeds the size limit')
    # Accept a reviewed SHA-256 or the exact Git blob returned by the source repository.
    if not source.get('sha256') and not source.get('gitBlobSha'):
        raise ValueError('Original artwork requires a reviewed content hash')
    if source.get('sha256') and hashlib.sha256(data).hexdigest() != source['sha256']:
        raise ValueError('Original artwork changed; review it before publication')
    if source.get('gitBlobSha'):
        header = f'blob {len(data)}\0'.encode('ascii')
        if hashlib.sha1(header + data).hexdigest() != source['gitBlobSha']:
            raise ValueError('Original Git image blob changed; review it before publication')
    with Image.open(io.BytesIO(data)) as original:
        return ImageOps.exif_transpose(original).convert('RGB')


for record in load('cover-sources.json'):
    project = projects.get(record['slug'])
    if not project or project['repository'] != record['repository'] or record['repository'] not in approved:
        raise ValueError('Artwork requires exact project approval')
    output = (ROOT / 'public' / project['cover']).resolve()
    allowed = (ROOT / 'public/assets/projects').resolve()
    if output.parent != allowed or (output.suffix != '.webp' and not (record['kind'] == 'owner-uploaded-poster' and output.suffix == '.jpeg')):
        raise ValueError('Invalid cover output path')
    if record['kind'] == 'owner-uploaded-poster':
        if not output.exists() or not record.get('sha256') or not record.get('approvalInstruction'):
            raise ValueError('The explicitly approved poster must be committed locally')
        if hashlib.sha256(output.read_bytes()).hexdigest() != record['sha256']:
            raise ValueError('Owner-approved poster bytes changed')
    if output.exists():
        with Image.open(output) as existing:
            existing.verify()
        continue
    if record['kind'] == 'interface-capture':
        raise ValueError('The reviewed original interface capture must already be committed')
    tiles = [image(source, record['repository']) for source in record['sources']]
    if record['kind'] == 'tiles':
        if len(tiles) != 8 or len({tile.size for tile in tiles}) != 1:
            raise ValueError('Expected the original equal-sized 2 x 4 poster tiles')
        width, height = tiles[0].size
        artwork = Image.new('RGB', (width * 2, height * 4))
        for index, tile in enumerate(tiles):
            artwork.paste(tile, ((index % 2) * width, (index // 2) * height))
    elif record['kind'] == 'image' and len(tiles) == 1:
        artwork = tiles[0]
    else:
        raise ValueError('Unsupported artwork record')
    artwork.thumbnail((1000, 800), Image.Resampling.LANCZOS)
    output.parent.mkdir(parents=True, exist_ok=True)
    artwork.save(output, 'WEBP', quality=78, method=6)
    print(f'Prepared approved artwork: {project["slug"]}')
