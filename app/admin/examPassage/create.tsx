"use client";

import { useState } from "react";
import { SimpleForm, Create, TextInput, NumberInput, 
         ReferenceInput, AutocompleteInput, required, useNotify } from "react-admin";

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

export const BlanksEditor = ({ blanks, onChange }: { 
    blanks: Blank[], 
    onChange: (b: Blank[]) => void 
}) => {
    const add = () => onChange([...blanks, { 
        blankNumber: blanks.length + 1, 
        correctAnswer: "", 
        acceptedAnswers: "" 
    }]);
    
    const remove = (i: number) => {
        const updated = blanks.filter((_, idx) => idx !== i)
            .map((b, idx) => ({ ...b, blankNumber: idx + 1 }));
        onChange(updated);
    };

    const update = (i: number, field: keyof Blank, value: string | number) => {
        const updated = [...blanks];
        updated[i] = { ...updated[i], [field]: value };
        onChange(updated);
    };

    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ fontWeight: 500, margin: 0 }}>Blank answers</p>
                <button onClick={add} type="button" style={addBtnStyle}>+ Add blank</button>
            </div>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 12 }}>
                Place [BLANK_1], [BLANK_2] etc in the passage above. Define the correct answer for each here.
            </p>
            {blanks.map((blank, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-end" }}>
                    <div style={{ width: 60, flexShrink: 0 }}>
                        <label style={labelStyle}>Blank #</label>
                        <div style={{ ...inputStyle, background: "var(--color-background-secondary)", color: "var(--color-text-secondary)", display: "flex", alignItems: "center" }}>
                            {blank.blankNumber}
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Correct answer *</label>
                        <input
                            value={blank.correctAnswer}
                            onChange={e => update(i, "correctAnswer", e.target.value)}
                            placeholder="e.g. ran"
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ flex: 2 }}>
                        <label style={labelStyle}>Also accepted (pipe-separated)</label>
                        <input
                            value={blank.acceptedAnswers}
                            onChange={e => update(i, "acceptedAnswers", e.target.value)}
                            placeholder="e.g. run|running|runs"
                            style={inputStyle}
                        />
                    </div>
                    <button onClick={() => remove(i)} type="button" style={removeBtnStyle}>✕</button>
                </div>
            ))}
            {blanks.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", fontStyle: "italic" }}>
                    No blanks added yet. Click "+ Add blank" or use AI generation.
                </p>
            )}
        </div>
    );
};

export const QuestionsEditor = ({ questions, onChange }: {
    questions: Question[],
    onChange: (q: Question[]) => void
}) => {
    const add = () => onChange([...questions, {
        question: "",
        markScheme: "",
        sampleAnswer: "",
        maxMarks: 3,
    }]);

    const remove = (i: number) => onChange(questions.filter((_, idx) => idx !== i));

    const update = (i: number, field: keyof Question, value: string | number) => {
        const updated = [...questions];
        updated[i] = { ...updated[i], [field]: value };
        onChange(updated);
    };

    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ fontWeight: 500, margin: 0 }}>Comprehension questions</p>
                <button onClick={add} type="button" style={addBtnStyle}>+ Add question</button>
            </div>
            {questions.map((q, i) => (
                <div key={i} style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>Question {i + 1}</span>
                        <button onClick={() => remove(i)} type="button" style={removeBtnStyle}>✕</button>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <label style={labelStyle}>Question *</label>
                        <input
                            value={q.question}
                            onChange={e => update(i, "question", e.target.value)}
                            placeholder="e.g. Why did the character decide to leave?"
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <label style={labelStyle}>Sample / model answer *</label>
                        <textarea
                            value={q.sampleAnswer}
                            onChange={e => update(i, "sampleAnswer", e.target.value)}
                            placeholder="Write a full model answer here. Claude will compare the student's answer against this."
                            rows={3}
                            style={{ ...inputStyle, resize: "vertical" }}
                        />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <label style={labelStyle}>Mark scheme (for Claude to evaluate)</label>
                        <textarea
                            value={q.markScheme}
                            onChange={e => update(i, "markScheme", e.target.value)}
                            placeholder="e.g. Award 1 mark for mentioning X. Award 2 marks for explaining Y. Award 3 marks for..."
                            rows={3}
                            style={{ ...inputStyle, resize: "vertical" }}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Max marks</label>
                        <input
                            type="number" min={1} max={10}
                            value={q.maxMarks}
                            onChange={e => update(i, "maxMarks", Number(e.target.value))}
                            style={{ ...inputStyle, width: 80 }}
                        />
                    </div>
                </div>
            ))}
            {questions.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", fontStyle: "italic" }}>
                    No questions added yet.
                </p>
            )}
        </div>
    );
};

export const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: "var(--color-text-secondary)",
    display: "block",
    marginBottom: 4,
};

export const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid var(--color-border-secondary)",
    fontSize: 14,
    boxSizing: "border-box",
    background: "transparent",
    color: "var(--color-text-primary)",
};

const addBtnStyle: React.CSSProperties = {
    padding: "6px 14px",
    borderRadius: 8,
    border: "1px solid var(--color-border-secondary)",
    background: "transparent",
    cursor: "pointer",
    fontSize: 13,
    color: "var(--color-text-secondary)",
};

const removeBtnStyle: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 8,
    border: "none",
    background: "var(--color-background-danger)",
    color: "var(--color-text-danger)",
    cursor: "pointer",
    fontSize: 13,
    flexShrink: 0,
};

const AIGenerateButton = ({ onGenerated }: { onGenerated: (data: any) => void }) => {
    const [loading, setLoading] = useState(false);
    const [topic, setTopic] = useState("");
    const [level, setLevel] = useState("intermediate");
    const [blanks, setBlanks] = useState(5);
    const [questions, setQuestions] = useState(3);
    const notify = useNotify();

    const generate = async () => {
        if (!topic) { notify("Please enter a topic", { type: "warning" }); return; }
        setLoading(true);
        try {
            const res = await fetch("/api/admin/generatepassage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic, level, blanks, questions }),
            });
            const data = await res.json();
            onGenerated(data);
            notify("Passage generated! Review and edit before saving.", { type: "success" });
        } catch {
            notify("Generation failed", { type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ border: "2px dashed var(--color-border-secondary)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <p style={{ fontWeight: 500, marginBottom: 12, margin: "0 0 12px" }}>✨ Generate with AI</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 2, minWidth: 180 }}>
                    <label style={labelStyle}>Topic</label>
                    <input value={topic} onChange={e => setTopic(e.target.value)}
                        placeholder="e.g. Japanese culture" style={inputStyle} />
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={labelStyle}>Level</label>
                    <select value={level} onChange={e => setLevel(e.target.value)} style={inputStyle}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: 80 }}>
                    <label style={labelStyle}>Blanks</label>
                    <input type="number" min={1} max={10} value={blanks}
                        onChange={e => setBlanks(Number(e.target.value))} style={inputStyle} />
                </div>
                <div style={{ flex: 1, minWidth: 80 }}>
                    <label style={labelStyle}>Questions</label>
                    <input type="number" min={1} max={6} value={questions}
                        onChange={e => setQuestions(Number(e.target.value))} style={inputStyle} />
                </div>
            </div>
            <button onClick={generate} disabled={loading} type="button"
                style={{ padding: "8px 20px", borderRadius: 8, border: "none",
                    background: loading ? "var(--color-border-secondary)" : "#22c55e",
                    color: "white", fontWeight: 500, cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Generating..." : "Generate"}
            </button>
        </div>
    );
};

export const ExamPassageCreate = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [blanks, setBlanks] = useState<Blank[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);

    const handleGenerated = (data: any) => {
        setTitle(data.title || "");
        setContent(data.content || "");
        setBlanks(data.blanks || []);
        setQuestions(data.questions || []);
    };

    // Transform for submission
    const transform = (formData: any) => ({
        ...formData,
        title,
        content,
        blanksJson: JSON.stringify(blanks),
        questionsJson: JSON.stringify(questions),
    });

    return (
        <Create transform={transform}>
            <SimpleForm>
                <AIGenerateButton onGenerated={handleGenerated} />

                <ReferenceInput source="courseId" reference="courses" label="Course">
                    <AutocompleteInput optionText="title" optionValue="id" fullWidth validate={[required()]} />
                </ReferenceInput>

                <div style={{ width: "100%", marginBottom: 16 }}>
                    <label style={labelStyle}>Passage title *</label>
                    <input value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. A Day in Tokyo" style={inputStyle} />
                </div>

                <div style={{ width: "100%", marginBottom: 16 }}>
                    <label style={labelStyle}>
                        Passage content * — use [BLANK_1], [BLANK_2] etc where blanks should appear
                    </label>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={10}
                        placeholder="Write or paste your passage here. Use [BLANK_1] for the first blank, [BLANK_2] for the second, etc."
                        style={{ ...inputStyle, resize: "vertical" }}
                    />
                </div>

                <BlanksEditor blanks={blanks} onChange={setBlanks} />
                <QuestionsEditor questions={questions} onChange={setQuestions} />

                <NumberInput source="timeLimit" label="Time limit (minutes)" defaultValue={30} />
                <NumberInput source="order" label="Order" defaultValue={0} />
            </SimpleForm>
        </Create>
    );
};