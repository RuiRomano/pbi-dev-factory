import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CommentPanel } from "./comment-panel";
import { listComments, saveComment } from "@/lib/comments";
import { kpis } from "@/queries";

vi.mock("@/hooks/auth.context", () => ({ useAuth: () => ({ session: { user: { id: "user-1" } } }) }));
vi.mock("@/lib/comments", () => ({ listComments: vi.fn(), saveComment: vi.fn() }));
const props = { kpi: kpis[0], start: "2020-02-01", end: "2020-02-29" };

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listComments).mockResolvedValue([]);
    vi.mocked(saveComment).mockResolvedValue({ id: "comment-1", user_id: "user-1", kpiId: "sales-amount", period: "2020-02-01/2020-02-29", body: "<script>plain text</script>", createdAt: new Date("2026-11-03T14:00:00Z") });
});

describe("comment panel", () => {
    it("saves, confirms only after success, and reloads stored plain text on remount", async () => {
        const { unmount } = render(<CommentPanel {...props} />);
        await screen.findByText(/No comments yet/);
        const save = screen.getByRole("button", { name: "Save comment" });
        expect(save).toBeDisabled();
        fireEvent.change(screen.getByLabelText("Your comment"), { target: { value: "<script>plain text</script>" } });
        fireEvent.click(save);
        await screen.findByText("Comment saved.");
        expect(saveComment).toHaveBeenCalledWith("sales-amount", "2020-02-01/2020-02-29", "<script>plain text</script>", "user-1");
        expect(document.querySelector("script")).toBeNull();
        expect(screen.getByLabelText("Your comment")).toHaveValue("");
        const stored = await vi.mocked(saveComment).mock.results[0].value;
        unmount();
        vi.mocked(listComments).mockResolvedValue([stored]);
        render(<CommentPanel {...props} />);
        expect(await screen.findByText("<script>plain text</script>")).toBeInTheDocument();
    });

    it("keeps the draft and allows retry after a failed save", async () => {
        vi.mocked(saveComment).mockRejectedValue(new Error("offline"));
        render(<CommentPanel {...props} />);
        await screen.findByText(/No comments yet/);
        fireEvent.change(screen.getByLabelText("Your comment"), { target: { value: "Keep my draft" } });
        fireEvent.click(screen.getByRole("button", { name: "Save comment" }));
        await screen.findByRole("alert");
        expect(screen.getByLabelText("Your comment")).toHaveValue("Keep my draft");
        expect(screen.queryByText("Comment saved.")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Save comment" })).toBeEnabled();
    });

    it("reports load failure and retries", async () => {
        vi.mocked(listComments).mockRejectedValueOnce(new Error("offline"));
        render(<CommentPanel {...props} />);
        fireEvent.click(await screen.findByRole("button", { name: "Retry comments" }));
        await waitFor(() => expect(listComments).toHaveBeenCalledTimes(2));
        expect(await screen.findByText(/No comments yet/)).toBeInTheDocument();
    });
});
