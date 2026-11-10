import time
from typing import Any, Optional
from cachetools import TTLCache
from core.config import settings

class HybridCache:
    """
    In-memory TTLCache with configurable TTL.
    Provides fast O(1) in-memory lookups for weather telemetry, reverse geocoding,
    and prediction scores.
    """
    def __init__(self, maxsize: int = 10000, ttl: int = settings.CACHE_TTL_SECONDS):
        self._cache = TTLCache(maxsize=maxsize, ttl=ttl)

    def get(self, key: str) -> Optional[Any]:
        return self._cache.get(key)

    def set(self, key: str, value: Any) -> None:
        self._cache[key] = value

    def delete(self, key: str) -> None:
        if key in self._cache:
            del self._cache[key]

    def clear(self) -> None:
        self._cache.clear()

    def __contains__(self, key: str) -> bool:
        return key in self._cache

# Global cache instance
cache = HybridCache()
