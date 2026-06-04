import { SimpleForm, Create, TextInput, required } from "react-admin";

export const CourseCreate = () => {
    return(
        <Create>
            <SimpleForm>
                {/* No ID field here - it's auto-generated */}
                <TextInput 
                    source="title" 
                    validate={[required()]} 
                    label="Title" 
                    fullWidth
                />
                <TextInput 
                    source="imageSrc" 
                    validate={[required()]} 
                    label="Image URL"
                    fullWidth
                    helperText="Enter image path like: /images/JP.svg"
                />
            </SimpleForm>
        </Create>
    );
};
