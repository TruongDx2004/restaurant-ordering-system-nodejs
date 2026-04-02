# config.py
"""
Configuration file for MCP Server - Restaurant API
"""

import os
from typing import Dict, Any

class APIConfig:
    """API Configuration class for Restaurant Management System"""
    
    # Base API settings
    BASE_URL = 'http://localhost:8080'
    TIMEOUT = int(os.getenv('API_TIMEOUT', '10'))
    
    # API Endpoints
    ENDPOINTS = {
        'dishes': '/dishes',
        'dish_detail': '/dishes/{dish_id}',
        'categories': '/api/categories/all', 
        'checkout': '/api/invoices/checkout',
        'table_invoice': '/api/invoices/table/{table_number}'
    }
    
    # Pagination settings
    DEFAULT_LIMIT = 10
    MAX_LIMIT = 100
    
    # Request settings
    HEADERS = {
        'Content-Type': 'application/json',
        'User-Agent': 'MCP-Server/1.0'
    }
    
    @classmethod
    def get_full_url(cls, endpoint_key: str, **kwargs) -> str:
        """
        Get full URL for an endpoint with optional path parameters
        
        Args:
            endpoint_key: Key from ENDPOINTS dict
            **kwargs: Path parameters for URL formatting
            
        Returns:
            Complete URL string
            
        Example:
            get_full_url('dish_detail', dish_id=123)
            -> 'http://localhost:8080/dishes/123'
        """
        endpoint = cls.ENDPOINTS.get(endpoint_key)
        if not endpoint:
            raise ValueError(f"Unknown endpoint key: {endpoint_key}")
            
        if kwargs:
            endpoint = endpoint.format(**kwargs)
            
        return f"{cls.BASE_URL}{endpoint}"
    
    @classmethod
    def get_request_config(cls) -> Dict[str, Any]:
        """Get common request configuration"""
        return {
            'headers': cls.HEADERS,
            'timeout': cls.TIMEOUT
        }

# Environment-specific configurations
class DevelopmentConfig(APIConfig):
    """Development environment configuration"""
    BASE_URL = 'http://localhost:8080'
    DEBUG = True

class ProductionConfig(APIConfig):
    """Production environment configuration"""
    BASE_URL = os.getenv('PRODUCTION_API_URL', 'https://api.restaurant.com')
    DEBUG = False
    TIMEOUT = 30

class TestingConfig(APIConfig):
    """Testing environment configuration"""
    BASE_URL = 'http://localhost:8081'
    DEBUG = True
    TIMEOUT = 5

# Configuration mapping
CONFIGS = {
    'development': DevelopmentConfig,
    'production': ProductionConfig, 
    'testing': TestingConfig
}

def get_config(env: str = None) -> APIConfig:
    """
    Get configuration based on environment
    
    Args:
        env: Environment name ('development', 'production', 'testing')
        If None, uses FLASK_ENV environment variable or defaults to 'development'
        
    Returns:
        Configuration class instance
    """
    if env is None:
        env = os.getenv('FLASK_ENV', 'testing').lower()
    
    config_class = CONFIGS.get(env, DevelopmentConfig)
    return config_class()

# Default configuration instance
config = get_config()