"""
Test verification against RunPod API
"""
import requests
import re
from pathlib import Path

API_URL = "https://3f8w0ew2c3oea1-8000.proxy.runpod.net"

# Test directories
TEST_DIRS = [
    "cv_detector/new_detector/test1/jpg",
    "cv_detector/new_detector/test2/jpg",
    "cv_detector/new_detector/test3/jpg",
]

def test_image(image_path: str, step_id: int):
    """Send an image to the verification API"""
    with open(image_path, 'rb') as f:
        files = {'image': ('capture.jpg', f, 'image/jpeg')}
        data = {'stepId': step_id}
        response = requests.post(f"{API_URL}/verify/verify-step", files=files, data=data)

    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"HTTP {response.status_code}: {response.text}"}

def get_step_from_filename(filename: str) -> int:
    """Extract step number from filename like s1.jpg, s2.jpg"""
    match = re.search(r's(\d+)', filename)
    if match:
        return int(match.group(1))
    return 0

def main():
    print("=" * 60)
    print("VERIFICATION TEST RESULTS")
    print("=" * 60)

    total = 0
    correct = 0

    for test_dir in TEST_DIRS:
        test_path = Path(test_dir)
        if not test_path.exists():
            print(f"\n[SKIP] {test_dir} not found")
            continue

        print(f"\n--- Testing {test_dir} ---")

        for img_file in sorted(test_path.glob("*.jpg")):
            step_id = get_step_from_filename(img_file.name)
            if step_id == 0:
                print(f"  {img_file.name}: SKIP - cannot determine step")
                continue

            total += 1
            result = test_image(str(img_file), step_id)

            if "error" in result:
                print(f"  {img_file.name} vs Step {step_id}: ERROR - {result['error'][:60]}...")
            else:
                match = result.get('match', False)
                confidence = result.get('confidence', 'unknown')
                feedback = result.get('feedback', '')[:70]

                status = "✓ MATCH" if match else "✗ NO MATCH"
                if match:
                    correct += 1

                print(f"  {img_file.name} vs Step {step_id}: {status} ({confidence})")
                print(f"    → {feedback}...")

    print("\n" + "=" * 60)
    print(f"SUMMARY: {correct}/{total} correct ({100*correct/total:.0f}%)" if total > 0 else "No tests run")
    print("=" * 60)

if __name__ == "__main__":
    main()
