import type { FabricSemanticModel } from "@microsoft/rayfin-connector-fabric-semanticmodel";

export type SalesModelSchema = FabricSemanticModel<"executeQuery">;
export const connectorConfig = { connector: "fabric-semanticmodel" } as const;
