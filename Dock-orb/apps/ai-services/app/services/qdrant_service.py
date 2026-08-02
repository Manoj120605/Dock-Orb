import os
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import logging
from uuid import uuid4

logger = logging.getLogger(__name__)

class QdrantService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(QdrantService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        api_key = os.getenv("QDRANT_API_KEY", None)
        logger.info(f"Connecting to Qdrant at {qdrant_url}")
        self.client = QdrantClient(url=qdrant_url, api_key=api_key)
        
        # Ensure collections exist
        self._ensure_collection("capsules", vector_size=384) # 384 for all-MiniLM-L6-v2

    def _ensure_collection(self, collection_name: str, vector_size: int):
        try:
            collections = self.client.get_collections().collections
            exists = any(c.name == collection_name for c in collections)
            
            if not exists:
                logger.info(f"Creating collection '{collection_name}'")
                self.client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
                )
        except Exception as e:
            logger.error(f"Failed to ensure collection {collection_name}: {str(e)}")

    def upsert_vectors(self, collection_name: str, ids: list[str], vectors: list[list[float]], payloads: list[dict]):
        points = [
            PointStruct(id=id_ or str(uuid4()), vector=vector, payload=payload)
            for id_, vector, payload in zip(ids, vectors, payloads)
        ]
        self.client.upsert(
            collection_name=collection_name,
            points=points
        )

    def search(self, collection_name: str, query_vector: list[float], limit: int = 5, filter_dict: dict = None):
        # Build filter if provided
        query_filter = None
        # Simplified filter for MVP
        
        results = self.client.search(
            collection_name=collection_name,
            query_vector=query_vector,
            limit=limit,
            query_filter=query_filter
        )
        return results

# Singleton instance
qdrant_service = QdrantService()
