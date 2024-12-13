from importlib import import_module, reload

SEARCH_MODULES = [
    "server.src.routes.cmd.cmdGetRoutes",
]

def handle_get(path, query_params=None):
    query_params = query_params or {}

    for module_name in SEARCH_MODULES:
        try:
            module = import_module(module_name)
            reload(module)
            
            if hasattr(module, "handle_get"):
                status, response = module.handle_get(path, query_params)
                
                if status != 404:
                    return status, response
            
        except ImportError as e:
            print(f"Failed to import {module_name}: {e}")
        except Exception as e:
            print(f"Error in module {module_name}: {e}")
    
    # Invalid route
    return 404, {"error": "Not found"}