import json
import os
import subprocess
from pathlib import Path
from uuid import UUID

from dotenv import load_dotenv

root = Path(__file__).resolve().parents[1]
load_dotenv(root / ".env")

workspace_name = os.getenv("WORKSPACE_NAME")

if not workspace_name:
    raise ValueError("Set WORKSPACE_NAME in the environment or root .env file")

print(f"Target workspace: {workspace_name}", flush=True)

models = sorted((root / "src").rglob("*.SemanticModel/.platform"))

if not models:
    raise ValueError("No semantic models found in src")

query = json.dumps({"queries": [{"query": "EVALUATE TESTS()"}]})
failed_tests: list[str] = []

for platform_file in models:
    platform = json.loads(platform_file.read_text(encoding="utf-8-sig"))
    display_name = platform["metadata"]["displayName"]

    print(f"Testing semantic model: {display_name}", flush=True)

    result = subprocess.run(
        [
            "fab", "get", f"/{workspace_name}.Workspace/{display_name}.SemanticModel",
            "-q", "id", "--output_format", "json", "-f",
        ],
        stdout=subprocess.PIPE,
        text=True,
        encoding="utf-8",
    )
    if result.returncode:
        print(result.stdout, flush=True)
        result.check_returncode()

    response = json.loads(result.stdout)
    model_id = UUID(response["result"]["data"][0])

    query_result = subprocess.run(
        [
            "fab", "api", "-A", "powerbi", f"datasets/{model_id}/executeQueries",
            "-X", "post", "-i", query, "--output_format", "json",
        ],
        stdout=subprocess.PIPE,
        text=True,
        encoding="utf-8",
    )
    if query_result.returncode:
        print(query_result.stdout, flush=True)
    query_result.check_returncode()

    query_response = json.loads(query_result.stdout)
    api_result = query_response["result"]["data"][0]
    test_results = api_result["text"]
    if api_result["status_code"] != 200 or "error" in test_results:
        raise RuntimeError(f"Query failed for {display_name}: {json.dumps(api_result)}")

    for test_result in test_results["results"]:
        if "error" in test_result:
            raise RuntimeError(f"Query failed for {display_name}: {json.dumps(test_result)}")
        for table in test_result["tables"]:
            columns = ["TestName", "Expected", "Actual", "Passed"]
            table_rows = [columns] + [
                [" ".join(str(row.get(f"[{column}]", "")).splitlines()) for column in columns]
                for row in table["rows"]
            ]
            widths = [max(len(row[index]) for row in table_rows) for index in range(len(columns))]
            for index, cells in enumerate(table_rows):
                print(" | ".join(cell.ljust(width) for cell, width in zip(cells, widths)), flush=True)
                if index == 0:
                    print("-+-".join("-" * width for width in widths), flush=True)

            for row in table["rows"]:
                if row.get("[Passed]") is not True:
                    failed_tests.append(f"{display_name}: {json.dumps(row)}")

if failed_tests:
    raise RuntimeError("Semantic model tests failed:\n" + "\n".join(failed_tests))
