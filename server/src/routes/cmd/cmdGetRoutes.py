import json
from server.src.controllers.cmdController import handle_get_tree

def handle_get(path, query_params=None):
    """Routes the request to the appropriate controller."""
    
    if path == "/tree":
        return handle_get_tree(query_params or {})
    
    return 404, json.dumps({"error": "Not found"})