import { Datagrid, List, TextField, ReferenceField, NumberField, TopToolbar, ExportButton, CreateButton, FilterButton, 
         ReferenceInput, AutocompleteInput } from "react-admin";
import { ImportButton } from "@/components/ui/import-button";

const exporter = async (records: any[], fetchRelatedRecords: any) => {
    const units = await fetchRelatedRecords(records, "unitId", "units");
    const csvData = records.map(record => {
        const unit = units[record.unitId];
        return {
            title: record.title,
            description: record.description || "",
            unit_title: unit?.title || "",
            order: record.order,
        };
    });
    
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
    link.download = `lessons_${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const lessonFilters = [
    <ReferenceInput source="unitId" reference="units" label="Unit">
        <AutocompleteInput optionText="title" />
    </ReferenceInput>,
];

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <ExportButton exporter={exporter} />
        <ImportButton resource="lessons" />
    </TopToolbar>
);

export const LessonList = () => {
    return (
        <List actions={<ListActions />} filters={lessonFilters}>
            <Datagrid rowClick="edit">
                <TextField source="id" />
                <TextField source="title" />
                <TextField source="description" />
                <ReferenceField source="unitId" reference="units"/>
                <NumberField source="order" />
            </Datagrid>
        </List>
    );
};
