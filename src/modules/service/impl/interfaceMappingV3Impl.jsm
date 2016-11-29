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

var EXPORTED_SYMBOLS = [ "rigantestools_InterfaceMappingV3" ];

/**
 * Creates an instance of interfaceMappingV1.
 *
 * @constructor
 * @this {InterfaceMappingV3}
 *
 */
var rigantestools_InterfaceMappingV3 = function(parent) {
    /** @private */
    this._logger = new rigantestools_Logger("InterfaceMappingV3");
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
    /** the current players profile selected */
    this._playerProfileSelected = undefined;
    /** @private */
    /** the worldID */
    this._worldID = "";
};

/**
 * initialize.
 *
 * @this {InterfaceMappingV3}
 */
rigantestools_InterfaceMappingV3.prototype.initialize = function() {
    this._logger.trace("initialize");
    var contentWinWrapper = this._util.getWindow(this._parent._parent.getDocument());
    this._debugger.initialize(contentWinWrapper);
};

/**
 * isPlayerFound.
 *
 * @this {InterfaceMappingV3}
 * @return {Boolean} true if player found
 */
rigantestools_InterfaceMappingV3.prototype.isPlayerFound = function() {
    var contentWinWrapper = this._util.getWindow(this._parent._parent.getDocument());
    return (this._mplayer !== null);
}

/**
 * reset.
 *
 * @this {InterfaceMappingV3}
 */
rigantestools_InterfaceMappingV3.prototype.reset = function() {
    this._logger.trace("reset");
    this._mplayer = null;
    this._worldID = "";
    this._debugger.reset();
};

/**
 * release.
 *
 * @this {InterfaceMappingV3}
 */
rigantestools_InterfaceMappingV3.prototype.release = function() {
    this._logger.trace("release");
    this._debugger.release();
};

/**
 * get player.
 *
 * @this {InterfaceMappingV3}
 * @param {String}
 *            type the player type
 * @return {Player} the player
 */
rigantestools_InterfaceMappingV3.prototype.getPlayer = function(type) {
    var habitatSet = this._mplayer.habitatsCollection.habitatSet;
    var alliancesSet = this._mplayer.alliancesCollection.alliancesSet;
    var currentPlayer = undefined;
    var that = this;
    if (type === 'profile') {
        if (this._playerProfileSelected) {
            currentPlayer = this._playerProfileSelected;
        }
    } else {
        currentPlayer = this._mplayer.playersCollection.playersSet[this._mplayer.getPlayerId()];
    }

    if(!currentPlayer) {
        return undefined;
    }

    // player mapper
    var player = {};
    player.nick = currentPlayer.nick;
    player.id = currentPlayer.id;
    player.points = currentPlayer.points;
    player.habitateisAttacked = false;
    if(currentPlayer.habitateisAttacked) {
        player.habitateisAttacked = currentPlayer.habitateisAttacked;
    }
    player.unreadDiscussionCount = 0;
    player.unreadReportCount = 0;
    player.unreadAllianceMessages = 0;
    if(currentPlayer.alerts) {
        player.unreadDiscussionCount = currentPlayer.alerts.bottomBar.unreadDiscussionCount;
        player.unreadReportCount = currentPlayer.alerts.bottomBar.unreadReportCount;
        player.unreadAllianceMessages = currentPlayer.alerts.bottomBar.unreadThreadCount;
    }
    player.alliance = {};
    for(var sProp in alliancesSet) {
        if (alliancesSet.hasOwnProperty(sProp)) {
            var alliance = alliancesSet[sProp];
            if (currentPlayer.alliance === alliance.id) {
                player.alliance.id = alliance.id;
                player.alliance.name = alliance.name;
                break;
            }
        }
    }
    player.habitate = {};
    for(var sProp in habitatSet) {
        if (habitatSet.hasOwnProperty(sProp)) {
            var habitat = habitatSet[sProp];
            if(habitat.player && (habitat.player === player.id)) {
                var newHabitat = {};
                newHabitat.name = habitat.name;
                newHabitat.id = habitat.id;
                newHabitat.mapX = habitat.mapX;
                newHabitat.mapY = habitat.mapY;
                newHabitat.orgX = habitat.orgX;
                newHabitat.orgY = habitat.orgY;
                newHabitat.nextBattleDate = habitat.nextBattleDate;
                newHabitat.nextNPCUpgrateDate = habitat.nextNPCUpgrateDate;
                newHabitat.points = habitat.points;
                newHabitat.nextBattleDate = habitat.possibleNextBattleDate;
                newHabitat.habitatResources = habitat.habitatResourceDictionary?habitat.habitatResourceDictionary:[];
                newHabitat.habitatUnitOrders = habitat.habitatUnitOrderArray?habitat.habitatUnitOrderArray:[];
                newHabitat.habitatKnowledgeOrders = habitat.habitatKnowledgeOrderArray?habitat.habitatKnowledgeOrderArray:[];
                newHabitat.habitatBuildingUpgrades = habitat.habitatBuildingUpgradeArray?habitat.habitatBuildingUpgradeArray:[];
                newHabitat.habitatMissions = habitat.habitatMissionArray?habitat.habitatMissionArray:[];
                newHabitat.habitatTransits = [];
                newHabitat.habitatUnits = [];
                if(habitat.habitatTransitArray) {
                    habitat.habitatTransitArray.forEach(function(item) {
                        var transit = that._mplayer.transitsCollection.transits[item];
                        var newTransit = {};
                        newTransit.destinationETA = transit.destinationETA;
                        newTransit.transitType = transit.transitType;
                        if (that._mplayer.habitatsCollection.habitatSet[transit.sourceHabitat]) {
                            newTransit.sourceHabitat = that._mplayer.habitatsCollection.habitatSet[transit.sourceHabitat];
                        }
                        if (that._mplayer.habitatsCollection.habitatSet[transit.destinationHabitat]) {
                            newTransit.destinationHabitat = that._mplayer.habitatsCollection.habitatSet[transit.destinationHabitat];
                        }
                        newTransit.units = [];
                        if(transit.unitDictionary) {
                            for(var sProp in transit.unitDictionary) {
                                if (transit.unitDictionary.hasOwnProperty(sProp)) {
                                    var unitType = that._mplayer.unitsCollection.units[sProp];
                                    var unit = {
                                        count: transit.unitDictionary[sProp],
                                        identifier: unitType.identifier,
                                        storeAmount: unitType.storeAmount,
                                        corps: unitType.corps,
                                        secondsPerField: unitType.secondsPerField
                                    }
                                    newTransit.units.push(unit);
                                }
                            };
                        }
                        newHabitat.habitatTransits.push(newTransit);
                    });
                }
                if(habitat.localHabitatUnitArray) {
                    habitat.localHabitatUnitArray.forEach(function(item) {
                        var unitInfo = that._mplayer.unitsCollection.habitatUnits[item];
                        if(that._mplayer.habitatsCollection.habitatSet[unitInfo.sourceHabitat]) {
                            unitInfo.sourceHabitat = that._mplayer.habitatsCollection.habitatSet[unitInfo.sourceHabitat];
                        }
                        var unitType = that._mplayer.unitsCollection.units[unitInfo.unitId];
                        var unit = {
                            count: unitInfo.amount,
                            identifier: unitType.identifier,
                            storeAmount: unitType.storeAmount,
                            corps: unitType.corps,
                            secondsPerField: unitType.secondsPerField
                        }
                        unitInfo.units = [unit];
                        newHabitat.habitatUnits.push(unitInfo);
                    });
                }
                player.habitate[sProp] = newHabitat;
            }
        }
    }
    return new rigantestools_Player(player, this._mplayer.settings.worldId);
};

/**
 * refresh links of the LordsOfKnights page.
 *
 * @this {InterfaceMappingV3}
 * @param {Number}
 *            mapX
 * @param {Number}
 *            mapY
 */
rigantestools_InterfaceMappingV3.prototype.refreshLinks = function(mapX, mapY) {
    this._logger.trace("refreshLinks");
};

/**
 * refresh Player Profile.
 *
 * @this {InterfaceMappingV3}
 * @param {Object}
 *            player the player
 */
rigantestools_InterfaceMappingV3.prototype.refreshPlayerProfile = function(player) {
    this._logger.trace("refreshPlayerInformations");
};

/**
 * refresh Player Profile.
 *
 * @this {InterfaceMappingV3}
 * @param {String}
 *            nickname of the player
 * @return {Object} player object of undefined if not found
 */
rigantestools_InterfaceMappingV3.prototype.getPlayerFromNickName = function(nickname) {
    for (var sProp in this._mplayer.playersCollection.playersSet) {
        if (this._mplayer.playersCollection.playersSet.hasOwnProperty(sProp)) {
            var player = this._mplayer.playersCollection.playersSet[sProp];
            this._logger.trace(player.nick + ' === ' + nickname);
            if (player.nick === nickname) {
                return player;
            }
        }
    }
    return undefined;
};

/**
 * is Player Profile Selected.
 *
 * @this {InterfaceMappingV3}
 * @return {Boolean} true if selected
 */
rigantestools_InterfaceMappingV3.prototype.isPlayerProfileSelected = function(target) {
    this._playerProfileSelected = undefined;
    var currentTarget = target;
    var i = 0;
    while (currentTarget && currentTarget.parentNode && i < 15) {
        if (currentTarget.className && currentTarget.className.indexOf("menu-section") !== -1 && currentTarget.firstChild.firstChild.childNodes[1].textContent == 'Profil') {
            var currentPlayerNickNameSelected = currentTarget.childNodes[1].firstChild.childNodes[1].firstChild.firstChild.textContent;
            this._playerProfileSelected = this.getPlayerFromNickName(currentPlayerNickNameSelected);
            break;
        } else {
            currentTarget = currentTarget.parentNode;
            i++;
        }
    }
    return (this._playerProfileSelected !== undefined);
};

/**
 * is Own informations selected.
 *
 * @this {InterfaceMapping}
 * @return {Boolean} true if selected
 */
rigantestools_InterfaceMappingV3.prototype.isOwnInformationsSelected = function(target) {
    var currentTarget = target;
    var i = 0;
    while (currentTarget && currentTarget.parentNode && i < 15) {
        if (currentTarget.className && currentTarget.className.indexOf("menu-section") !== -1 && currentTarget.firstChild.firstChild.childNodes[1].textContent == 'Profil') {
            var currentPlayerNickNameSelected = currentTarget.childNodes[1].firstChild.childNodes[1].firstChild.firstChild.textContent;
            var currentPlayerSelected = this.getPlayerFromNickName(currentPlayerNickNameSelected);
            if(currentPlayerSelected.id === this._mplayer.getPlayerId()) {
                return true;
            } else {
                return false;
            }
            break;
        } else {
            currentTarget = currentTarget.parentNode;
            i++;
        }
    }
    return false;
};

/**
 * is Report Description Selected.
 *
 * @this {InterfaceMappingV3}
 * @return {Node} the current target idf exist
 */
rigantestools_InterfaceMappingV3.prototype.isReportDescriptionSelected = function(target) {
    var currentTarget = target;
    var i = 0;
    while (currentTarget && currentTarget.parentNode && i < 15) {
        if (currentTarget.className && currentTarget.className.indexOf("menu-section") !== -1 && (currentTarget.firstChild.firstChild.childNodes[1].textContent.indexOf('Report ') !== -1 || currentTarget.firstChild.firstChild.childNodes[1].textContent.indexOf('Rapport ') !== -1)) {
            return currentTarget;
        } else {
            currentTarget = currentTarget.parentNode;
            i++;
        }
    }
    return undefined;
};

/**
 * copy Attack Report.
 *
 * @this {InterfaceMapping}
 * @return {Object} parameters
 */
rigantestools_InterfaceMappingV3.prototype.copyAttackReport = function(target) {
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
        var nodeReport = this.isReportDescriptionSelected(target);
        if (nodeReport === null) {
            return simulationParameters;
        }

        var nodeTable = nodeReport.getElementsByClassName("habitat-overview--widget");
        for (var index = 0; index < nodeTable.length; index++) {
            var isDefense = false;
            if (nodeTable[index].getAttribute("data-reactid").indexOf("defender") > 0) {
                isDefense = true;
            }
            var nodesUnitElementTable = nodeTable[index].getElementsByClassName("icon-amount--widget");
            for (var indexUnit = 0; indexUnit < nodesUnitElementTable.length; indexUnit++) {
                var unitType = nodesUnitElementTable[indexUnit].getAttribute("data-reactid").split("-").pop();
                var unitCount = Number(nodesUnitElementTable[indexUnit].getElementsByClassName("amount")[0].innerHTML);
                if (!isDefense) {
                    simulationParameters.attackers[mappingUnitType[unitType]] += unitCount;
                } else {
                    simulationParameters.defenser[mappingUnitType[unitType]] += unitCount;
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
Object.freeze(rigantestools_InterfaceMappingV3);
