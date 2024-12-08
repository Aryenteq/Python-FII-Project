from server.src.services.cmdService import get_root_structure, list_directory_contents
import json

def handle_get_tree(query_params):
    """GET /tree: dirs and files (non-recursive)"""
    
    path = query_params.get("path", [None])[0]
    if path:
        directory_structure = list_directory_contents(path)
    else:
        directory_structure = get_root_structure()
    return json.dumps(directory_structure)