import 'clay-button';
import {Config} from 'metal-state';
import Component from 'metal-component';
import Soy from 'metal-soy';
import loadImage from 'image-promise';

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
 * Component that create an pdf preview
 * @review
 */
class PdfPreviewer extends Component {

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

		this._fetchClosePages(currentPage);
	}

	/**
	 * Fetch close pages of the current one
	 * @param {number|string} currentPage - the current page
	 * @param {number} [numberOfPages=2] - number of load pages (before and after)
	 * @private
	 * @review
	 */
	_fetchClosePages(currentPage, numberOfPages = 2) {
		const pagesUrlToLoad = [];

		for (let i = 1; i <= numberOfPages; i++) {
			if (currentPage + i <= this.totalPages) {
				pagesUrlToLoad.push(this.baseImageURL + (currentPage + i));
			}
			if (currentPage - i > 1) {
				pagesUrlToLoad.push(this.baseImageURL + (currentPage - i));
			}
		}

		loadImage(pagesUrlToLoad);
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
	 * Set the current page if is valid page
	 * @param {number|string} page
	 * @private
	 * @review
	 */
	_setCurrentPage(page) {
		const pageNumber = Number.parseInt(page, 10);

		if (pageNumber) {
			this.currentPage = Math.min(
				Math.max(1, pageNumber),
				this.totalPages
			);
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
	totalPages: Config.number().required()
};

Soy.register(PdfPreviewer, templates);
export {PdfPreviewer};
export default PdfPreviewer;