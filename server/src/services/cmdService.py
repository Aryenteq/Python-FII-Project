import os

def list_drives():
    """Get all available drives on Windows or the root directory on Unix-like systems."""
    if os.name == 'nt':  # Windows
        import string
        return [f"{drive}:\\" for drive in string.ascii_uppercase if os.path.exists(f"{drive}:\\")]
    else:
        # Unix
        return ["/"]

def list_directory_contents(path="."):
    """Lists the contents of a directory (non-recursive)."""
    try:
        entries = os.listdir(path)
        structure = []
        for entry in entries:
            full_path = os.path.join(path, entry)
            if os.path.isdir(full_path):
                structure.append({"name": entry, "type": "directory"})
            else:
                structure.append({"name": entry, "type": "file"})
        return structure
    except PermissionError:
        return [{"name": "Permission Denied", "type": "error"}]
    except Exception as e:
        return [{"name": "Error", "details": str(e)}]

def get_root_structure():
    """Returns the list of drives (on Windows) or the root directory (on Unix-like systems)."""
    drives = list_drives()
    return [{"name": drive, "type": "drive"} for drive in drives]