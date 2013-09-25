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
 * Creates an instance of AttackCalculate.
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
com.rigantestools.service.AttackCalculate = function(habitats, targetLink) {
    this._logger = new com.rigantestools.service.Logger("AttackCalculate");
    /** @private */
    /** The util tool. */
    this._util = new com.rigantestools.service.Util();
    /** @private */
    /** The habitats list. */
    this.habitats = habitats;
    /** @private */
    /** The target link. */
    this.targetLink = targetLink;
};

/**
 * get Programmed Attack.
 * 
 * @this {AttackCalculate}
 */
com.rigantestools.service.AttackCalculate.prototype.getProgrammedAttack = function(date, maxTime, minPA, withUD, withAllCastles) {
    var index;
    var bufferUnits = [];

    var maxStartDate = new Date(date.getTime() - maxTime * 1000);
    if (maxStartDate < new Date()) {
        maxStartDate = new Date();
    }
    if (this.habitats.length > 0) {
        for (index = 0; index < this.habitats.length; index++) {
            var habitat = this.habitats[index];
            if (habitat.link !== this.targetLink) {
                // check duration with swordman
                var duration = habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.SWORDMAN, this.targetLink);
                var startDate = new Date(date.getTime() - duration * 1000);
                var selectedUnit = com.rigantestools.constant.UNITTYPE.SWORDMAN;

                if ((habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.SWORDMAN) === 0) || (duration !== 0) && (startDate < maxStartDate)) {
                    selectedUnit = com.rigantestools.constant.UNITTYPE.ARCHER;
                    duration = habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.ARCHER, this.targetLink);
                    // check duration with archer
                    startDate = new Date(date.getTime() - duration * 1000);
                    if ((habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.ARCHER) === 0) || (duration !== 0) && (startDate < maxStartDate)) {
                        selectedUnit = com.rigantestools.constant.UNITTYPE.LANCER;
                        duration = habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.LANCER, this.targetLink);
                        // check duration with lancer
                        startDate = new Date(date.getTime() - duration * 1000);
                        if ((habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.LANCER) === 0) || (duration !== 0) && (startDate < maxStartDate)) {
                            if (withUD) {
                                selectedUnit = com.rigantestools.constant.UNITTYPE.SPEARMAN;
                                duration = habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.SPEARMAN, this.targetLink);
                                // check duration with spearman
                                startDate = new Date(date.getTime() - duration * 1000);
                                if ((habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.SPEARMAN) === 0) || (duration !== 0) && (startDate < maxStartDate)) {
                                    selectedUnit = com.rigantestools.constant.UNITTYPE.CROSSBOWMAN;
                                    duration = habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.CROSSBOWMAN, this.targetLink);
                                    // check duration with crossbowman
                                    startDate = new Date(date.getTime() - duration * 1000);
                                    if ((habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.CROSSBOWMAN) === 0) || (duration !== 0) && (startDate < maxStartDate)) {
                                        selectedUnit = com.rigantestools.constant.UNITTYPE.SCORPIONRIDER;
                                        duration = habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.SCORPIONRIDER, this.targetLink);
                                        // check duration with scorpion
                                        // rider
                                        startDate = new Date(date.getTime() - duration * 1000);
                                        if ((habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.SCORPIONRIDER) === 0) || (duration !== 0) && (startDate < maxStartDate)) {
                                            selectedUnit = '';
                                            duration = 0;
                                        }
                                    }
                                }
                            } else {
                                selectedUnit = '';
                                duration = 0;
                            }
                        }
                    }
                }
                // remove not used PA castle
                var currentPA = habitat.getResourceCount(com.rigantestools.constant.RESOURCETYPE.ARGENT);
                if (currentPA < minPA) {
                    currentPA = 0;
                }
                var item = {
                    'name' : habitat.name,
                    'paCount' : currentPA,
                    'swordmanCount' : habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.SWORDMAN),
                    'swordmanDuration' : habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.SWORDMAN, this.targetLink),
                    'swordmanPAStoreAmount' : habitat.getUnitStoreAmount(com.rigantestools.constant.UNITTYPE.SWORDMAN),
                    'archerCount' : habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.ARCHER),
                    'archerDuration' : habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.ARCHER, this.targetLink),
                    'archerPAStoreAmount' : habitat.getUnitStoreAmount(com.rigantestools.constant.UNITTYPE.ARCHER),
                    'lancerCount' : habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.LANCER),
                    'lancerDuration' : habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.LANCER, this.targetLink),
                    'lancerPAStoreAmount' : habitat.getUnitStoreAmount(com.rigantestools.constant.UNITTYPE.LANCER),
                    'crossbowmanCount' : habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.CROSSBOWMAN),
                    'crossbowmanDuration' : habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.CROSSBOWMAN, this.targetLink),
                    'crossbowmanPAStoreAmount' : habitat.getUnitStoreAmount(com.rigantestools.constant.UNITTYPE.CROSSBOWMAN),
                    'scorpionRiderCount' : habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.SCORPIONRIDER),
                    'scorpionRiderDuration' : habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.SCORPIONRIDER, this.targetLink),
                    'scorpionPAStoreAmount' : habitat.getUnitStoreAmount(com.rigantestools.constant.UNITTYPE.SCORPIONRIDER),
                    'spearmanCount' : habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.SPEARMAN),
                    'spearmanDuration' : habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.SPEARMAN, this.targetLink),
                    'spearmanPAStoreAmount' : habitat.getUnitStoreAmount(com.rigantestools.constant.UNITTYPE.SPEARMAN),
                    'pushcartCount' : habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.PUSHCART),
                    'pushcartDuration' : habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.PUSHCART, this.targetLink),
                    'pushcartPAStoreAmount' : habitat.getUnitStoreAmount(com.rigantestools.constant.UNITTYPE.PUSHCART),
                    'oxcartCount' : habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.OXCART),
                    'oxcartDuration' : habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.OXCART, this.targetLink),
                    'oxcartPAStoreAmount' : habitat.getUnitStoreAmount(com.rigantestools.constant.UNITTYPE.OXCART),
                    'selectedUnit' : selectedUnit,
                    'selectedDuration' : duration,
                    'selectedPACount' : 0,
                    'inAreaTime' : false,
                    'disableUnit' : false
                };
                this.selectUnitEnableInAreaTime(item, date, maxStartDate);
                if (withAllCastles || item.selectedDuration > 0) {
                    bufferUnits.push(item);
                }
            }
        }
    }
    return bufferUnits;
};

/**
 * get Flash Attack.
 * 
 * @this {AttackCalculate}
 */
com.rigantestools.service.AttackCalculate.prototype.getFlashAttack = function(startDate, minUO, minPA, withUD, withAllCastles) {
    var index;
    var indexHabitat;
    var habitat;
    var item;
    var bufferUnits = [];
    var bufferUnitsTemps = [];

    if (this.habitats.length > 0) {
        for (index = 0; index < this.habitats.length; index++) {
            habitat = this.habitats[index];
            if (habitat.link !== this.targetLink) {
                var currentPA = habitat.getResourceCount(com.rigantestools.constant.RESOURCETYPE.ARGENT);
                if (currentPA < minPA) {
                    currentPA = 0;
                }
                bufferUnits.push({
                    'name' : habitat.name,
                    'paCount' : currentPA,
                    'paUsed' : 0,
                    'uoUsed' : 0,
                    'swordmanCount' : habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.SWORDMAN),
                    'swordmanDuration' : habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.SWORDMAN, this.targetLink),
                    'swordmanPAStoreAmount' : habitat.getUnitStoreAmount(com.rigantestools.constant.UNITTYPE.SWORDMAN),
                    'archerCount' : habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.ARCHER),
                    'archerDuration' : habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.ARCHER, this.targetLink),
                    'archerPAStoreAmount' : habitat.getUnitStoreAmount(com.rigantestools.constant.UNITTYPE.ARCHER),
                    'lancerCount' : habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.LANCER),
                    'lancerDuration' : habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.LANCER, this.targetLink),
                    'lancerPAStoreAmount' : habitat.getUnitStoreAmount(com.rigantestools.constant.UNITTYPE.LANCER),
                    'crossbowmanCount' : habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.CROSSBOWMAN),
                    'crossbowmanDuration' : habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.CROSSBOWMAN, this.targetLink),
                    'crossbowmanPAStoreAmount' : habitat.getUnitStoreAmount(com.rigantestools.constant.UNITTYPE.CROSSBOWMAN),
                    'scorpionRiderCount' : habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.SCORPIONRIDER),
                    'scorpionRiderDuration' : habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.SCORPIONRIDER, this.targetLink),
                    'scorpionPAStoreAmount' : habitat.getUnitStoreAmount(com.rigantestools.constant.UNITTYPE.SCORPIONRIDER),
                    'spearmanCount' : habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.SPEARMAN),
                    'spearmanDuration' : habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.SPEARMAN, this.targetLink),
                    'spearmanPAStoreAmount' : habitat.getUnitStoreAmount(com.rigantestools.constant.UNITTYPE.SPEARMAN),
                    'pushcartCount' : habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.PUSHCART),
                    'pushcartDuration' : habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.PUSHCART, this.targetLink),
                    'pushcartPAStoreAmount' : habitat.getUnitStoreAmount(com.rigantestools.constant.UNITTYPE.PUSHCART),
                    'oxcartCount' : habitat.getUnitCount(com.rigantestools.constant.UNITTYPE.OXCART),
                    'oxcartDuration' : habitat.getUnitDurationTo(com.rigantestools.constant.UNITTYPE.OXCART, this.targetLink),
                    'oxcartPAStoreAmount' : habitat.getUnitStoreAmount(com.rigantestools.constant.UNITTYPE.OXCART),
                    'selectedUnit' : '',
                    'selectedDuration' : 0,
                    'inAreaTime' : false,
                    'disableUnit' : false
                });
                for ( var key in com.rigantestools.constant.UNITTYPE) {
                    var unitType = com.rigantestools.constant.UNITTYPE[key];
                    var unitCount = habitat.getUnitCount(unitType);
                    if (unitCount > 0) {
                        item = {
                            'name' : habitat.name,
                            'paCount' : currentPA,
                            'unitType' : unitType,
                            'unitCount' : habitat.getUnitCount(unitType),
                            'duration' : habitat.getUnitDurationTo(unitType, this.targetLink),
                            'PAStoreAmount' : habitat.getUnitStoreAmount(unitType)
                        };
                        bufferUnitsTemps.push(item);
                    }
                }
            }
        }
    }
    // sort temp buffer by duration
    bufferUnitsTemps.sort(function(a, b) {

        if (b.duration > a.duration) {
            return -1;
        } else if (b.duration < a.duration) {
            return 1;
        }
        return 0;
    });
    // search unit available
    var currentNbPA = 0;
    var currentNBUO = 0;
    var nbPAToCapture = (this.habitats.length * 1000);
    var found = false;
    for (index = 0; index < bufferUnitsTemps.length && !found; index++) {
        item = bufferUnitsTemps[index];
        if ((item.paCount > 0)
                && (withUD || ((item.unitType !== com.rigantestools.constant.UNITTYPE.CROSSBOWMAN) && (item.unitType !== com.rigantestools.constant.UNITTYPE.SCORPIONRIDER) && (item.unitType !== com.rigantestools.constant.UNITTYPE.SPEARMAN)))) {
            habitat = null;
            for (indexHabitat = 0; indexHabitat < bufferUnits.length; indexHabitat++) {
                habitat = bufferUnits[indexHabitat];
                if (habitat.name === item.name) {
                    break;
                }
            }
            if (habitat !== null) {
                var nbPA = habitat.paCount - habitat.paUsed;
                if (item.PAStoreAmount < nbPA) {
                    nbPA = item.PAStoreAmount;
                }
                currentNbPA += nbPA;
                habitat.paUsed += nbPA;
                habitat.selectedUnit = item.unitType;
                habitat.selectedDuration = item.duration;
                if ((item.unitType === com.rigantestools.constant.UNITTYPE.SWORDMAN) || (item.unitType === com.rigantestools.constant.UNITTYPE.ARCHER)
                        || (item.unitType === com.rigantestools.constant.UNITTYPE.LANCER)) {
                    currentNBUO += item.unitCount;
                    habitat.uoUsed += item.unitCount;
                }
                if ((currentNbPA >= nbPAToCapture) && (currentNBUO >= minUO)) {
                    found = true;
                }
            }
        }
    }
    // sort buffer by duration
    bufferUnits.sort(function(a, b) {

        if (b.duration > a.duration) {
            return -1;
        } else if (b.duration < a.duration) {
            return 1;
        }
        return 0;
    });
    for (indexHabitat = 0; indexHabitat < bufferUnits.length; indexHabitat++) {
        habitat = bufferUnits[indexHabitat];
        if ((habitat.selectedDuration > 0) && ((currentNbPA - habitat.paUsed) > nbPAToCapture) && (habitat.uoUsed === 0)) {
            currentNbPA -= habitat.paUsed;
            habitat.paUsed = 0;
            habitat.selectedUnit = '';
            habitat.selectedDuration = 0;

        }
    }
    // remove habitat if necessary
    if (!withAllCastles) {
        for (indexHabitat = bufferUnits.length - 1; indexHabitat >= 0; indexHabitat--) {
            habitat = bufferUnits[indexHabitat];
            if (habitat.selectedDuration === 0) {
                bufferUnits.splice(indexHabitat, 1);
            }
        }
    }
    return bufferUnits;
};

/**
 * select unit enable in area time
 * 
 * @this {AttackCalculate}
 * @param {Object}
 *            item
 * @param {Date}
 *            date
 * @param {Number}
 *            maxTime
 */
com.rigantestools.service.AttackCalculate.prototype.selectUnitEnableInAreaTime = function(item, date, maxStartDate) {
    if (item.selectedDuration === 0 || this.isUnitEnableInAreaTime(date, item.selectedDuration)) {
        return;
    }
    item.inAreaTime = true;

    var maxTime = (date.getTime() - maxStartDate.getTime()) / 1000;
    var currentWeight = this.getUnitWeight(item.selectedUnit);
    var minUnitType = '';
    var minDuration = 0;
    var maxUnitType = '';
    var maxDuration = 0;
    if (item.oxcartCount > 0 && item.oxcartDuration < maxTime && this.isUnitEnableInAreaTime(date, item.oxcartDuration)
            && (currentWeight > this.getUnitWeight(com.rigantestools.constant.UNITTYPE.OXCART))) {
        minUnitType = com.rigantestools.constant.UNITTYPE.OXCART;
        minDuration = item.oxcartDuration;
    }
    if (item.pushcartCount > 0 && item.pushcartDuration < maxTime && this.isUnitEnableInAreaTime(date, item.pushcartDuration)
            && (currentWeight > this.getUnitWeight(com.rigantestools.constant.UNITTYPE.PUSHCART))) {
        minUnitType = com.rigantestools.constant.UNITTYPE.PUSHCART;
        minDuration = item.pushcartDuration;
    }
    if (item.spearmanCount > 0 && item.spearmanDuration < maxTime && this.isUnitEnableInAreaTime(date, item.spearmanDuration)
            && (currentWeight > this.getUnitWeight(com.rigantestools.constant.UNITTYPE.SPEARMAN))) {
        minUnitType = com.rigantestools.constant.UNITTYPE.SPEARMAN;
        minDuration = item.spearmanDuration;
    }
    if (item.swordmanCount > 0 && item.swordmanDuration < maxTime && this.isUnitEnableInAreaTime(date, item.swordmanDuration)) {
        if (currentWeight > this.getUnitWeight(com.rigantestools.constant.UNITTYPE.SWORDMAN)) {
            minUnitType = com.rigantestools.constant.UNITTYPE.SWORDMAN;
            minDuration = item.swordmanDuration;
        } else if (currentWeight < this.getUnitWeight(com.rigantestools.constant.UNITTYPE.SWORDMAN)) {
            maxUnitType = com.rigantestools.constant.UNITTYPE.SWORDMAN;
        }
    }
    if (item.crossbowmanCount > 0 && item.crossbowmanDuration < maxTime && this.isUnitEnableInAreaTime(date, item.crossbowmanDuration)) {
        if (currentWeight > this.getUnitWeight(com.rigantestools.constant.UNITTYPE.CROSSBOWMAN)) {
            minUnitType = com.rigantestools.constant.UNITTYPE.CROSSBOWMAN;
            minDuration = item.crossbowmanDuration;
        } else if (maxUnitType === '' && currentWeight < this.getUnitWeight(com.rigantestools.constant.UNITTYPE.CROSSBOWMAN)) {
            maxUnitType = com.rigantestools.constant.UNITTYPE.CROSSBOWMAN;
            maxDuration = item.crossbowmanDuration;
        }
    }
    if (item.archerCount > 0 && item.archerDuration < maxTime && this.isUnitEnableInAreaTime(date, item.archerDuration)) {
        if (currentWeight > this.getUnitWeight(com.rigantestools.constant.UNITTYPE.ARCHER)) {
            minUnitType = com.rigantestools.constant.UNITTYPE.ARCHER;
            minDuration = item.archerDuration;
        } else if (currentWeight < this.getUnitWeight(com.rigantestools.constant.UNITTYPE.ARCHER)) {
            maxUnitType = com.rigantestools.constant.UNITTYPE.ARCHER;
            maxDuration = item.archerDuration;
        }
    }
    if (item.lancerCount > 0 && item.lancerDuration < maxTime && this.isUnitEnableInAreaTime(date, item.lancerDuration)
            && (maxUnitType === '' || maxUnitType !== com.rigantestools.constant.UNITTYPE.ARCHER) && (currentWeight < this.getUnitWeight(com.rigantestools.constant.UNITTYPE.LANCER))) {
        maxUnitType = com.rigantestools.constant.UNITTYPE.LANCER;
        maxDuration = item.lancerDuration;
    }
    if (minUnitType !== '') {
        item.selectedUnit = minUnitType;
        item.selectedDuration = minDuration;
    } else {
        item.selectedUnit = maxUnitType;
        item.selectedDuration = maxDuration;
    }
};

/**
 * verify unit enable in area time
 * 
 * @this {AttackCalculate}
 * @param {Date}
 *            startDate
 * @param {Number}
 *            duration
 * @return {Boolean} true if successful
 */
com.rigantestools.service.AttackCalculate.prototype.isUnitEnableInAreaTime = function(startDate, duration) {
    var area = this._util.getPref(com.rigantestools.constant.PREF_TIME_AREA);
    if (area === '') {
        return true;
    }
    var date = new Date(startDate.getTime() - duration * 1000);
    var elems = area.split('#');
    for ( var index = 0; index < elems.length; index++) {
        var elem = elems[index];
        var attributes = elem.split('/');
        // check if area enable
        if (attributes[3] === 'true') {
            var days = attributes[2].split(',');
            var day = date.getDay() - 1;
            if (day < 0) {
                day = 6;
            }
            if (days[day] === 'true') {
                var time = attributes[0].split(':');
                var startTime = Number(time[0]) * 3600 + Number(time[1]) * 60;
                time = attributes[1].split(':');
                var endTime = Number(time[0]) * 3600 + Number(time[1]) * 60;
                var currentTime = Number(date.getHours()) * 3600 + Number(date.getMinutes()) * 60;
                if (currentTime >= startTime && currentTime <= endTime) {
                    return false;
                }
            }
        }
    }
    return true;
};

/**
 * get Unit Weight
 * 
 * @this {MainFrame}
 * @param {String}
 *            unit
 * @return {Number} weight
 */
com.rigantestools.service.AttackCalculate.prototype.getUnitWeight = function(unit) {
    var weight = 8;
    if (unit === com.rigantestools.constant.UNITTYPE.SCORPIONRIDER) {
        weight = 7;
    } else if (unit === com.rigantestools.constant.UNITTYPE.LANCER) {
        weight = 6;
    } else if (unit === com.rigantestools.constant.UNITTYPE.ARCHER) {
        weight = 5;
    } else if (unit === com.rigantestools.constant.UNITTYPE.CROSSBOWMAN) {
        weight = 4;
    } else if (unit === com.rigantestools.constant.UNITTYPE.SPEARMAN) {
        weight = 3;
    } else if (unit === com.rigantestools.constant.UNITTYPE.SWORDMAN || unit === com.rigantestools.constant.UNITTYPE.PUSHCART) {
        weight = 2;
    } else if (unit === com.rigantestools.constant.UNITTYPE.OXCART) {
        weight = 1;
    }
    return weight;
};