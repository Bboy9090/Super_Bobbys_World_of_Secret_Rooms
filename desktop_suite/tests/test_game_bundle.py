"""Real loopback HTTP integration tests against the actual entertainment export."""
import http.client
import json
from pathlib import Path
import shutil
import sys
import tempfile
import threading
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "desktop_suite"))
import app_engine

class GameBundleTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.meta = json.loads((ROOT / "desktop_suite/app_meta.json").read_text())
        shutil.copytree(ROOT / "exports/house-hidden-doors-bootstrap", self.root / "real_app")
        self.server = None

    def launch(self):
        self.server = app_engine.create_server(0, self.root, self.meta)
        thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        thread.start()
        def stop():
            self.server.shutdown()
            self.server.server_close()
            thread.join(timeout=2)
        self.addCleanup(stop)

    def request(self, path, method="GET", headers=None):
        conn = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=3)
        try:
            conn.request(method, path, headers=headers or {})
            r = conn.getresponse()
            return r.status, r.getheader("Content-Type"), r.read()
        finally:
            conn.close()

    def test_exact_game_mapping(self):
        self.assertEqual(self.meta["extra_datas"], [{"src": "exports/house-hidden-doors-bootstrap", "dst": "real_app"}])

    def test_serves_actual_campaign_and_search(self):
        self.launch()
        for route, file in [("/", "index.html"), ("/search.html", "search.html")]:
            status, mime, body = self.request(route)
            self.assertEqual(status, 200)
            self.assertIn("text/html", mime)
            self.assertEqual(body, (self.root / "real_app" / file).read_bytes())

    def test_every_required_module_served_with_correct_mime(self):
        self.launch()
        for name, mime in app_engine.FILES.items():
            with self.subTest(name=name):
                status, actual, body = self.request("/" + name)
                self.assertEqual((status, actual), (200, mime))
                self.assertEqual(body, (self.root / "real_app" / name).read_bytes())

    def test_old_hardware_and_clipboard_routes_not_exposed(self):
        self.launch()
        for route in ("/api/usb", "/api/disks", "/api/clipboard", "/api/scan-file", "/package.json", "/tests/core.test.mjs", "/missing.mjs", "/../app_meta.json", "/%2e%2e/app_meta.json"):
            with self.subTest(route=route):
                self.assertEqual(self.request(route)[0], 404)
        self.assertEqual(self.request("/api/usb", "POST")[0], 405)

    def test_health_is_content_only_not_gameplay_claim(self):
        self.launch()
        status, _, body = self.request("/api/health")
        health = json.loads(body)
        self.assertEqual(status, 200)
        self.assertTrue(health["content_ready"])
        self.assertFalse(health["gameplay_verified"])
        self.assertEqual(health["game"], "house-hidden-doors")

    def test_host_and_origin_rejected(self):
        self.launch()
        self.assertEqual(self.request("/", headers={"Host": "unrelated.invalid"})[0], 403)
        self.assertEqual(self.request("/", headers={"Origin": "https://unrelated.invalid"})[0], 403)

    def test_missing_game_does_not_fall_back(self):
        shutil.rmtree(self.root / "real_app")
        (self.root / "ui").mkdir()
        (self.root / "ui/index.html").write_text("legacy")
        with self.assertRaisesRegex(ValueError, "Missing canonical"):
            app_engine.create_server(0, self.root, self.meta)

    def test_missing_module_rejected(self):
        (self.root / "real_app/src/timedSearch.mjs").unlink()
        with self.assertRaisesRegex(ValueError, "Missing game file"):
            app_engine.create_server(0, self.root, self.meta)

    def test_unrelated_entrypoint_rejected(self):
        (self.root / "real_app/index.html").write_text("<title>Warp Zones</title>")
        with self.assertRaisesRegex(ValueError, "Wrong campaign"):
            app_engine.create_server(0, self.root, self.meta)

    def test_wrong_product_rejected(self):
        self.meta["title"] = "Warp Zones"
        with self.assertRaisesRegex(ValueError, "Wrong game metadata"):
            app_engine.create_server(0, self.root, self.meta)

if __name__ == "__main__":
    unittest.main()
