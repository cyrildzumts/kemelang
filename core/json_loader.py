import os
from pathlib import Path
import json
import logging

logger = logging.getLogger(__name__)

def load_config(path):
    data = None
    if path is None:
        logger.warning(f"load_config with empty path")
    logger.info(f"loading config with path {path}")
    try:
        with open(path, 'r') as config:

            data = json.loads(config.read())
            
    except Exception as e:
        logger.warn(f"Error loading config file {path} - current working directory : {Path.cwd()}")
        logger.exception(e)
    return data

def store_config(json_data, path):
    try:
        with open(path, 'w') as f:
            json.dump(json_data, f)
    except Exception as e:
        logger.warning(f"Error while storing json data {json_data} to file {path}. Error : {str(e)}") 