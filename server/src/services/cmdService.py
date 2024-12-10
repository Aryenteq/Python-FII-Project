import os
import shutil
from datetime import datetime

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
        return 404, f"The path '{path}' does not exist."

    if not os.path.isdir(path):
        return 400, f"The path '{path}' is not a directory."

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
        return 403, "Permission Denied: Access denied to the directory."
    except Exception as e:
        return 500, f"Error - details: {str(e)}"