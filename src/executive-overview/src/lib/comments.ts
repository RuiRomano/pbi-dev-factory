import type { KpiComment } from "../../rayfin/data/KpiComment";
import { getRayfinClient } from "@/lib/rayfin-client";
import { kpis } from "@/queries";

export function listComments(kpiId: string, period: string) {
    return getRayfinClient().data.KpiComment
        .select(["id", "kpiId", "period", "body", "createdAt"])
        .where({ kpiId: { eq: kpiId }, period: { eq: period } })
        .orderBy({ createdAt: "desc" })
        .first(50)
        .execute();
}

export async function saveComment(kpiId: string, period: string, body: string, userId: string): Promise<KpiComment> {
    const trimmed = body.trim();
    if (!userId || !kpis.some(kpi => kpi.id === kpiId) || !/^\d{4}-\d{2}-\d{2}\/\d{4}-\d{2}-\d{2}$/.test(period) || !trimmed || trimmed.length > 2000) {
        throw new Error("Choose a KPI and enter a comment of 1 to 2,000 characters.");
    }
    return getRayfinClient().data.KpiComment.create({
        id: crypto.randomUUID(),
        user_id: userId,
        kpiId,
        period,
        body: trimmed,
        createdAt: new Date(),
    });
}
