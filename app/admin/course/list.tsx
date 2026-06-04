import { Datagrid, List, TextField, TopToolbar, ExportButton, CreateButton } from "react-admin";
import { ImportButton } from "@/components/ui/import-button";

const exporter = (records: any[]) => {
    const csvData = records.map(record => ({
        title: record.title,
        image_src: record.imageSrc,
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
    link.download = `courses_${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const ListActions = () => (
    <TopToolbar>
        <CreateButton />
        <ExportButton exporter={exporter} />
        <ImportButton resource="courses" />
    </TopToolbar>
);

// Custom image component
const ImageField = ({ source, record }: { source: string; record: any }) => {
    if (!record || !record[source]) {
        return null;
    }
    
    return (
        <img 
            src={record[source]} 
            alt={record.title}
            style={{ 
                width: 60, 
                height: 60, 
                objectFit: 'cover',
                borderRadius: '4px',
                border: '1px solid #e0e0e0'
            }}
            onError={(e) => {
                (e.target as HTMLImageElement).src = '/icon.png';
            }}
        />
    );
};

export const CourseList = () => {
    return (
        <List actions={<ListActions />}>
            <Datagrid>
                <TextField source="id" />
                <TextField source="title" />
                <ImageField source="imageSrc" record={{}} />
            </Datagrid>
        </List>
    );
};
