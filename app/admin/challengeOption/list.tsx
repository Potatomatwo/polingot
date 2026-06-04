import { Datagrid, List, TextField, BooleanField, ReferenceField, ImageField, UrlField, FunctionField, TopToolbar, ExportButton, CreateButton, FilterButton, 
         ReferenceInput, AutocompleteInput } from "react-admin";
import { ImportButton } from "@/components/ui/import-button";

const exporter = async (records: any[], fetchRelatedRecords: any) => {
    const challenges = await fetchRelatedRecords(records, "challengeId", "challenges");
   const csvData = records.map(record => {
        const challenge = challenges[record.challengeId];
        return {
            question: challenge?.question || "",
            type: challenge?.type || "",
            lesson_id: challenge?.lessonId || "",
            order: challenge?.order || "",
            option_text: record.text,
            correct: record.correct,
            image_src: record.imageSrc || "",
            audio_src: record.audioSrc || "",
        };
    });

    const headers = Object.keys(csvData[0] || {});
    const csvRows = [
        headers.join(","),
        ...csvData.map(row =>
            headers.map(header => {
                let value = row[header as keyof typeof row];
                if (typeof value === "boolean") value = value ? "true" : "false";
                const escaped = String(value).replace(/"/g, '""');
                return escaped.includes(",") ? `"${escaped}"` : escaped;
            }).join(",")
        ),
    ];
    
   const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `challengeOptions_${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
const challengeOptionFilters = [
    <ReferenceInput key="lessonId" source="lessonId" reference="lessons" label="Filter by Lesson">
        <AutocompleteInput optionText="title" />
    </ReferenceInput>,
    <ReferenceInput key="challengeId" source="challengeId" reference="challenges" label="Filter by Challenge">
        <AutocompleteInput optionText="question" />
    </ReferenceInput>,
];
const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <ExportButton exporter={exporter} />
        <ImportButton resource="challengeOptions" />
    </TopToolbar>
);

export const ChallengeOptionList = () => {
    return (
        <List actions={<ListActions />} filters={challengeOptionFilters}>
            <Datagrid>
                <TextField source="id" />
                <FunctionField 
                    label="Option / Answer"
                    render={(record) => {
                        const challengeType = record.challengeId?.type;
                        if (challengeType === 'TYPING' || challengeType === 'SPEAKING') {
                            return <span>✓ Answer: <strong>"{record.text}"</strong></span>;
                        }
                        return <span>📝 Option: {record.text}</span>;
                    }}
                />
                <BooleanField source="correct" label="Correct?" />
                <ReferenceField source="challengeId" reference="challenges" label="Challenge">
                    <TextField source="question" />
                </ReferenceField>
                <ReferenceField source="challengeId" reference="challenges" label="Challenge Type">
                    <TextField source="type" />
                </ReferenceField>
                <ImageField source="imageSrc" label="Image" />
                <UrlField source="audioSrc" label="Audio" />
            </Datagrid>
        </List>
    );
};
