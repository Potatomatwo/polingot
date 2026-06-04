import { SimpleForm, Edit, TextInput, BooleanInput, ReferenceInput, AutocompleteInput, NumberInput, required } from "react-admin";
import { useWatch } from "react-hook-form";

const ChallengeSelectWithLessonFilter = () => {
    const lessonId = useWatch({ name: "lessonId" });
    
    return (
        <ReferenceInput
            source="challengeId"
            reference="challenges"
            filter={lessonId ? { lessonId } : {}}
            label="Challenge"
        >
            <AutocompleteInput 
                optionText="question"
                optionValue="id"
                fullWidth
                disabled={!lessonId}
                helperText={!lessonId ? "Select a lesson first" : ""}
            />
        </ReferenceInput>
    );
};

const ImagePreview = () => {
    const imageSrc = useWatch({ name: "imageSrc" });
    if (!imageSrc) return null;
    return (
        <div style={{ marginTop: '10px' }}>
            <label>Image Preview</label>
            <br />
            <img 
                src={imageSrc} 
                alt="Preview" 
                style={{ 
                    maxWidth: '100px', 
                    maxHeight: '100px', 
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                }} 
            />
        </div>
    );
};

const AudioPreview = () => {
    const audioSrc = useWatch({ name: "audioSrc" });
    if (!audioSrc) return null;
    return (
        <div style={{ marginTop: '10px' }}>
            <label>Audio Preview</label>
            <br />
            <audio controls src={audioSrc} style={{ marginTop: '5px' }} />
        </div>
    );
};

export const ChallengeOptionEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <NumberInput source="id" disabled label="ID" />
                
                <ReferenceInput source="lessonId" reference="lessons" label="Lesson (filter)">
                    <AutocompleteInput 
                        optionText="title"
                        optionValue="id"
                        fullWidth
                        helperText="Pick a lesson to filter the challenge list"
                    />
                </ReferenceInput>

                <ChallengeSelectWithLessonFilter />

                <TextInput source="text" label="Option Text" fullWidth validate={[required()]} />
                <BooleanInput source="correct" label="Is Correct?" />
                <TextInput source="imageSrc" label="Image URL" fullWidth />
                <ImagePreview />
                <TextInput source="audioSrc" label="Audio URL" fullWidth />
                <AudioPreview />
            </SimpleForm>
        </Edit>
    );
};