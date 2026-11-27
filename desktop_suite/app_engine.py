"""Game-only desktop HTTP server. No hardware, clipboard or native command routes."""
from __future__ import annotations

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import platform
from pathlib import Path
from urllib.parse import urlsplit

TITLE = "Bobby's House of Hidden Doors"
GAME = "house-hidden-doors"
FILES = {
    "index.html": "text/html; charset=utf-8",
    "search.html": "text/html; charset=utf-8",
    "styles.css": "text/css; charset=utf-8",
    **{f"src/{name}.mjs": "text/javascript; charset=utf-8" for name in (
        "browserApp", "doorGraph", "gameReducer", "puzzleState", "saveState",
        "roomContent", "searchApp", "timedSearch",
    )},
}


def load_game(bundle_root: Path, meta: dict) -> dict[str, bytes]:
    if meta.get("title") != TITLE or meta.get("slug") != "bobbys-house-of-hidden-doors":
        raise ValueError("Wrong game metadata")
    root = bundle_root / "real_app"
    if root.is_symlink() or not root.is_dir():
        raise ValueError("Missing canonical entertainment bundle")
    files = {}
    for name in FILES:
        path = root / name
        if any(p.is_symlink() for p in (path, *path.parents) if p != root and p.is_relative_to(root)):
            raise ValueError(f"Unsafe game file: {name}")
        if not path.is_file() or not path.resolve().is_relative_to(root.resolve()):
            raise ValueError(f"Missing game file: {name}")
        content = path.read_bytes()
        if not content:
            raise ValueError(f"Empty game file: {name}")
        files[name] = content
    if b"<title>Bobby's House of Hidden Doors</title>" not in files["index.html"] or b"./src/browserApp.mjs" not in files["index.html"]:
        raise ValueError("Wrong campaign entry point")
    if b"./src/searchApp.mjs" not in files["search.html"]:
        raise ValueError("Wrong timed search entry point")
    return files


def create_server(port: int, bundle_root: Path, meta: dict):
    files = load_game(bundle_root, meta)

    class Handler(BaseHTTPRequestHandler):
        def _reply(self, status, content, mime):
            self.send_response(status)
            self.send_header("Content-Type", mime)
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none'; base-uri 'none'")
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(content)

        def _json(self, status, value):
            self._reply(status, json.dumps(value).encode("utf-8"), "application/json")

        def _serve(self):
            allowed = f"127.0.0.1:{self.server.server_port}"
            if self.headers.get("Host") != allowed:
                return self._json(403, {"error": "Invalid loopback host"})
            origin = self.headers.get("Origin")
            if origin and origin != f"http://{allowed}":
                return self._json(403, {"error": "Invalid origin"})
            target = urlsplit(self.path)
            if target.scheme or target.netloc:
                return self._json(400, {"error": "Invalid request target"})
            path = target.path
            if path == "/api/health":
                return self._json(200, {"ok": True, "app": TITLE, "game": GAME,
                                        "content_ready": True, "gameplay_verified": False})
            if path == "/api/platform":
                return self._json(200, {"os": {"Darwin": "macos", "Windows": "windows", "Linux": "linux"}.get(platform.system(), "unsupported")})
            name = "index.html" if path == "/" else path.removeprefix("/")
            if name not in files:
                return self._json(404, {"error": "Not a game resource"})
            return self._reply(200, files[name], FILES[name])

        do_GET = _serve
        do_HEAD = _serve

        def do_POST(self):
            self._json(405, {"error": "Game server is read-only"})

    return ThreadingHTTPServer(("127.0.0.1", port), Handler)


def start_server(port: int, bundle_root: Path, meta: dict):
    with create_server(port, bundle_root, meta) as server:
        server.serve_forever()
