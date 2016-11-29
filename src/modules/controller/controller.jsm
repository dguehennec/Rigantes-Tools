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

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://rigantestools/constant/constants.jsm");
Components.utils.import("resource://rigantestools/service/interfaceMapping.jsm");
Components.utils.import("resource://rigantestools/service/logger.jsm");
Components.utils.import("resource://rigantestools/service/util.jsm");

var EXPORTED_SYMBOLS = [ "rigantestools_Controller" ];

/* ***************** Private object used by Controller ********************* */

/**
 * Creates a single instance of private data associated.
 * 
 * @constructor
 * @static
 * @this {Controller}
 */
var rigantestools_Controller = {
    /** @private */
    /** The util tool. */
    _util : new rigantestools_Util(),
    /** @private */
    /** The interface Mapping. */
    _interfaceMapping : undefined,
    /** @private */
    /** The listeners list. */
    _listenerList : [],
    /** @private */
    /** The current interface listener. */
    _currentInterfaceListener : undefined,
    /** @private */
    /** The document of the LordsOfKnights page. */
    _document : undefined,
};

/**
 * connect the listener to the controller
 *
 * @this {Controller}
 * @param {Object}
 *            listener the listener
 */
rigantestools_Controller.connect = function(listener) {
    if (!this._interfaceMapping) {
        this._interfaceMapping = new rigantestools_InterfaceMapping(this);
    }
    this._listenerList.push(listener);
};

/**
 * disconnect the listener of the controller
 *
 * @this {Controller}
 * @param {Object}
 *            listener the listener
 */
rigantestools_Controller.disconnect = function(listener) {
    this.lordAndKnightsInterfaceUnloaded(listener);

    for (var index = 0; index < this._listenerList.length; index++) {
        if (this._listenerList[index] === listener) {
            this._listenerList.splice(index, 1);
            break;
        }
    }
};

/**
 * notify the controller that the lordAndKnightsInterface is loaded
 *
 * @this {Controller}
 * @param {Object}
 *            listener the listener
 * @param {DOMDocument}
 *            doc the document of the current page
 */
rigantestools_Controller.lordAndKnightsInterfaceLoaded = function(listener, doc) {
    if (this.isInitialized()) {
        return false;
    }
    this._currentInterfaceListener = listener;
    this._document = doc;

    if (this._interfaceMapping.initialize()) {
        this._util.notifyObservers(rigantestools_Constant.OBSERVER.REFRESH);
        return true;
    }
    return false;
};

/**
 * notify the controller that the lordAndKnightsInterface is unloaded
 *
 * @this {Controller}
 * @param {Object}
 *            listener the listener
 */
rigantestools_Controller.lordAndKnightsInterfaceUnloaded = function(listener) {
    if (this._currentInterfaceListener != listener) {
        return;
    }
    if (this.isInitialized()) {
        this._interfaceMapping.reset();
    }
    this._currentInterfaceListener = undefined;
    this._document = undefined;
    rigantestools_UtilPlayer.release();
    this._util.notifyObservers(rigantestools_Constant.OBSERVER.REFRESH);
};

/**
 * Get the document of the LordsOfKnights page.
 * 
 * @this {Controller}
 * @return {DOMDocument} the LordsOfKnights document page
 */
rigantestools_Controller.getDocument = function() {
    return this._document;
};

/**
 * is initialized
 *
 * @this {Controller}
 * @return {boolean} true if interface initialized
 */
rigantestools_Controller.isInitialized = function() {
    return this._interfaceMapping.isInitialized();
};

/**
 * is player profile window is selected
 *
 * @this {Controller}
 * @param {Node}
 *            target the current node selected
 * @return {boolean} true if player profile window is selected
 */
rigantestools_Controller.isPlayerProfileSelected = function(target) {
    return this._interfaceMapping.isPlayerProfileSelected(target);
};

/**
 * is own information window is selected
 *
 * @this {Controller}
 * @param {Node}
 *            target the current node selected
 * @return {boolean} true if own information window is selected
 */
rigantestools_Controller.isOwnInformationsSelected = function(target) {
    return this._interfaceMapping.isOwnInformationsSelected(target);
};

/**
 * is report window is selected
 *
 * @this {Controller}
 * @param {Node}
 *            target the current node selected
 * @return {boolean} true if report window is selected
 */
rigantestools_Controller.isReportDescriptionSelected = function(target) {
    return this._interfaceMapping.isReportDescriptionSelected(target);
};

/**
 * copy profile
 *
 * @this {Controller}
 * @param {Node}
 *            target the current node selected
 * @return {boolean} true if copy is successful
 */
rigantestools_Controller.copyProfile = function(target) {
    return this._interfaceMapping.copyProfile(target);
};

/**
 * copy attack report
 *
 * @this {Controller}
 * @param {Node}
 *            target the current node selected
 * @return {Object} attack report information
 */
rigantestools_Controller.copyAttackReport = function(target) {
    return this._interfaceMapping.copyAttackReport(target);
};

/**
 * get number of unread messages
 *
 * @this {Controller}
 * @return {Number} the number unread messages
 */
rigantestools_Controller.getNbUnreadMessage = function() {
    return this._interfaceMapping.getNotifier().getNbUnreadMessage();
};

/**
 * get player
 *
 * @this {Controller}
 * @return {Player} the player
 */
rigantestools_Controller.getPlayer = function() {
    return this._interfaceMapping.getPlayer();
};
