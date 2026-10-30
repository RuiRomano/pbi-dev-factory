import json
import os
import subprocess
import time
from pathlib import Path
from uuid import UUID

from dotenv import load_dotenv


def run_fab(*args: str):
    result = subprocess.run(
        ["fab", *args, "--output_format", "json"],
        stdout=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        timeout=120,
    )
    if result.returncode:
        print(result.stdout, flush=True)
        result.check_returncode()
    return json.loads(result.stdout)["result"]["data"][0]


root = Path(__file__).resolve().parents[1]
load_dotenv(root / ".env")

workspace_name = os.getenv("WORKSPACE_NAME")

if not workspace_name:
    raise ValueError("Set WORKSPACE_NAME in the environment or root .env file")

print(f"Target workspace: {workspace_name}", flush=True)

models = sorted((root / "src").rglob("*.SemanticModel/.platform"))

if not models:
    raise ValueError("No semantic models found in src")

workspace_path = f"/{workspace_name}.Workspace"
workspace_id = UUID(run_fab("get", workspace_path, "-q", "id", "-f"))

for platform_file in models:
    platform = json.loads(platform_file.read_text(encoding="utf-8-sig"))
    display_name = platform["metadata"]["displayName"]
    model_id = UUID(run_fab("get", f"{workspace_path}/{display_name}.SemanticModel", "-q", "id", "-f"))
    endpoint = f"groups/{workspace_id}/datasets/{model_id}/refreshes"

    print(f"Refreshing semantic model: {display_name}", flush=True)
    response = run_fab(
        "api", "-A", "powerbi", endpoint, "-X", "post",
        "-i", json.dumps({"type": "Full"}), "--show_headers",
    )
    if response["status_code"] != 202:
        raise RuntimeError(f"Refresh request failed for {display_name}: {json.dumps(response)}")

    headers = {key.lower(): value for key, value in response["headers"].items()}
    refresh_id = (
        headers["location"].rstrip("/").rsplit("/", 1)[-1]
        if headers.get("location")
        else headers.get("requestid")
    )
    if not refresh_id:
        raise RuntimeError(f"No refresh ID returned for {display_name}: {json.dumps(response)}")
    refresh_id = UUID(refresh_id)

    timeout = time.monotonic() + 600

    while time.monotonic() < timeout:
        response = run_fab("api", "-A", "powerbi", f"{endpoint}/{refresh_id}")
        if response["status_code"] not in (200, 202):
            raise RuntimeError(f"Refresh status request failed for {display_name}: {json.dumps(response)}")

        details = response["text"]
        status = details.get("extendedStatus") or details["status"]
        print(f"{display_name}: {status}", flush=True)

        if status == "Completed":
            print(f"Refresh succeeded: {display_name}", flush=True)
            break
        if status not in ("NotStarted", "InProgress", "Unknown"):
            raise RuntimeError(f"Refresh did not complete for {display_name}: {json.dumps(details)}")
        time.sleep(5)
    else:
        raise TimeoutError(f"Refresh did not complete within 600 seconds: {display_name}")
