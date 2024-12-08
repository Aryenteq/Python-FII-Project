from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from importlib import import_module, reload
import threading
import time
import os
import sys

class ChangeHandler(FileSystemEventHandler):
    """Restart the server on file changes."""
    def __init__(self, restart_callback):
        self.restart_callback = restart_callback
        self._debounce_time = 1  # seconds
        self._last_event_time = 0

    def on_any_event(self, event):
        if event.is_directory:
            return
        
        # Ignore changes in `__pycache__`
        if "__pycache__" in event.src_path or event.src_path.endswith(".pyc"):
            return
        if event.event_type in ("modified", "created", "deleted"):
            current_time = time.time()
            if current_time - self._last_event_time > self._debounce_time:
                self._last_event_time = current_time
                print(f"Change detected in: {event.src_path}")
                self.restart_callback()

class ServerManager:
    def __init__(self):
        self.httpd = None
        self.server_thread = None

    def start_server(self):
        """Start the HTTP server in a separate thread."""
        if self.server_thread and self.server_thread.is_alive():
            self.stop_server()

        def run():
            global app
            try:
                # Forcefully clear cache and reload modules!
                modules_to_clear = [
                    "app",
                    "src.routes.cmdRoutes",
                    "src.controllers.cmdController",
                    "src.services.cmdService",
                ]
                for module_name in modules_to_clear:
                    if module_name in sys.modules:
                        del sys.modules[module_name]

                # re-import the modules manually
                app = import_module("app")
                cmdRoutes = import_module("src.routes.cmdRoutes")
                cmdController = import_module("src.controllers.cmdController")
                cmdService = import_module("src.services.cmdService")

                print("Starting server on http://127.0.0.1:8000")
                self.httpd = app.HTTPServer(("127.0.0.1", 8000), app.Server)
                self.httpd.serve_forever()
            except Exception as e:
                print(f"Error while starting server: {e}")

        self.server_thread = threading.Thread(target=run, daemon=True)
        self.server_thread.start()

    def stop_server(self):
        """Stop the HTTP server."""
        if self.httpd:
            print("Stopping server...")
            self.httpd.shutdown()
            self.httpd.server_close()
            self.httpd = None

def main():
    manager = ServerManager()

    def restart():
        print("Restarting server...")
        manager.stop_server()
        time.sleep(0.5)  # Give a short pause to avoid conflicts
        manager.start_server()

    # Start the server initially
    restart()

    # HMR
    observer = Observer()
    handler = ChangeHandler(restart_callback=restart)
    observer.schedule(handler, path=".", recursive=True)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        observer.stop()
        observer.join()
        manager.stop_server()

if __name__ == "__main__":
    main()