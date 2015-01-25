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
Components.utils.import("resource://rigantestools/constant/constants.jsm");

var EXPORTED_SYMBOLS = [ "rigantestools_SlowAttackDefenseCalculate" ];

/**
 * Creates an instance of SlowAttackDefenseCalculate.
 * 
 * @constructor
 * @this {SlowAttackDefense}
 * @param {Array}
 *            habitats Habitat array
 * @param {String}
 *            targetLink the target link
 * @param {Date}
 *            date the date of the first defense
 * @param {Number}
 *            duration the duration of the defense
 * @param {Boolean}
 *            withUD with UD
 * @param {Boolean}
 *            withUO with UO
 * @param {Number}
 *            unitCount the unit count
 * @param {Number}
 *            startTimeUnit the time to launch before the first attack
 * @param {Boolean}
 *            allCastles use all Castles
 * @param {Number}
 *            errorMargin the error margin
 * @param {String}
 *            onlyCastles only castles contained this string
 * @param {String}
 *            noCastles without castles contained this string
 * @param {Number}
 *            ralentit if unit is slow down
 * @param {Number}
 *            maxperminute number max of units launched in the same minute
 */
var rigantestools_SlowAttackDefenseCalculate = function(habitats, targetLink, date, duration, allow, unitCount, startTimeUnit, allCastles, errorMargin, onlyCastles, noCastles, ralentit, maxperminute) {
    var step;

    this.nbNewUnits = unitCount;
    this.nbCurrentUnits = 352;
    this.allow = allow;
    this.ralentit = ralentit;
    this.maxperminute = maxperminute;

    var stepDuration = 1800;

    if (unitCount == 100) {
        this.nbNewUnits = 100;
        this.nbCurrentUnits = 52;
        stepDuration = 600 ;
    }
    else if (unitCount == 101) {
        this.nbNewUnits = 200;
        this.nbCurrentUnits = 104;
        stepDuration = 600 ;
    }
    else if (unitCount == 150) {
        this.nbNewUnits = 200;
        this.nbCurrentUnits = 152;
        stepDuration = 900 ;
    }
    else if (unitCount == 200) {
        this.nbNewUnits = 200;
        this.nbCurrentUnits = 152;
        stepDuration = 1200 ;
    }
    else if (unitCount == 201) {
        this.nbNewUnits = 400;
        this.nbCurrentUnits = 304;
        stepDuration = 1200 ;
    }
    else if (unitCount == 400) {
        this.nbNewUnits = 400;
        this.nbCurrentUnits = 352;
        stepDuration = 1800 ;
    }
    else if (unitCount == 500) {
        this.nbNewUnits = 500;
        this.nbCurrentUnits = 254;
        stepDuration = 600 ;
    }
    else if (unitCount == 750) {
        this.nbNewUnits = 1000;
        this.nbCurrentUnits = 754;
        stepDuration = 900 ;
    }
    else if (unitCount == 1000) {
        this.nbNewUnits = 1000;
        this.nbCurrentUnits = 754;
        stepDuration = 1200 ;
    }
     else {
        this.nbNewUnits = 1;
        this.nbCurrentUnits = 1;
        stepDuration = 600 ;
    }

    this.habitats = habitats;
    this.targetLink = targetLink;
    this.date = date;
    this.currentDate = new Date();

    this.startTimeUnit = new Date(this.currentDate.getTime() + startTimeUnit * 1000);

    if (this.startTimeUnit > this.date) {
        this.startTimeUnit = this.date;
    }

    this.onlyCastles = onlyCastles;
    this.noCastles = noCastles;

    this.allCastles = allCastles;
    this.duration = duration;
    this.errorMargin = errorMargin;
    this.bufferUnits = [];
    this.bufferTime = [];
    this.bufferHabitatsUnitsCalculate = [];

    // initialize buffer times with date + 5 minutes
    var startAttackDefenseTime = date.getTime() - 300000;

    for (step = 0; step <= duration / stepDuration; step++) {
        this.bufferTime.push({
            'castle' : '',
            'unitType' : '',
            'unitCount' : '',
            'ralentUnitType' : '',
            'startDate' : null,
            'arrivalDate' : new Date(startAttackDefenseTime + step * stepDuration * 1000)
        });
    }

    var totalDuration = this.duration + (this.date.getTime() - this.startTimeUnit) / 1000;
    var loop = 0;
    var durationStep = 60000;

    this.bufferUnits = this.getNewUDList(allow, this.ralentit);
    while ((this.bufferUnits.length > 0) && !this.solutionFound() && (loop <= totalDuration)) {
        this.updateBufferUnitsWithDurationStep(durationStep);
        this.searchSolution2();
        loop += 60;
    }

    // fix init value to the first time
    for (var indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
        if ((this.bufferTime[indexTime].startDate !== null)) {
            this.bufferTime[indexTime].unitCount = this.nbNewUnits;
            break;
        }
    }
};

/**
 * get result list.
 * 
 * @this {SlowAttackDefenseCalculate}
 * @return {Array} the buffer time
 */
rigantestools_SlowAttackDefenseCalculate.prototype.getResultList = function() {
    return this.bufferTime;
};

/**
 * update Buffer Units With Duration Step
 * 
 * @this {SlowAttackDefenseCalculate}
 * @param {Number}
 *            durationStep the duration step
 */
rigantestools_SlowAttackDefenseCalculate.prototype.updateBufferUnitsWithDurationStep = function(durationStep) {
    // update currentArrivalDate and delete unit that it is not possible to used
    // in the next search
    var maxDateTime = 600000 + this.duration * 1000 + this.date.getTime();
    for (var index = this.bufferUnits.length - 1; index >= 0; index--) {
        this.bufferUnits[index].currentArrivalDate = this.bufferUnits[index].currentArrivalDate + durationStep;

        if (((this.bufferUnits[index].unitCount < this.nbCurrentUnits) && (this.ralentit == 0)) || (this.bufferUnits[index].unitCount == 0)
                || (this.bufferUnits[index].currentArrivalDate > maxDateTime)) {
            this.bufferUnits.splice(index, 1);
        }
    }
};

/**
 * update Buffer Units With Duration Step
 * 
 * @this {SlowAttackDefenseCalculate}
 * @param {Number}
 *            arrival the arrival
 * @param {Number}
 *            target the target
 * @param {Number}
 *            marge the marge
 * @return {Boolean} true if arrival ok
 */
rigantestools_SlowAttackDefenseCalculate.prototype.ArrivalOK = function(arrival, target, marge) {
    var a = Math.floor(arrival / 60000);
    var t = Math.floor(target / 60000);
    if ((a >= t - marge) && (a <= t + marge)) {
        return true;
    }
    return false;
};

/**
 * unit Allowed
 * 
 * @this {SlowAttackDefenseCalculate}
 * @param {Unit}
 *            unit the unit
 * @param {Number}
 *            allow the allow
 * @return {Boolean} true if allowed
 */
rigantestools_SlowAttackDefenseCalculate.prototype.Allowed = function(unit, allow) {
    if (unit === rigantestools_Constant.UNITTYPE.SCORPIONRIDER) {
        return (allow == 0 || allow == 2 || allow == 3);
    } else if (unit === rigantestools_Constant.UNITTYPE.LANCER) {
        return (allow == 1 || allow == 2);
    } else if (unit === rigantestools_Constant.UNITTYPE.ARCHER) {
        return (allow == 1 || allow == 2 || allow == 3);
    } else if (unit === rigantestools_Constant.UNITTYPE.CROSSBOWMAN) {
        return (allow == 0 || allow == 2 || allow == 3)
    } else if (unit === rigantestools_Constant.UNITTYPE.SPEARMAN) {
        return (allow == 0 || allow == 2 || allow == 3)
    } else if (unit === rigantestools_Constant.UNITTYPE.SWORDMAN) {
        return (allow == 1 || allow == 2 || allow == 3);
    } else if (unit === rigantestools_Constant.UNITTYPE.PUSHCART) {
        return false;
    } else if (unit === rigantestools_Constant.UNITTYPE.OXCART) {
        return false;
    }

    return false;
}

/**
 * Find Unit Index
 * 
 * @this {SlowAttackDefenseCalculate}
 * @param {Unit}
 *            index the index
 * @param {Number}
 *            needed the needed
 * @param {Number}
 *            allow the allow
 * @return {Number} the index
 */
rigantestools_SlowAttackDefenseCalculate.prototype.FindUnitIndex = function(index, needed, allow) {

    // 0 = UD
    // 1 = UO
    // 2 = UD+UO
    // 3 = UD+UO sauf lances

    var i = index;
    var habitat = this.bufferUnits[i].habitatName;
    if (this.bufferUnits[i].unitCount <= 0) {
        return -1;
    }

    do {
        if (this.bufferUnits[i].habitatName !== habitat) {
            return -1;
        }
        if (this.bufferUnits[i].unitCount >= needed && this.Allowed(this.bufferUnits[i].unitType, allow)) {
            return i;
        }
        i++;
        if (this.ralentit == 0) {
            return -1;
        }
    } while (i < this.bufferUnits.length);

    return -1;
}

/**
 * search Solution 2
 * 
 * @this {SlowAttackDefenseCalculate}
 */
rigantestools_SlowAttackDefenseCalculate.prototype.searchSolution2 = function() {

    var indexTime, index;
    var maxperminute = this.maxperminute;
    var ndeparts = 0;
    var marge = this.errorMargin;

    var allow = this.allow;

    for (indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
        if ((this.bufferTime[indexTime].startDate === null)) {
            var candidates = [];
            var neededUnits;

            if (indexTime == 0) {
                neededUnits = this.nbNewUnits;
            } else {
                neededUnits = this.nbCurrentUnits;
            }

            for (index = 0; index < this.bufferUnits.length; index++) {
                if (this.ArrivalOK(this.bufferUnits[index].currentArrivalDate, this.bufferTime[indexTime].arrivalDate.getTime(), marge)) {
                    var index2 = this.FindUnitIndex(index, neededUnits, allow);
                    if (index2 != -1) {
                        var item = {
                            'ralent_unit' : this.bufferUnits[index],
                            'main_unit' : this.bufferUnits[index2]
                        };
                        candidates.push(item);
                    }
                }
            }

            if (candidates.length > 0) {
                candidates.sort(function(item1, item2) {
                    if (item1.main_unit.unitType == item1.ralent_unit.unitType && item2.main_unit.unitType != item2.ralent_unit.unitType) {
                        return -1;
                    } else if (item1.main_unit.unitType != item1.ralent_unit.unitType && item2.main_unit.unitType == item2.ralent_unit.unitType) {
                        return 1;
                    } else {
                        var a = item1.main_unit;
                        var b = item2.main_unit;
                        if (b.priority == a.priority) {
                            return b.unitCount - a.unitCount;
                        } else {
                            return b.priority - a.priority;
                        }
                    }
                });

                var ralent_unit = candidates[0].ralent_unit;
                var main_unit = candidates[0].main_unit;

                this.bufferTime[indexTime].castle = ralent_unit.habitatName;
                this.bufferTime[indexTime].unitType = main_unit.unitType;
                this.bufferTime[indexTime].unitCount = neededUnits;
                main_unit.unitCount = main_unit.unitCount - neededUnits;
                if (ralent_unit.unitType != main_unit.unitType) {
                    this.bufferTime[indexTime].ralentUnitType = ralent_unit.unitType;
                    ralent_unit.unitCount = ralent_unit.unitCount - 1;
                }
                this.bufferTime[indexTime].startDate = new Date(ralent_unit.currentArrivalDate - ralent_unit.duration);
                this.bufferTime[indexTime].arrivalDate = new Date(ralent_unit.currentArrivalDate);

                ndeparts = ndeparts + 1;
            }
        }

        if (ndeparts == maxperminute)
            break;
    }
};

/**
 * indicate if solution is found.
 * 
 * @this {SlowAttackDefenseCalculate}
 * @return {Boolean} true if found
 */
rigantestools_SlowAttackDefenseCalculate.prototype.solutionFound = function() {
    for (var indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
        if (this.bufferTime[indexTime].startDate === null) {
            return false;
        }
    }
    return true;
};

/**
 * indicate if one time is found.
 * 
 * @this {SlowAttackDefenseCalculate}
 * @return {Boolean} true if found
 */
rigantestools_SlowAttackDefenseCalculate.prototype.firstSolutionFound = function() {
    for (var indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
        if (this.bufferTime[indexTime].startDate !== null) {
            return true;
        }
    }
    return false;
};

/**
 * get the number of attacks.
 * 
 * @this {SlowAttackDefenseCalculate}
 * @return {Number} the number of attacks
 */
rigantestools_SlowAttackDefenseCalculate.prototype.getNbAttacks = function() {
    var nbAttacks = 0;
    for (var indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
        if (this.bufferTime[indexTime].startDate !== null) {
            nbAttacks++;
        }
    }
    return nbAttacks;
};

/**
 * get the max start time to go to the target
 * 
 * @this {SlowAttackDefenseCalculate}
 * @return {Number} the max start time
 */
rigantestools_SlowAttackDefenseCalculate.prototype.getStartTimeTargetMax = function() {
    var maxStartTime = null;
    var inArea = false;
    for (var indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
        if (this.bufferTime[indexTime].startDate !== null) {
            inArea = true;
        } else if (inArea) {
            break;
        }
        if (inArea && ((maxStartTime === null) || (this.bufferTime[indexTime].startDate > maxStartTime))) {
            maxStartTime = this.bufferTime[indexTime].startDate;
        }
    }
    return maxStartTime;
};

/**
 * get the min start time to go to the target
 * 
 * @this {SlowAttackDefenseCalculate}
 * @return {Number} the min start time
 */
rigantestools_SlowAttackDefenseCalculate.prototype.getStartTimeTargetMin = function() {
    var minStartTime = null;
    var inArea = false;
    for (var indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
        if (this.bufferTime[indexTime].startDate !== null) {
            inArea = true;
        } else if (inArea) {
            break;
        }
        if (inArea && ((minStartTime === null) || (this.bufferTime[indexTime].startDate < minStartTime))) {
            minStartTime = this.bufferTime[indexTime].startDate;
        }
    }
    return minStartTime;
};

/**
 * get the first arrival time to the target
 * 
 * @this {SlowAttackDefenseCalculate}
 * @return {Number} the first arrival date
 */
rigantestools_SlowAttackDefenseCalculate.prototype.getFirstArrivalDate = function() {
    var firstArrivalDate = null;
    var inArea = false;
    for (var indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
        if (this.bufferTime[indexTime].startDate !== null) {
            inArea = true;
        } else if (inArea) {
            break;
        }
        if (inArea && ((firstArrivalDate === null) || (this.bufferTime[indexTime].arrivalDate < firstArrivalDate))) {
            firstArrivalDate = this.bufferTime[indexTime].arrivalDate;
        }
    }
    return firstArrivalDate;
};

/**
 * get the last arrival time to the target
 * 
 * @this {SlowAttackDefenseCalculate}
 * @return {Number} the last arrival date
 */
rigantestools_SlowAttackDefenseCalculate.prototype.getLastArrivalDate = function() {
    var lastArrivalDate = null;
    var inArea = false;
    for (var indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
        if (this.bufferTime[indexTime].startDate !== null) {
            inArea = true;
        } else if (inArea) {
            break;
        }
        if (inArea && ((lastArrivalDate === null) || (this.bufferTime[indexTime].arrivalDate > lastArrivalDate))) {
            lastArrivalDate = this.bufferTime[indexTime].arrivalDate;
        }
    }
    return lastArrivalDate;
};

/**
 * get the target link
 * 
 * @this {SlowAttackDefenseCalculate}
 * @return {String} the target link
 */
rigantestools_SlowAttackDefenseCalculate.prototype.getTargetLink = function() {
    return this.targetLink;
};

/**
 * castle Match List.
 * 
 * @this {SlowAttackDefenseCalculate}
 * @param {String}
 *            castle the castle name
 * @param {Array}
 *            list the list
 * @return {Boolean} true if match
 */
rigantestools_SlowAttackDefenseCalculate.prototype.CastleMatchList = function(castle, list) {
    var index;
    for (index = 0; index < list.length; index++) {
        if (castle.search(list[index]) >= 0) {
            return true;
        }
    }
    return false;
}

/**
 * Get List From Spec.
 * 
 * @this {SlowAttackDefenseCalculate}
 * @param {String}
 *            spec the spec
 * @return {Array} the list
 */
rigantestools_SlowAttackDefenseCalculate.prototype.GetListFromSpec = function(spec) {

    var list = [];
    var str = spec;

    while (1) {
        var pos = str.indexOf(",");
        if (pos == -1) {
            break;
        }
        if (pos > 0) {
            var item = str.slice(0, pos);
            list.push(item);
        }
        str = str.slice(pos + 1);
    }

    if (str.length > 0) {
        list.push(str);
    }
    return list;
}

/**
 * get new UD list
 * 
 * @this {SlowAttackDefenseCalculate}
 * @return {Array} the buffer units of UD
 */
rigantestools_SlowAttackDefenseCalculate.prototype.getNewUDList = function(allow, ralentit) {
    var index, currentUnitCount, currentDuration;
    var bufferUnits = [];
    var unitTypeList = [];

    // 0 = UD
    // 1 = UO
    // 2 = UD+UO
    // 3 = UD+UO sauf lances

    var listonly = this.GetListFromSpec(this.onlyCastles);
    var listno = this.GetListFromSpec(this.noCastles);

    if (allow == 1 || allow == 2 || allow == 3 || ralentit)
        unitTypeList.push({
            'type' : rigantestools_Constant.UNITTYPE.SWORDMAN,
            priority : 2
        });
    if (allow == 0 || allow == 2 || allow == 3 || ralentit)
        unitTypeList.push({
            'type' : rigantestools_Constant.UNITTYPE.SPEARMAN,
            priority : 5
        });
    if (allow == 0 || allow == 2 || allow == 3 || ralentit)
        unitTypeList.push({
            'type' : rigantestools_Constant.UNITTYPE.CROSSBOWMAN,
            priority : 4
        });
    if (allow == 1 || allow == 2 || allow == 3 || ralentit)
        unitTypeList.push({
            'type' : rigantestools_Constant.UNITTYPE.ARCHER,
            priority : 1
        });
    if (allow == 1 || allow == 2 || ralentit)
        unitTypeList.push({
            'type' : rigantestools_Constant.UNITTYPE.LANCER,
            priority : 0
        });
    if (allow == 0 || allow == 2 || allow == 3 || ralentit)
        unitTypeList.push({
            'type' : rigantestools_Constant.UNITTYPE.SCORPIONRIDER,
            priority : 3
        });

    for (index = 0; index < this.habitats.length; index++) {
        var habitat = this.habitats[index];

        if (this.onlyCastles.length > 0) {
            if (!this.CastleMatchList(habitat.name, listonly))
                continue;
        }

        if (this.noCastles.length > 0) {
            if (this.CastleMatchList(habitat.name, listno)) {
                continue;
            }
        }

        if (habitat.link === this.targetLink) {
            continue;
        }

        // This is currently without effect. isAttacked5 should mean attacked by less than 5 castles, but it's not set at initalization time of habitats yet
        if (!this.allCastles && habitat.isAttacked5) {
            continue;
        }

        for (var xxx = 0; xxx < unitTypeList.length; xxx++) {
            currentUnitCount = habitat.getUnitCount(unitTypeList[xxx].type);
            if (currentUnitCount > this.nbCurrentUnits || ralentit == 1) {
                currentDuration = habitat.getUnitDurationTo(unitTypeList[xxx].type, this.targetLink) * 1000;
                bufferUnits.push({
                    'habitatName' : habitat.name,
                    'unitType' : unitTypeList[xxx].type,
                    'unitCount' : currentUnitCount,
                    'duration' : currentDuration,
                    'currentArrivalDate' : (this.startTimeUnit.getTime() + currentDuration),
                    'priority' : unitTypeList[xxx].priority
                });
            }
        }
    }

    return bufferUnits;
};

/**
 * Freeze the interface
 */
Object.freeze(rigantestools_SlowAttackDefenseCalculate);
