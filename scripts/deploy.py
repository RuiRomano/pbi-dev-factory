import os
from pathlib import Path
from azure.identity import InteractiveBrowserCredential, AzureCliCredential, EnvironmentCredential
from dotenv import load_dotenv
from fabric_cicd import FabricWorkspace, publish_all_items

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

environment = (os.getenv("ENVIRONMENT") or "").strip().upper() or "DEV"
workspace_name = os.getenv("WORKSPACE_NAME")
auth_mode = (os.getenv("AUTH") or "INTERACTIVE").strip().upper()

if not workspace_name:
    raise ValueError("Set WORKSPACE_NAME in the environment or root .env file")

print(f"Auth Mode: {auth_mode}", flush=True)

# Authentication (SPN or Interactive)

if auth_mode == "INTERACTIVE":
    credential = InteractiveBrowserCredential()
elif auth_mode == "SPN":    
    credential = EnvironmentCredential()
elif auth_mode == "CLI":    
    credential = AzureCliCredential()
else:
    raise ValueError("AUTH must be INTERACTIVE, SPN or CLI")

print(f"Deployment environment: {environment}", flush=True)

print(f"Target workspace: {workspace_name}", flush=True)

workspace_params = {
    "workspace_name": workspace_name,
    "environment": environment,
    "repository_directory": "./src",
    "item_type_in_scope": ["SemanticModel", "Report"],
    "token_credential": credential,
}

target_workspace = FabricWorkspace(**workspace_params)

publish_all_items(target_workspace)