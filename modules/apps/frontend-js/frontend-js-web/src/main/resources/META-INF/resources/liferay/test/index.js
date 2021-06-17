import React from 'react';
import ReactDOM from 'react-dom';

const TranslationSelector = () => {
	return (<div>{'Im a translation selector'}</div>);
};

export default function(container) {
	const element = <TranslationSelector />;
	ReactDOM.render(element, container);
}
