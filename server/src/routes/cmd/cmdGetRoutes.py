from server.src.controllers.cmdController import *

def handle_get(path, query_params=None):
    """Routes the request to the appropriate controller."""
    
    if path == "/tree":
        return handle_get_tree(query_params or {})
    if path == '/file-content':
        return handle_get_file_content(query_params or {})
    
    return 404, {"error": "Not found"}