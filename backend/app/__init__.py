"""UNLIMITED choice Backend Application"""
import sys
import os

# Ensure backend root directory is in sys.path so 'app' is always resolvable
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURRENT_DIR)
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)

# Backward-compatibility alias for legacy backend.app imports
if "backend" not in sys.modules:
    import types
    _backend_mod = types.ModuleType("backend")
    _backend_mod.app = sys.modules[__name__]
    sys.modules["backend"] = _backend_mod
    sys.modules["backend.app"] = sys.modules[__name__]
