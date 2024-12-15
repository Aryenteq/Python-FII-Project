from server.src.controllers.cmdController import *

def handle_put(path, body=None):
    """Routes the request to the appropriate controller."""
    
    if path == '/rename':
        return handle_rename(body or {})
    
    return 404, {"error": "Not found"}