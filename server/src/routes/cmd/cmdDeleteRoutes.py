from server.src.controllers.cmdController import handle_delete

def handle_post(path, query_params=None):
    """Routes the request to the appropriate controller."""
    
    if path == "/tree":
        return handle_delete(query_params or {})
    
    return 404, '{"error": "Not Found"}'