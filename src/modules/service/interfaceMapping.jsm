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

Components.utils.import("resource://rigantestools/service/util.jsm");
Components.utils.import("resource://rigantestools/service/logger.jsm");
Components.utils.import("resource://rigantestools/service/notifier.jsm");
Components.utils.import("resource://rigantestools/service/impl/interfaceMappingV1Impl.jsm");
Components.utils.import("resource://rigantestools/service/impl/interfaceMappingV2Impl.jsm");
Components.utils.import("resource://rigantestools/constant/constants.jsm");

var EXPORTED_SYMBOLS = [ "rigantestools_InterfaceMapping" ];

/**
 * Creates an instance of InterfaceMapping.
 * 
 * @constructor
 * @this {InterfaceMapping}
 * @param {Main}
 *            parent
 */
var rigantestools_InterfaceMapping = function(parent) {
    this._logger = new rigantestools_Logger("InterfaceMapping");
    /** @private */
    this._util = new rigantestools_Util();
    /** @private */
    /** The v1 interface. */
    this._interfaceV1 = new rigantestools_InterfaceMappingV1(this);
    /** @private */
    /** The v2 interface. */
    this._interfaceV2 = new rigantestools_InterfaceMappingV2(this);
    /** @private */
    /** The notifier. */
    this._notifier = new rigantestools_Notifier(this);
    /** @private */
    /** The current interface used. */
    this._currentInterface = null;
    /** @private */
    /** The parent. */
    this._parent = parent;
};

/**
 * initialize.
 * 
 * @this {InterfaceMapping}
 * @return {Boolean} true, if correctly initialized
 */
rigantestools_InterfaceMapping.prototype.initialize = function() {
    this._currentInterface = null;

    var contentWinWrapper = this._util.getWindow(this._parent.getDocument());
    if (contentWinWrapper === null) {
        return false;
    }

    if (typeof (contentWinWrapper.Player) !== 'undefined') {
        this._currentInterface = this._interfaceV1;
    } else if (typeof (contentWinWrapper.cred) !== 'undefined') {
        this._currentInterface = this._interfaceV2;
    } else {
        return false;
    }

    this._currentInterface.initialize();
    // start notifier
    this._notifier.start();
    return true;
};

/**
 * reset.
 * 
 * @this {InterfaceMapping}
 */
rigantestools_InterfaceMapping.prototype.reset = function() {
    this._currentInterface = null;
    // reset interfaces
    this._interfaceV1.reset();
    this._interfaceV2.reset();
    // stop notifier
    this._notifier.stop();
};

/**
 * release.
 * 
 * @this {InterfaceMapping}
 */
rigantestools_InterfaceMapping.prototype.release = function() {
    this._interfaceV1.release();
    this._interfaceV2.release();
};

/**
 * isInitialized.
 * 
 * @this {InterfaceMapping}
 * @return {Boolean} true, if initialized
 */
rigantestools_InterfaceMapping.prototype.isInitialized = function() {
    if (this._parent.getDocument() === null) {
        this._currentInterface = null;
        return false;
    }
    if (this._currentInterface === null) {
        return false;
    }
    return this._currentInterface.isPlayerFound();
};

/**
 * get notifier.
 * 
 * @this {InterfaceMapping}
 * @return {Notifier} the notifier
 */
rigantestools_InterfaceMapping.prototype.getNotifier = function() {
    return this._notifier;
};

/**
 * get player.
 * 
 * @this {InterfaceMapping}
 * @param {type}
 *            type of player : current player or profil player
 * @return {Player} the current player
 */
rigantestools_InterfaceMapping.prototype.getPlayer = function(type) {
    if (this.isInitialized()) {
        return this._currentInterface.getPlayer(type);
    }
    return null;
};

/**
 * is Player Profile Selected.
 * 
 * @this {InterfaceMapping}
 * @return {Boolean} true if selected
 */
rigantestools_InterfaceMapping.prototype.isPlayerProfileSelected = function() {
    if (this.isInitialized()) {
        return this._currentInterface.isPlayerProfileSelected();
    }
    return false;
};

/**
 * is Report Description Selected.
 * 
 * @this {InterfaceMapping}
 * @return {Boolean} true if selected
 */
rigantestools_InterfaceMapping.prototype.isReportDescriptionSelected = function() {
    if (this.isInitialized()) {
        return this._currentInterface.isReportDescriptionSelected();
    }
    return false;
};

/**
 * is Own informations selected.
 * 
 * @this {InterfaceMapping}
 * @return {Boolean} true if selected
 */
rigantestools_InterfaceMapping.prototype.isOwnInformationsSelected = function() {
    if (this.isInitialized()) {
        return this._currentInterface.isOwnInformationsSelected();
    }
    return false;
};

/**
 * copy Attack Report.
 * 
 * @this {InterfaceMapping}
 * @return {Boolean} true if selected
 */
rigantestools_InterfaceMapping.prototype.copyAttackReport = function() {
    if (this.isInitialized()) {
        return this._currentInterface.copyAttackReport();
    }
    return false;
};

/**
 * copy Profile.
 * 
 * @this {InterfaceMapping}
 * @return {Boolean} true if selected
 */
rigantestools_InterfaceMapping.prototype.copyProfile = function() {
    try {
        var index;
        var province;

        var player = null;
        if (this.isPlayerProfileSelected() && !this.isOwnInformationsSelected()) {
            player = this.getPlayer('profile');
        } else {
            player = this.getPlayer();
        }
        if (player === null) {
            return;
        }

        var currentHabitats = [];
        var area = this._util.getPref(rigantestools_Constant.PREF_CASTLES_AREA);
        var provArea = [];
        if (area !== "" && area !== null) {
            provArea = area.split('#');
        }
        for (index = 0; index < provArea.length + 1; index++) {
            if (index < provArea.length) {
                province = provArea[index].split('§');
                currentHabitats.push(province[0] + " :\n");
            } else {
                currentHabitats.push(this._util.getBundleString("mainframe.player.castleOther") + " :\n");
            }
        }
        var habitats = player.getHabitatList();
        for (var indexHab = 0; indexHab < habitats.length; indexHab++) {
            var habitat = habitats[indexHab];
            var inProv = false;
            for (var indexProv = 0; indexProv < provArea.length; indexProv++) {
                province = provArea[indexProv].split('§');
                var mapX = habitat.getMapXFromLink(province[1]);
                var mapY = habitat.getMapYFromLink(province[1]);
                var distance = province[2];
                if (habitat.getDistanceTo(mapX, mapY) <= distance) {
                    currentHabitats[indexProv] += habitat.name + " " + habitat.link + "\n";
                    inProv = true;
                }
            }
            if (!inProv) {
                currentHabitats[provArea.length] += habitat.name + " " + habitat.link + "\n";
            }
        }
        var message = this._util.getBundleString("date") + " :" + this._util.formatDateTime(new Date()) + "\n\n" + player.name + "\n" + player.link + "\n\n" + this._util.getBundleString("points")
                + " : " + player.points + "\n" + this._util.getBundleString("ally") + " :" + player.allianceName + "\n" + this._util.getBundleString("castles") + " :" + habitats.length + "\n\n";
        for (index = 0; index < currentHabitats.length; index++) {
            message += currentHabitats[index] + "\n\n";
        }
        this._util.copieToClipboard(message);
        return true;
    } catch (e) {
        this._logger.error("onCopyProfileTargetClick = " + e);
    }
    return false;
};

/**
 * Freeze the interface
 */
Object.freeze(rigantestools_InterfaceMapping);
