from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from importlib import import_module, reload
import threading
import time
import os
import sys
import shutil

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

class ChangeHandler(FileSystemEventHandler):
    """
    Detects changes to a file and calls a restart_callback
    Ignores changes to pycache and has a cooldown of 1 second between refreshes
    """
    def __init__(self, restart_callback):
        self.restart_callback = restart_callback
        self._debounce_time = 1  # seconds
        self._last_event_time = 0

    def on_any_event(self, event):
        if event.is_directory:
            return

        if "__pycache__" in event.src_path or event.src_path.endswith(".pyc"):
            return

        if event.event_type in ("modified", "created", "deleted"):
            current_time = time.time()
            if current_time - self._last_event_time > self._debounce_time:
                self._last_event_time = current_time
                print(f"Change detected in: {event.src_path}")
                self.restart_callback()


def clear_and_reload_modules(base_path, prefix="server"):
    """
    Deletes app, all __pycache__ folders, modules from current directory and refreshes
    """
    global app  # Explicitly clear global app reference
    app = None

    base_path = os.path.abspath(base_path)

    # Invalidate caching
    for root, dirs, files in os.walk(base_path):
        for dir_name in dirs:
            if dir_name == "__pycache__":
                pycache_path = os.path.join(root, dir_name)
                # print(f"Deleting __pycache__: {pycache_path}")
                shutil.rmtree(pycache_path, ignore_errors=True)
                
    # Reload modules from current directory (removing __pycache__ is not enough)
    modules_to_clear = [
        module_name
        for module_name, module in sys.modules.items()
        if getattr(module, "__file__", None)
        and module.__file__.startswith(base_path)
        and (module_name.startswith(prefix) or module_name == "app")
    ]

    # print(f"Modules to clear: {modules_to_clear}")

    for module_name in modules_to_clear:
        del sys.modules[module_name]

    # Reload all modules
    for module_name in sorted(modules_to_clear):
        try:
            # print(f"Reloading module: {module_name}")
            module = import_module(module_name)
            reload(module)
        except Exception as e:
            print(f"Error reloading module {module_name}: {e}")


class ServerManager:
    """
    Init / start (in a separate thread) / stop the HTTP server from app.py
    """
    def __init__(self):
        self.httpd = None
        self.server_thread = None

    def start_server(self):
        if self.server_thread and self.server_thread.is_alive():
            self.stop_server()

        def run():
            global app
            try:
                base_path = os.path.abspath(os.path.dirname(__file__))

                clear_and_reload_modules(base_path)

                app = import_module("app")
                reload(app)

                print("Starting server on http://127.0.0.1:8000")
                self.httpd = app.HTTPServer(("127.0.0.1", 8000), app.Server)
                self.httpd.serve_forever()
            except Exception as e:
                print(f"Error while starting server: {e}")

        self.server_thread = threading.Thread(target=run, daemon=True)
        self.server_thread.start()

    def stop_server(self):
        if self.httpd:
            print("Stopping server...")
            self.httpd.shutdown()
            self.httpd.server_close()
            self.httpd = None


def main():
    """
    On first run, restart the server (even tho it is closed the first time)
    Restart everyt time a change is made to a file
    """
    manager = ServerManager()

    def restart():
        print("Restarting server...")
        manager.stop_server()
        time.sleep(0.5) # Time to close and release all used resources
        manager.start_server()

    restart()

    # File watcher for HMR
    observer = Observer()
    handler = ChangeHandler(restart_callback=restart)
    observer.schedule(handler, path=".", recursive=True)
    observer.start()

    try:
        while True:
            time.sleep(1) # Check for changes 1 time per second
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        observer.stop()
        observer.join()
        manager.stop_server()

if __name__ == "__main__":
    main()