from server.src.controllers.cmd_controller import *

def handle_delete(path, query_params=None):
    """Routes the request to the appropriate controller."""
    
    if path == "/tree":
        return delete_items_controller(query_params or {})
    
    return 404, {"error": "Not found"}