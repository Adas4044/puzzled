"""
Siamese Network Step Verification Service.
Uses a trained Siamese network for image comparison (CPU-optimized inference).
"""

import cv2
import numpy as np
from pathlib import Path
from dataclasses import dataclass
from typing import Optional
import os

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models
from PIL import Image


@dataclass
class SiameseVerificationResult:
    step: int
    is_match: bool
    confidence: str  # "high", "medium", "low"
    similarity: float
    explanation: str


class SiameseNetwork(nn.Module):
    """Siamese Network using shared ResNet backbone."""

    def __init__(self, embedding_dim: int = 256):
        super().__init__()
        backbone = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        self.features = nn.Sequential(*list(backbone.children())[:-1])
        self.embedding = nn.Sequential(
            nn.Flatten(),
            nn.Linear(512, embedding_dim),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(embedding_dim, embedding_dim)
        )

    def forward_one(self, x):
        x = self.features(x)
        x = self.embedding(x)
        x = F.normalize(x, p=2, dim=1)
        return x


class SiameseStepDetector:
    """Step verification using trained Siamese network (CPU inference)."""

    def __init__(self, reference_dir: str, model_path: str = None,
                 similarity_threshold: float = 0.85):
        self.device = "cpu"  # Force CPU for serverless deployment
        self.reference_dir = Path(reference_dir)
        self.similarity_threshold = similarity_threshold

        self.reference_images = {}
        self.reference_embeddings = {}

        # Initialize model
        self.model = SiameseNetwork()
        self.model = self.model.to(self.device)

        if model_path and Path(model_path).exists():
            print(f"Loading Siamese model from {model_path}")
            self.model.load_state_dict(
                torch.load(model_path, map_location=self.device, weights_only=True)
            )

        self.model.eval()

        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

        # Load reference images
        self._load_references()

    def _load_references(self):
        """Load reference images and compute embeddings."""
        # Check for cropped directory first
        cropped_dir = self.reference_dir / "cropped"
        search_dir = cropped_dir if cropped_dir.exists() else self.reference_dir

        # Support multiple naming patterns
        patterns = ["cropped_s*-*.jpg", "s*-*.jpg", "step*.jpg"]

        for pattern in patterns:
            for img_path in sorted(search_dir.glob(pattern)):
                name = img_path.stem.replace("cropped_", "")

                # Extract step number
                if name.startswith("s") and "-" in name:
                    step_num = int(name.split("-")[0][1:])
                elif name.startswith("step"):
                    step_num = int("".join(filter(str.isdigit, name)) or 0)
                else:
                    continue

                if step_num not in self.reference_images:
                    self.reference_images[step_num] = []
                    self.reference_embeddings[step_num] = []

                self.reference_images[step_num].append(img_path)

                # Compute embedding
                embedding = self._compute_embedding_from_path(img_path)
                self.reference_embeddings[step_num].append(embedding)

        total_refs = sum(len(v) for v in self.reference_images.values())
        print(f"Loaded {len(self.reference_images)} steps with {total_refs} reference images")

    def _compute_embedding_from_path(self, image_path: Path) -> torch.Tensor:
        """Compute embedding for an image file."""
        image = Image.open(image_path).convert('RGB')
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            embedding = self.model.forward_one(input_tensor)

        return embedding.squeeze(0)

    def _compute_embedding_from_bytes(self, image_bytes: bytes) -> torch.Tensor:
        """Compute embedding from image bytes."""
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise ValueError("Could not decode image")

        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(rgb)
        input_tensor = self.transform(pil_image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            embedding = self.model.forward_one(input_tensor)

        return embedding.squeeze(0)

    def verify_step(
        self,
        captured_image: bytes,
        target_step: int,
        task_context: str = "assembly"
    ) -> SiameseVerificationResult:
        """
        Verify if the captured image matches the target step.
        """
        if target_step not in self.reference_embeddings:
            return SiameseVerificationResult(
                step=target_step,
                is_match=False,
                confidence="low",
                similarity=0.0,
                explanation=f"No reference images found for step {target_step}"
            )

        # Compute embedding for captured image
        captured_emb = self._compute_embedding_from_bytes(captured_image)

        # Compare against all reference embeddings for this step
        similarities = []
        for ref_emb in self.reference_embeddings[target_step]:
            sim = torch.dot(captured_emb, ref_emb).item()
            similarities.append(sim)

        max_similarity = max(similarities)

        # Determine match
        is_match = max_similarity >= self.similarity_threshold

        # Map similarity to confidence levels
        if max_similarity >= 0.95:
            confidence = "high"
        elif max_similarity >= 0.85:
            confidence = "medium"
        else:
            confidence = "low"

        if is_match:
            explanation = f"Matches step {target_step} (similarity: {max_similarity:.1%})"
        else:
            explanation = f"Does not match step {target_step} (similarity: {max_similarity:.1%}, need {self.similarity_threshold:.0%})"

        return SiameseVerificationResult(
            step=target_step,
            is_match=is_match,
            confidence=confidence,
            similarity=max_similarity,
            explanation=explanation
        )

    def get_total_steps(self) -> int:
        """Get the total number of steps."""
        return max(self.reference_images.keys()) if self.reference_images else 0


# Singleton instance (lazy loaded)
_siamese_detector: Optional[SiameseStepDetector] = None


def get_siamese_detector() -> SiameseStepDetector:
    """Get or create the Siamese detector instance."""
    global _siamese_detector
    if _siamese_detector is None:
        reference_dir = os.getenv("REFERENCE_DIR", "./reference_images")
        model_path = os.getenv("SIAMESE_MODEL_PATH", "./siamese_model.pth")
        threshold = float(os.getenv("SIAMESE_THRESHOLD", "0.85"))
        _siamese_detector = SiameseStepDetector(
            reference_dir=reference_dir,
            model_path=model_path,
            similarity_threshold=threshold
        )
    return _siamese_detector
