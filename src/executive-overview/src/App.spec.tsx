//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { beforeEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import App from "@/App";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";

vi.mock("@/hooks/use-semantic-model-query", () => ({ useSemanticModelQuery: vi.fn() }));
vi.mock("@/components/comment-panel", () => ({ CommentPanel: ({ kpi }: { kpi: { label: string } }) => <aside>Comments for {kpi.label}</aside> }));

describe("App", () => {
    beforeEach(() => {
        vi.mocked(useSemanticModelQuery).mockImplementation(({ connection }) => ({
            isLoading: false, error: undefined, refetch: vi.fn(),
            data: {
                status: "success", requestId: "", fromCache: false, table: {
                    columns: ["[periodStart]", "[periodEnd]", ...(connection === "salesModel" ? ["[sales-amount]", "[sales-margin]", "[sales-quantity]", "[sales-customers]"] : ["[hr-headcount]", "[hr-fte]", "[hr-attrition]", "[hr-salary]"])].map(name => ({ name, dataType: "unknown" })),
                    rows: connection === "salesModel" ? [["2020-02-01", "2020-02-29", 53517.038, 21006.098, 239, 82]] : [["2025-12-01", "2025-12-31", 891, 868.8, 0.050174216027874564, 5939835.8333]],
                },
            },
        }));
    });

    it("shows all eight live KPIs with their independent reporting periods", () => {
        render(<App />);
        expect(screen.getAllByRole("button", { pressed: false })).toHaveLength(8);
        expect(screen.getByText("$ 53,517")).toBeInTheDocument();
        expect(screen.getByText("5.0%")).toBeInTheDocument();
        expect(screen.getByText(/1 Feb 2020 to 29 Feb 2020/)).toBeInTheDocument();
        expect(screen.getByText(/1 Dec 2025 to 31 Dec 2025/)).toBeInTheDocument();
    });

    it("selects a KPI and switches comment context between domains", () => {
        render(<App />);
        fireEvent.click(screen.getByRole("button", { name: /Sales amount/ }));
        expect(screen.getByText("Comments for Sales amount")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /^Headcount/ }));
        expect(screen.getByText("Comments for Headcount")).toBeInTheDocument();
    });

    it("shows loading, error and empty states without inventing values", () => {
        const mock = vi.mocked(useSemanticModelQuery);
        mock.mockReturnValue({ data: undefined, isLoading: true, error: undefined, refetch: vi.fn() });
        const { rerender } = render(<App />);
        expect(screen.getByText("Loading Sales metrics...")).toBeInTheDocument();
        mock.mockReturnValue({ data: undefined, isLoading: false, error: new Error("failed"), refetch: vi.fn() });
        rerender(<App />);
        expect(screen.getByText(/Could not load Sales metrics/)).toBeInTheDocument();
        mock.mockReturnValue({ data: { status: "success", requestId: "", fromCache: false, table: { columns: [], rows: [] } }, isLoading: false, error: undefined, refetch: vi.fn() });
        rerender(<App />);
        expect(screen.getByText("No Sales data is available.")).toBeInTheDocument();
    });
});
