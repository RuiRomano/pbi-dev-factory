//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useState } from "react";
import { domains, kpis, type Kpi } from "@/queries";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { formatKpi, formatPeriod, readOverview } from "@/lib/kpis";
import { CommentPanel } from "@/components/comment-panel";
import "./executive.css";

type Selection = { kpi: Kpi; start: string; end: string };

function DomainOverview({ domain, selection, select }: { domain: typeof domains[number]; selection: Selection | null; select: (selection: Selection) => void }) {
    const { data, isLoading, error, refetch } = useSemanticModelQuery(domain);
    const overview = data?.status === "success" ? readOverview(data.table) : null;
    return (
        <section className="domain" aria-labelledby={`${domain.connection}-title`}>
            <div className="section-heading">
                <div><p className="eyebrow">{domain.name === "Sales" ? "01 / Performance" : "02 / People"}</p><h2 id={`${domain.connection}-title`}>{domain.name === "Sales" ? "Sales at a glance" : "Our workforce"}</h2></div>
                <button disabled={isLoading} onClick={() => void refetch()} aria-label={`Refresh ${domain.name}`}>Refresh</button>
            </div>
            {isLoading ? <p role="status">Loading {domain.name} metrics...</p>
                : error || data?.status === "error" ? <div role="alert"><p>Could not load {domain.name} metrics. Check your model permissions and try Refresh.</p></div>
                : !overview ? <p>No {domain.name} data is available.</p>
                : <>
                    <p className="period">Latest available period: {formatPeriod(overview.start, overview.end)}</p>
                    <div className="kpi-grid">
                        {kpis.filter(kpi => kpi.domain === domain.name).map(kpi => {
                            const available = typeof overview.row[`[${kpi.id}]`] === "number";
                            return <button key={kpi.id} className="kpi-card" aria-pressed={selection?.kpi.id === kpi.id} disabled={!available} onClick={() => select({ kpi, start: overview.start, end: overview.end })}>
                                <span className="kpi-label">{kpi.label}</span>
                                <span className="kpi-value">{formatKpi(overview.row[`[${kpi.id}]`], kpi.format)}</span>
                                <span className="supporting">{kpi.id === "hr-attrition" ? "Trailing 12 complete months" : kpi.id === "hr-salary" ? "Synthetic currency units" : domain.name === "HR" ? "Month-end snapshot" : "Latest available sales month"}</span>
                                <span className="card-action">{available ? "Select to comment" : "No value in this period"}</span>
                            </button>;
                        })}
                    </div>
                </>}
        </section>
    );
}

function App() {
    const [selection, setSelection] = useState<Selection | null>(null);
    return (
        <div className="executive-app">
            <header className="brand"><svg width="40" height="40" viewBox="0 0 56 56" aria-hidden="true"><path fill="#536CE5" d="M18 7h32L40 21H25l-8 10 8 11h15l10 14H18L0 31z" /><path fill="#C8BCF4" d="M18 7h32L40 21H27z" /></svg><span>contoso</span><span className="brand-divider">Executive overview</span></header>
            <main>
                <div className="intro"><p className="eyebrow">Sales &amp; HR / Development prototype</p><h1>A clearer view.<br /><strong>A shared direction.</strong></h1><p>Key metrics, with room for your perspective. Select a KPI to save a private comment.</p></div>
                <div className="workspace">
                    <div>{domains.map(domain => <DomainOverview key={domain.connection} domain={domain} selection={selection} select={setSelection} />)}</div>
                    {selection ? <CommentPanel key={`${selection.kpi.id}/${selection.start}/${selection.end}`} {...selection} /> : <aside className="comment-panel empty-panel"><p className="eyebrow">Your perspective</p><h2>Start with a metric.</h2><p>Select a Sales or HR card to review its definition and save a comment.</p><p className="supporting">Each model uses its own latest available period. These are sample models, not current business results.</p></aside>}
                </div>
            </main>
            <footer>Contoso / Executive insights <span>Live semantic models. Private, persistent comments.</span></footer>
        </div>
    );
}

export default App;
