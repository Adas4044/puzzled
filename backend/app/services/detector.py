"""
Step Verification Service using Claude API.
Compares captured images against reference images.
"""

import anthropic
import base64
import cv2
import numpy as np
from dataclasses import dataclass
from pathlib import Path
from typing import Optional
import os


def extract_bounding_box_color(image: np.ndarray, padding: int = 30) -> tuple[np.ndarray, tuple[int, int, int, int]]:
    """
    Extract bounding box around the Lego piece(s) using color-based segmentation.
    Better for detecting colored Lego pieces on tan background.
    """
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Define range for tan/brown background (to exclude)
    lower_tan = np.array([10, 20, 100])
    upper_tan = np.array([30, 120, 220])

    # Create mask for background
    bg_mask = cv2.inRange(hsv, lower_tan, upper_tan)

    # Invert to get foreground (Lego pieces)
    fg_mask = cv2.bitwise_not(bg_mask)

    # Clean up the mask
    kernel = np.ones((7, 7), np.uint8)
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel)
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, kernel)

    # Find contours
    contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        h, w = image.shape[:2]
        return image, (0, 0, w, h)

    # Get bounding box that encompasses all significant contours
    min_area = 500
    significant_contours = [c for c in contours if cv2.contourArea(c) > min_area]

    if not significant_contours:
        largest = max(contours, key=cv2.contourArea)
        significant_contours = [largest]

    # Combine all significant contours
    all_points = np.vstack(significant_contours)
    x, y, w, h = cv2.boundingRect(all_points)

    # Add padding
    img_h, img_w = image.shape[:2]
    x = max(0, x - padding)
    y = max(0, y - padding)
    w = min(img_w - x, w + 2 * padding)
    h = min(img_h - y, h + 2 * padding)

    cropped = image[y:y+h, x:x+w]
    return cropped, (x, y, w, h)


@dataclass
class VerificationResult:
    step: int
    is_match: bool
    confidence: str  # "high", "medium", "low"
    explanation: str


class StepDetector:
    """Step verification using Claude's vision capabilities."""

    def __init__(self, reference_dir: str, api_key: str = None, tutorial_id: str = "treehacks"):
        """
        Initialize the detector.

        Args:
            reference_dir: Directory containing step reference images
            api_key: Anthropic API key (defaults to ANTHROPIC_API_KEY env var)
            tutorial_id: Tutorial identifier for tutorial-specific prompts
        """
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")

        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.reference_dir = Path(reference_dir)
        self.tutorial_id = tutorial_id
        self.reference_images = self._load_reference_images()

    def _load_reference_images(self) -> dict[int, list[Path]]:
        """Load all reference images grouped by step number."""
        references = {}
        # Support multiple naming patterns
        for pattern in ["s*-*.jpg", "step*.jpg", "*.jpg"]:
            for f in sorted(self.reference_dir.glob(pattern)):
                # Try to extract step number from filename
                name = f.stem.lower()
                if name.startswith("s") and "-" in name:
                    step_num = int(name.split("-")[0][1:])
                elif name.startswith("step"):
                    step_num = int("".join(filter(str.isdigit, name)) or 0)
                else:
                    continue

                if step_num not in references:
                    references[step_num] = []
                references[step_num].append(f)

        return references

    def _image_to_base64(self, image_path: Path) -> str:
        """Convert an image file to base64 string."""
        with open(image_path, "rb") as f:
            return base64.standard_b64encode(f.read()).decode("utf-8")

    def _bytes_to_base64(self, image_bytes: bytes) -> str:
        """Convert image bytes to base64 string."""
        return base64.standard_b64encode(image_bytes).decode("utf-8")

    def _preprocess_image(self, image_bytes: bytes, max_dimension: int = 1024) -> bytes:
        """Preprocess image by cropping and resizing to focus on Lego pieces."""
        # Decode bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return image_bytes

        # Crop to bounding box
        cropped, _ = extract_bounding_box_color(image)

        # Resize if too large (keep aspect ratio)
        h, w = cropped.shape[:2]
        if max(h, w) > max_dimension:
            scale = max_dimension / max(h, w)
            new_w = int(w * scale)
            new_h = int(h * scale)
            cropped = cv2.resize(cropped, (new_w, new_h), interpolation=cv2.INTER_AREA)

        # Encode back to JPEG bytes with good compression
        _, encoded = cv2.imencode('.jpg', cropped, [cv2.IMWRITE_JPEG_QUALITY, 85])
        return encoded.tobytes()

    def verify_step(
        self,
        captured_image: bytes,
        target_step: int,
        task_context: str = "assembly"
    ) -> VerificationResult:
        """
        Verify if the captured image matches the target step.

        Args:
            captured_image: Image bytes (JPEG)
            target_step: Step number to verify against
            task_context: Description of the task type

        Returns:
            VerificationResult with match status and explanation
        """
        if target_step not in self.reference_images:
            return VerificationResult(
                step=target_step,
                is_match=False,
                confidence="low",
                explanation=f"No reference images found for step {target_step}"
            )

        # Preprocess captured image (crop to Lego pieces)
        preprocessed_image = self._preprocess_image(captured_image)
        captured_b64 = self._bytes_to_base64(preprocessed_image)

        # Check for cropped reference image first
        ref_path = self.reference_images[target_step][0]
        cropped_ref_path = ref_path.parent / "cropped" / f"cropped_{ref_path.name}"
        if cropped_ref_path.exists():
            ref_b64 = self._image_to_base64(cropped_ref_path)
        else:
            ref_b64 = self._image_to_base64(ref_path)

        # Get tutorial-specific prompt additions
        tutorial_specific = TUTORIAL_PROMPTS.get(self.tutorial_id, "")

        prompt = f"""You are a step verification assistant. Compare these two images:

IMAGE 1 (Reference): This shows what step {target_step} of the {task_context} should look like when completed correctly.

IMAGE 2 (Captured): This is what the user has done.

Analyze if the captured image matches the reference for step {target_step}.

Consider:
1. Are the same components/pieces present?
2. Are they arranged in the same configuration?
3. Is the overall shape/structure matching?
4. ORIENTATION DOES NOT MATTER - the piece can be rotated or flipped and still be correct.
5. Minor differences in angle/lighting are acceptable.
{tutorial_specific}

Respond in this exact format:
MATCH: [YES/NO]
CONFIDENCE: [HIGH/MEDIUM/LOW]
EXPLANATION: [Brief explanation of your assessment]"""

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=300,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": ref_b64
                                }
                            },
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": captured_b64
                                }
                            }
                        ]
                    }
                ]
            )

            response_text = response.content[0].text
            lines = response_text.strip().split("\n")

            is_match = False
            confidence = "low"
            explanation = response_text

            for line in lines:
                if line.startswith("MATCH:"):
                    is_match = "YES" in line.upper()
                elif line.startswith("CONFIDENCE:"):
                    conf = line.split(":")[1].strip().upper()
                    if conf in ["HIGH", "MEDIUM", "LOW"]:
                        confidence = conf.lower()
                elif line.startswith("EXPLANATION:"):
                    explanation = line.split(":", 1)[1].strip()

            # Use simple positive message for matches
            if is_match:
                explanation = "Success! Keep going with the build process."

            return VerificationResult(
                step=target_step,
                is_match=is_match,
                confidence=confidence,
                explanation=explanation
            )

        except Exception as e:
            return VerificationResult(
                step=target_step,
                is_match=False,
                confidence="low",
                explanation=f"API error: {str(e)}"
            )

    def get_total_steps(self) -> int:
        """Get the total number of steps."""
        return max(self.reference_images.keys()) if self.reference_images else 0


# Tutorial-specific prompts
TUTORIAL_PROMPTS = {
    "nutsbolts": """For hardware (screws, bolts, nuts): Pay close attention to:
- Screw/bolt LENGTH
- Nut SIZE and type (hex nut vs wing nut)
- Assembly state (loose vs tightened, partially vs fully assembled)
- Count the number of components - must match exactly""",
    "treehacks": """For Lego pieces: Focus on the overall shape and color of the assembled pieces.""",
}

# Map Supabase UUIDs to folder/prompt names
TUTORIAL_ID_MAP = {
    "407d67a9-47f0-48c2-8e2c-d484b2953e37": "treehacks",
    "7cbceca1-47bc-444b-941a-3e34da230430": "nutsbolts",
}

# Cache detectors by tutorial_id
_detectors: dict[str, StepDetector] = {}


def get_detector(tutorial_id: str = "treehacks") -> StepDetector:
    """Get or create the detector instance for a specific tutorial."""
    global _detectors
    # Resolve UUID to folder name if needed
    resolved_id = TUTORIAL_ID_MAP.get(tutorial_id, tutorial_id)
    if resolved_id not in _detectors:
        base_dir = os.getenv("REFERENCE_DIR", "./reference_images")
        # Look for tutorial-specific subfolder, fall back to base dir
        tutorial_dir = Path(base_dir) / resolved_id
        if tutorial_dir.exists():
            reference_dir = str(tutorial_dir)
        else:
            reference_dir = base_dir
        _detectors[resolved_id] = StepDetector(reference_dir, tutorial_id=resolved_id)
    return _detectors[resolved_id]
