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
if (!com.rigantestools.domain) {
    com.rigantestools.domain = {};
}

/**
 * Creates an instance of Habitat.
 * 
 * @constructor
 * @this {Habitat}
 * @param {object}
 *            mhabitat The Lords And Knights Habitat object.
 */
com.rigantestools.domain.Habitat = function(mhabitat, world) {
    this._logger = new com.rigantestools.service.Logger("Habitat");
    this._logger.trace("init(" + mhabitat.name + ", " + world + ")");

    try {
        /** @private */
        this._util = new com.rigantestools.service.Util();
        /** @private */
        this.name = mhabitat.name;
        /** @private */
        this.id = mhabitat.id;
        /** @private */
        this.orgX = mhabitat.mapX;
        /** @private */
        this.orgY = mhabitat.mapY;
        /** @private */
        this.link = 'l+k://coordinates?' + this.orgX + ',' + this.orgY + '&' + world;
        /** @private */
        this.nextBattleDate = mhabitat.nextBattleDate;
        /** @private */
        this.newUpgrateDate = mhabitat.nextNPCUpgrateDate;
        /** @private */
        this.points = mhabitat.points;
        /** @private */
        this._ressources = [];
        /** @private */
        this._units = [];
        /** @private */
        this._externalUnits = [];
        /** @private */
        this._attackersUnits = [];
        /** @private */
        this._missionUnits = [];
        /** @private */
        this._habitatTransits = [];
        /** @private */
        this._modifiers = [];
        /** @private */
        this.isAttacked = false;
        /** @private */
        this.nbUnitOrder = 0;
        /** @private */
        this.nbKnowledgeOrder = 0;
        /** @private */
        this.nbHabitatBuildingOrder = 0;
        /** @private */
        this.nbhabitatesTransits = 0;
        /** @private */
        this.nbhabitatesMissions = 0;

        // get length informations
        if (mhabitat.habitatUnitOrders) {
            this.nbUnitOrder = mhabitat.habitatUnitOrders.length;
        }
        if (mhabitat.habitatKnowledgeOrders) {
            this.nbKnowledgeOrder = mhabitat.habitatKnowledgeOrders.length;
        }
        if (mhabitat.habitatBuildingUpgrades) {
            this.nbHabitatBuildingOrder = mhabitat.habitatBuildingUpgrades.length;
        }
        if (mhabitat.habitatTransits) {
            this.nbhabitatesTransits = mhabitat.habitatTransits.length;
        }
        if (mhabitat.habitatMissions) {
            this.nbhabitatesMissions = mhabitat.habitatMissions.length;
        }
        // get resources
        if (mhabitat.habitatResources) {
            var mresources = mhabitat.habitatResources;
            for ( var key in mresources) {
                if (mresources.hasOwnProperty(key) && mresources[key].amount) {
                    this._ressources.push(mresources[key].amount);
                }
            }
        }

        var munits, units, unit, index, indexUnit;
        try {
            // get Units available
            this._logger.trace("get Units available");
            if (mhabitat.habitatUnits) {
                munits = mhabitat.habitatUnits;
                for (index = 0; index < munits.length; index++) {
                    if (munits[index].battleType === com.rigantestools.constant.BATTLETYPE.OWN_HABITAT) {
                        units = munits[index].units;
                        for (indexUnit = 0; indexUnit < units.length; indexUnit++) {
                            unit = new com.rigantestools.domain.Unit(units[indexUnit]);
                            this._units.push(unit);
                        }
                    } else if (munits[index].battleType === com.rigantestools.constant.BATTLETYPE.EXTERNAL_UNITS_TO_DEFENSE) {
                        units = munits[index].units;
                        for (indexUnit = 0; indexUnit < units.length; indexUnit++) {
                            unit = new com.rigantestools.domain.Unit(units[indexUnit]);
                            this._externalUnits.push(unit);
                        }
                    } else if (munits[index].battleType === com.rigantestools.constant.BATTLETYPE.ATTACKER) {
                        units = munits[index].units;
                        for (indexUnit = 0; indexUnit < units.length; indexUnit++) {
                            unit = new com.rigantestools.domain.Unit(units[indexUnit]);
                            this._attackersUnits.push(unit);
                        }
                    }
                }
            }
        } catch (e) {
            this._logger.error("init error in get Unites available:" + e);
        }

        try {
            // get Units in transits
            this._logger.trace("get Units in transits");
            if (mhabitat.habitatTransits) {
                var mhabitatTransit = mhabitat.habitatTransits;
                for (index = 0; index < mhabitatTransit.length; index++) {
                    var habitatTransit = new com.rigantestools.domain.HabitatTransit(mhabitatTransit[index], world);
                    this._habitatTransits.push(habitatTransit);
                }
            }
            this.isAttacked = ((this.getHabitatTransits(com.rigantestools.constant.TRANSITTYPE.ATTACKER, true).length > 0) || (this.getUnitAttackersCount() > 0));
        } catch (e) {
            this._logger.error("init error in get Unites in transits:" + e);
        }

        try {
            // get Units in mission
            this._logger.trace("get Units in mission");
            if (mhabitat.habitatMissions) {
                munits = mhabitat.habitatMissions;
                for (index = 0; index < munits.length; index++) {
                    var units = [];
                    for ( var key in munits[index].mission.unitProductions) {
                        var c = {};
                        c.count = munits[index].mission.unitProductions[key];
                        switch (key) {
                            case "1":
                                c.identifier = com.rigantestools.constant.UNITTYPE.SPEARMAN;
                                c.corps = 'Infantry';
                                c.storeAmount = 12;
                                break;
                            case "2":
                                c.identifier = com.rigantestools.constant.UNITTYPE.SWORDMAN;
                                c.corps = 'Infantry';
                                c.storeAmount = 10;
                                break;
                            case "101":
                                c.identifier = com.rigantestools.constant.UNITTYPE.ARCHER;
                                c.corps = 'Artillery';
                                c.storeAmount = 16;
                                break;
                            case "102":
                                c.identifier = com.rigantestools.constant.UNITTYPE.CROSSBOWMAN;
                                c.corps = 'Artillery';
                                c.storeAmount = 13;
                                break;
                            case "201":
                                c.identifier = com.rigantestools.constant.UNITTYPE.SCORPIONRIDER;
                                c.corps = 'Cavalry';
                                c.storeAmount = 22;
                                break;
                            case "202":
                                c.identifier = com.rigantestools.constant.UNITTYPE.LANCER;
                                c.corps = 'Cavalry';
                                c.storeAmount = 20;
                                break;
                        }
                        if (c.identifier) {
                            units.push(c);
                        }
                    }
                    for (indexUnit = 0; indexUnit < units.length; indexUnit++) {
                        unit = new com.rigantestools.domain.Unit(units[indexUnit]);
                        this._missionUnits.push(unit);
                    }
                }
            }
        } catch (e) {
            this._logger.error("init error in get Units in mission:" + e);
        }
        // get Modifier
        if (mhabitat.habitatModifier) {
            this._modifiers = mhabitat.habitatModifier;
        }
    } catch (e) {
        this._logger.error("init error:" + e);
    }
};

/**
 * Get the distance of habitate to the target.
 * 
 * @this {Habitat}
 * @param {number}
 *            destX The x position of the target.
 * @param {number}
 *            destY The y position of the target.
 * @return {number} The distance between habitat and the target.
 */
com.rigantestools.domain.Habitat.prototype.getDistanceTo = function(destX, destY) {
    destX = parseInt(destX);
    destY = parseInt(destY);
    var orgXMod = this.orgX;
    if (this.orgY & 1) {
        orgXMod = orgXMod + 0.5;
    }
    if (destY & 1) {
        destX = destX + 0.5;
    }
    var distX = Math.abs(destX - orgXMod);
    var distY = Math.abs(destY - this.orgY);
    if (distY * 0.5 >= distX) {
        return distY;
    }
    return distY * 0.5 + distX;
};

/**
 * Get habitatTransit on this habitat.
 * 
 * @this {Habitat}
 * @param {transitType}
 *            transitType The transit type on this habitat.
 * @param {onMe}
 *            onMe The transit habitat to have in destination this habitat.
 * @return {object} The list of habitatTransit of this habitat.
 */
com.rigantestools.domain.Habitat.prototype.getHabitatTransits = function(transitType, onMe) {
    var listHabitatTransits = [];
    for (var index = 0; index < this._habitatTransits.length; index++) {
        var currentHabitatTransit = this._habitatTransits[index];
        if (currentHabitatTransit.transitType === transitType) {
            if (onMe) {
                if (currentHabitatTransit.destinationHabitatId === this.id) {
                    listHabitatTransits.push(currentHabitatTransit);
                }
            } else if (currentHabitatTransit.destinationHabitatId !== this.id) {
                listHabitatTransits.push(currentHabitatTransit);
            }
        }
    }
    listHabitatTransits.sort(function(a, b) {
        return a.date.getTime() - b.date.getTime();
    });
    return listHabitatTransits;
};

/**
 * Get the movement speed of the habitate.
 * 
 * @this {Habitat}
 * @return {number} The movement speed of the habitate.
 */
com.rigantestools.domain.Habitat.prototype.getMovementSpeed = function() {
    var a = 1;
    for (var index = 0; index < this._modifiers.length; index++) {
        var modifier = this._modifiers[index];
        if ((modifier.type === com.rigantestools.constant.MODIFIERTYPE.MOVEMENTSPEED) && (modifier.targets.indexOf("Unit") > -1)) {
            a += (modifier.percentage - 1);
        }
    }
    return Number(a.toFixed(2));
};

/**
 * Get the unit duration to the target.
 * 
 * @this {Habitat}
 * @param {UnitType}
 *            unitType the unit to go to the target.
 * @param {string}
 *            link the target link.
 * @return {number} The unit duration to the target.
 */
com.rigantestools.domain.Habitat.prototype.getUnitDurationTo = function(unitType, link) {
    var unitsTime = [];
    var speed = this.getMovementSpeed();
    for (var index = 0; index < this._units.length; index++) {
        var unit = this._units[index];
        if (unit.getType() === unitType) {
            unitsTime[index] = Math.floor(unit.getSecondsPerField() * speed);
        }
    }
    ;
    var time = this.getLongestDuration(unitsTime);
    if (isNaN(time)) {
        return 0;
    }
    return time * this.getDistanceTo(this.getMapXFromLink(link), this.getMapYFromLink(link));
};

/**
 * Get the longest duration in the list.
 * 
 * @this {Habitat}
 * @param {Array}
 *            a list of duration.
 * @return {number} The longest duration in the list.
 */
com.rigantestools.domain.Habitat.prototype.getLongestDuration = function(a) {
    a.sort(function(d, c) {
        return (c - d);
    });
    return a[0];
};

/**
 * Get the unit count.
 * 
 * @this {Habitat}
 * @param {UnitType}
 *            unitType the unit to count.
 * @return {number} The unit count.
 */
com.rigantestools.domain.Habitat.prototype.getUnitCount = function(unitType, withExternal, withMission) {
    var index, unit;
    var nb = 0;
    for (index = 0; index < this._units.length; index++) {
        unit = this._units[index];
        if (unit.getType() === unitType) {
            nb += unit.getCount();
        }
    }
    if (withMission === true) {
        for (index = 0; index < this._missionUnits.length; index++) {
            unit = this._missionUnits[index];
            if (unit.getType() === unitType) {
                nb += unit.getCount();
            }
        }
    }
    if (withExternal === true) {
        for (index = 0; index < this._externalUnits.length; index++) {
            unit = this._externalUnits[index];
            if (unit.getType() === unitType) {
                nb += unit.getCount();
            }
        }
    }
    return nb;
};

/**
 * Get the unit attackers count.
 * 
 * @this {Habitat}
 * @param {UnitType}
 *            unitType the unit to count.
 * @return {number} The unit count.
 */
com.rigantestools.domain.Habitat.prototype.getUnitAttackersCount = function(unitType) {
    var index, unit;
    var nb = 0;
    for (index = 0; index < this._attackersUnits.length; index++) {
        unit = this._attackersUnits[index];
        if (unit.getType() === unitType || unitType === undefined) {
            nb += unit.getCount();
        }
    }
    return nb;
};
/**
 * Get the unit store amount .
 * 
 * @this {Habitat}
 * @param {UnitType}
 *            unitType the unit to count.
 * @return {number} The unit store amount.
 */
com.rigantestools.domain.Habitat.prototype.getUnitStoreAmount = function(unitType) {
    var nb = 0;
    for (var index = 0; index < this._units.length; index++) {
        var unit = this._units[index];
        if (unit.getType() === unitType) {
            nb += unit.getCount() * unit.getStoreAmount();
        }
    }
    return nb;
};

/**
 * Get the resource count.
 * 
 * @this {Habitat}
 * @param {ResourceType}
 *            resourceType the resource to count.
 * @return {number} The resource count.
 */
com.rigantestools.domain.Habitat.prototype.getResourceCount = function(resourceType) {
    if (resourceType >= 0 && resourceType < this._ressources.length) {
        return this._ressources[resourceType];
    }
    return 0;
};

/**
 * valide the link of habitate.
 * 
 * @this {Habitat}
 * @param {string}
 *            link the target link.
 * @return {boolean} true if a good link.
 */
com.rigantestools.domain.Habitat.prototype.valideLink = function(link) {
    return this._util.valideHabitatLink(link);
};

/**
 * get the X position in the habitate link.
 * 
 * @this {Habitat}
 * @param {string}
 *            link the target link.
 * @return {number} the x position of the target link.
 */
com.rigantestools.domain.Habitat.prototype.getMapXFromLink = function(link) {
    if (this.valideLink(link)) {
        return link.substring(link.indexOf('?') + 1, link.indexOf(','));
    }
    return 0;
};

/**
 * get the Y position in the habitate link.
 * 
 * @this {Habitat}
 * @param {string}
 *            link the target link.
 * @return {number} the y position of the target link.
 */
com.rigantestools.domain.Habitat.prototype.getMapYFromLink = function(link) {
    if (this.valideLink(link)) {
        return link.substring(link.indexOf(',') + 1, link.indexOf('&'));
    }
    return 0;
};
