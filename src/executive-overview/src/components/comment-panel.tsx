import { useEffect, useState, type FormEvent } from "react";
import type { KpiComment } from "../../rayfin/data/KpiComment";
import type { Kpi } from "@/queries";
import { useAuth } from "@/hooks/auth.context";
import { listComments, saveComment } from "@/lib/comments";
import { formatPeriod } from "@/lib/kpis";

export function CommentPanel({ kpi, start, end }: { kpi: Kpi; start: string; end: string }) {
    const { session } = useAuth();
    const [comments, setComments] = useState<KpiComment[]>([]);
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [saveError, setSaveError] = useState(false);
    const [saved, setSaved] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const period = `${start}/${end}`;
    const userId = session?.user?.id;

    useEffect(() => {
        let active = true;
        listComments(kpi.id, period)
            .then(rows => { if (active) setComments(rows); })
            .catch(() => { if (active) setLoadError(true); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [kpi.id, period, attempt]);

    async function submit(event: FormEvent) {
        event.preventDefault();
        if (loading || saving || !userId || !body.trim()) return;
        setSaving(true);
        setSaved(false);
        setSaveError(false);
        try {
            const comment = await saveComment(kpi.id, period, body, userId);
            setComments(previous => [comment, ...previous].slice(0, 50));
            setBody("");
            setSaved(true);
        } catch {
            setSaveError(true);
        } finally {
            setSaving(false);
        }
    }

    return (
        <aside className="comment-panel" aria-labelledby="comment-title">
            <p className="eyebrow">{kpi.domain} / Your perspective</p>
            <h2 id="comment-title">{kpi.label}</h2>
            <p>{kpi.description}</p>
            <p className="period">{formatPeriod(start, end)}</p>
            <form onSubmit={submit}>
                <label htmlFor="comment">Your comment</label>
                <p id="comment-help" className="supporting">Saved privately to your Fabric account for this KPI and period. Avoid personal or confidential information.</p>
                <textarea id="comment" aria-describedby="comment-help" maxLength={2000} rows={5} value={body} disabled={saving} onChange={event => { setBody(event.target.value); setSaved(false); }} />
                <div className="form-actions">
                    <span className="supporting">{body.length}/2,000</span>
                    <button className="primary" type="submit" disabled={!userId || loading || saving || !body.trim() || body.trim().length > 2000}>{saving ? "Saving..." : "Save comment"}</button>
                </div>
                {saved && <p role="status">Comment saved.</p>}
                {saveError && <p role="alert">Could not save your comment. Your text is preserved. Please try again.</p>}
            </form>
            <h3>Your recent comments</h3>
            <p className="supporting">Latest 50 for this KPI and period.</p>
            {loading && <p role="status">Loading comments...</p>}
            {loadError && <div role="alert"><p>Could not load comments.</p><button onClick={() => { setLoadError(false); setLoading(true); setAttempt(value => value + 1); }}>Retry comments</button></div>}
            {!loading && !loadError && comments.length === 0 && <p>No comments yet. Add your first perspective.</p>}
            <ul className="comments">
                {comments.map(comment => <li key={comment.id}><time dateTime={new Date(comment.createdAt).toISOString()}>{new Date(comment.createdAt).toLocaleString()}</time><p>{comment.body}</p></li>)}
            </ul>
        </aside>
    );
}
