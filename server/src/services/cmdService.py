import json
import os
import shutil
from datetime import datetime

from server.src.utils.uniqueNames import get_unique_name

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
        return 404, {"error": f"The path '{path}' does not exist."}

    if not os.path.isdir(path):
        return 400, {"error": f"The path '{path}' is not a directory."}


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
        return 403, {"error": "Permission Denied: Access denied to the directory."}
    except Exception as e:
        return 500, {"error": str(e)}

    
    
def get_file_content(path):
    """
    Args:
        path (str): The absolute or relative path to the file.

    Returns:
        tuple: (status_code, response_json) - Status code and response details
    """
    try:
        path = os.path.abspath(os.path.normpath(path))
        if not os.path.exists(path):
            raise FileNotFoundError(f"The file '{path}' does not exist.")
        
        if not os.path.isfile(path):
            raise ValueError(f"The path '{path}' is not a file.")

        # Read the content of the file
        with open(path, 'r', encoding="utf-8", errors="ignore") as file:
            content = file.read()

        return 200, {
            "message": "File content retrieved successfully",
            "content": content
        }

    except FileNotFoundError as e:
        return 404, {"error": str(e)}

    except ValueError as e:
        return 400, {"error": str(e)}

    except PermissionError as e:
        return 403, {"error": f"Permission denied: {str(e)}"}

    except Exception as e:
        return 500, {"error": str(e)}

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
            
            # Construct the destination path (unique name - base name [plus suffix - Copy (n)])
            dest_path = os.path.join(destination, os.path.basename(item))
            dest_path = get_unique_name(dest_path)
            
            # Copy
            if os.path.isfile(item):
                shutil.copy2(item, dest_path)  # For files
                changed_paths.add(destination)
            elif os.path.isdir(item):
                shutil.copytree(item, dest_path, dirs_exist_ok=True)  # For directories
                changed_paths.add(destination)
        
        return 200, {
            "message": "Items copied successfully",
            "changed_paths": list(changed_paths)
        }
    
    except FileNotFoundError as e:
        return 404, {"error": str(e)}
    
    except ValueError as e:
        return 400, {"error": str(e)}
    
    except PermissionError as e:
        return 403, {"error": f"Permission denied: {str(e)}"}
    
    except Exception as e:
        return 500, {"error": str(e)}
    
    

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
        
        for item in items:
            item_path = os.path.abspath(os.path.normpath(item))
            dest_path = os.path.join(destination, os.path.basename(item))
            if item_path == dest_path:
                raise ValueError(f"Cannot move '{item}' to the same location '{destination}'.")
        
        # 1: Copy
        copy_status, copy_response = copy_items(items, destination)
        if copy_status != 200:
            return copy_status, copy_response

        # changed paths update
        # Updated part inside move_items
        copied_paths = copy_response.get("changed_paths", [])
        changed_paths.update(copied_paths)

        # 2: Delete
        delete_status, delete_response = delete_items(items)
        if delete_status != 200:
            return delete_status, {
                "message": "Move partially completed. Items copied but not deleted.",
                "changed_paths": list(changed_paths),
                "delete_error": delete_response
            }

        # Changed paths = original paths (folders containing deleted files)
        deleted_paths = delete_response.get("changed_paths", [])
        changed_paths.update(deleted_paths)

        return 200, {
            "message": "Items moved successfully",
            "changed_paths": list(changed_paths)
        }

    except FileNotFoundError as e:
        return 404, {"error": str(e)}
    
    except ValueError as e:
        return 400, {"error": str(e)}
    
    except PermissionError as e:
        return 403, {"error": f"Permission denied: {str(e)}"}
    
    except Exception as e:
        return 500, {"error": str(e)}



def create_item(name, item_type, destination):
    """
    Creates a new file / folder at the given destination.

    Args:
        name (str): Given name for the new item
        item_type (str): Either "file" or "folder"
        destination (str): Directory where the file/folder will be placed

    Returns:
        tuple: (status_code, response_json) - Status code and changed directories
    """
    try:
        destination = os.path.abspath(os.path.normpath(destination))
        
        if not os.path.exists(destination):
            raise FileNotFoundError(f"The destination path '{destination}' does not exist.")
        
        if not os.path.isdir(destination):
            raise ValueError(f"The destination path '{destination}' must be a directory.")
        
        # Full path
        item_path = os.path.join(destination, name)
        
        if item_type == "file":
            # Valid extension (extension not empty)
            if '.' not in name or name.rsplit('.', 1)[1] == '':
                raise ValueError(f"The file name '{name}' must include a valid extension (e.g., 'file.txt').")
            
            if os.path.exists(item_path):
                raise FileExistsError(f"The file '{item_path}' already exists.")
            
            with open(item_path, 'w') as file:
                file.write("")  # Empty file

            return 200, {
                "message": "File created successfully",
                "changed_paths": [destination]
            }

        elif item_type == "folder":
            if os.path.exists(item_path):
                raise FileExistsError(f"The folder '{item_path}' already exists.")
            
            # Create the folder
            os.makedirs(item_path)

            return 200, {
                "message": "Folder created successfully",
                "changed_paths": [destination]
            }
        
        else:
            raise ValueError(f"Invalid item type '{item_type}'. Must be either 'file' or 'folder'.")
    
    except FileNotFoundError as e:
        return 404, {"error": str(e)}
    except ValueError as e:
        return 400, {"error": str(e)}
    except FileExistsError as e:
        return 409, {"error": str(e)}
    except Exception as e:
        return 500, {"error": str(e)}
   

 
def rename_items(items, name=None, extension=None):
    """
    Renames the items (files or directories) with the given name and/or extension (at least one must be provided).

    Args:
        items (list): List of paths to files or directories to be renamed
        name (str, optional): The new name to be applied to all items
        extension (str, optional): The new extension to be applied to files. Ignored for folders.

    Returns:
        tuple: (status_code, response_json) - Status code and changed directories
    """
    changed_paths = set()
    try:
        if not isinstance(items, list) or not items:
            raise ValueError("The 'items' parameter must be a non-empty list of file paths.")
        
        for item in items:
            item = os.path.abspath(os.path.normpath(item))
            if not os.path.exists(item):
                raise FileNotFoundError(f"The item '{item}' does not exist.")
            
            # Folder renaming
            if os.path.isdir(item):
                if name is None:
                    raise ValueError("A new name must be provided for renaming folders.")
                # Generate unique folder name
                new_path = os.path.join(os.path.dirname(item), name)
                new_path = get_unique_name(new_path)
            
            # File renaming
            else:
                base_name, current_ext = os.path.splitext(os.path.basename(item))
                
                if name is None and extension:
                    new_name = base_name  # Keep current name
                else:
                    new_name = name or base_name
                
                # Normalize the extension to ensure it starts with a dot
                if extension and not extension.startswith("."):
                    extension = f".{extension}"
                
                # Extension
                new_extension = extension if extension else current_ext
                new_path = os.path.join(os.path.dirname(item), f"{new_name}{new_extension}")
                new_path = get_unique_name(new_path)
            
            # Rename
            os.rename(item, new_path)
            changed_paths.add(os.path.dirname(new_path))

        return 200, {
            "message": "Items renamed successfully",
            "changed_paths": list(changed_paths)
        }
    
    except FileNotFoundError as e:
        return 404, {"error": str(e)}
    
    except ValueError as e:
        return 400, {"error": str(e)}
    
    except PermissionError as e:
        return 403, {"error": f"Permission denied: {str(e)}"}
    
    except Exception as e:
        return 500, {"error": str(e)}



def set_file_content(file, content):
    """
    Args:
        path (str): The absolute or relative path to the file.

    Returns:
        tuple: (status_code, response_json) - Status code and response details
    """
    try:
        path = os.path.abspath(os.path.normpath(file))
        if not os.path.exists(path):
            raise FileNotFoundError(f"The file '{path}' does not exist.")
        
        if not os.path.isfile(path):
            raise ValueError(f"The path '{path}' is not a file.")

        # Write the content to the file
        with open(path, 'w', encoding="utf-8", errors="ignore") as file:
            file.write(content)

        return 200, {
            "message": "File content written successfully",
            "content": content
        }

    except FileNotFoundError as e:
        return 404, {"error": str(e)}

    except ValueError as e:
        return 400, {"error": str(e)}

    except PermissionError as e:
        return 403, {"error": f"Permission denied: {str(e)}"}

    except Exception as e:
        return 500, {"error": str(e)}


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
        
        return 200, {"message": "Items deleted successfully", "changed_paths": list(changed_paths)}
    
    except FileNotFoundError as e:
        return 404, {"error": str(e)}
    
    except ValueError as e:
        return 400, {"error": str(e)}
    
    except PermissionError as e:
        return 403, {"error": f"Permission denied: {str(e)}"}
    
    except Exception as e:
        return 500, {"error": str(e)}