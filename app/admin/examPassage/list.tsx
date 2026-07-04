import { Datagrid, List, TextField, NumberField, ReferenceField, 
         TopToolbar, CreateButton, ExportButton } from "react-admin";
import { ImportButton } from "@/components/ui/import-button";

const ListActions = () => (
    <TopToolbar>
        <CreateButton />
        <ExportButton />
        <ImportButton resource="examPassages" />
    </TopToolbar>
);

export const ExamPassageList = () => (
    <List actions={<ListActions />}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="title" />
            <ReferenceField source="courseId" reference="courses" label="Course" />
            <NumberField source="timeLimit" label="Time (mins)" />
            <NumberField source="order" />
        </Datagrid>
    </List>
);