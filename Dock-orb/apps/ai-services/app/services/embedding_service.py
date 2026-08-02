import os
from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)

class EmbeddingService:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        logger.info(f"Loading embedding model: {model_name}")
        # Loads model into memory. In production, consider ONNX or TensorRT for faster inference.
        self._model = SentenceTransformer(model_name)
        logger.info("Embedding model loaded successfully")

    def embed_text(self, text: str) -> list[float]:
        """Generate embedding for a single text string."""
        embedding = self._model.encode(text)
        return embedding.tolist()

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for a batch of text strings."""
        embeddings = self._model.encode(texts)
        return embeddings.tolist()

# Singleton instance
embedding_service = EmbeddingService()
