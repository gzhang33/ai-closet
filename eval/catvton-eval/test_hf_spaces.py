#!/usr/bin/env python3
"""Test HuggingFace Spaces Virtual Try-On APIs (free).

Demonstrates two calling methods:
1. gradio_client (Python SDK)
2. REST API (HTTP, no SDK needed)
"""
import base64, io, json, os, sys, time, requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ============================================================
# Method 1: gradio_client (recommended for Python)
# ============================================================

def test_gradio_client():
    """Call HF Space using gradio_client library."""
    try:
        from gradio_client import Client, handle_file
    except ImportError:
        print("gradio_client not installed. Run: pip install gradio_client")
        return None

    demo_base = os.path.join(SCRIPT_DIR, "catvton_repo/resource/demo/example")
    person_path = f"{demo_base}/person/men/Yifeng_0.png"
    cloth_path = f"{demo_base}/condition/upper/24083449_54173465_2048.jpg"

    # --- Kolors Virtual Try-On ---
    print("\n[Method 1] gradio_client - Kolors VTO")
    print("  Connecting to space...", end=" ", flush=True)
    t0 = time.time()

    try:
        client = Client("Kwai-Kolors/Kolors-Virtual-Try-On")
        print(f"OK ({time.time()-t0:.1f}s)")

        # View available API endpoints
        # print(client.view_api())

        print("  Calling predict...", end=" ", flush=True)
        t0 = time.time()
        result = client.predict(
            person_image=handle_file(person_path),
            garment_image=handle_file(cloth_path),
            api_name="/predict",
        )
        elapsed = time.time() - t0
        print(f"OK ({elapsed:.1f}s)")

        # result is typically a file path or URL
        print(f"  Result: {result}")
        return result
    except Exception as e:
        print(f"FAILED: {e}")
        return None


# ============================================================
# Method 2: REST API (no SDK dependency)
# ============================================================

def test_rest_api():
    """Call HF Space using raw HTTP requests (Gradio SSE protocol).

    Gradio Spaces expose a REST API:
    1. POST /call/{api_name}  -> returns event_id
    2. GET  /call/{api_name}/{event_id}  -> SSE stream with result
    """
    demo_base = os.path.join(SCRIPT_DIR, "catvton_repo/resource/demo/example")
    person_path = f"{demo_base}/person/men/Yifeng_0.png"
    cloth_path = f"{demo_base}/condition/upper/24083449_54173465_2048.jpg"

    def img_to_data_url(path):
        """Convert local image to base64 data URL."""
        from PIL import Image
        img = Image.open(path).convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64}"

    # --- Kolors Virtual Try-On via REST ---
    space_url = "https://kwai-kolors-kolors-virtual-try-on.hf.space"
    api_name = "predict"

    print(f"\n[Method 2] REST API - Kolors VTO")
    print(f"  Space URL: {space_url}")

    # Step 1: Submit request
    print("  Submitting request...", end=" ", flush=True)
    t0 = time.time()

    try:
        resp = requests.post(
            f"{space_url}/call/{api_name}",
            json={"data": [
                {"path": img_to_data_url(person_path), "meta": {"_type": "gradio.FileData"}},
                {"path": img_to_data_url(cloth_path), "meta": {"_type": "gradio.FileData"}},
            ]},
            timeout=30,
        )
        resp.raise_for_status()
        event_id = resp.json().get("event_id")
        print(f"OK ({time.time()-t0:.1f}s, event_id={event_id})")
    except Exception as e:
        print(f"FAILED: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"  Response: {e.response.text[:500]}")
        return None

    # Step 2: Poll for result (SSE stream)
    print("  Waiting for result...", end=" ", flush=True)
    max_wait = 300  # 5 minutes max (CPU is slow)
    start = time.time()

    try:
        resp = requests.get(
            f"{space_url}/call/{api_name}/{event_id}",
            stream=True,
            timeout=max_wait,
        )
        resp.raise_for_status()

        result_data = None
        for line in resp.iter_lines(decode_unicode=True):
            if not line:
                continue
            if line.startswith("event:"):
                event_type = line.split(":", 1)[1].strip()
                if event_type == "error":
                    print(f"\n  ERROR event received")
                continue
            if line.startswith("data:"):
                payload = line.split(":", 1)[1].strip()
                try:
                    parsed = json.loads(payload)
                    result_data = parsed
                    elapsed = time.time() - start
                    print(f"OK ({elapsed:.1f}s)")
                    print(f"  Result: {json.dumps(parsed, indent=2)[:500]}")

                    # Try to download result image
                    output_dir = os.path.join(SCRIPT_DIR, "output")
                    os.makedirs(output_dir, exist_ok=True)

                    if isinstance(parsed, list) and len(parsed) > 0:
                        img_info = parsed[0]
                        if isinstance(img_info, dict) and "url" in img_info:
                            img_url = img_info["url"]
                            if img_url.startswith("/"):
                                img_url = f"https://huggingface.co{img_url}"
                            print(f"  Downloading: {img_url[:80]}...")
                            img_resp = requests.get(img_url, timeout=30)
                            out_path = os.path.join(output_dir, "hf_kolors_rest_result.png")
                            with open(out_path, "wb") as f:
                                f.write(img_resp.content)
                            print(f"  Saved: {out_path} ({len(img_resp.content)//1024}KB)")

                    return result_data
                except json.JSONDecodeError:
                    pass

        if result_data is None:
            print(f"TIMEOUT ({time.time()-start:.0f}s)")
            return None

    except Exception as e:
        print(f"FAILED: {e}")
        return None


# ============================================================
# Method 3: Leffa (MIT license, higher quality)
# ============================================================

def test_leffa():
    """Call Leffa virtual try-on via gradio_client."""
    try:
        from gradio_client import Client, handle_file
    except ImportError:
        print("gradio_client not installed.")
        return None

    demo_base = os.path.join(SCRIPT_DIR, "catvton_repo/resource/demo/example")
    person_path = f"{demo_base}/person/men/Yifeng_0.png"
    cloth_path = f"{demo_base}/condition/upper/24083449_54173465_2048.jpg"

    print("\n[Method 3] gradio_client - Leffa (MIT license)")
    print("  Connecting to space...", end=" ", flush=True)
    t0 = time.time()

    try:
        client = Client("franciszzj/Leffa")
        print(f"OK ({time.time()-t0:.1f}s)")

        # First, view available APIs to find the right endpoint
        print("  Discovering API endpoints...")
        api_info = client.view_api()

        # Leffa endpoint: /leffa_predict_vt (virtual try-on)
        print("  Calling virtual try-on...", end=" ", flush=True)
        t0 = time.time()
        result = client.predict(
            src_image_path=handle_file(person_path),
            ref_image_path=handle_file(cloth_path),
            ref_acceleration=False,
            step=30,
            scale=2.5,
            seed=42,
            vt_model_type="viton_hd",
            vt_garment_type="upper_body",
            vt_repaint=False,
            api_name="/leffa_predict_vt",
        )
        elapsed = time.time() - t0
        print(f"OK ({time.time()-t0:.1f}s)")
        print(f"  Result: {result}")

        # Download result image if available
        output_dir = os.path.join(SCRIPT_DIR, "output")
        os.makedirs(output_dir, exist_ok=True)

        # result is (generated_image, generated_mask, generated_densepose)
        if isinstance(result, tuple) and len(result) >= 1:
            img_info = result[0]
            if isinstance(img_info, dict) and "url" in img_info:
                img_url = img_info["url"]
                print(f"  Downloading result image...")
                img_resp = requests.get(img_url, timeout=30)
                out_path = os.path.join(output_dir, "hf_leffa_result.png")
                with open(out_path, "wb") as f:
                    f.write(img_resp.content)
                print(f"  Saved: {out_path} ({len(img_resp.content)//1024}KB)")
            elif isinstance(img_info, dict) and "path" in img_info:
                print(f"  Local path: {img_info['path']}")

        return result
    except Exception as e:
        print(f"FAILED: {e}")
        return None


def test_miragic():
    """Call Miragic Virtual Try-On via gradio_client (free, CPU-based)."""
    try:
        from gradio_client import Client, handle_file
    except ImportError:
        print("gradio_client not installed.")
        return None

    demo_base = os.path.join(SCRIPT_DIR, "catvton_repo/resource/demo/example")
    person_path = f"{demo_base}/person/men/Yifeng_0.png"
    cloth_path = f"{demo_base}/condition/upper/24083449_54173465_2048.jpg"

    print("\n[Miragic VTO] gradio_client (free HF Space)")
    print("  Connecting...", end=" ", flush=True)
    t0 = time.time()

    try:
        client = Client("Miragic-AI/Miragic-Virtual-Try-On")
        print(f"OK ({time.time()-t0:.1f}s)")

        print("  Calling virtual_tryon (CPU, may take minutes)...", end=" ", flush=True)
        t0 = time.time()
        result = client.predict(
            human_img=handle_file(person_path),
            garment_img=handle_file(cloth_path),
            garment_type="Top",
            api_name="/virtual_tryon",
        )
        elapsed = time.time() - t0
        print(f"OK ({elapsed:.1f}s)")
        print(f"  Result: {result}")

        output_dir = os.path.join(SCRIPT_DIR, "output")
        os.makedirs(output_dir, exist_ok=True)

        if isinstance(result, dict) and "url" in result:
            img_url = result["url"]
            print(f"  Downloading: {img_url[:80]}...")
            img_resp = requests.get(img_url, timeout=30)
            out_path = os.path.join(output_dir, "hf_miragic_result.png")
            with open(out_path, "wb") as f:
                f.write(img_resp.content)
            print(f"  Saved: {out_path} ({len(img_resp.content)//1024}KB)")
        elif isinstance(result, dict) and "path" in result:
            import shutil
            out_path = os.path.join(output_dir, "hf_miragic_result.png")
            shutil.copy2(result["path"], out_path)
            print(f"  Saved: {out_path}")

        return result
    except Exception as e:
        print(f"FAILED ({time.time()-t0:.1f}s): {e}")
        return None


def main():
    print("=== HuggingFace Spaces Virtual Try-On API Test ===\n")

    results = {}

    # Kolors Space has no API endpoints exposed - skip
    print("[INFO] Kolors VTO Space has no API endpoints exposed, skipping.\n")

    # Test Miragic (free, has API)
    results["gradio_miragic"] = test_miragic()

    # Test Leffa (MIT license, GPU-based)
    results["gradio_leffa"] = test_leffa()

    # Summary
    print(f"\n{'='*50}")
    print("Summary")
    print(f"{'='*50}")
    for name, result in results.items():
        status = "OK" if result else "FAILED"
        print(f"  [{status}] {name}")

    results_dir = os.path.join(SCRIPT_DIR, "results")
    os.makedirs(results_dir, exist_ok=True)
    with open(os.path.join(results_dir, "hf_spaces_result.json"), "w") as f:
        json.dump({
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "results": {k: "success" if v else "failed" for k, v in results.items()},
        }, f, indent=2)


if __name__ == "__main__":
    main()
