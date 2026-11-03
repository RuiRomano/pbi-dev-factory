import { beforeEach, describe, expect, it, vi } from "vitest";
import { listComments, saveComment } from "./comments";

const { entity, create } = vi.hoisted(() => ({ entity: { select: vi.fn(), where: vi.fn(), orderBy: vi.fn(), first: vi.fn(), execute: vi.fn() }, create: vi.fn() }));
vi.mock("@/lib/rayfin-client", () => ({ getRayfinClient: () => ({ data: { KpiComment: { ...entity, create } } }) }));

beforeEach(() => {
    vi.clearAllMocks();
    entity.select.mockReturnValue(entity);
    entity.where.mockReturnValue(entity);
    entity.orderBy.mockReturnValue(entity);
    entity.first.mockReturnValue(entity);
    entity.execute.mockResolvedValue([]);
    create.mockResolvedValue({ id: "saved" });
});

describe("persistent KPI comments", () => {
    it("uses a bounded, period-specific query", async () => {
        await listComments("sales-amount", "2020-02-01/2020-02-29");
        expect(entity.where).toHaveBeenCalledWith({ kpiId: { eq: "sales-amount" }, period: { eq: "2020-02-01/2020-02-29" } });
        expect(entity.first).toHaveBeenCalledWith(50);
        expect(entity.orderBy).toHaveBeenCalledWith({ createdAt: "desc" });
    });

    it("saves trimmed plain text with the authenticated owner and KPI period", async () => {
        await saveComment("sales-amount", "2020-02-01/2020-02-29", "  Review revenue  ", "user-1");
        expect(create).toHaveBeenCalledWith(expect.objectContaining({ user_id: "user-1", kpiId: "sales-amount", period: "2020-02-01/2020-02-29", body: "Review revenue", createdAt: expect.any(Date) }));
    });

    it.each(["", "  ", "a".repeat(2001)])("rejects blank and oversized comments", async body => {
        await expect(saveComment("sales-amount", "2020-02-01/2020-02-29", body, "user-1")).rejects.toThrow();
        expect(create).not.toHaveBeenCalled();
    });

    it("rejects invalid KPI, period and missing identity", async () => {
        await expect(saveComment("invalid", "2020-02-01/2020-02-29", "text", "user-1")).rejects.toThrow();
        await expect(saveComment("sales-amount", "", "text", "user-1")).rejects.toThrow();
        await expect(saveComment("sales-amount", "2020-02-01/2020-02-29", "text", "")).rejects.toThrow();
        expect(create).not.toHaveBeenCalled();
    });
});
