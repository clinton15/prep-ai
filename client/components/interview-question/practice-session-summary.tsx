"use client";

import type { InterviewAnswer } from "@/types/interview-answer";
import type { InterviewQuestion } from "@/types/interview-question";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface SessionResult {
    question: InterviewQuestion;
    evaluation: InterviewAnswer | null;
    skipped: boolean;
}

interface PracticeSessionSummaryProps {
    results: SessionResult[];
    onRestart: () => void;
    onExit: () => void;
}

const WEAK_THRESHOLD = 6;

/**
 * End-of-session rollup: scores, weak topics, revision tips.
 */
export default function PracticeSessionSummary({
    results,
    onRestart,
    onExit,
}: PracticeSessionSummaryProps) {
    const evaluated = results.filter((r) => r.evaluation);
    const scores = evaluated.map((r) => r.evaluation!);

    const avg = (vals: number[]) =>
        vals.length
            ? Number(
                  (
                      vals.reduce((sum, n) => sum + n, 0) / vals.length
                  ).toFixed(1)
              )
            : null;

    const overall = avg(scores.map((s) => s.score));
    const technical = avg(
        scores
            .map((s) => s.technicalScore)
            .filter((n): n is number => n != null)
    );
    const communication = avg(
        scores
            .map((s) => s.communicationScore)
            .filter((n): n is number => n != null)
    );

    const topicBuckets = new Map<
        string,
        { total: number; count: number }
    >();

    for (const result of evaluated) {
        const topic = result.question.topic;
        const bucket = topicBuckets.get(topic) ?? { total: 0, count: 0 };
        bucket.total += result.evaluation!.score;
        bucket.count += 1;
        topicBuckets.set(topic, bucket);
    }

    const weakTopics = [...topicBuckets.entries()]
        .map(([topic, { total, count }]) => ({
            topic,
            average: Number((total / count).toFixed(1)),
        }))
        .filter((t) => t.average < WEAK_THRESHOLD)
        .sort((a, b) => a.average - b.average);

    const missingConcepts = [
        ...new Set(
            scores.flatMap((s) => s.missingConcepts ?? []).filter(Boolean)
        ),
    ].slice(0, 8);

    const skippedCount = results.filter((r) => r.skipped).length;

    return (
        <section
            className="space-y-6 rounded-xl border bg-card p-4 shadow-xs sm:p-6 animate-fade-up"
            aria-labelledby="session-summary-heading"
        >
            <header>
                <h2
                    id="session-summary-heading"
                    className="text-xl font-semibold tracking-tight"
                >
                    Session summary
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {evaluated.length} evaluated
                    {skippedCount > 0 ? ` · ${skippedCount} skipped` : ""}{" "}
                    of {results.length} questions
                </p>
            </header>

            <div className="grid gap-4 sm:grid-cols-3">
                <ScoreStat label="Overall" value={overall} />
                <ScoreStat label="Technical" value={technical} />
                <ScoreStat label="Communication" value={communication} />
            </div>

            <div>
                <h3 className="mb-2 text-sm font-medium">Weak topics</h3>
                {weakTopics.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No weak topics detected (threshold &lt; {WEAK_THRESHOLD}
                        /10).
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {weakTopics.map((item) => (
                            <li
                                key={item.topic}
                                className="flex flex-wrap items-center gap-2 text-sm"
                            >
                                <Badge variant="outline">{item.topic}</Badge>
                                <span className="text-muted-foreground">
                                    average score: {item.average}/10 — practice
                                    more {item.topic} questions
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {missingConcepts.length > 0 ? (
                <div>
                    <h3 className="mb-2 text-sm font-medium">
                        Recommended revision
                    </h3>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                        {missingConcepts.map((concept) => (
                            <li key={concept}>{concept}</li>
                        ))}
                    </ul>
                </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={onRestart}>
                    Practice again
                </Button>
                <Button type="button" variant="outline" onClick={onExit}>
                    Back to round
                </Button>
            </div>
        </section>
    );
}

function ScoreStat({
    label,
    value,
}: {
    label: string;
    value: number | null;
}) {
    return (
        <div className="rounded-lg border bg-muted/20 px-3 py-3">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
                {value != null ? value : "—"}
                {value != null ? (
                    <span className="text-sm font-normal text-muted-foreground">
                        /10
                    </span>
                ) : null}
            </p>
        </div>
    );
}
