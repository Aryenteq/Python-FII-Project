from server.src.controllers.cmdController import *

def handle_put(path, body=None):
    """Routes the request to the appropriate controller."""
    
    if path == '/rename':
        return handle_rename(body or {})
    if path == '/file-content':
        return handle_set_file_content(body or {})
    
    return 404, {"error": "Not found"}