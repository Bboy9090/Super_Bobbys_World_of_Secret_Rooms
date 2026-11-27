"""Builds standalone Windows .exe with embedded multi-res icon, splash assets, and full WebView2/Python.NET DLLs."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

SUITE_DIR = Path(__file__).resolve().parent
REPO_DIR = SUITE_DIR.parent
DIST_DIR = REPO_DIR / "dist_windows"
WORK_DIR = SUITE_DIR / ".pyi_work"
SPEC_DIR = SUITE_DIR / ".pyi_spec"


def verify_real_gui_window(exe_file: Path, expected_title_substr: str) -> dict:
    """Inspect only the launched process and its descendants; never another session."""
    import psutil

    if not expected_title_substr:
        raise ValueError("Expected window title required")
    proc = subprocess.Popen([str(exe_file)])
    owned = {}
    found = {"opened": False, "status": "FAILED", "title": None, "hwnd": None}
    try:
        root = psutil.Process(proc.pid)
        owned[root.pid] = root
        deadline = time.monotonic() + 14
        while time.monotonic() < deadline:
            try:
                for child in root.children(recursive=True):
                    owned[child.pid] = child
            except psutil.NoSuchProcess:
                break
            ids = [str(p.pid) for p in owned.values() if p.is_running()]
            if not ids:
                break
            query = "Get-Process -Id " + ",".join(ids) + " -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object Id,MainWindowHandle,MainWindowTitle | ConvertTo-Json -Compress"
            ps = subprocess.run(["powershell", "-NoProfile", "-Command", query], capture_output=True, text=True, timeout=6)
            if ps.returncode == 0 and ps.stdout.strip():
                parsed = json.loads(ps.stdout)
                for info in parsed if isinstance(parsed, list) else [parsed]:
                    title = str(info.get("MainWindowTitle") or "")
                    hwnd = int(info.get("MainWindowHandle") or 0)
                    pid = int(info.get("Id") or 0)
                    if pid in owned and owned[pid].is_running() and hwnd > 0 and expected_title_substr in title:
                        found = {"opened": True, "status": "PASSED", "title": title, "hwnd": hwnd, "pid": pid}
                        break
            if found["opened"] or proc.poll() is not None:
                break
            time.sleep(0.5)
    finally:
        for p in reversed(list(owned.values())):
            try:
                p.terminate()
            except psutil.NoSuchProcess:
                continue
        if proc.poll() is None:
            proc.terminate()
        proc.wait(timeout=10)
    return found


def build() -> Path:
    meta = json.loads((SUITE_DIR / "app_meta.json").read_text(encoding="utf-8"))
    exe_name = meta["exe_name"]
    ico_path = REPO_DIR / "assets" / "windows" / "app.ico"
    win_assets = REPO_DIR / "assets" / "windows"

    DIST_DIR.mkdir(parents=True, exist_ok=True)
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    SPEC_DIR.mkdir(parents=True, exist_ok=True)

    # A locked output fails the build; do not terminate existing user sessions.

    cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--noconfirm",
        "--clean",
        "--onefile",
        "--windowed",
        f"--name={exe_name}",
        f"--icon={ico_path}",
        f"--distpath={DIST_DIR}",
        f"--workpath={WORK_DIR}",
        f"--specpath={SPEC_DIR}",
        f"--paths={SUITE_DIR}",
        f"--add-data={SUITE_DIR / 'app_meta.json'};.",
        f"--add-data={win_assets};assets",
        "--hidden-import=app_engine",
        "--hidden-import=platform_exclusive",
        "--hidden-import=flask",
        "--hidden-import=werkzeug",
        "--hidden-import=jinja2",
        "--hidden-import=psutil",
        "--hidden-import=webview",
        "--hidden-import=webview.platforms.edgechromium",
        "--hidden-import=webview.platforms.winforms",
        "--hidden-import=clr",
        "--hidden-import=pythonnet",
        "--collect-all=webview",
        "--collect-all=pythonnet",
        "--collect-all=clr_loader",
    ]

    for extra in meta.get("extra_datas", []):
        src, dst = extra["src"], extra["dst"]
        src_path = REPO_DIR / src
        if not src_path.is_dir():
            raise FileNotFoundError(f"Missing required game bundle: {src_path}")
        cmd.append(f"--add-data={src_path};{dst}")

    cmd.append(str(SUITE_DIR / "launcher.py"))
    print(f"=== Compiling {exe_name}.exe ===")
    subprocess.run(cmd, check=True)

    exe_file = DIST_DIR / f"{exe_name}.exe"
    if not exe_file.exists():
        raise FileNotFoundError(f"Expected built exe not found: {exe_file}")

    # Candidate remains in dist_windows; never replace installed/shared copies.

    shutil.rmtree(WORK_DIR, ignore_errors=True)
    shutil.rmtree(SPEC_DIR, ignore_errors=True)

    # 1. Headless self-test verification
    test_out = DIST_DIR / f"{exe_name}_selftest.json"
    test_out.unlink(missing_ok=True)
    res = subprocess.run([str(exe_file), "--self-test", "--self-test-out", str(test_out)], timeout=30)
    if res.returncode != 0 or not test_out.exists():
        raise RuntimeError(f"Self-test FAILED for {exe_name}.exe (rc={res.returncode})")
    data = json.loads(test_out.read_text(encoding="utf-8"))
    if not data.get("ok"):
        raise RuntimeError(f"Self-test reported ok=False for {exe_name}.exe: {data}")

    # 2. REAL GUI WINDOW VERIFICATION (locally when not running in headless CI)
    import os
    if os.environ.get("CI", "").lower() == "true":
        gui = {"opened": False, "status": "NOT_RUN", "reason": "CI headless", "title": None, "hwnd": None}
        data["gui_window_verified"] = gui
        test_out.write_text(json.dumps(data, indent=2), encoding="utf-8")
        print(f"[HEADLESS CONTENT CHECK ONLY] {exe_file.name} ({exe_file.stat().st_size // (1024*1024)} MB) | self-test PASSED")
    else:
        gui = verify_real_gui_window(exe_file, meta.get("title", ""))
        data["gui_window_verified"] = gui
        test_out.write_text(json.dumps(data, indent=2), encoding="utf-8")
        if not gui["opened"]:
            raise RuntimeError("Expected window not observed for launched candidate")
        print(f"[WINDOW OBSERVED] {exe_file.name} | Gameplay verification remains separate")
    return exe_file


if __name__ == "__main__":
    build()
