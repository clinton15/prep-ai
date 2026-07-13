"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type {
    InterviewQuestion,
    QuestionDifficulty,
} from "@/types/interview-question";
import { QUESTION_DIFFICULTIES } from "@/types/interview-question";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface StartPracticeSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    processId: string;
    roundId: string;
    questions: InterviewQuestion[];
}

/**
 * Configure and start a timed practice session over existing questions.
 */
export default function StartPracticeSessionDialog({
    open,
    onOpenChange,
    processId,
    roundId,
    questions,
}: StartPracticeSessionDialogProps) {
    const router = useRouter();
    const [count, setCount] = useState(
        Math.min(10, Math.max(1, questions.length))
    );
    const [difficulty, setDifficulty] = useState<QuestionDifficulty | "">("");
    const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

    const eligible = useMemo(() => {
        let pool = questions.filter((q) => !q.isFollowUp);
        if (difficulty) {
            pool = pool.filter((q) => q.difficulty === difficulty);
        }
        if (bookmarkedOnly) {
            pool = pool.filter((q) => q.isBookmarked);
        }
        return pool;
    }, [questions, difficulty, bookmarkedOnly]);

    const maxCount = Math.max(1, eligible.length);

    function startSession() {
        const n = Math.min(Math.max(1, count), maxCount);
        const params = new URLSearchParams({
            session: "1",
            count: String(n),
        });
        if (difficulty) params.set("difficulty", difficulty);
        if (bookmarkedOnly) params.set("bookmarked", "1");

        onOpenChange(false);
        router.push(
            `/interviews/${processId}/rounds/${roundId}/practice?${params.toString()}`
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Start practice session</DialogTitle>
                    <DialogDescription>
                        Choose how many questions to practice. You will answer
                        each one, get AI feedback, then see a session summary.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <div>
                        <label
                            htmlFor="session-count"
                            className="mb-1 block text-sm font-medium"
                        >
                            Number of questions
                        </label>
                        <Input
                            id="session-count"
                            type="number"
                            min={1}
                            max={maxCount}
                            value={count}
                            onChange={(event) => {
                                const next = event.target.valueAsNumber;
                                setCount(
                                    Number.isNaN(next) ? 1 : next
                                );
                            }}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                            {eligible.length} eligible
                            {difficulty || bookmarkedOnly
                                ? " with current filters"
                                : ""}
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="session-difficulty"
                            className="mb-1 block text-sm font-medium"
                        >
                            Difficulty (optional)
                        </label>
                        <Select
                            id="session-difficulty"
                            value={difficulty}
                            onChange={(event) =>
                                setDifficulty(
                                    (event.target.value ||
                                        "") as QuestionDifficulty | ""
                                )
                            }
                        >
                            <option value="">Any</option>
                            {QUESTION_DIFFICULTIES.map((level) => (
                                <option key={level} value={level}>
                                    {level}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={bookmarkedOnly}
                            onChange={(event) =>
                                setBookmarkedOnly(event.target.checked)
                            }
                            className="size-4 rounded border"
                        />
                        Bookmarked questions only
                    </label>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={eligible.length === 0}
                        onClick={startSession}
                    >
                        Start session
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
