import json
import os
import shutil
from datetime import datetime

# 
# 
# GET ROUTES
# 
# 


def list_drives():
    drives_info = []

    if os.name == 'nt':  # Windows
        import string
        drives = [f"{drive}:\\" for drive in string.ascii_uppercase if os.path.exists(f"{drive}:\\")]
    else:
        # Unix-like systems
        drives = ["/"]

    for drive in drives:
        try:
            usage = shutil.disk_usage(drive)
            drives_info.append({
                "name": drive,
                "type": "drive" if os.name == 'nt' else "root",
                "total_space": usage.total,
                "used_space": usage.used,
                "free_space": usage.free,
            })
        except Exception as e:
            drives_info.append({
                "drive_name": drive,
                "drive_type": "drive" if os.name == 'nt' else "root",
                "error": str(e)
            })

    return drives_info

def is_hidden(file_path):
    if os.name == 'nt':
        import ctypes
        attribute = ctypes.windll.kernel32.GetFileAttributesW(file_path)
        if attribute == -1:
            raise FileNotFoundError(f"Cannot access file: {file_path}")
        return bool(attribute & 2)  # FILE_ATTRIBUTE_HIDDEN == 2
    else:
        # unix - hidden files start with .
        return os.path.basename(file_path).startswith('.')

def list_directory_contents(path=None):
    if path is None:
        return 200, list_drives()

    if not os.path.exists(path):
        return 404, json.dumps({"error": f"The path '{path}' does not exist."})

    if not os.path.isdir(path):
        return 400, json.dumps({"error": f"The path '{path}' is not a directory."})


    try:
        entries = os.listdir(path)
        structure = []
        for entry in entries:
            full_path = os.path.join(path, entry)
            try:
                # File stats
                stats = os.stat(full_path)
                date_created = datetime.fromtimestamp(stats.st_birthtime).strftime("%Y-%m-%d %H:%M:%S")
                size = stats.st_size if not os.path.isdir(full_path) else None
                hidden = is_hidden(full_path)

                if os.path.isdir(full_path):
                    structure.append({
                        "name": entry,
                        "extension": "File Folder",
                        "date_created": date_created,
                        "size": size,
                        "hidden": hidden,
                    })
                else:
                    extension = os.path.splitext(entry)[1] if '.' in entry else "No Extension"
                    entry = os.path.splitext(entry)[0] if '.' in entry else entry
                    structure.append({
                        "name": entry,
                        "extension": extension,
                        "date_created": date_created,
                        "size": size,
                        "hidden": hidden,
                    })
            except PermissionError:
                structure.append({
                    "name": entry,
                    "extension": "Permission Denied",
                    "date_created": "N/A",
                    "size": "N/A",
                    "hidden": "Unknown"
                })
            except FileNotFoundError:
                structure.append({
                    "name": entry,
                    "extension": "File Not Found",
                    "date_created": "N/A",
                    "size": "N/A",
                    "hidden": "Unknown"
                })
            except Exception as e:
                structure.append({
                    "name": entry,
                    "extension": "Error",
                    "date_created": "N/A",
                    "size": "N/A",
                    "hidden": f"Error: {str(e)}"
                })
        return 200, structure
    except PermissionError:
        return 403, json.dumps({"error": "Permission Denied: Access denied to the directory."})
    except Exception as e:
        return 500, json.dumps({"error": str(e)})

    

# 
# 
# POST ROUTES
# 
# 

def copy_items(items, destination):
    """
    Copies the specified items (files or directories) to a destination directory.
    
    Args:
        items (list): List of paths to files or directories to be copied.
        destination (str): The destination directory.
        
    Returns:
        tuple: (status_code, response_json) - Status code and response details in JSON format.
    """
    changed_paths = set()
    try:
        destination = os.path.abspath(os.path.normpath(destination))
        if not os.path.exists(destination):
            raise FileNotFoundError(f"The destination path '{destination}' does not exist.")
        
        if not os.path.isdir(destination):
            raise ValueError(f"The destination path '{destination}' must be a directory.")
        
        if not isinstance(items, list) or not items:
            raise ValueError("The 'items' parameter must be a non-empty list of file paths.")
        
        for item in items:
            item = os.path.abspath(os.path.normpath(item))
            if not os.path.exists(item):
                raise FileNotFoundError(f"The item '{item}' does not exist.")
            
            # Construct the destination path
            dest_path = os.path.join(destination, os.path.basename(item))
            
            # Copy
            if os.path.isfile(item):
                shutil.copy2(item, dest_path)  # For files
                changed_paths.add(destination)
            elif os.path.isdir(item):
                shutil.copytree(item, dest_path, dirs_exist_ok=True)  # For directories
                changed_paths.add(destination)
        
        return 200, json.dumps({
            "message": "Items copied successfully",
            "changed_paths": list(changed_paths)
        })
    
    except FileNotFoundError as e:
        return 404, json.dumps({"error": str(e)})
    
    except ValueError as e:
        return 400, json.dumps({"error": str(e)})
    
    except PermissionError as e:
        return 403, json.dumps({"error": f"Permission denied: {str(e)}"})
    
    except Exception as e:
        return 500, json.dumps({"error": str(e)})
    

def move_items(items, destination):
    """
    Moves the specified items (files or directories) to the destination.

    Args:
        items (list): List of paths to files or directories to be moved.
        destination (str): The destination directory.

    Returns:
        tuple: (status_code, response_json) - Status code and response details in JSON format.
    """
    changed_paths = set()
    try:
        # Normalize and validate
        destination = os.path.abspath(os.path.normpath(destination))
        if not os.path.exists(destination):
            raise FileNotFoundError(f"The destination path '{destination}' does not exist.")
        
        if not os.path.isdir(destination):
            raise ValueError(f"The destination path '{destination}' must be a directory.")
        
        if not isinstance(items, list) or not items:
            raise ValueError("The 'items' parameter must be a non-empty list of file paths.")
        
        # 1: Copy
        copy_status, copy_response = copy_items(items, destination)
        if copy_status != 200:
            return copy_status, copy_response

        # changed paths update
        copied_paths = json.loads(copy_response).get("changed_paths", [])
        changed_paths.update(copied_paths)

        # 2: Delete
        delete_status, delete_response = delete_items(items)
        if delete_status != 200:
            return delete_status, json.dumps({
                "message": "Move partially completed. Items copied but not deleted.",
                "changed_paths": list(changed_paths),
                "delete_error": delete_response
            })

        # Changed paths = original paths (folders containing deleted files)
        deleted_paths = json.loads(delete_response).get("changed_paths", [])
        changed_paths.update(deleted_paths)

        return 200, json.dumps({
            "message": "Items moved successfully",
            "changed_paths": list(changed_paths)
        })

    except FileNotFoundError as e:
        return 404, json.dumps({"error": str(e)})
    
    except ValueError as e:
        return 400, json.dumps({"error": str(e)})
    
    except PermissionError as e:
        return 403, json.dumps({"error": f"Permission denied: {str(e)}"})
    
    except Exception as e:
        return 500, json.dumps({"error": str(e)})
    
# 
# 
# DELETE ROUTES
# 
#  
    
def delete_items(items):
    """
    Deletes the specified items (files or directories).
    
    Args:
        items (list): List of paths to files or directories to be deleted.
        
    Returns:
        tuple: (status_code, response_dict) - Status code and response details.
    """
    changed_paths = set()
    try:
        if not isinstance(items, list) or not items:
            raise ValueError("The 'items' parameter must be a non-empty list of file or directory paths.")
        
        for item in items:
            item = os.path.abspath(os.path.normpath(item))
            parent_dir = os.path.dirname(item) # parent dir
            if not os.path.exists(item):
                raise FileNotFoundError(f"The item '{item}' does not exist.")
            
            if os.path.isfile(item):
                os.remove(item)  # Delete the file
                changed_paths.add(parent_dir)
            elif os.path.isdir(item):
                shutil.rmtree(item)  # Delete the directory
                changed_paths.add(parent_dir)
        
        return 200, json.dumps({"message": "Items deleted successfully", "changed_paths": list(changed_paths)})
    
    except FileNotFoundError as e:
        return 404, json.dumps({"error": str(e)})
    
    except ValueError as e:
        return 400, json.dumps({"error": str(e)})
    
    except PermissionError as e:
        return 403, json.dumps({"error": f"Permission denied: {str(e)}"})
    
    except Exception as e:
        return 500, json.dumps({"error": str(e)})