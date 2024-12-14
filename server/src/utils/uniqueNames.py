import os

def get_unique_name(path):
    """
    Generates a unique name for a file or directory by adding a suffix if the file already exists.

    Args:
        path (str): The original file or directory path.

    Returns:
        str: A unique file or directory path with a suffix.
    """
    base, ext = os.path.splitext(path)
    counter = 1

    # Check for conflicts and increment the suffix
    while os.path.exists(path):
        path = f"{base} - ({counter}){ext}"
        counter += 1

    return path