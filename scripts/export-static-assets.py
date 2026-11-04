#!/usr/bin/env python3
"""Copy pointer-backed media into a static site's exact referenced URLs.

This is a deployment-only export: source pointers remain authoritative and no
downloaded binaries are committed. GitHub Pages cannot serve Lovable's proxy.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import time
from urllib.parse import quote, unquote, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent


def asset_destination(output: Path, asset: dict) -> Path:
    url = urlsplit(asset["url"])
    path = unquote(url.path)
    if (url.scheme or url.netloc or url.query or url.fragment
            or not path.startswith("/__l5e/assets-v1/")
            or any(part in {".", ".."} for part in path.split("/"))):
        raise ValueError(f"Invalid static asset path: {asset['url']}")
    destination = (output / path.lstrip("/")).resolve()
    if not destination.is_relative_to(output.resolve()):
        raise ValueError("Asset path escapes the static output")
    return destination


def export_asset(output: Path, origin: str, asset: dict) -> Path:
    destination = asset_destination(output, asset)
    last_error = None
    for attempt in range(3):
        try:
            # The asset service blocks the default urllib user agent.
            request = Request(origin.rstrip("/") + quote(asset["url"], safe="/%"), headers={"User-Agent": "Mozilla/5.0 (Static media export)"})
            with urlopen(request, timeout=60) as response:
                data = response.read()
                content_type = response.headers.get_content_type()
            if len(data) != asset["size"] or content_type != asset["content_type"]:
                raise ValueError(f"Unexpected asset response for {asset['original_filename']}: {content_type}, {len(data)} bytes")
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(data)
            return destination
        except Exception as error:
            last_error = error
            if attempt < 2:
                time.sleep(attempt + 1)
    raise RuntimeError(f"Could not export {asset['original_filename']}: {last_error}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--origin", required=True, help="Public Lovable origin serving the original media")
    args = parser.parse_args()
    origin = urlsplit(args.origin)
    if origin.scheme not in {"http", "https"} or not origin.netloc or origin.path not in {"", "/"}:
        parser.error("origin must be an HTTP(S) origin, without a path")
    assets = {}
    for pointer in sorted((ROOT / "src/assets").rglob("*.asset.json")):
        asset = json.loads(pointer.read_text())
        asset_destination(args.output, asset)
        assets[asset["url"]] = asset
    if not assets:
        raise RuntimeError("No source asset pointers found; refusing an empty export")
    with ThreadPoolExecutor(max_workers=6) as pool:
        exported = list(pool.map(lambda asset: export_asset(args.output, args.origin, asset), assets.values()))
    print(f"Exported {len(exported)} original media files into {args.output}")


if __name__ == "__main__":
    main()