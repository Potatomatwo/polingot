"use client";

import { useState, useEffect } from "react";
import { Edit, SimpleForm, ReferenceInput, AutocompleteInput, 
         NumberInput, required, useNotify } from "react-admin";
import { 
    BlanksEditor, 
    QuestionsEditor, 
    labelStyle, 
    inputStyle 
} from "./create"; // Import shared editors from create

type Blank = {
    blankNumber: number;
    correctAnswer: string;
    acceptedAnswers: string;
};

type Question = {
    question: string;
    markScheme: string;
    sampleAnswer: string;
    maxMarks: number;
};

export const ExamPassageEdit = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [blanks, setBlanks] = useState<Blank[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const notify = useNotify();

    // Parse incoming JSON when form loads
    const parseFormData = (formData: any) => {
        setTitle(formData.title || "");
        setContent(formData.content || "");
        
        try {
            const blanksData = typeof formData.blanksJson === "string"
                ? JSON.parse(formData.blanksJson)
                : formData.blanksJson;
            setBlanks(blanksData || []);
        } catch (e) {
            console.error("Error parsing blanks:", e);
            notify("Error parsing blanks JSON", { type: "warning" });
        }

        try {
            const questionsData = typeof formData.questionsJson === "string"
                ? JSON.parse(formData.questionsJson)
                : formData.questionsJson;
            setQuestions(questionsData || []);
        } catch (e) {
            console.error("Error parsing questions:", e);
            notify("Error parsing questions JSON", { type: "warning" });
        }
    };

    // Transform for submission (same as Create)
    const transform = (formData: any) => ({
        ...formData,
        title,
        content,
        blanksJson: JSON.stringify(blanks),
        questionsJson: JSON.stringify(questions),
    });

    return (
        <Edit transform={transform}>
            <SimpleForm
                onSuccess={() => {
                    notify("Exam passage saved successfully", { type: "success" });
                }}
            >
                {/* ID field (read-only) */}
                <div style={{ width: "100%", marginBottom: 16 }}>
                    <label style={labelStyle}>ID</label>
                    <div style={{
                        ...inputStyle,
                        background: "var(--color-background-secondary)",
                        color: "var(--color-text-secondary)",
                        display: "flex",
                        alignItems: "center",
                    }}>
                        {/* Will be auto-populated from record */}
                    </div>
                </div>

                {/* Course selection */}
                <ReferenceInput source="courseId" reference="courses" label="Course">
                    <AutocompleteInput optionText="title" optionValue="id" fullWidth validate={[required()]} />
                </ReferenceInput>

                {/* Title */}
                <div style={{ width: "100%", marginBottom: 16 }}>
                    <label style={labelStyle}>Passage title *</label>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. A Day in Tokyo"
                        style={inputStyle}
                    />
                </div>

                {/* Content */}
                <div style={{ width: "100%", marginBottom: 16 }}>
                    <label style={labelStyle}>
                        Passage content * — use [BLANK_1], [BLANK_2] etc where blanks should appear
                    </label>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={10}
                        placeholder="Write or paste your passage here..."
                        style={{ ...inputStyle, resize: "vertical" }}
                    />
                </div>

                {/* Blanks Editor (same as Create) */}
                <BlanksEditor blanks={blanks} onChange={setBlanks} />

                {/* Questions Editor (same as Create) */}
                <QuestionsEditor questions={questions} onChange={setQuestions} />

                {/* Time limit */}
                <NumberInput source="timeLimit" label="Time limit (minutes)" defaultValue={30} />

                {/* Order */}
                <NumberInput source="order" label="Order" defaultValue={0} />
            </SimpleForm>
        </Edit>
    );
};