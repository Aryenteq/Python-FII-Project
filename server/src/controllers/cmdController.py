from server.src.services.cmdService import *

# 
# 
# GET ROUTES
# 
# 

def handle_get_tree(query_params):
    """GET /tree: dirs and files (non-recursive)"""
    path = query_params.get("path", [None])[0]
    
    if path:
        status_code, directory_structure = list_directory_contents(path)
    else:
        status_code, directory_structure = 200, list_drives()
    
    return status_code, directory_structure


def handle_get_file_content(query_params):
    path = query_params.get("path", [None])[0]
    
    if not path:
        return 400, {"error": "Missing required parameter: 'path'"}

    status_code, file_data = get_file_content(path)
    
    return status_code, file_data


# 
# 
# POST ROUTES
# 
# 

def handle_copy(body):
    items = body.get("items")
    destination = body.get("destination")
        
    if not items or not destination:
        return 400, {"error": "Missing required parameters: 'items' or 'destination'"}
        
    status_code, changed_paths = copy_items(items, destination)
        
    return status_code, changed_paths



def handle_move(body):
    items = body.get("items")
    destination = body.get("destination")
        
    if not items or not destination:
        return 400, {"error": "Missing required parameters: 'items' or 'destination'"}
        
    status_code, changed_paths = move_items(items, destination)
        
    return status_code, changed_paths



def handle_create(body):
    name = body.get("name")
    item_type = body.get("creatingItem")
    destination = body.get("destination")
    
    if not name or not item_type or not destination:
        return 400, {"error": "Missing required parameters: 'name' or 'creatingItem' or 'destination'"}
    
    if item_type not in ("file", "folder"):
        return 400, {"error": "creatingItem should be 'file' or 'folder'"}
    
    status_code, changed_paths = create_item(name, item_type, destination)
        
    return status_code, changed_paths

#
#
# PUT ROUTES
#
#

def handle_rename(body):
    items = body.get("items")
    name = body.get("name")
    extension = body.get("extension")
        
    if not items or (not name and not extension):
        return 400, {"error": "Missing required parameters: 'items' and at least one of 'name' or 'extension'"}
        
    status_code, changed_paths = rename_items(items, name, extension)
        
    return status_code, changed_paths

def handle_set_file_content(body):
    file = body.get("file")
    content = body.get("content")
        
    if not file or content:
        return 400, {"error": "Missing required parameters: 'file' or 'content"}
        
    status_code, response = set_file_content(file, content)
        
    return status_code, response

# 
# 
# DELETE ROUTES
# 
# 

def delete_items_controller(query_params):
    """DELETE /tree: delete items specified in query_params (can be an array)"""
    items = query_params.get("items", [])
    
    # Check if items is empty
    if not items:
        return 400, {"error": "No items provided"}

    status_code, changed_paths = delete_items(items)
    return status_code, changed_paths
