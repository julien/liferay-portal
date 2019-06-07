import {DefaultEventHandler} from 'frontend-js-web';

class SiteDropdownDefaultEventHandler extends DefaultEventHandler {
	joinSite(itemData) {
		this._send(itemData.joinSiteURL);
	}

	leaveSite(itemData) {
		this._send(itemData.leaveSiteURL);
	}

	_send(url) {
		submitForm(document.hrefFm, url);
	}
}

export default SiteDropdownDefaultEventHandler;
