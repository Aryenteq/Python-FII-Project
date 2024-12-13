import json
from server.src.controllers.cmdController import handle_copy, handle_move

def handle_post(path, body=None):
    """Routes the request to the appropriate controller."""
    
    if path == "/copy":
        return handle_copy(body or {})
    if path == "/move":
        return handle_move(body or {})
    
    return 404, json.dumps({"error": "Not found"})