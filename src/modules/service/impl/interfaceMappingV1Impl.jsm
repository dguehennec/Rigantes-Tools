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
Components.utils.import("resource://rigantestools/model/player.jsm");
Components.utils.import("resource://rigantestools/constant/constants.jsm");

var EXPORTED_SYMBOLS = [ "rigantestools_InterfaceMappingV1" ];

/**
 * Creates an instance of interfaceMappingV1.
 * 
 * @constructor
 * @this {InterfaceMappingV1}
 * 
 */
var rigantestools_InterfaceMappingV1 = function(parent) {
    /** @private */
    this._logger = new rigantestools_Logger("InterfaceMappingV1");
    /** @private */
    this._util = new rigantestools_Util();
    /** @private */
    var object = this;
    this._callbackRefresh = function() {
        object.refreshLinks();
    };
    /** @private */
    this._parent = parent;
    /** @private */
    this._currentLinks = "";
    /** @private */
    /** the worldID */
    this._worldID = "";
};

/**
 * initialize.
 * 
 * @this {InterfaceMappingV1}
 */
rigantestools_InterfaceMappingV1.prototype.initialize = function() {
    this._logger.trace("initialize");
    var contentWinWrapper = this._util.getWindow(this._parent._parent.getDocument());
    this._worldID = contentWinWrapper.worldID;
    this._parent._parent.getDocument().defaultView.addEventListener("click", this._callbackRefresh);
};

/**
 * isPlayerFound.
 * 
 * @this {InterfaceMappingV1}
 * @return {Boolean} true if player found
 */
rigantestools_InterfaceMappingV1.prototype.isPlayerFound = function() {
    var contentWinWrapper = this._util.getWindow(this._parent._parent.getDocument());
    return (typeof (contentWinWrapper.mPlayer) !== 'undefined');
}

/**
 * reset.
 * 
 * @this {InterfaceMappingV1}
 */
rigantestools_InterfaceMappingV1.prototype.reset = function() {
    this._logger.trace("reset");
    this._currentLinks = "";
    this._worldID = "";
    this._parent._parent.getDocument().defaultView.removeEventListener("click", this._callbackRefresh);
};

/**
 * release.
 * 
 * @this {InterfaceMappingV1}
 */
rigantestools_InterfaceMappingV1.prototype.release = function() {
    this._logger.trace("release");
};

/**
 * get player.
 * 
 * @this {InterfaceMappingV1}
 * @return {Player} the current player
 */
rigantestools_InterfaceMappingV1.prototype.getPlayer = function(type) {
    this._logger.trace("getPlayer");
    var contentWinWrapper = this._util.getWindow(this._parent._parent.getDocument());
    var mplayer = null;
    if (type === 'profile') {
        // get player View
        if (typeof (contentWinWrapper.mProfileView) === 'undefined') {
            return null;
        }
        mplayer = contentWinWrapper.mProfileView.player;
    } else {
        // get player
        if (typeof (contentWinWrapper.mPlayer) === 'undefined') {
            return null;
        }
        mplayer = contentWinWrapper.mPlayer;
    }
    return new rigantestools_Player(mplayer, this._worldID);
};

/**
 * refresh links of the LordsOfKnights page.
 * 
 * @this {InterfaceMapping}
 * @return {Boolean} true if success
 */
rigantestools_InterfaceMappingV1.prototype.refreshLinks = function() {
    this._logger.trace("refreshLinks");
    var contentWinWrapper = this._util.getWindow(this._parent._parent.getDocument());
    var link = contentWinWrapper.utils.clipboard.get();
    if ((link !== null) && (link !== this._currentLinks)
            && (this._util.valideHabitatLink(link) || this._util.validePlayerLink(link) || this._util.valideReportLink(link) || this._util.valideAllianceLink(link))) {
        this._currentLinks = link;
        this._util.copieToClipboard(link);
        return true;
    }
    return false;
};

/**
 * is Player Profile Selected.
 * 
 * @this {InterfaceMappingV1}
 * @return {Boolean} true if selected
 */
rigantestools_InterfaceMappingV1.prototype.isPlayerProfileSelected = function(target) {
    if (target.ownerDocument.getElementsByClassName("playerProfile").length > 0) {
        return true;
    }
    return false;
};

/**
 * is Own informations selected.
 * 
 * @this {InterfaceMapping}
 * @return {Boolean} true if selected
 */
rigantestools_InterfaceMappingV1.prototype.isOwnInformationsSelected = function(target) {
    if (target.ownerDocument.getElementsByClassName("owninformations").length > 0) {
        return true;
    }
    return false;
};

/**
 * is Report Description Selected.
 * 
 * @this {InterfaceMappingV1}
 * @return {Boolean} true if selected
 */
rigantestools_InterfaceMappingV1.prototype.isReportDescriptionSelected = function(target) {
    var nodes = target.ownerDocument.getElementsByClassName("reportdescription");
    if (nodes.length > 0 && ((nodes[0].innerHTML.indexOf("Une bataille a eu lieu à") >= 0) || (nodes[0].innerHTML.indexOf("A battle was fought at") >= 0))) {
        return true;
    }
    return false;
};

/**
 * copy Attack Report.
 * 
 * @this {InterfaceMapping}
 * @return {Object} parameters
 */
rigantestools_InterfaceMappingV1.prototype.copyAttackReport = function(target) {
    var simulationParameters = {
        'attackers' : {
            'spearman' : 0,
            'swordman' : 0,
            'archer' : 0,
            'crossbowman' : 0,
            'scorpionRider' : 0,
            'lancer' : 0
        },
        'defenser' : {
            'spearman' : 0,
            'swordman' : 0,
            'archer' : 0,
            'crossbowman' : 0,
            'scorpionRider' : 0,
            'lancer' : 0
        }
    };

    try {
        var nodesTitles = target.ownerDocument.getElementsByClassName("reportdescription");
        if (nodesTitles.length === 0) {
            return simulationParameters;
        }

        var castlesAttacked = nodesTitles[0].innerHTML;
        var nodesUnitsTitle = target.ownerDocument.getElementsByClassName("unitstitle");
        for (var index = 0; index < nodesUnitsTitle.length; index++) {
            var castleTitle = nodesUnitsTitle[index].innerHTML.split(" - ");
            var castle = castleTitle[0];
            var attacked = true;
            if (castlesAttacked.indexOf(castle) >= 0) {
                attacked = false;
            }
            var unitsTable = nodesUnitsTitle[index].parentNode;
            if (unitsTable !== null) {
                var unitsCount = unitsTable.getElementsByClassName("count");
                var switchImageCount = unitsTable.getElementsByClassName("switchImage");
                if (unitsCount.length === switchImageCount.length) {
                    for (var indexUnit = 0; indexUnit < unitsCount.length; indexUnit++) {
                        var unitCount = Number(unitsCount[indexUnit].innerHTML);
                        var unitType = switchImageCount[indexUnit].src;
                        if (unitType.toLowerCase().indexOf("spearman") >= 0) {
                            if (attacked) {
                                simulationParameters.attackers.spearman += unitCount;
                            } else {
                                simulationParameters.defenser.spearman += unitCount;
                            }
                        }
                        if (unitType.toLowerCase().indexOf("swordman") >= 0) {
                            if (attacked) {
                                simulationParameters.attackers.swordman += unitCount;
                            } else {
                                simulationParameters.defenser.swordman += unitCount;
                            }
                        }
                        if (unitType.toLowerCase().indexOf("archer") >= 0) {
                            if (attacked) {
                                simulationParameters.attackers.archer += unitCount;
                            } else {
                                simulationParameters.defenser.archer += unitCount;
                            }
                        }
                        if (unitType.toLowerCase().indexOf("crossbowman") >= 0) {
                            if (attacked) {
                                simulationParameters.attackers.crossbowman += unitCount;
                            } else {
                                simulationParameters.defenser.crossbowman += unitCount;
                            }
                        }
                        if (unitType.toLowerCase().indexOf("scorpion") >= 0) {
                            if (attacked) {
                                simulationParameters.attackers.scorpionRider += unitCount;
                            } else {
                                simulationParameters.defenser.scorpionRider += unitCount;
                            }
                        }
                        if (unitType.toLowerCase().indexOf("lancer") >= 0) {
                            if (attacked) {
                                simulationParameters.attackers.lancer += unitCount;
                            } else {
                                simulationParameters.defenser.lancer += unitCount;
                            }
                        }
                    }
                }
            }
        }
    } catch (e) {
        this._logger.error("onCopyAttackReportTargetClick", e);
    }
    return simulationParameters;
};

/**
 * Freeze the interface
 */
Object.freeze(rigantestools_InterfaceMappingV1);
