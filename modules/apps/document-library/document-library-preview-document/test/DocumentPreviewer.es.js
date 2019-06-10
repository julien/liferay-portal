import DocumentPreviewer from '../src/main/resources/META-INF/resources/preview/js/DocumentPreviewer.es';

let component;

const defaultDocumentPreviewerConfig = {
	baseImageURL: '/document-images/',
	spritemap: 'icons.svg'
};

describe('document-library-preview-document', () => {
	afterEach(() => {
		if (component) {
			component.dispose();
		}
	});

	it('should render a document previewer with ten pages and the first page rendered', () => {
		component = new DocumentPreviewer({
			...defaultDocumentPreviewerConfig,
			currentPage: 1,
			totalPages: 10
		});

		expect(component).toMatchSnapshot();
	});

	it('should render a document previewer with nineteen pages and the fifth page rendered', () => {
		component = new DocumentPreviewer({
			...defaultDocumentPreviewerConfig,
			currentPage: 5,
			totalPages: 19
		});

		expect(component).toMatchSnapshot();
	});
});
