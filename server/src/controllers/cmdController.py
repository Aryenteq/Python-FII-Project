from server.src.services.cmdService import list_drives, list_directory_contents, copy_items, delete_items, move_items
import json

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
    
    return status_code, json.dumps(directory_structure)



# 
# 
# POST ROUTES
# 
# 

def handle_copy(body):
    try:
        items = body.get("items")
        destination = body.get("destination")
        
        if not items or not destination:
            raise ValueError("Missing required parameters: 'items' or 'destination'")
        
        status_code, response = copy_items(items, destination)
        
        return status_code, json.dumps(response)
    
    except ValueError as e:
        return 400, json.dumps({"error": str(e)})
    
    except Exception as e:
        return 500, json.dumps({"error": "Internal Server Error", "details": str(e)})

def handle_move(body):
    try:
        items = body.get("items")
        destination = body.get("destination")
        
        if not items or not destination:
            raise ValueError("Missing required parameters: 'items' or 'destination'")
        
        status_code, response = move_items(items, destination)
        
        return status_code, json.dumps(response)
    
    except ValueError as e:
        return 400, json.dumps({"error": str(e)})
    
    except Exception as e:
        return 500, json.dumps({"error": "Internal Server Error", "details": str(e)})
    
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
        return 400, json.dumps({"error": "No items provided"})

    status_code, deleted_items = delete_items(items)
    return status_code, json.dumps(deleted_items)
