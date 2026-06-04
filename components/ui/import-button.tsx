"use client";

import { useState } from "react";
import { Button, useNotify, useDataProvider, useRefresh } from "react-admin";
import { Upload } from "lucide-react";
import Papa from "papaparse";

type Props = {
    resource: "courses" | "units" | "lessons" | "challenges" | "challengeOptions";
};

// Maps what foreign key fields each resource depends on
const RESOURCE_DEPS: Record<string, string[]> = {
    courses: [],
    units: ["course_id"],
    lessons: ["unit_id"],
    challenges: ["lesson_id"],
    challengeOptions: ["challenge_id"],
};

// Maps snake_case CSV field names to camelCase API field names
const FIELD_MAP: Record<string, string> = {
    course_id: "courseId",
    unit_id: "unitId",
    lesson_id: "lessonId",
    challenge_id: "challengeId",
    image_src: "imageSrc",
    audio_src: "audioSrc",
};

// For challenge options, group by challenge and create challenge first
const CHALLENGE_OPTION_FIELDS = [
    "option_text",
    "correct",
    "image_src",
    "audio_src",
];

const transformRow = (row: any) => {
    const transformed: any = {};

    for (const [key, value] of Object.entries(row)) {
        const mappedKey = FIELD_MAP[key] || key;

        // Convert numeric strings
        if (["courseId", "unitId", "lessonId", "challengeId", "order"].includes(mappedKey)) {
            transformed[mappedKey] = value ? Number(value) : undefined;
            continue;
        }

        // Convert booleans
        if (key === "correct") {
            transformed[mappedKey] = value === "true" || value === true;
            continue;
        }

        // Convert empty strings to null for optional fields
        if (["imageSrc", "audioSrc"].includes(mappedKey)) {
            transformed[mappedKey] = value || null;
            continue;
        }

        transformed[mappedKey] = value;
    }

    return transformed;
};

// Detects if CSV has challenge+option columns combined
const isCombinedChallengeOptionCSV = (headers: string[]) => {
    return headers.includes("option_text") && headers.includes("question");
};

export const ImportButton = ({ resource }: Props) => {
    const [isLoading, setIsLoading] = useState(false);
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const refresh = useRefresh();

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        event.target.value = "";
        setIsLoading(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const data = results.data as any[];
                const headers = results.meta.fields || [];

                 try {
        // Use combined import if CSV has question+option_text columns
        // regardless of which resource page we're on
        if (isCombinedChallengeOptionCSV(headers)) {
            await importChallengesWithOptions(data);
        } else {
            await importSimple(data, resource);
        }
            } catch (err) {
                notify("Import failed unexpectedly", { type: "error" });
                console.error(err);
            }

                setIsLoading(false);
                refresh();
            },
            error: (error) => {
                console.error("Parse error:", error);
                notify("Error parsing CSV file", { type: "error" });
                setIsLoading(false);
            },
        });
    };

    const importSimple = async (data: any[], res: string) => {
        let successCount = 0;
        let errorCount = 0;

        for (const row of data) {
            const { id, ...rest } = row;
            const transformed = transformRow(rest);

            try {
                await dataProvider.create(res, { data: transformed });
                successCount++;
            } catch (error) {
                console.error("Error importing row:", transformed, error);
                errorCount++;
            }
        }

        notify(
            `${successCount} items imported.` +
                (errorCount > 0 ? ` ${errorCount} failed.` : ""),
            { type: errorCount > 0 ? "warning" : "success" }
        );
    };

    const importChallengesWithOptions = async (data: any[]) => {
    let challengesCreated = 0;
    let challengesReused = 0;
    let optionsCreated = 0;
    let errorCount = 0;

    const groups = new Map<string, any[]>();
    for (const row of data) {
        const key = `${row.question}__${row.lesson_id}__${row.order}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(row);
    }

    for (const [, rows] of groups) {
        const firstRow = rows[0];

        try {
            // 👇 Check if challenge already exists first
            const existingChallenges = await dataProvider.getList("challenges", {
                filter: { 
                    lessonId: Number(firstRow.lesson_id),
                    order: Number(firstRow.order),
                },
                pagination: { page: 1, perPage: 1 },
                sort: { field: "id", order: "ASC" },
            });

            let challengeId: number;

            if (existingChallenges.data.length > 0) {
                // Reuse existing challenge
                challengeId = existingChallenges.data[0].id;
                challengesReused++;
            } else {
                // Create new challenge
                const challengeResponse = await dataProvider.create("challenges", {
                    data: {
                        question: firstRow.question,
                        type: firstRow.type,
                        lessonId: Number(firstRow.lesson_id),
                        order: Number(firstRow.order),
                    },
                });
                challengeId = challengeResponse.data.id;
                challengesCreated++;
            }

            // Delete existing options for this challenge before re-importing
            const existingOptions = await dataProvider.getList("challengeOptions", {
                filter: { challengeId },
                pagination: { page: 1, perPage: 100 },
                sort: { field: "id", order: "ASC" },
            });

            for (const option of existingOptions.data) {
                await dataProvider.delete("challengeOptions", { id: option.id });
            }

            // Create fresh options
            for (const row of rows) {
                if (!row.option_text) continue;
                try {
                    await dataProvider.create("challengeOptions", {
                        data: {
                            text: row.option_text,
                            correct: row.correct === "true" || row.correct === true,
                            challengeId,
                            imageSrc: row.image_src || null,
                            audioSrc: row.audio_src || null,
                        },
                    });
                    optionsCreated++;
                } catch (err) {
                    console.error("Error creating option:", row, err);
                    errorCount++;
                }
            }
        } catch (err) {
            console.error("Error processing challenge:", firstRow, err);
            errorCount++;
        }
    }

    notify(
        `Done! ${challengesCreated} new challenges, ${challengesReused} reused, ${optionsCreated} options created.` +
        (errorCount > 0 ? ` ${errorCount} failed.` : ""),
        { type: errorCount > 0 ? "warning" : "success" }
    );
};

    return (
        <Button
            variant="outlined"
            size="small"
            disabled={isLoading}
            onClick={() => document.getElementById(`csv-upload-${resource}`)?.click()}
            label={isLoading ? "Importing..." : "Import"}
        >
            <Upload style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} />
            <input
                id={`csv-upload-${resource}`}
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={handleFileUpload}
            />
        </Button>
    );
};
