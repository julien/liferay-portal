/** Used to map HTML entities to characters. */

const htmlUnescapes = {
	'&amp;': '&',
	'&gt;': '>',
	'&lt;': '<',
	'&quot;': '"',
	'&#39;': '\''
};

/** Used to match HTML entities and HTML characters. */

const reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g;
const reHasEscapedHtml = RegExp(reEscapedHtml.source);

/**
 *Converts the HTML entities
 * `&amp;`,`&gt;`, `&lt;`,`&quot;` and `&#39;` in `string` to
 * their corresponding characters.
 * @param {string} [string=''] The string to unescape.
 * @returns {string} Returns the unescaped string.
 * @example
 *
 * unescape('fred, barney, &amp; pebbles')
 * // => 'fred, barney, & pebbles'
 */

export default function unescape(string) {
	return (string && reHasEscapedHtml.test(string)) ?
		string.replace(reEscapedHtml, (entity) => htmlUnescapes[entity]) : string;
}