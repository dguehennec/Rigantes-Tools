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
if (!com.rigantestools.service) {
    com.rigantestools.service = {};
}

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
 */
com.rigantestools.service.SlowAttackDefenseCalculate = function(habitats, targetLink, date, duration, withUD, withUO, unitCount, startTimeUnit, allCastles) {
    var step;

    this.nbNewUnits = unitCount;
    this.nbCurrentUnits = 356;
    if (unitCount < 400) {
        this.nbCurrentUnits = 154;
        if (unitCount < 200) {
            this.nbNewUnits = 101;
            this.nbCurrentUnits = 52;
        }
    }
    this.habitats = habitats;
    this.targetLink = targetLink;
    this.date = date;
    this.currentDate = new Date();
    this.startTimeUnit = new Date(this.date.getTime() - startTimeUnit * 1000);
    if (this.startTimeUnit < this.currentDate) {
        this.startTimeUnit = this.currentDate;
    }
    this.allCastles = allCastles;
    this.duration = duration;
    this.bufferUnits = [];
    this.bufferTime = [];
    this.bufferHabitatsUnitsCalculate = [];

    // initialize buffer times with date + 5 minutes
    var startAttackDefenseTime = date.getTime() - 300000;
    var stepDuration = 1800;
    if (this.nbNewUnits < 200) {
        stepDuration = 600;
    } else if (this.nbNewUnits < 400) {
        stepDuration = 1200;
    }

    for (step = 0; step <= duration / stepDuration; step++) {
        this.bufferTime.push({
            'castle' : '',
            'unitType' : '',
            'unitCount' : '',
            'startDate' : null,
            'arrivalDate' : new Date(startAttackDefenseTime + step * stepDuration * 1000)
        });
    }

    var totalDuration = this.duration + (this.date.getTime() - this.startTimeUnit) / 1000;
    var loop = 0;
    var durationStep = 60000;
    if (withUD) {
        this.bufferUnits = this.getNewUDList();
        while ((this.bufferUnits.length > 0) && !this.solutionFound() && (loop <= totalDuration)) {
            this.updateBufferUnitsWithDurationStep(durationStep);
            this.searchSolution();
            loop += 60;
        }
    }
    if (withUO) {
        this.bufferUnits = this.getNewUOList();
        while ((this.bufferUnits.length > 0) && !this.solutionFound() && (loop <= totalDuration)) {
            this.updateBufferUnitsWithDurationStep(durationStep);
            this.searchSolution();
            loop += 60;
        }
    }
    // fix init value to the first time
    for ( var indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
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
 */
com.rigantestools.service.SlowAttackDefenseCalculate.prototype.getResultList = function() {
    return this.bufferTime;
};

/**
 * update currentArrivalDate.
 * 
 * @this {SlowAttackDefenseCalculate}
 * @param {Number}
 *            durationStep the duration step
 */
com.rigantestools.service.SlowAttackDefenseCalculate.prototype.updateBufferUnitsWithDurationStep = function(durationStep) {
    // update currentArrivalDate and delete unit that it is not possible to used
    // in the next search
    var maxDateTime = 600000 + this.duration * 1000 + this.date.getTime();
    for ( var index = this.bufferUnits.length - 1; index >= 0; index--) {
        this.bufferUnits[index].currentArrivalDate = this.bufferUnits[index].currentArrivalDate + durationStep;
        if ((this.bufferUnits[index].unitCount < this.nbNewUnits) || (this.bufferUnits[index].currentArrivalDate > maxDateTime)) {
            this.bufferUnits.splice(index, 1);
        }
    }
};

/**
 * update buffer time.
 * 
 * @this {SlowAttackDefenseCalculate}
 */
com.rigantestools.service.SlowAttackDefenseCalculate.prototype.searchSolution = function() {
    var indexTime, index;

    for (indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
        for (index = 0; index < this.bufferUnits.length; index++) {
            if ((this.bufferTime[indexTime].startDate === null)
                    && (Math.floor(this.bufferUnits[index].currentArrivalDate / 60000) === Math.floor(this.bufferTime[indexTime].arrivalDate.getTime() / 60000))) {
                this.bufferTime[indexTime].castle = this.bufferUnits[index].habitatName;
                this.bufferTime[indexTime].unitType = this.bufferUnits[index].unitType;
                if (indexTime === 0) {
                    this.bufferTime[indexTime].unitCount = this.nbNewUnits;
                    this.bufferUnits[index].unitCount = this.bufferUnits[index].unitCount - this.nbNewUnits;
                } else {
                    this.bufferTime[indexTime].unitCount = this.nbCurrentUnits;
                    this.bufferUnits[index].unitCount = this.bufferUnits[index].unitCount - this.nbCurrentUnits;
                }
                this.bufferTime[indexTime].startDate = new Date(this.bufferUnits[index].currentArrivalDate - this.bufferUnits[index].duration);
                this.bufferTime[indexTime].arrivalDate = new Date(this.bufferUnits[index].currentArrivalDate);
                break;
            }
        }
    }
};

/**
 * indicate if solution is found.
 * 
 * @this {SlowAttackDefenseCalculate}
 * @return {Boolean} true if found
 */
com.rigantestools.service.SlowAttackDefenseCalculate.prototype.solutionFound = function() {
    for ( var indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
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
com.rigantestools.service.SlowAttackDefenseCalculate.prototype.firstSolutionFound = function() {
    for ( var indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
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
com.rigantestools.service.SlowAttackDefenseCalculate.prototype.getNbAttacks = function() {
    var nbAttacks = 0;
    for ( var indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
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
com.rigantestools.service.SlowAttackDefenseCalculate.prototype.getStartTimeTargetMax = function() {
    var maxStartTime = null;
    var inArea = false;
    for ( var indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
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
com.rigantestools.service.SlowAttackDefenseCalculate.prototype.getStartTimeTargetMin = function() {
    var minStartTime = null;
    var inArea = false;
    for ( var indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
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
com.rigantestools.service.SlowAttackDefenseCalculate.prototype.getFirstArrivalDate = function() {
    var firstArrivalDate = null;
    var inArea = false;
    for ( var indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
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
com.rigantestools.service.SlowAttackDefenseCalculate.prototype.getLastArrivalDate = function() {
    var lastArrivalDate = null;
    var inArea = false;
    for ( var indexTime = 0; indexTime < this.bufferTime.length; indexTime++) {
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
com.rigantestools.service.SlowAttackDefenseCalculate.prototype.getTargetLink = function() {
    return this.targetLink;
};

/**
 * get new UD list
 * 
 * @this {SlowAttackDefenseCalculate}
 * @return {Array} the buffer units of UD
 */
com.rigantestools.service.SlowAttackDefenseCalculate.prototype.getNewUDList = function() {
    var index, currentUnitCount, currentDuration;
    var bufferUnits = [];
    for (index = 0; index < this.habitats.length; index++) {
        var habitat = this.habitats[index];

        if (habitat.link !== this.targetLink && (this.allCastles || (!this.allCastles && !habitat.isAttacked))) {
            currentUnitCount = habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.SPEARMAN);
            if (currentUnitCount > this.nbNewUnits) {
                currentDuration = habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.SPEARMAN, this.targetLink) * 1000;
                bufferUnits.push({
                    'habitatName' : habitat.name,
                    'unitType' : com.rigantestools.constant.UNITTYPE.SPEARMAN,
                    'unitCount' : currentUnitCount,
                    'duration' : currentDuration,
                    'currentArrivalDate' : (this.startTimeUnit.getTime() + currentDuration)
                });
            }
            currentUnitCount = habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.CROSSBOWMAN);
            if (currentUnitCount > this.nbNewUnits) {
                currentDuration = habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.CROSSBOWMAN, this.targetLink) * 1000;
                bufferUnits.push({
                    'habitatName' : habitat.name,
                    'unitType' : com.rigantestools.constant.UNITTYPE.CROSSBOWMAN,
                    'unitCount' : currentUnitCount,
                    'duration' : currentDuration,
                    'currentArrivalDate' : (this.startTimeUnit.getTime() + currentDuration)
                });
            }
            currentUnitCount = habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.SCORPIONRIDER);
            if (currentUnitCount > this.nbNewUnits) {
                currentDuration = habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.SCORPIONRIDER, this.targetLink) * 1000;
                bufferUnits.push({
                    'habitatName' : habitat.name,
                    'unitType' : com.rigantestools.constant.UNITTYPE.SCORPIONRIDER,
                    'unitCount' : currentUnitCount,
                    'duration' : currentDuration,
                    'currentArrivalDate' : (this.startTimeUnit.getTime() + currentDuration)
                });
            }
        }
    }
    bufferUnits.sort(function(a, b) {
        return b.duration - a.duration;
    });

    return bufferUnits;
};

/**
 * get new UO list
 * 
 * @this {SlowAttackDefenseCalculate}
 * @return {Array} the buffer units of UO
 */
com.rigantestools.service.SlowAttackDefenseCalculate.prototype.getNewUOList = function() {
    var index, currentUnitCount, currentDuration;
    var bufferUnits = [];
    for (index = 0; index < this.habitats.length; index++) {
        var habitat = this.habitats[index];
        if (habitat.link !== this.targetLink && (this.allCastles || (!this.allCastles && !habitat.isAttacked))) {
            currentUnitCount = habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.SWORDMAN);
            if (currentUnitCount > this.nbNewUnits) {
                currentDuration = habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.SWORDMAN, this.targetLink) * 1000;
                bufferUnits.push({
                    'habitatName' : habitat.name,
                    'unitType' : com.rigantestools.constant.UNITTYPE.SWORDMAN,
                    'unitCount' : currentUnitCount,
                    'duration' : currentDuration,
                    'currentArrivalDate' : (this.startTimeUnit.getTime() + currentDuration)
                });
            }
            currentUnitCount = habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.ARCHER);
            if (currentUnitCount > this.nbNewUnits) {
                currentDuration = habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.ARCHER, this.targetLink) * 1000;
                bufferUnits.push({
                    'habitatName' : habitat.name,
                    'unitType' : com.rigantestools.constant.UNITTYPE.ARCHER,
                    'unitCount' : currentUnitCount,
                    'duration' : currentDuration,
                    'currentArrivalDate' : (this.startTimeUnit.getTime() + currentDuration)
                });
            }
            currentUnitCount = habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.LANCER);
            if (currentUnitCount > this.nbNewUnits) {
                currentDuration = habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.LANCER, this.targetLink) * 1000;
                bufferUnits.push({
                    'habitatName' : habitat.name,
                    'unitType' : com.rigantestools.constant.UNITTYPE.LANCER,
                    'unitCount' : currentUnitCount,
                    'duration' : currentDuration,
                    'currentArrivalDate' : (this.startTimeUnit.getTime() + currentDuration)
                });
            }
        }
    }
    bufferUnits.sort(function(a, b) {
        return b.duration - a.duration;
    });

    return bufferUnits;
};
