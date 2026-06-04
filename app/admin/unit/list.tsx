import { Datagrid, List, TextField, ReferenceField, TopToolbar, ExportButton, CreateButton, FilterButton, ReferenceInput, AutocompleteInput } from "react-admin";
import { ImportButton } from "@/components/ui/import-button";

const exporter = async (records: any[], fetchRelatedRecords: any) => {
    const courses = await fetchRelatedRecords(records, "courseId", "courses");
    const csvData = records.map(record => {
        const course = courses[record.courseId];
        return {
            title: record.title,
            description: record.description || "",
            course_title: course?.title || "",
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
    link.download = `units_${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const unitFilters = [
    <ReferenceInput source="courseId" reference="courses" label="Course">
        <AutocompleteInput optionText="title" />
    </ReferenceInput>,
];

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <ExportButton exporter={exporter} />
        <ImportButton resource="units" />
    </TopToolbar>
);

export const UnitList = () => {
    return (
        <List actions={<ListActions />} filters={unitFilters}>
            <Datagrid rowClick="edit">
                <TextField source="id" />
                <TextField source="title" />
                <TextField source="description" />
                <ReferenceField source="courseId" reference="courses"/>
                <TextField source="order" />
            </Datagrid>
        </List>
    );
};
