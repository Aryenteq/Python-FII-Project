from server.src.controllers.cmd_controller import *

def handle_post(path, body=None):
    """Routes the request to the appropriate controller."""
    
    if path == "/copy":
        return handle_copy(body or {})
    if path == "/move":
        return handle_move(body or {})
    if path == '/create':
        return handle_create(body or {})
    
    return 404, {"error": "Not found"}