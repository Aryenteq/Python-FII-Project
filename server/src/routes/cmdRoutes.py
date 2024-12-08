from src.controllers.cmdController import handle_get_tree

def route_request(path, method, query_params=None):
    """Routes the request to the appropriate controller."""
    
    if path == "/tree" and method == "GET":
        return 200, handle_get_tree(query_params or {})
    return 404, '{"error": "Not Found"}'