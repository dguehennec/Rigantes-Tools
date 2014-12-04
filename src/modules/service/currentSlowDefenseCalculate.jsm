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

var EXPORTED_SYMBOLS = [ "rigantestools_CurrentSlowDefenseCalculate" ];

/**
 * Creates an instance of SlowAttackDefenseCalculate.
 * 
 * @constructor
 * @this {CurrentSlowDefenseCalculate}
 * @param {Player}
 *            player the player
 */
var rigantestools_CurrentSlowDefenseCalculate = function(player) {
    this._logger = new rigantestools_Logger("CurrentSlowDefenseCalculate");
    this._logger.trace("init");

    this._bufferRounds = [];
    this._stepDuration = 10 * 60;
    this._duration = 60 * 60 * 24;

    // get attaks to player
    var habitats = player.getHabitatList();
    for (var indexHab = 0; indexHab < habitats.length; indexHab++) {
        var habitat = habitats[indexHab];
        var habitatTransits = habitat.getHabitatTransits(rigantestools_Constant.TRANSITTYPE.ATTACKER, true);
        if ((habitatTransits.length > 0) || (habitat.getUnitAttackersCount() > 0)) {
            // get the min date of attack
            var minDate = null;
            for (var indexHabTrans = 0; indexHabTrans < habitatTransits.length; indexHabTrans++) {
                if (minDate === null || minDate > habitatTransits[indexHabTrans].date) {
                    minDate = habitatTransits[indexHabTrans].date;
                }
            }
            var bufferRound = this.createNewBufferRound(minDate);
            this.addUnitsToBufferRound(bufferRound, habitat);
            var maxDefenseTime = this.calculateBufferRound(bufferRound);
            this._bufferRounds[habitat.id] = {
                'name' : habitat.name,
                'bufferRound' : bufferRound,
                'maxDefenseTime' : maxDefenseTime
            };
        }
    }
};

/**
 * generate buffer Round.
 * 
 * @this {CurrentSlowDefenseCalculate}
 */
rigantestools_CurrentSlowDefenseCalculate.prototype.calculateBufferRound = function(bufferRound) {
    var index;
    var totalNbSpearman = 0;
    var totalNbSwordman = 0;
    var totalNbCrossbowman = 0;
    var totalNbArcher = 0;
    var totalNbScorpionRider = 0;
    var totalNbLancer = 0;

    var firstRoundTime = 0;
    var lastRoundTime = 0;
    var issue = false;
    // calculate lost unit per round
    for (index = 0; index < bufferRound.length; index++) {
        var item = bufferRound[index];

        if (index === 0) {
            firstRoundTime = item.date.getTime();
            lastRoundTime = firstRoundTime;
        } else if (!issue) {
            lastRoundTime = item.date.getTime();
        }

        totalNbSpearman = Math.floor(totalNbSpearman / 2) + item.nbNewSpearman;
        totalNbSwordman = Math.floor(totalNbSwordman / 2) + item.nbNewSwordman;
        totalNbCrossbowman = Math.floor(totalNbCrossbowman / 2) + item.nbNewCrossbowman;
        totalNbArcher = Math.floor(totalNbArcher / 2) + item.nbNewArcher;
        totalNbScorpionRider = Math.floor(totalNbScorpionRider / 2) + item.nbNewScorpionRider;
        totalNbLancer = Math.floor(totalNbLancer / 2) + item.nbNewLancer;
        item.unitCount = totalNbSpearman + totalNbSwordman + totalNbCrossbowman + totalNbArcher + totalNbScorpionRider + totalNbLancer;
        if (item.unitCount <= 100) {
            issue = true;
            totalNbSpearman = 0;
            totalNbSwordman = 0;
            totalNbCrossbowman = 0;
            totalNbArcher = 0;
            totalNbScorpionRider = 0;
            totalNbLancer = 0;
            item.unitCount = 0;
            item.issue = true;
        }
    }
    // remove not necessary round
    for (index = bufferRound.length - 2; index >= 0; index--) {
        if (bufferRound[index].unitCount !== 0) {
            break;
        }
        bufferRound.pop();
    }

    var maxDefenseTime = Math.round((lastRoundTime - firstRoundTime) / 1000);
    return maxDefenseTime;
};

/**
 * create new bufferRound.
 * 
 * @this {CurrentSlowDefenseCalculate}
 */
rigantestools_CurrentSlowDefenseCalculate.prototype.createNewBufferRound = function(date) {
    var bufferRound = [];
    // initialize buffer Rounds with date + 5 minutes
    var startDefenseRound = new Date().getTime() - 300000;
    if (date) {
        startDefenseRound = date.getTime() + this._stepDuration;
    }

    for (var step = 0; step <= (this._duration / this._stepDuration); step++) {
        bufferRound.push({
            'date' : new Date(startDefenseRound + step * this._stepDuration * 1000),
            'unitCount' : 0,
            'newUnitCount' : 0,
            'issue' : false,
            'nbNewSpearman' : 0,
            'nbNewSwordman' : 0,
            'nbNewCrossbowman' : 0,
            'nbNewArcher' : 0,
            'nbNewScorpionRider' : 0,
            'nbNewLancer' : 0
        });
    }
    return bufferRound;
};

/**
 * add Units To BufferRound.
 * 
 * @this {CurrentSlowDefenseCalculate}
 */
rigantestools_CurrentSlowDefenseCalculate.prototype.addUnitsToBufferRound = function(bufferRound, habitat) {
    var round;
    // Add default units of caslte
    if (bufferRound.length > 0) {
        round = bufferRound[0];
        round.nbNewSpearman = habitat.getUnitCount(rigantestools_Constant.UNITTYPE.SPEARMAN, false);
        round.nbNewSwordman = habitat.getUnitCount(rigantestools_Constant.UNITTYPE.SWORDMAN, false);
        round.nbNewCrossbowman = habitat.getUnitCount(rigantestools_Constant.UNITTYPE.CROSSBOWMAN, false);
        round.nbNewArcher = habitat.getUnitCount(rigantestools_Constant.UNITTYPE.ARCHER, false);
        round.nbNewScorpionRider = habitat.getUnitCount(rigantestools_Constant.UNITTYPE.SCORPIONRIDER, false);
        round.nbNewLancer = habitat.getUnitCount(rigantestools_Constant.UNITTYPE.LANCER, false);
        round.newUnitCount = 0;
    }
    // Add units in transit
    var habitatTransitsDefense = habitat.getHabitatTransits(rigantestools_Constant.TRANSITTYPE.DEFENSE, true);
    for (var indexTransit = 0; indexTransit < habitatTransitsDefense.length; indexTransit++) {
        var habitatTransit = habitatTransitsDefense[indexTransit];
        for (var index = 0; index < bufferRound.length; index++) {
            var diffTime = habitatTransit.date.getTime() - bufferRound[index].date.getTime();
            if ((diffTime >= 0) && (diffTime < this._stepDuration * 1000)) {
                round = bufferRound[index];
                round.nbNewSpearman += habitatTransit.getUnitCount(rigantestools_Constant.UNITTYPE.SPEARMAN);
                round.nbNewSwordman += habitatTransit.getUnitCount(rigantestools_Constant.UNITTYPE.SWORDMAN);
                round.nbNewCrossbowman += habitatTransit.getUnitCount(rigantestools_Constant.UNITTYPE.CROSSBOWMAN);
                round.nbNewArcher += habitatTransit.getUnitCount(rigantestools_Constant.UNITTYPE.ARCHER);
                round.nbNewScorpionRider += habitatTransit.getUnitCount(rigantestools_Constant.UNITTYPE.SCORPIONRIDER);
                round.nbNewLancer += habitatTransit.getUnitCount(rigantestools_Constant.UNITTYPE.LANCER);
                round.newUnitCount = round.nbNewSpearman + round.nbNewSwordman + round.nbNewCrossbowman + round.nbNewArcher + round.nbNewScorpionRider + round.nbNewLancer;
            }
        }
    }
};

/**
 * get result list.
 * 
 * @this {CurrentSlowDefenseCalculate}
 */
rigantestools_CurrentSlowDefenseCalculate.prototype.getResultList = function() {
    return this._bufferRounds;
};


/**
 * get slow defense.
 * 
 * @this {CurrentSlowDefenseCalculate}
 */
rigantestools_CurrentSlowDefenseCalculate.prototype.getSlowDefense = function(habitat) {
    return this._bufferRounds[habitat.id];
};

/**
 * Freeze the interface
 */
Object.freeze(rigantestools_CurrentSlowDefenseCalculate);
