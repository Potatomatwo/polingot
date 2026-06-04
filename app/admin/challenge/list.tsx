import { Datagrid, List, TextField, SelectField, ReferenceField, TopToolbar, ExportButton, CreateButton, FilterButton, 
         ReferenceInput, AutocompleteInput } from "react-admin";
import { ImportButton } from "@/components/ui/import-button";

const challengeTypes = [
    { id: 'SELECT', name: 'Select' },
    { id: 'ASSIST', name: 'Assist' },
    { id: 'TYPING', name: 'Typing' },
    { id: 'SPEAKING', name: 'Speaking' },
    { id: 'LISTENING', name: 'Listening' },
];

const exporter = (records: any[]) => {
    const csvData = records.map(record => ({
        lesson_id: record.lessonId,
        type: record.type,
        question: record.question,
        order: record.order,
    }));
    
    const headers = Object.keys(csvData[0] || {});
    const csvRows = [
        headers.join(','),
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
    link.download = `challenges_${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
const challengeFilters = [
    <ReferenceInput source="lessonId" reference="lessons" label="Lesson">
        <AutocompleteInput optionText="title" />
    </ReferenceInput>,
];
const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <ExportButton exporter={exporter} />
        <ImportButton resource="challenges" />
    </TopToolbar>
);

export const ChallengeList = () => {
    return (
        <List actions={<ListActions />} filters={challengeFilters}>
            <Datagrid>
                <TextField source="id" />
                <TextField source="question" />
                <SelectField 
                    source="type" 
                    choices={challengeTypes}
                />
                <ReferenceField 
                    source="lessonId" 
                    reference="lessons" 
                    label="Lesson"
                >
                    <TextField source="title" />
                </ReferenceField>
                <TextField source="order" />
            </Datagrid>
        </List>
    );
};