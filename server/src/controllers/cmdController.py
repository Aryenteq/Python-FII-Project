from server.src.services.cmdService import list_drives, list_directory_contents
import json

def handle_get_tree(query_params):
    """GET /tree: dirs and files (non-recursive)"""
    path = query_params.get("path", [None])[0]
    
    if path:
        status_code, directory_structure = list_directory_contents(path)
    else:
        status_code, directory_structure = 200, list_drives()
    
    return status_code, json.dumps(directory_structure)