const React = AlloyEditor.React;

/**
 * The BackgroundColor class provides functionality for changing background
 * color in a document.
 *
 * @uses ButtonStateClasses
 * @uses ButtonCfgProps
 *
 * @class BackgroundColor
 */
const BackgroundColor = React.createClass({
	mixins: [ AlloyEditor.ButtonStateClasses, AlloyEditor.ButtonCfgProps],

	// Allows validating props being passed to the component.
	propTypes: {
		/**
		 * The editor instance where the component is being used.
		 *
		 * @instance
		 * @memberof BackgroundColor
		 * @property {Object} editor
		 */
		editor: React.PropTypes.object.isRequired,

		/**
		 * Indicates whether the styles list is expanded or not.
		 *
		 * @instance
		 * @memberof BackgroundColor
		 * @property {Boolean} expanded
		 */
		expanded: React.PropTypes.bool,

		/**
		 * The label that should be used for accessibility purposes.
		 *
		 * @instance
		 * @memberof BackgroundColor
		 * @property {String} label
		 */
		label: React.PropTypes.string,

		/**
		 * Indicates whether the remove styles item should appear in the styles list.
		 *
		 * @instance
		 * @memberof BackgroundColor
		 * @property {Boolean} showRemoveStylesItem
		 */
		showRemoveStylesItem: React.PropTypes.bool,

		/**
		 * List of the styles the button is able to handle.
		 *
		 * @instance
		 * @memberof BackgroundColor
		 * @property {Array} styles
		 */
		styles: React.PropTypes.arrayOf(React.PropTypes.object),

		/**
		 * The tabIndex of the button in its toolbar current state. A value other than -1
		 * means that the button has focus and is the active element.
		 *
		 * @instance
		 * @memberof BackgroundColor
		 * @property {Number} tabIndex
		 */
		tabIndex: React.PropTypes.number,

		/**
		 * Callback provided by the button host to notify when the styles list has been expanded.
		 *
		 * @instance
		 * @memberof BackgroundColor
		 * @property {Function} toggleDropdown
		 */
		toggleDropdown: React.PropTypes.func
	},

	// Lifecycle. Provides static properties to the widget.
	statics: {
		key: 'backgroundColor'
	},

	/**
	 * Lifecycle. Renders the UI of the button.
	 *
	 * @method render
	 * @return {Object} The content which should be rendered.
	 */
	render: function() {
		var activeColor = AlloyEditor.Strings.normal;

		var activeColorClass = '';

		var colors = this._getColors();

		colors.forEach(function (item) {
			if (this._checkActive(item.style)) {
				activeColor = item.name;

				activeColorClass = item.style.attributes.textClass;
			}
		}.bind(this));

		var buttonStylesList;

		if (this.props.expanded) {
			buttonStylesList = React.createElement(AlloyEditor.ButtonStylesList, { activeStyle: activeColor, editor: this.props.editor, onDismiss: this.props.toggleDropdown, showRemoveStylesItem: false, styles: colors });
		}

		return React.createElement(
			'div',
			{ className: 'ae-container-dropdown ae-has-dropdown col-2' },
			React.createElement(
				'button',
				{ 'aria-expanded': this.props.expanded, className: 'ae-toolbar-element', onClick: this.props.toggleDropdown, role: 'combobox', tabIndex: this.props.tabIndex, title: activeColor },
				React.createElement(
					'div',
					{ className: 'ae-container' },
					React.createElement(
						'span',
						{ className: 'ae-container-dropdown-selected-item ' + activeColorClass},
						React.createElement('span', { dangerouslySetInnerHTML: {__html: Liferay.Util.getLexiconIconTpl('textbox')}})
					),
					React.createElement('span', { className: 'ae-icon-arrow' })
				)
			),
			buttonStylesList
		);
	},

	/**
	 * Checks if the given color definition is applied to the current selection in the editor.
	 *
	 * @instance
	 * @memberof BackgroundColor
	 * @method _checkActive
	 * @param {Object} styleConfig Color definition as per http://docs.ckeditor.com/#!/api/CKEDITOR.style.
	 * @protected
	 * @return {Boolean} Returns true if the color is applied to the selection, false otherwise.
	 */
	_checkActive: function(styleConfig) {
		var nativeEditor = this.props.editor.get('nativeEditor');

		// Styles with wildcard element (*) won't be considered active by CKEditor. Defaulting
		// to a 'span' element works for most of those cases with no defined element.
		styleConfig = CKEDITOR.tools.merge({ element: 'span' }, styleConfig);

		var style = new CKEDITOR.style(styleConfig);

		return style.checkActive(nativeEditor.elementPath(), nativeEditor);
	},

	/**
	 * Returns an array of colors. Each color consists from two properties:
	 * - name - the style name, for example "default"
	 * - style - an object with one property, called `element` which value
	 * represents the style which have to be applied to the element.
	 *
	 * @instance
	 * @memberof BackgroundColor
	 * @method _getColor
	 * @protected
	 * @return {Array<object>} An array of objects containing the colors.
	 */
	_getColors: function() {
		return this.props.styles || [{
			name: AlloyEditor.Strings.normal,
			style: {
				element: 'span',
				attributes: {
					class: 'bg-transparent',
					textClass: 'text-body'
				},
			}
		}, {
			name: Liferay.Language.get('primary'),
			style: {
				element: 'span',
				attributes: {
					class: 'bg-primary',
					textClass: 'text-primary'
				}
			}
		}, {
			name: Liferay.Language.get('disabled'),
			style: {
				element: 'span',
				attributes: {
					class: 'bg-secondary',
					textClass: 'text-secondary'
				}
			}
		}, {
			name: Liferay.Language.get('success'),
			style: {
				element: 'span',
				attributes: {
					class: 'bg-success',
					textClass: 'text-success'
				}
			}
		}, {
			name: Liferay.Language.get('danger'),
			style: {
				element: 'span',
				attributes: {
					class: 'bg-danger',
					textClass: 'text-danger'
				}
			}
		}, {
			name: Liferay.Language.get('warning'),
			style: {
				element: 'span',
				attributes: {
					class: 'bg-warning',
					textClass: 'text-warning'
				}
			}
		}, {
			name: Liferay.Language.get('info'),
			style: {
				element: 'span',
				attributes: {
					class: 'bg-info',
					textClass: 'text-info'
				}
			}
		}];
	}

});

export default BackgroundColor;
export {BackgroundColor};