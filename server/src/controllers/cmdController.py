from ..services.cmdService import get_root_structure, list_directory_contents
import json

def handle_get_tree(query_params):
    """Handles the /tree request and returns the non-recursive directory structure."""
    path = query_params.get("path", [None])[0]  # 'path' parameter; default to None
    if path:
        directory_structure = list_directory_contents(path)
    else:
        directory_structure = get_root_structure()
    return json.dumps(directory_structure)