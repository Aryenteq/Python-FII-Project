from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from server.src.routes.get_routes import handle_get
from server.src.routes.post_routes import handle_post
from server.src.routes.put_routes import handle_put
from server.src.routes.delete_routes import handle_delete


import json

class Server(BaseHTTPRequestHandler):
    """
    Server configuration (set headers, handle requests)
    """
    def _set_headers(self, status_code=200, content_type="application/json"):
        self.send_response(status_code)
        self.send_header("Content-Type", content_type)
        
        # CORS headers
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        parsed_url = urlparse(self.path)
        query_params = parse_qs(parsed_url.query)
        path = parsed_url.path

        # Route the request
        status_code, response = handle_get(path, query_params)
        self._set_headers(status_code)
        self.wfile.write(json.dumps(response).encode("utf-8"))
    
    def do_POST(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8")

        try:
            body = json.loads(post_data)
        except json.JSONDecodeError:
            body = {}

        # Route the request
        status_code, response = handle_post(path, body)
        self._set_headers(status_code)
        self.wfile.write(json.dumps(response).encode("utf-8"))
        
    def do_PUT(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8")

        try:
            body = json.loads(post_data)
        except json.JSONDecodeError:
            body = {}

        # Route the request
        status_code, response = handle_put(path, body)
        self._set_headers(status_code)
        self.wfile.write(json.dumps(response).encode("utf-8"))
        
    def do_DELETE(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        # Extract query parameters (if any)
        query_params = parse_qs(parsed_url.query)

        # Route the DELETE request
        status_code, response = handle_delete(path, query_params)
        self._set_headers(status_code)
        self.wfile.write(json.dumps(response).encode("utf-8"))