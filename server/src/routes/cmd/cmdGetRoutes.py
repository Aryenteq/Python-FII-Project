from server.src.controllers.cmdController import handle_get_tree

def handle_get(path, query_params=None):
    """Routes the request to the appropriate controller."""
    
    if path == "/tree":
        return 200, handle_get_tree(query_params or {})