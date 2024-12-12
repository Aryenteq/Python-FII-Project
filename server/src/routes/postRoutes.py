from importlib import import_module, reload

SEARCH_MODULES = [
    "server.src.routes.cmd.cmdPostRoutes",
]

def handle_post(path, body=None):
    body = body or {}

    for module_name in SEARCH_MODULES:
        try:
            module = import_module(module_name)
            reload(module)
            
            if hasattr(module, "handle_post"):
                status, response = module.handle_post(path, body)
                
                if status != 404:
                    return status, response
            
        except ImportError as e:
            print(f"Failed to import {module_name}: {e}")
        except Exception as e:
            print(f"Error in module {module_name}: {e}")
    
    # Invalid route
    return 404, '{"error": "Not Found"}'
