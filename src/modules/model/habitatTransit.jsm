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
Components.utils.import("resource://rigantestools/model/unit.jsm");
Components.utils.import("resource://rigantestools/constant/constants.jsm");

var EXPORTED_SYMBOLS = [ "rigantestools_HabitatTransit", "rigantestools_HabitatUnit" ];

/**
 * Creates an instance of HabitatTransit.
 * 
 * @constructor
 * @this {HabitatTransit}
 * @param {object}
 *            mhabitat The Lords And Knights Habitat object.
 */
var rigantestools_HabitatTransit = function(mhabitatTransit, world) {
    /** @private */
    this.transitType = mhabitatTransit.transitType;

    if (mhabitatTransit.sourceHabitat) {
        /** @private */
        this.sourceHabitatName = mhabitatTransit.sourceHabitat.name;
        /** @private */
        this.sourceHabitatId = mhabitatTransit.sourceHabitat.id;
        /** @private */
        this.sourceHabitatOrgX = mhabitatTransit.sourceHabitat.mapX;
        /** @private */
        this.sourceHabitatOrgY = mhabitatTransit.sourceHabitat.mapY;
        /** @private */
        this.sourceHabitatLink = 'l+k://coordinates?' + this.sourceHabitatOrgX + ',' + this.sourceHabitatOrgY + '&' + world;

        if (mhabitatTransit.sourceHabitat.player) {
            var sourceHabitatPlayer = mhabitatTransit.sourceHabitat.player;
            if(typeof sourceHabitatPlayer === "number") {
                sourceHabitatPlayer = rigantestools_UtilPlayer.getPlayer(sourceHabitatPlayer, world);
            } else {
                rigantestools_UtilPlayer.updatePlayer(sourceHabitatPlayer, world);
            }
            /** @private */
            this.sourceHabitatPlayerName = sourceHabitatPlayer.nick;
            /** @private */
            this.sourceHabitatPlayerLink = 'l+k://player?' + sourceHabitatPlayer.id + '&' + world;
            /** @private */
            this.sourceHabitatPlayerId = sourceHabitatPlayer.id;
        }
        /** @private */
        this.sourceHabitatPoints = mhabitatTransit.sourceHabitat.points;
    }
    if (mhabitatTransit.destinationHabitat) {
        /** @private */
        this.destinationHabitatName = mhabitatTransit.destinationHabitat.name;
        /** @private */
        this.destinationHabitatId = mhabitatTransit.destinationHabitat.id;
        if (!this.destinationHabitatName) {
            this.destinationHabitatName = "Free castle " + this.destinationHabitatId;
        }
        /** @private */
        this.destinationHabitatOrgX = mhabitatTransit.destinationHabitat.mapX;
        /** @private */
        this.destinationHabitatOrgY = mhabitatTransit.destinationHabitat.mapY;
        /** @private */
        this.destinationHabitatLink = 'l+k://coordinates?' + this.destinationHabitatOrgX + ',' + this.destinationHabitatOrgY + '&' + world;

        if (mhabitatTransit.destinationHabitat.player) {
            var destinationHabitatPlayer = mhabitatTransit.destinationHabitat.player;
            if(typeof destinationHabitatPlayer === "number") {
                destinationHabitatPlayer = rigantestools_UtilPlayer.getPlayer(destinationHabitatPlayer, world);
            } else {
                rigantestools_UtilPlayer.updatePlayer(destinationHabitatPlayer, world);
            }
            /** @private */
            this.destinationHabitatPlayerName = destinationHabitatPlayer.nick;
            /** @private */
            this.destinationHabitatPlayerLink = 'l+k://player?' + destinationHabitatPlayer.id + '&' + world;
            /** @private */
            this.destinationHabitatPlayerId = destinationHabitatPlayer.id;
        }
        /** @private */
        this.destinationHabitatPoints = mhabitatTransit.destinationHabitat.points;
    }
    /** @private */
    this.date = mhabitatTransit.destinationETA;
    /** @private */
    this._ressources = [];
    /** @private */
    this._units = [];

    // get resources
    if (mhabitatTransit.resources) {
        var ressources = mhabitatTransit.resources;
        for ( var key in ressources) {
            if (ressources.hasOwnProperty(key)) {
                this._ressources[key] = ressources[key];
            }
        }
    }
    // get Unites available
    if (mhabitatTransit.units) {
        var units = mhabitatTransit.units;
        for (var indexUnit = 0; indexUnit < units.length; indexUnit++) {
            var unit = new rigantestools_Unit(units[indexUnit]);
            this._units.push(unit);
        }
    }
};

/**
 * Get the unit count.
 * 
 * @this {HabitatTransit}
 * @param {UnitType}
 *            unitType the unit to count.
 * @return {number} The unit count.
 */
rigantestools_HabitatTransit.prototype.getUnitCount = function(unitType) {
    var nb = 0;
    for (var index = 0; index < this._units.length; index++) {
        var unit = this._units[index];
        if (unit.getType() === unitType) {
            nb += unit.getCount();
        }
    }
    return nb;
};

/**
 * Get the resource count.
 * 
 * @this {HabitatTransit}
 * @param {ResourceType}
 *            resourceType the resource to count.
 * @return {number} The resource count.
 */
rigantestools_HabitatTransit.prototype.getResourceCount = function(resourceType) {
    if (this._ressources[resourceType + 1] !== undefined) {
        return this._ressources[resourceType + 1];
    }
    return 0;
};


/**
 * Freeze the interface
 */
Object.freeze(rigantestools_HabitatTransit);


/**
 * Creates an instance of HabitatUnit
 * 
 * @constructor
 * @this {HabitatUnit}
 * @param {object}
 *            mhabitat The Lords And Knights Habitat object.
 */
var rigantestools_HabitatUnit = function(mhabitatUnit, world) {
   this.battleType = mhabitatUnit.battleType;

    if (mhabitatUnit.sourceHabitat) 
    {
        this.sourceHabitatName = mhabitatUnit.sourceHabitat.name;
        this.sourceHabitatId = mhabitatUnit.sourceHabitat.id;
        this.sourceHabitatOrgX = mhabitatUnit.sourceHabitat.mapX;
        this.sourceHabitatOrgY = mhabitatUnit.sourceHabitat.mapY;
        this.sourceHabitatLink = 'l+k://coordinates?' + this.sourceHabitatOrgX + ',' + this.sourceHabitatOrgY + '&' + world;

        if (mhabitatUnit.sourceHabitat.player) 
        {
            var sourceHabitatPlayer = mhabitatUnit.sourceHabitat.player;
            if(typeof sourceHabitatPlayer === "number") {
                sourceHabitatPlayer = rigantestools_UtilPlayer.getPlayer(sourceHabitatPlayer, world);
            } else {
                rigantestools_UtilPlayer.updatePlayer(sourceHabitatPlayer, world);
            }
            this.sourceHabitatPlayerName = sourceHabitatPlayer.nick;
            this.sourceHabitatPlayerLink = 'l+k://player?' + sourceHabitatPlayer.id + '&' + world;
            this.sourceHabitatPlayerId = sourceHabitatPlayer.id;
        }
    }

    this._units = [];

    // get Unites available
    if (mhabitatUnit.units) 
    {
        var units = mhabitatUnit.units;
        for (var indexUnit = 0; indexUnit < units.length; indexUnit++) 
        {
            var unit = new rigantestools_Unit(units[indexUnit]);
            this._units.push(unit);
        }
    }
};




rigantestools_HabitatUnit.prototype.getUnitCount = function(unitType) {
    var nb = 0;
    for (var index = 0; index < this._units.length; index++) {
        var unit = this._units[index];
        if (unit.getType() === unitType) {
            nb += unit.getCount();
        }
    }
    return nb;
};



/**
 * Freeze the interface
 */
Object.freeze(rigantestools_HabitatUnit);





