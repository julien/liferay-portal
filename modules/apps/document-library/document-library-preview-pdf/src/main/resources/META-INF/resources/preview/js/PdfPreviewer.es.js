import {Config} from 'metal-state';
import {debounce} from 'metal-debounce';
import Component from 'metal-component';
import imagePromise from 'image-promise';
import Soy from 'metal-soy';

import templates from './PdfPreviewer.soy';

const KEY_CODE_ENTER = 13;

const KEY_CODE_ESC = 27;

/**
 * Valid list of keycodes
 * Includes backspace, tab, arrows, delete and numbers
 * @type {Array<number>}
 */
const VALID_KEY_CODES = [8, 9, 37, 38, 39, 40, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57];

/**
 * Milisecons between goToPage calls
 * @type {number}
 */
const WAIT_BETWEEN_GO_TO_PAGE = 250;

/**
 * Component that create an pdf preview
 * @review
 */
class PdfPreviewer extends Component {

	/**
	 * @inheritDoc
	 */
	attached() {
		this._goToPageDebounced = debounce(
			this._goToPage.bind(this),
			WAIT_BETWEEN_GO_TO_PAGE
		);
		this._goToPageDebounced(this.currentPage);
	}

	/**
	 * @inheritDoc
	 */
	rendered() {
		if (this.showPageInput) {
			setTimeout(() => this.refs.pageInput.focus(), 100);
		}
	}

	/**
	 * @inheritDoc
	 */
	syncCurrentPage(currentPage) {
		this.refs.imageContainer.scrollTop = 0;
		this.previousPageDisabled = currentPage === 1;
		this.nextPageDisabled = currentPage === this.totalPages;
	}

	/**
	 * Load close pages of the current one
	 * @param {number|string} currentPage - the current page
	 * @param {number} [numberOfPages=2] - number of load pages (before and after)
	 * @private
	 * @review
	 */
	_loadClosePages(currentPage, numberOfPages = 2) {
		for (let i = 1; i <= numberOfPages; i++) {
			if (currentPage + i <= this.totalPages) {
				this._loadPage(currentPage + i);
			}
			if (currentPage - i > 1) {
				this._loadPage(currentPage - i);
			}
		}
	}

	/**
	 * Trigger a promise to load the image
	 * @param {number} pageToLoad
	 * @return {Promise} A promise to be resolved when the image is loaded
	 * @private
	 * @review
	 */
	_loadPage(pageToLoad) {
		let pagePromise = this._loadedPages[pageToLoad];

		if (!pagePromise) {
			pagePromise = imagePromise(`${this.baseImageURL}${pageToLoad}`);
			this._loadedPages[pageToLoad] = pagePromise;
		}

		return pagePromise;
	}

	/**
	 * Show page when it's completely loaded
	 * and load the closest pages
	 * @param {number} page
	 * @private
	 * @review
	 */
	_goToPage(page) {
		this._loadPage(page).then(
			() => {
				if (this.currentPage === page) {
					this.currentPageLoading = false;
					this._loadClosePages(page);
				}
			}
		);
	}

	/**
	 * Event handler executed on pageInput blur.
	 * Saves the current value.
	 * @param {!Event} event
	 * @private
	 * @review
	 */
	_handleBlurPageInput(event) {
		this._setCurrentPage(event.delegateTarget.value);
		this.showPageInput = false;
	}

	/**
	 * Handles click action in the toolbar.
	 *
	 * @param {!Event} event
	 * @private
	 * @review
	 */
	_handleClickToolbar(event) {
		const action = event.currentTarget.value;

		if (action === 'next') {
			this._setCurrentPage(this.currentPage + 1);
		}
		else if (action === 'previous') {
			this._setCurrentPage(this.currentPage - 1);
		}
		else if (action === 'go') {
			this.showPageInput = true;
		}
	}

	/**
	 * Prevents from introducing non digits in input field.
	 * And map certain actions to escape enter (save) or (cancel)
	 * @param {KeyboardEvent} event The keyboard event.
	 * @private
	 * @review
	 */
	_handleKeyDownPageInput(event) {
		const code = event.keyCode || event.charCode;

		if (code === KEY_CODE_ENTER) {
			this._setCurrentPage(event.delegateTarget.value);
			this.showPageInput = false;
		}
		else if (code === KEY_CODE_ESC) {
			this.showPageInput = false;
		}
		else if (VALID_KEY_CODES.indexOf(code) === -1) {
			event.preventDefault();
		}
	}

	/**
	 * Set the current page if is valid page and show loader
	 * @param {number|string} page
	 * @private
	 * @review
	 */
	_setCurrentPage(page) {
		const pageNumber = Number.parseInt(page, 10);

		if (pageNumber) {
			const currentPage = Math.min(
				Math.max(1, pageNumber),
				this.totalPages
			);

			this.currentPage = currentPage;
			this.currentPageLoading = true;

			this._goToPageDebounced(currentPage);
		}
	}
}

/**
 * State definition.
 * @review
 * @static
 * @type {!Object}
 */
PdfPreviewer.STATE = {

	/**
	 * Base path to page images.
	 * @type {String}
	 */
	baseImageURL: Config.string().required(),

	/**
	 * Current page
	 * @type {Number}
	 */
	currentPage: Config.number().required(),

	/**
	 * Flag that indicate if currentPgae is loading.
	 * @type {Boolean}
	 */
	currentPageLoading: Config.bool(),

	/**
	 * Flag that indicate if 'next page' is disabled.
	 * @type {Boolean}
	 */
	nextPageDisabled: Config.bool(),

	/**
	 * Flag that indicate if 'previous page' is disabled.
	 * @type {Boolean}
	 */
	previousPageDisabled: Config.bool(),

	/**
	 * Flag that indicate if 'pageInput' is visible.
	 * @type {Boolean}
	 */
	showPageInput: Config.bool(),

	/**
	 * Path to icon images.
	 * @type {String}
	 */
	spritemap: Config.string().required(),

	/**
	 * Pdf pages lenght
	 * @type {Number}
	 */
	totalPages: Config.number().required(),

	/**
	 * Object that store promises in the page key
	 * @default {}
	 * @type {Object}
	 */
	_loadedPages: Config.object().internal().value({})
};

Soy.register(PdfPreviewer, templates);
export {PdfPreviewer};
export default PdfPreviewer;