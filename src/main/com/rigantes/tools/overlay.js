/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Rigantes Tools.
 *
 * The Initial Developer of the Original Code is
 * David GUEHENNEC.
 * Portions created by the Initial Developer are Copyright (C) 2013
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

if (!com) {
    var com = {};
}
if (!com.rigantestools) {
    com.rigantestools = {};
}
/**
 * The Class Main.
 * 
 * @constructor
 * @this {Main}
 */
com.rigantestools.Main = {};

/**
 * Init module.
 * 
 * @this {Main}
 */
com.rigantestools.Main.init = function() {
    /** @private */
    /** The logger. */
    this._logger = new com.rigantestools.service.Logger("Main");
    this._logger.trace("init");
    /** @private */
    /** The util tool. */
    this._util = new com.rigantestools.service.Util();
    this._util.addObserver(this, com.rigantestools.constant.OBSERVER.REFRESH);
    /** @private */
    /** The interface Mapping. */
    this._interfaceMapping = new com.rigantestools.service.InterfaceMapping(this);
    /** @private */
    /** The document of the LordsOfKnights page. */
    this._document = null;
    /** @private */
    /** The mainFrame parameters when necessary. */
    this._mainFrameParameters = null;

    this.checkVersion();
    this.refresh();

    // add event listener to notify when Dom content is loaded
    window.document.addEventListener("DOMContentLoaded", this.contentLoadedEvent);
};

/**
 * release Main.
 * 
 * @this {Main}
 */

com.rigantestools.Main.release = function() {
    if (this._util) {
        this._logger.trace("release");
        this._util.removeObserver(this, com.rigantestools.constant.OBSERVER.REFRESH);
        this._interfaceMapping.release();
    }
};

/**
 * observe
 * 
 * @this {Main}
 * @param {ISupports}
 *            subject the subject
 * @param {String}
 *            topic the topic
 * @param {String}
 *            data the data
 */
com.rigantestools.Main.observe = function(subject, topic, data) {
    if (topic === com.rigantestools.constant.OBSERVER.REFRESH) {
        this.refresh();
    }
};

/**
 * check current version.
 * 
 * @this {Main}
 */
com.rigantestools.Main.checkVersion = function() {
    var lastversion = this._util.getPref(com.rigantestools.constant.PREF_CURRENT_VERSION);
    if (lastversion === "") {
        this._util.installButton("nav-bar", "rigantestools-toolbar-button");
    }
    this._util.setPref(com.rigantestools.constant.PREF_CURRENT_VERSION, com.rigantestools.constant.VERSION_NUMBER);
};

/**
 * Sets the document of the LordsOfKnights page.
 * 
 * @this {Main}
 * @param {DOMDocument}
 *            currentDoc the LordsOfKnights document page
 */
com.rigantestools.Main.setDocument = function(currentDoc) {
    this._document = currentDoc;
};

/**
 * Get the document of the LordsOfKnights page.
 * 
 * @this {Main}
 * @return {DOMDocument} the LordsOfKnights document page
 */
com.rigantestools.Main.getDocument = function() {
    return this._document;
};

/**
 * Get the interface.
 * 
 * @this {Main}
 * @return {InerfaceMapping} the interface
 */
com.rigantestools.Main.getInterface = function() {
    return this._interfaceMapping;
};

/**
 * Sets the mainframe parameters.
 * 
 * @this {Main}
 * @param {Object}
 *            mainFrameParameters the parameter of the mainFrame
 */
com.rigantestools.Main.setMainFrameParameters = function(mainFrameParameters) {
    this._mainFrameParameters = mainFrameParameters;
};

/**
 * Gets the mainframe parameters.
 * 
 * @this {Main}
 * @return {Object} the parameters of the mainFrame
 */
com.rigantestools.Main.getMainFrameParameters = function() {
    return this._mainFrameParameters;
};

/**
 * refresh Main.
 * 
 * @this {Main}
 */
com.rigantestools.Main.refresh = function() {
    // show or hide statusbar
    if (window.statusbar.visible && this._util.getPref(com.rigantestools.constant.PREF_ACCESS_STATUSBAR)) {
        this._util.setVisibility('rigantestools-status-icon', "visible");
    } else {
        this._util.setVisibility('rigantestools-status-icon', "collapse");
    }
    // refresh nb unread message
    var nbUnreadMessages = this._interfaceMapping.getNotifier().getNbUnreadMessage();
    if ((this._document !== null) && (nbUnreadMessages > 0)) {
        this._util.setAttribute('rigantestools-toolbar-button-label', "value", nbUnreadMessages);
    } else {
        this._util.setAttribute('rigantestools-toolbar-button-label', "value", "");
    }

    // refresh contextMenu and icon status
    if (this._document !== null) {
        this.setIcon(1);
    } else {
        this.setIcon(0);
        this._util.setAttribute("rigantestools-contextMenuItemSeparator", "hidden", "true");
        this._util.setAttribute("rigantestools-contextMenuItemAttack", "hidden", "true");
        this._util.setAttribute("rigantestools-contextMenuItemDefense", "hidden", "true");
        this._util.setAttribute("rigantestools-contextMenuItemCopyAttackReport", "hidden", "true");
        this._util.setAttribute("rigantestools-contextMenuItemCopyProfile", "hidden", "true");
    }
};

/**
 * Checks if URL is Lords And Knights.
 * 
 * @this {Main}
 * @param {String}
 *            href the url to test
 * @return {Boolean} true, if URL is browser.rigantestools.com
 */
com.rigantestools.Main.isLordsAndKnightsWebSite = function(href) {
    return (href.indexOf("browser.lordsandknights.com") >= 0);
};

/**
 * Sets the icon status.
 * 
 * @this {Main}
 * @param {Number}
 *            value 0 -> disable, 1 -> enable
 */
com.rigantestools.Main.setIcon = function(value) {
    if (this._util.getPref(com.rigantestools.constant.PREF_ACCESS_STATUSBAR)) {
        this._util.setAttribute('rigantestools-status-icon', "status", value);
    }
    this._util.setAttribute('rigantestools-mainToolsApp', "status", value);
    this._util.setAttribute('rigantestools-toolbar-button', "status", value);
};

/**
 * Show MainFrame
 * 
 * @this {Main}
 * @param {Number}
 *            selectedTab the selected tab in MainFrame
 * @param {Object}
 *            parameters the parameters used by the MainFrame to initialize
 *            display
 * @return {Boolean} true if success
 */
com.rigantestools.Main.showMainFrame = function(selectedTab, parameters) {
    this._logger.trace("showMainFrame(" + selectedTab + "," + parameters + ")");
    if (!this._interfaceMapping.isInitialized()) {
        this._util.showMessage(this._util.getBundleString("error.data.invalid.title"), this._util.getBundleString("error.data.invalid.message"));
        return false;
    }
    this.setMainFrameParameters({
        tab : selectedTab,
        parameters : parameters
    });
    var topWindow = this._util.getXULWindow("window:rigantestoolsMainFrame");
    if (topWindow) {
        try {
            topWindow.focus();
        } catch (e) {
            this._logger.error("showMainFrame = " + e);
            return false;
        }
    } else {
        this._util.showMainFrame(this);
    }
    return true;
};

/**
 * Show Option Menu
 * 
 * @this {Main}
 */
com.rigantestools.Main.openOptionsDialog = function() {
    this._logger.trace("openOptionsDialog");
    this._util.showOption(0);
};

/**
 * Show About Menu
 * 
 * @this {Main}
 */
com.rigantestools.Main.openAboutDialog = function() {
    this._logger.trace("openAboutDialog");
    this._util.showAbout();
};

/**
 * Show Help Menu
 * 
 * @this {Main}
 */
com.rigantestools.Main.openHelpDialog = function() {
    this._logger.trace("openHelpDialog");
    this._util.openURL('http://rigantes.free.fr/?page_id=54');
};

/**
 * Show WebSite Menu
 * 
 * @this {Main}
 */
com.rigantestools.Main.openWebSiteDialog = function() {
    this._logger.trace("openWebSiteDialog");
    this._util.openURL('http://rigantes.free.fr/');
};

/**
 * Update context menu
 * 
 * @this {Main}
 */
com.rigantestools.Main.updateContextMenu = function() {
    var toShow = (gContextMenu.onLink && this._util.valideHabitatLink(gContextMenu.target.innerHTML.replace("&amp;", "&")));
    this._util.setAttribute("rigantestools-contextMenuItemSeparator", "hidden", !toShow);
    this._util.setAttribute("rigantestools-contextMenuItemAttack", "hidden", !toShow);
    this._util.setAttribute("rigantestools-contextMenuItemDefense", "hidden", !toShow);
    this._util.setAttribute("rigantestools-contextMenuItemCopyProfile", "hidden", "true");
    this._util.setAttribute("rigantestools-contextMenuItemCopyAttackReport", "hidden", "true");
    if (this.isLordsAndKnightsWebSite(gContextMenu.target.ownerDocument.location.href)) {
        if (this._interfaceMapping.isPlayerProfileSelected()) {
            this._util.removeAttribute("rigantestools-contextMenuItemSeparator", "hidden");
            this._util.removeAttribute("rigantestools-contextMenuItemCopyProfile", "hidden");
        }

        if (this._interfaceMapping.isReportDescriptionSelected()) {
            this._util.removeAttribute("rigantestools-contextMenuItemSeparator", "hidden");
            this._util.removeAttribute("rigantestools-contextMenuItemCopyAttackReport", "hidden");
        }
    }
};

/**
 * Check Web Site.
 * 
 * @this {Main}
 * @param {DOMDocument}
 *            doc the window document
 * @return {Boolean} true, if web site ok
 */
com.rigantestools.Main.checkWebSite = function(doc) {
    var href = doc.location.toString();
    if (this.isLordsAndKnightsWebSite(href)) {
        return true;
    }
    return false;
};

/**
 * call on DOMContentLoaded
 * 
 * @this {Main}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.Main.contentLoaded = function(evt) {
    this._logger.trace("contentLoaded");
    if (evt.originalTarget instanceof HTMLDocument) {
        var doc = evt.originalTarget;
        if ((doc.location !== null) && this.checkWebSite(doc)) {
            this.setDocument(doc);
            this.refresh();
            this._interfaceMapping.initialize();
            // update events listener
            window.document.removeEventListener("DOMContentLoaded", this.contentLoadedEvent);
            window.document.getElementById("contentAreaContextMenu").addEventListener('popupshowing', this.updateContextMenuEvent, false);
            doc.defaultView.addEventListener("unload", this.contentUnloadEvent);
        }
    }
};

/**
 * call on content unloaded
 * 
 * @this {Main}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.Main.contentUnload = function(evt) {
    this._logger.trace("contentUnload");
    // reset interface mapping
    this._interfaceMapping.reset();
    // update events listener
    window.document.addEventListener("DOMContentLoaded", this.contentLoadedEvent);
    window.document.getElementById("contentAreaContextMenu").removeEventListener('popupshowing', this.updateContextMenuEvent);
    var doc = evt.originalTarget;
    if ((doc.location !== null) && this.checkWebSite(doc)) {
        doc.defaultView.removeEventListener("unload", this.contentUnloadEvent);
    }
    // update menu
    this.setDocument(null);
    this.refresh();
};

/**
 * call on statusBar event
 * 
 * @this {Main}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.Main.onStatusBarClick = function(evt) {
    this._logger.trace("onStatusBarClick");
    if (evt === undefined || evt.button === 0) {
        if (this.getDocument() !== null) {
            this.showMainFrame();
        } else {
            this._util.showMessage(this._util.getBundleString("error.site.invalid.title"), this._util.getBundleString("error.site.invalid.message"));
            this._util.openURL('http://lordsandknights.com/');
        }
    }
};

/**
 * call on attack target event
 * 
 * @this {Main}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.Main.onAttackTargetClick = function(evt) {
    this._logger.trace("onAttackTargetClick");
    this.showMainFrame(1, gContextMenu.target.innerHTML.replace("&amp;", "&"));
};

/**
 * call on defense target event
 * 
 * @this {Main}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.Main.onDefenseTargetClick = function(evt) {
    this._logger.trace("onDefenseTargetClick");
    this.showMainFrame(3, gContextMenu.target.innerHTML.replace("&amp;", "&"));
};

/**
 * call on copy attack report target event
 * 
 * @this {Main}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.Main.onCopyAttackReportTargetClick = function(evt) {
    this._logger.trace("onCopyAttackReportTargetClick");
    this.showMainFrame(5, this._interfaceMapping.copyAttackReport());
};

/**
 * call on copy profile target event
 * 
 * @this {Main}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.Main.onCopyProfileTargetClick = function(evt) {
    this._logger.trace("onCopyProfileTargetClick");
    this._interfaceMapping.copyProfile();
};

/**
 * call on DOMContentLoaded Event
 * 
 * @this {Main}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.Main.contentLoadedEvent = function(evt) {
    com.rigantestools.Main.contentLoaded(evt);
};

/**
 * call on content unloaded Event
 * 
 * @this {Main}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.Main.contentUnloadEvent = function(evt) {
    com.rigantestools.Main.contentUnload(evt);
};

/**
 * Update context menu
 * 
 * @this {Main}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.Main.updateContextMenuEvent = function(evt) {
    com.rigantestools.Main.updateContextMenu();
};

/**
 * add event listener to notify when addon is loaded
 * 
 */
window.addEventListener("load", function() {
    window.setTimeout(function() {
        com.rigantestools.Main.init();
    });
}, false);

/**
 * add event listener to notify when content is loaded
 * 
 */
window.addEventListener("unload", function() {
    window.setTimeout(function() {
        com.rigantestools.Main.release();
    });
}, false);