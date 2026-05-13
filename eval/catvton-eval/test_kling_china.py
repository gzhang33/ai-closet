#!/usr/bin/env python3
"""Test Kling China (api-beijing.klingai.com) Virtual Try-On API."""
import base64, json, os, sys, time, jwt, requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

ACCESS_KEY = "AmdJ3JynhgAag3GaH83gpebEGnLKrynQ"
SECRET_KEY = "tMrTbbAttTypehrCkn4LbQNCk8EypHty"
API_BASE = "https://api-beijing.klingai.com"

def generate_token():
    now = int(time.time())
    headers = {"alg": "HS256", "typ": "JWT"}
    payload = {"iss": ACCESS_KEY, "exp": now + 1800, "nbf": now - 5}
    return jwt.encode(payload, SECRET_KEY, headers=headers)

def create_task(token, human_b64, cloth_b64, model="kolors-virtual-try-on-v1-5"):
    resp = requests.post(
        f"{API_BASE}/v1/images/kolors-virtual-try-on",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
        json={
            "model_name": model,
            "human_image": human_b64,
            "cloth_image": cloth_b64,
        },
        timeout=30,
    )
    data = resp.json()
    if data.get("code") != 0:
        raise Exception(f"Create task failed (code={data.get('code')}): {data.get('message', resp.text)}")
    return data["data"]["task_id"]

def query_task(token, task_id):
    resp = requests.get(
        f"{API_BASE}/v1/images/kolors-virtual-try-on/{task_id}",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
        timeout=30,
    )
    data = resp.json()
    if data.get("code") != 0:
        raise Exception(f"Query task failed: {data.get('message', resp.text)}")
    return data["data"]

def img_to_b64(path):
    from PIL import Image
    import io
    img = Image.open(path).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def main():
    output_dir = os.path.join(SCRIPT_DIR, "output")
    results_dir = os.path.join(SCRIPT_DIR, "results")
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(results_dir, exist_ok=True)

    # Test pairs from benchmark - use same images as CatVTON eval
    demo_base = os.path.join(SCRIPT_DIR, "catvton_repo/resource/demo/example")
    test_pairs = [
        {
            "name": "men_upper_Yifeng",
            "person": f"{demo_base}/person/men/Yifeng_0.png",
            "cloth": f"{demo_base}/condition/upper/24083449_54173465_2048.jpg",
        },
        {
            "name": "men_upper_Simon",
            "person": f"{demo_base}/person/men/Simon_1.png",
            "cloth": f"{demo_base}/condition/upper/24083449_54173465_2048.jpg",
        },
    ]

    # Verify images exist
    for pair in test_pairs:
        if not os.path.exists(pair["person"]) or not os.path.exists(pair["cloth"]):
            print(f"ERROR: Images not found for {pair['name']}")
            print(f"  person: {pair['person']} (exists={os.path.exists(pair['person'])})")
            print(f"  cloth: {pair['cloth']} (exists={os.path.exists(pair['cloth'])})")
            sys.exit(1)

    print("=== Kling China API (api-beijing.klingai.com) Virtual Try-On Test ===\n")
    print(f"API Base: {API_BASE}")
    print(f"Access Key: {ACCESS_KEY[:8]}...")
    print(f"Model: kolors-virtual-try-on-v1-5")
    print(f"Test pairs: {len(test_pairs)}\n")

    # Step 1: Token
    print("[1] Generating JWT token...", end=" ", flush=True)
    t0 = time.time()
    token = generate_token()
    token_time = time.time() - t0
    print(f"OK ({token_time:.2f}s)")

    all_results = []

    for idx, pair in enumerate(test_pairs):
        print(f"\n--- Test {idx+1}/{len(test_pairs)}: {pair['name']} ---")

        # Encode
        print("  Encoding images...", end=" ", flush=True)
        t0 = time.time()
        human_b64 = img_to_b64(pair["person"])
        cloth_b64 = img_to_b64(pair["cloth"])
        encode_time = time.time() - t0
        print(f"OK ({encode_time:.2f}s, human={len(human_b64)//1024}KB, cloth={len(cloth_b64)//1024}KB)")

        # Create task
        print("  Creating try-on task...", end=" ", flush=True)
        t0 = time.time()
        try:
            task_id = create_task(token, human_b64, cloth_b64)
            create_time = time.time() - t0
            print(f"OK ({create_time:.2f}s, task_id={task_id})")
        except Exception as e:
            create_time = time.time() - t0
            print(f"FAILED ({create_time:.2f}s)")
            print(f"  Error: {e}")
            all_results.append({
                "name": pair["name"], "success": False, "error": str(e),
                "timing": {"token_s": token_time, "encode_s": encode_time, "create_s": create_time},
            })
            continue

        # Poll
        print("  Polling for result", end="", flush=True)
        poll_start = time.time()
        max_retries = 60
        result_url = None
        poll_error = None
        deduction = None
        for i in range(max_retries):
            try:
                task_data = query_task(token, task_id)
                status = task_data["task_status"]
                if status == "succeed":
                    result_url = task_data["task_result"]["images"][0]["url"]
                    deduction = task_data.get("final_unit_deduction", "unknown")
                    break
                elif status == "failed":
                    poll_error = task_data.get("task_status_msg", "Task failed")
                    break
                else:
                    print(".", end="", flush=True)
                    time.sleep(2)
            except Exception as e:
                poll_error = str(e)
                break

        poll_time = time.time() - poll_start

        if result_url:
            print(f" OK ({poll_time:.1f}s)")
            # Download
            print("  Downloading result...", end=" ", flush=True)
            t0 = time.time()
            out_path = os.path.join(output_dir, f"kling_cn_{pair['name']}.jpg")
            resp = requests.get(result_url, timeout=30)
            with open(out_path, "wb") as f:
                f.write(resp.content)
            dl_time = time.time() - t0
            print(f"OK ({dl_time:.2f}s, {len(resp.content)//1024}KB)")

            total_time = token_time + encode_time + create_time + poll_time + dl_time
            all_results.append({
                "name": pair["name"], "success": True, "error": None,
                "timing": {
                    "token_s": round(token_time, 2),
                    "encode_s": round(encode_time, 2),
                    "create_s": round(create_time, 2),
                    "poll_s": round(poll_time, 1),
                    "download_s": round(dl_time, 2),
                    "total_s": round(total_time, 1),
                },
                "task_id": task_id,
                "result_url": result_url,
                "deduction": deduction,
                "output": out_path,
                "config": {
                    "provider": "kling_china",
                    "api_base": API_BASE,
                    "model": "kolors-virtual-try-on-v1-5",
                },
            })
        else:
            print(f" FAILED ({poll_time:.1f}s)")
            print(f"  Error: {poll_error}")
            all_results.append({
                "name": pair["name"], "success": False, "error": poll_error,
                "timing": {
                    "token_s": round(token_time, 2),
                    "encode_s": round(encode_time, 2),
                    "create_s": round(create_time, 2),
                    "poll_s": round(poll_time, 1),
                },
                "task_id": task_id,
            })

    # Summary
    success_count = sum(1 for r in all_results if r["success"])
    print(f"\n{'='*50}")
    print(f"Kling China API Summary")
    print(f"{'='*50}")
    print(f"Total: {len(all_results)} | Success: {success_count} | Failed: {len(all_results) - success_count}")

    for r in all_results:
        status = "OK" if r["success"] else "FAIL"
        t = r["timing"]
        total = t.get("total_s", t.get("create_s", 0) + t.get("poll_s", 0))
        deduction = r.get("deduction", "N/A")
        print(f"  [{status}] {r['name']}: total={total}s, deduction={deduction}")

    # Save results
    result_path = os.path.join(results_dir, "kling_china_result.json")
    with open(result_path, "w") as f:
        json.dump({"meta": {
            "provider": "kling_china",
            "api_base": API_BASE,
            "model": "kolors-virtual-try-on-v1-5",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        }, "results": all_results}, f, indent=2)
    print(f"\nResults saved: {result_path}")

    return 0 if success_count == len(all_results) else 1

if __name__ == "__main__":
    sys.exit(main())
