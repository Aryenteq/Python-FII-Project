from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from src.routes.cmdRoutes import route_request

class Server(BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200, content_type="application/json"):
        """Set standard headers, including CORS."""
        self.send_response(status_code)
        self.send_header("Content-Type", content_type)
        
        # CORS headers
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self._set_headers()

    def do_GET(self):
        parsed_url = urlparse(self.path)
        query_params = parse_qs(parsed_url.query)
        path = parsed_url.path

        # Route the request
        status_code, response = route_request(path, "GET", query_params)
        self._set_headers(status_code)
        self.wfile.write(response.encode("utf-8"))

if __name__ == "__main__":
    server_address = ("127.0.0.1", 8000)
    httpd = HTTPServer(server_address, Server)
    print("Starting server on http://127.0.0.1:8000")
    httpd.serve_forever()