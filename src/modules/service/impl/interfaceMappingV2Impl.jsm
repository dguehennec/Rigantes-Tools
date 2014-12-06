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
Components.utils.import("resource://rigantestools/service/debugger.jsm");
Components.utils.import("resource://rigantestools/model/player.jsm");
Components.utils.import("resource://rigantestools/constant/constants.jsm");

var EXPORTED_SYMBOLS = [ "rigantestools_InterfaceMappingV2" ];

/**
 * Creates an instance of interfaceMappingV1.
 * 
 * @constructor
 * @this {InterfaceMappingV2}
 * 
 */
var rigantestools_InterfaceMappingV2 = function(parent) {
    /** @private */
    this._logger = new rigantestools_Logger("InterfaceMappingV2");
    /** @private */
    this._util = new rigantestools_Util();
    /** @private */
    /** The debugger. */
    this._debugger = new rigantestools_Debugger(this);
    /** @private */
    this._parent = parent;
    /** @private */
    /** the current mplayer of lords and knights information */
    this._mplayer = null;
    /** @private */
    /** the worldID */
    this._worldID = "";
};

/**
 * initialize.
 * 
 * @this {InterfaceMappingV2}
 */
rigantestools_InterfaceMappingV2.prototype.initialize = function() {
    this._logger.trace("initialize");
    var contentWinWrapper = this._util.getWindow(this._parent._parent.getDocument());
    this._worldID = contentWinWrapper.cred.worldID;

    this._debugger.initialize(contentWinWrapper);
};

/**
 * isPlayerFound.
 * 
 * @this {InterfaceMappingV2}
 * @return {Boolean} true if player found
 */
rigantestools_InterfaceMappingV2.prototype.isPlayerFound = function() {
    var contentWinWrapper = this._util.getWindow(this._parent._parent.getDocument());
    return (this._mplayer !== null);
}

/**
 * reset.
 * 
 * @this {InterfaceMappingV2}
 */
rigantestools_InterfaceMappingV2.prototype.reset = function() {
    this._logger.trace("reset");
    this._mplayer = null;
    this._worldID = "";
    this._debugger.reset();
};

/**
 * release.
 * 
 * @this {InterfaceMappingV2}
 */
rigantestools_InterfaceMappingV2.prototype.release = function() {
    this._logger.trace("release");
    this._debugger.release();
};

/**
 * get player.
 * 
 * @this {InterfaceMappingV2}
 * @return {Player} the current player
 */
rigantestools_InterfaceMappingV2.prototype.getPlayer = function(type) {
    this._logger.trace("getPlayer " + this._mplayer);
    return new rigantestools_Player(this._mplayer, this._worldID);
};

/**
 * refresh links of the LordsOfKnights page.
 * 
 * @this {InterfaceMappingV2}
 * @param {Number}
 *            mapX
 * @param {Number}
 *            mapY
 */
rigantestools_InterfaceMappingV2.prototype.refreshLinks = function(mapX, mapY) {
    this._logger.trace("refreshLinks");
    this._util.copieToClipboard('l+k://coordinates?' + mapX + ',' + mapY + '&' + this._worldID);
};

/**
 * is Player Profile Selected.
 * 
 * @this {InterfaceMappingV2}
 * @return {Boolean} true if selected
 */
rigantestools_InterfaceMappingV2.prototype.isPlayerProfileSelected = function() {
    return false;
};

/**
 * is Own informations selected.
 * 
 * @this {InterfaceMapping}
 * @return {Boolean} true if selected
 */
rigantestools_InterfaceMappingV2.prototype.isOwnInformationsSelected = function() {
    return false;
};

/**
 * is Report Description Selected.
 * 
 * @this {InterfaceMappingV2}
 * @return {Boolean} true if selected
 */
rigantestools_InterfaceMappingV2.prototype.isReportDescriptionSelected = function() {
    return (this.getReportNode() !== null);
};

/**
 * copy Attack Report.
 * 
 * @this {InterfaceMapping}
 * @return {Object} parameters
 */
rigantestools_InterfaceMappingV2.prototype.copyAttackReport = function() {
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
    var mappingUnitType = {
        '1' : 'spearman',
        '2' : 'swordman',
        '101' : 'archer',
        '102' : 'crossbowman',
        '201' : 'scorpionRider',
        '202' : 'lancer'
    };
    try {
        var nodeReport = this.getReportNode();
        if (nodeReport === null) {
            return simulationParameters;
        }
        var classname = [ "unittable", "resourcetable" ];
        for ( var key in classname) {
            var nodeTable = nodeReport.getElementsByClassName(classname[key]);
            for (var index = 0; index < nodeTable.length; index++) {
                var isDefense = (nodeTable[index].parentNode.parentNode.className.indexOf("defenderPartyContainer") !== -1);
                var nodesUnitElementTable = nodeTable[index].getElementsByClassName("unitElement");
                for (var indexUnit = 0; indexUnit < nodesUnitElementTable.length; indexUnit++) {
                    var unitType = nodesUnitElementTable[indexUnit].getAttribute("data-primary-key");
                    var unitCount = Number(nodesUnitElementTable[indexUnit].getElementsByClassName("affordable")[0].innerHTML);
                    if (!isDefense) {
                        simulationParameters.attackers[mappingUnitType[unitType]] += unitCount;
                    } else {
                        simulationParameters.defenser[mappingUnitType[unitType]] += unitCount;
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
 * get report node.
 * 
 * @this {InterfaceMappingV2}
 * @return {Node} node of the report
 */
rigantestools_InterfaceMappingV2.prototype.getReportNode = function() {
    var target = gContextMenu.target;
    var i = 0;
    while (typeof target !== "undefined" && target !== null && i < 15) {
        if (typeof target.className !== "undefined" && target.className !== null && target.className.indexOf("contentCurrentView") !== -1 && target.className.indexOf("report") !== -1) {
            return target;
        } else {
            target = target.parentNode;
            i++;
        }
    }
    return null;
};

/**
 * Freeze the interface
 */
Object.freeze(rigantestools_InterfaceMappingV2);
