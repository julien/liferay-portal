import ManageCollaborators from '../src/main/resources/META-INF/resources/ManageCollaborators.es';

let component;
const componentDefaultConfig = {
	spritemap: 'icons.svg',
	actionUrl: '//action-url',
	dialogId: 'manageCollaboratorsDialog'
};

const sharingEntryPermissionDisplaySelectOptions = (permissionValue = 'VIEW') =>
	[
		{label: 'Can Update', value: 'UPDATE', selected: false},
		{label: 'Can Comment', value: 'COMMENTS', selected: false},
		{label: 'Can View', value: 'VIEW', selected: false}
	].map(permision =>
		permision.value === permissionValue
			? {...permision, selected: true}
			: permision
	);

const collaboratorConfigRequired = {
	...componentDefaultConfig,
	fullName: 'Sarah Henderson',
	sharingEntryId: '37764',
	sharingEntryPermissionDisplaySelectOptions: sharingEntryPermissionDisplaySelectOptions(),
	userId: 37755
};

const collaboratorConfigPicture = {
	...collaboratorConfigRequired,
	portraitURL: '//user_portrait.jpg'
};

const collaboratorConfigExpiration = {
	...collaboratorConfigRequired,
	sharingEntryExpirationDate: '2019-06-19',
	sharingEntryExpirationDateTooltip: 'Until 6/19/19'
};

const collaboratorConfigShareable = {
	...collaboratorConfigRequired,
	sharingEntryShareable: true
};

const collaboratorConfigAll = {
	...collaboratorConfigPicture,
	...collaboratorConfigExpiration,
	...collaboratorConfigShareable
};

describe('sharing-web: ManageCollaborators', () => {
	afterEach(() => {
		if (component) {
			component.dispose();
		}
	});

	it('should render an manage collaborator dialogs with colaborators with diferrent info', () => {
		component = new ManageCollaborators({
			collaborators: [
				collaboratorConfigRequired,
				collaboratorConfigPicture,
				collaboratorConfigExpiration,
				collaboratorConfigShareable,
				collaboratorConfigAll
			]
		});

		expect(component).toMatchSnapshot();
	});
});
