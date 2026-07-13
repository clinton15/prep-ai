"use client";

import { useMemo, useState } from "react";

import type {
    QuestionDifficulty,
    QuestionFilters,
    QuestionStatus,
} from "@/types/interview-question";
import {
    QUESTION_DIFFICULTIES,
    QUESTION_STATUSES,
} from "@/types/interview-question";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface InterviewQuestionFiltersProps {
    topics: string[];
    filters: QuestionFilters;
    onChange: (filters: QuestionFilters) => void;
}

/**
 * Filter / search / sort controls for a round's question list.
 */
export default function InterviewQuestionFilters({
    topics,
    filters,
    onChange,
}: InterviewQuestionFiltersProps) {
    const [searchInput, setSearchInput] = useState(filters.search ?? "");

    const uniqueTopics = useMemo(
        () => [...new Set(topics)].sort((a, b) => a.localeCompare(b)),
        [topics]
    );

    function patch(partial: Partial<QuestionFilters>) {
        onChange({ ...filters, ...partial });
    }

    function clearFilters() {
        setSearchInput("");
        onChange({
            sort: "order",
            order: "asc",
            includeFollowUps: true,
        });
    }

    const hasActiveFilters = Boolean(
        filters.topic ||
            filters.difficulty ||
            filters.status ||
            filters.bookmarked ||
            filters.search
    );

    return (
        <div
            className="mb-4 space-y-3 rounded-xl border bg-card p-3 sm:p-4"
            role="search"
            aria-label="Filter questions"
        >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <div className="xl:col-span-2">
                    <label
                        htmlFor="question-search"
                        className="mb-1 block text-xs font-medium text-muted-foreground"
                    >
                        Search
                    </label>
                    <Input
                        id="question-search"
                        type="search"
                        placeholder="Search questions..."
                        value={searchInput}
                        onChange={(event) => {
                            const value = event.target.value;
                            setSearchInput(value);
                            patch({
                                search: value.trim() || undefined,
                            });
                        }}
                    />
                </div>

                <div>
                    <label
                        htmlFor="question-topic"
                        className="mb-1 block text-xs font-medium text-muted-foreground"
                    >
                        Topic
                    </label>
                    <Select
                        id="question-topic"
                        value={filters.topic ?? ""}
                        onChange={(event) =>
                            patch({
                                topic: event.target.value || undefined,
                            })
                        }
                    >
                        <option value="">All topics</option>
                        {uniqueTopics.map((topic) => (
                            <option key={topic} value={topic}>
                                {topic}
                            </option>
                        ))}
                    </Select>
                </div>

                <div>
                    <label
                        htmlFor="question-difficulty"
                        className="mb-1 block text-xs font-medium text-muted-foreground"
                    >
                        Difficulty
                    </label>
                    <Select
                        id="question-difficulty"
                        value={filters.difficulty ?? ""}
                        onChange={(event) =>
                            patch({
                                difficulty: (event.target.value ||
                                    undefined) as
                                    | QuestionDifficulty
                                    | undefined,
                            })
                        }
                    >
                        <option value="">All levels</option>
                        {QUESTION_DIFFICULTIES.map((level) => (
                            <option key={level} value={level}>
                                {level}
                            </option>
                        ))}
                    </Select>
                </div>

                <div>
                    <label
                        htmlFor="question-status"
                        className="mb-1 block text-xs font-medium text-muted-foreground"
                    >
                        Status
                    </label>
                    <Select
                        id="question-status"
                        value={filters.status ?? ""}
                        onChange={(event) =>
                            patch({
                                status: (event.target.value ||
                                    undefined) as QuestionStatus | undefined,
                            })
                        }
                    >
                        <option value="">All statuses</option>
                        {QUESTION_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </Select>
                </div>

                <div>
                    <label
                        htmlFor="question-sort"
                        className="mb-1 block text-xs font-medium text-muted-foreground"
                    >
                        Sort
                    </label>
                    <Select
                        id="question-sort"
                        value={`${filters.sort ?? "order"}-${filters.order ?? "asc"}`}
                        onChange={(event) => {
                            const [sort, order] = event.target.value.split(
                                "-"
                            ) as [
                                QuestionFilters["sort"],
                                QuestionFilters["order"],
                            ];
                            patch({ sort, order });
                        }}
                    >
                        <option value="order-asc">Order</option>
                        <option value="difficulty-asc">Difficulty</option>
                        <option value="topic-asc">Topic A–Z</option>
                        <option value="status-asc">Status</option>
                        <option value="createdAt-desc">Newest</option>
                    </Select>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant={filters.bookmarked ? "default" : "outline"}
                    aria-pressed={Boolean(filters.bookmarked)}
                    onClick={() =>
                        patch({
                            bookmarked: filters.bookmarked
                                ? undefined
                                : true,
                        })
                    }
                >
                    Bookmarked only
                </Button>

                {hasActiveFilters ? (
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
