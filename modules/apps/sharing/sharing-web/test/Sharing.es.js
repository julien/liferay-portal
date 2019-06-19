import Sharing from '../src/main/resources/META-INF/resources/Sharing.es';

let component;

describe('sharing-web: Sharing', () => {
	afterEach(() => {
		if (component) {
			component.dispose();
		}
	});

	it('should render an manage collaborator dialogs with colaborators with diferrent info', () => {
		component = new Sharing({
			spritemap: 'icons.svg',
			shareActionURL: '//share-action-url',
			sharingEntryPermissionDisplayActionId: 'sharingId',
			sharingUserAutocompleteURL: '//sharing-user-autocomplete-url',
			sharingVerifyEmailAddressURL: '//sharing-verify-email-url'
		});

		expect(component).toMatchSnapshot();
	});
});
