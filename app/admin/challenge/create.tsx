import { SimpleForm, Create, TextInput, NumberInput, SelectInput, ReferenceInput, AutocompleteInput, required } from "react-admin";

const challengeTypes = [
    { id: 'SELECT', name: 'Select (Multiple Choice)' },
    { id: 'ASSIST', name: 'Assist (Fill in blank)' },
    { id: 'TYPING', name: 'Typing (Text Input)' },
    { id: 'SPEAKING', name: 'Speaking (Voice Recognition)' },
    { id: 'LISTENING', name: 'Listening (Audio Comprehension)' },
];

export const ChallengeCreate = () => {
    return (
        <Create>
            <SimpleForm>
                <TextInput source="question" validate={[required()]} label="Question" fullWidth 
                    helperText="Instructions for the user (e.g., 'Type what you hear')" />
                <SelectInput 
                    source="type"
                    choices={challengeTypes} 
                    validate={[required()]} 
                    label="Challenge Type"
                />
                <ReferenceInput 
                    source="lessonId" 
                    reference="lessons" 
                    label="Lesson"
                >
                    <AutocompleteInput 
                        optionText="title" 
                        optionValue="id"
                        fullWidth
                    />
                </ReferenceInput>
                <NumberInput source="order" label="Order" defaultValue={0} />
            </SimpleForm>
        </Create>
    );
};