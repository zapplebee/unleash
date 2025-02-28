import { useNavigate } from 'react-router-dom';
import ProjectForm from '../ProjectForm/ProjectForm';
import { NewProjectForm } from './NewProjectForm';
import useProjectForm, {
    DEFAULT_PROJECT_STICKINESS,
} from '../hooks/useProjectForm';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { CREATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { GO_BACK } from 'constants/navigate';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { Button, styled } from '@mui/material';
import { useUiFlag } from 'hooks/useUiFlag';

const CREATE_PROJECT_BTN = 'CREATE_PROJECT_BTN';

const StyledButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const CreateProject = () => {
    const { setToastData, setToastApiError } = useToast();
    const { refetchUser } = useAuthUser();
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();
    const { trackEvent } = usePlausibleTracker();
    const {
        projectId,
        projectName,
        projectDesc,
        projectMode,
        projectEnvironments,
        setProjectMode,
        setProjectId,
        setProjectName,
        setProjectDesc,
        setProjectEnvironments,
        getCreateProjectPayload,
        clearErrors,
        validateProjectId,
        validateName,
        setProjectStickiness,
        projectStickiness,
        errors,
    } = useProjectForm();

    const useNewProjectForm = useUiFlag('newCreateProjectUI');

    const { createProject, loading } = useProjectApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();
        const validName = validateName();
        const validId = await validateProjectId();

        if (validName && validId) {
            const payload = getCreateProjectPayload();
            try {
                await createProject(payload);
                refetchUser();
                navigate(`/projects/${projectId}`, { replace: true });
                setToastData({
                    title: 'Project created',
                    text: 'Now you can add toggles to this project',
                    confetti: true,
                    type: 'success',
                });

                if (projectStickiness !== DEFAULT_PROJECT_STICKINESS) {
                    trackEvent('project_stickiness_set');
                }
                trackEvent('project-mode', {
                    props: { mode: projectMode, action: 'added' },
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${uiConfig.unleashUrl}/api/admin/projects' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getCreateProjectPayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    if (useNewProjectForm) {
        return (
            <FormTemplate
                disablePadding
                loading={loading}
                description='Projects allows you to group feature toggles together in the management UI.'
                documentationLink='https://docs.getunleash.io/reference/projects'
                documentationLinkLabel='Projects documentation'
                formatApiCode={formatApiCode}
            >
                <NewProjectForm
                    errors={errors}
                    handleSubmit={handleSubmit}
                    projectId={projectId}
                    projectEnvironments={projectEnvironments}
                    setProjectEnvironments={setProjectEnvironments}
                    setProjectId={setProjectId}
                    projectName={projectName}
                    projectStickiness={projectStickiness}
                    projectMode={projectMode}
                    setProjectMode={setProjectMode}
                    setProjectStickiness={setProjectStickiness}
                    setProjectName={setProjectName}
                    projectDesc={projectDesc}
                    setProjectDesc={setProjectDesc}
                    mode='Create'
                    clearErrors={clearErrors}
                    validateProjectId={validateProjectId}
                >
                    <StyledButton onClick={handleCancel}>Cancel</StyledButton>
                    <CreateButton
                        name='project'
                        permission={CREATE_PROJECT}
                        data-testid={CREATE_PROJECT_BTN}
                    />
                </NewProjectForm>
            </FormTemplate>
        );
    }

    return (
        <FormTemplate
            loading={loading}
            title='Create project'
            description='Projects allows you to group feature toggles together in the management UI.'
            documentationLink='https://docs.getunleash.io/reference/projects'
            documentationLinkLabel='Projects documentation'
            formatApiCode={formatApiCode}
        >
            <ProjectForm
                errors={errors}
                handleSubmit={handleSubmit}
                projectId={projectId}
                setProjectId={setProjectId}
                projectName={projectName}
                projectStickiness={projectStickiness}
                projectMode={projectMode}
                setProjectMode={setProjectMode}
                setProjectStickiness={setProjectStickiness}
                setProjectName={setProjectName}
                projectDesc={projectDesc}
                setProjectDesc={setProjectDesc}
                mode='Create'
                clearErrors={clearErrors}
                validateProjectId={validateProjectId}
            >
                <CreateButton
                    name='project'
                    permission={CREATE_PROJECT}
                    data-testid={CREATE_PROJECT_BTN}
                />
                <StyledButton onClick={handleCancel}>Cancel</StyledButton>
            </ProjectForm>
        </FormTemplate>
    );
};

export default CreateProject;
