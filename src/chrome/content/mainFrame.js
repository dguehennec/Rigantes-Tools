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

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://rigantestools/constant/constants.jsm", com);
Components.utils.import("resource://rigantestools/controller/controller.jsm", com);
Components.utils.import("resource://rigantestools/service/AttackCalculate.jsm", com);
Components.utils.import("resource://rigantestools/service/currentSlowDefenseCalculate.jsm", com);
Components.utils.import("resource://rigantestools/service/slowAttackDefenseCalculate.jsm", com);
Components.utils.import("resource://rigantestools/service/exporter.jsm", com);
Components.utils.import("resource://rigantestools/service/logger.jsm", com);
Components.utils.import("resource://rigantestools/service/util.jsm", com);

/**
 * The Class MainFrame.
 * 
 * @constructor
 * @this {MainFrame}
 */
com.rigantestools.MainFrame = {};

/**
 * Init MainFrame.
 * 
 * @this {MainFrame}
 * @return true if successful
 */
com.rigantestools.MainFrame.init = function() {
    /** @private */
    /** The logger. */
    this._logger = new com.rigantestools_Logger("MainFrame");
    this._logger.trace("init");
    /** @private */
    /** The util tool. */
    this._util = new com.rigantestools_Util(window);
    /** @private */
    /** The exporter. */
    this._exporter = new com.rigantestools_Exporter(window);
    /** @private */
    /** parameters */
    this._parameters = window.arguments[0];
    /** @private */
    /** the player */
    this._player = com.rigantestools_Controller.getPlayer();
    /** @private */
    /** the generated War Informations */
    this._generatedWarInformations = "";
    /** the generated Attack Defense Slow Informations */
    this._generatedAttackDefenseSlowInformations = "";
    /** @private */
    /** the current Habitats Column Tree Sort */
    this._currentHabitatsColumnTreeSort = null;
    /** @private */
    /** the current Habitats War Column Tree Sort */
    this._currentHabitatsWarColumnTreeSort = null;
    /** @private */
    /** the current Habitats Defense Column Tree Sort */
    this._currentHabitatsDefenseColumnTreeSort = null;
    /** @private */
    /** the current Habitats Attack Defense Slow Column Tree Sort */
    this._currentHabitatsAttackDefenseSlowColumnTreeSort = null;
    /** @private */
    /** the current array list */
    this.currentHabitats = [];
    this.currentHabitatsWar = [];
    this.currentHabitatsDefense = [];
    this.currentHabitatsAttackDefenseSlow = [];
    this.currentUnitsSimulation = [];
    
    if(this._player === null) {
        this._util.showMessage(this._util.getBundleString("error.data.invalid.title"), this._util.getBundleString("error.data.invalid.message"));
        return;
    }
    
    this._util.setAttribute("rigantestools-playerName", "value", this._player.name);
    if(this._player.creationDate) {
        this._util.setAttribute("rigantestools-playerCreationDate", "value", this._util.formatDateTime(new Date(this._player.creationDate), true));
    }
    this._util.setAttribute("rigantestools-playerLink", "value", this._player.link);
    this._util.setAttribute("rigantestools-playerNbCastles", "value", this._player.getHabitatList().length);
    // select current show tab
    this.selectTab();
    // Init player castles and attacks in progress after show interface
    var object = this;
    window.setTimeout(function() {
        object.initializePlayerInformation();
        object.initializeWarInProgressInformation();
    }, 10);
    return true;
};

/**
 * Gets the player of the LordsOfKnights.
 * 
 * @this {MainFrame}
 * @return {Player} the player
 */
com.rigantestools.MainFrame.getPlayer = function() {
    return this._player;
};

/**
 * Focus MainFrame.
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.focus = function() {
    // select current show tab
    this.selectTab();
};
/**
 * select tab MainFrame.
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.selectTab = function() {
    // select tab and initialize link
    var parameters = this._parameters;
    if( (parameters!==null) && (parameters.tab!==undefined) ) {
        this._util.setAttribute('rigantestools-tabbox', 'selectedIndex', parameters.tab);
        if(parameters.tab===1) {
            this._util.setAttribute('rigantestools-warTargetLink', 'value', parameters.parameters);
            this.clearWarTab();
        }
        else if (parameters.tab===3) {
            this._util.setAttribute('rigantestools-defenseTargetLink', 'value', parameters.parameters);
            this.clearDefenseTab();
        }
        else if (parameters.tab===5) {
            this._util.setAttribute('rigantestools-simulationAttaqueSpearman', 'value', parameters.parameters.attackers.spearman);
            this._util.setAttribute('rigantestools-simulationAttaqueSwordman', 'value', parameters.parameters.attackers.swordman);
            this._util.setAttribute('rigantestools-simulationAttaqueArcher', 'value', parameters.parameters.attackers.archer);
            this._util.setAttribute('rigantestools-simulationAttaqueCrossbowman', 'value', parameters.parameters.attackers.crossbowman);
            this._util.setAttribute('rigantestools-simulationAttaqueScorpionRider', 'value', parameters.parameters.attackers.scorpionRider);
            this._util.setAttribute('rigantestools-simulationAttaqueLancer', 'value', parameters.parameters.attackers.lancer);
            this._util.setAttribute('rigantestools-simulationDefenseSpearman', 'value', parameters.parameters.defenser.spearman);
            this._util.setAttribute('rigantestools-simulationDefenseSwordman', 'value', parameters.parameters.defenser.swordman);
            this._util.setAttribute('rigantestools-simulationDefenseArcher', 'value', parameters.parameters.defenser.archer);
            this._util.setAttribute('rigantestools-simulationDefenseCrossbowman', 'value', parameters.parameters.defenser.crossbowman);
            this._util.setAttribute('rigantestools-simulationDefenseScorpionRider', 'value', parameters.parameters.defenser.scorpionRider);
            this._util.setAttribute('rigantestools-simulationDefenseLancer', 'value', parameters.parameters.defenser.lancer);
            this.clearSimulationTab();
        }
    }
};

/**
 * Clean War tab.
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.clearWarTab = function() {
    this._util.setVisibility('rigantestools-warActionBar','collapse');
    this.clearWarTree();
    this.clearWarInformations();
    this.currentHabitatsWar = [];
};

/**
 * Clean Defense tab.
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.clearDefenseTab = function() {
    this.clearDefenseTree();
    this.clearDefenseInformations();
    this.currentHabitatsDefense = [];
};

/**
 * Clean Attack/Defense slow tab.
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.clearAttackDefenseSlowTab = function() {
    this.clearAttackDefenseSlowTree();
    this.clearAttackDefenseSlowInformations();
    this.currentHabitatsAttackDefenseSlow = [];
};

/**
 * Clean Simulation tab.
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.clearSimulationTab = function() {
    this.clearSimulationRoundsTree();
    this.clearSimulationAttackerTree();
    this.clearSimulationDefenserTree();
    this._util.setAttribute('rigantestools-simulationResultLabel','value', '');
    this.currentUnitsSimulation = [];
};

/**
 * Get war target link.
 * 
 * @this {MainFrame}
 * @return target link
 */
com.rigantestools.MainFrame.getWarTargetLink = function() {
    var targetLink = this._util.getAttribute('rigantestools-warTargetLink', 'value');
    if (!this._util.valideHabitatLink(targetLink)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.format.castle.link"));
        return null;
    }
    return targetLink;
};

/**
 * Get attack/Defense slow target link.
 * 
 * @this {MainFrame}
 * @return target link
 */
com.rigantestools.MainFrame.getAttackDefenseSlowTargetLink = function() {
    var targetLink = this._util.getAttribute('rigantestools-attackDefenseSlowTargetLink', 'value');
    if (!this._util.valideHabitatLink(targetLink)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.format.castle.link"));
        return null;
    }
    return targetLink;
};

/**
 * indicate if it is necessary to show all castles
 * 
 * @this {MainFrame}
 * @return {Boolean} true if necessary
 */
com.rigantestools.MainFrame.showWarAllCastles = function() {
    return this._util.getAttribute('rigantestools-warShowAllCastles', 'checked');
};

/**
 * indicate if it is necessary to show all castles
 * 
 * @this {MainFrame}
 * @return {Number} the selected index
 */
com.rigantestools.MainFrame.getAttackType = function() {
    return this._util.getAttribute('rigantestools-attackType', 'selectedIndex');
};

/**
 * indicate if we use UD
 * 
 * @this {MainFrame}
 * @return {Boolean} true if used
 */
com.rigantestools.MainFrame.isWarWithUD = function() {
    return this._util.getAttribute('rigantestools-warWithUD', 'checked');
};

/**
 * get war Min PA.
 * 
 * @this {MainFrame}
 * @return {Number} the min PA
 */
com.rigantestools.MainFrame.getWarMinPA = function() {
    var value = this._util.getAttribute('rigantestools-warMinPA', 'value');
    if (!this._util.isNumeric(value, false)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.format.number"));
        return null;
    }
    return value;
};

/**
 * get war Min UO.
 * 
 * @this {MainFrame}
 * @return {Number} the min UO
 */
com.rigantestools.MainFrame.getWarMinUO = function() {
    var value = this._util.getAttribute('rigantestools-warMinUO', 'value');
    if (!this._util.isNumeric(value, false)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.format.number"));
        return null;
    }
    return value;
};

/**
 * get war MaxTime.
 * 
 * @this {MainFrame}
 * @return {Number} the max time war value
 */
com.rigantestools.MainFrame.getWarMaxTime = function() {
    var time = this._util.getAttribute('rigantestools-warMaxTime', 'value');
    if (!this._util.valideTimeHHMM(time, false)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.format.time"));
        return null;
    }
    var hours = Number(time.substring(0, time.indexOf(':')));
    var minutes = Number(time.substring(time.indexOf(':') + 1));
    return hours * 3600 + minutes * 60;
};

/**
 * get attack/defense slow duration.
 * 
 * @this {MainFrame}
 * @return {Number} the duration
 */
com.rigantestools.MainFrame.getAttackDefenseSlowDuration = function() {
    var time = this._util.getAttribute('rigantestools-attackDefenseSlowDuration', 'value');
    if (!this._util.valideTimeHHMM(time, false)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.format.time"));
        return null;
    }
    var hours = Number(time.substring(0, time.indexOf(':')));
    var minutes = Number(time.substring(time.indexOf(':') + 1));
    return hours * 3600 + minutes * 60;
};

/**
 * get attack/defense slow start unit time.
 * 
 * @this {MainFrame}
 * @return {Number} the duration
 */
com.rigantestools.MainFrame.getAttackDefenseSlowStartUnitTime = function() {
    var time = this._util.getAttribute('rigantestools-attackDefenseSlowStartUnitTime', 'value');
    if (!this._util.valideTimeHHMM(time, false)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.format.time"));
        return null;
    }
    var hours = Number(time.substring(0, time.indexOf(':')));
    var minutes = Number(time.substring(time.indexOf(':') + 1));
    return hours * 3600 + minutes * 60;
};

/**
 * get war DateTime.
 * 
 * @this {MainFrame}
 * @return {Date} the war date value
 */
com.rigantestools.MainFrame.getWarDateTime = function() {
    var datePicker = document.getElementById('rigantestools-warDate');
    var time = this._util.getAttribute('rigantestools-warTime', 'value');
    if (!this._util.valideTimeHHMM(time, true)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.format.time"));
        return null;
    }
    var hours = time.substring(0, time.indexOf(':'));
    var minutes = time.substring(time.indexOf(':') + 1);
    var date = new Date(datePicker.year, datePicker.month, datePicker.date, hours, minutes, 0, 0);
    return date;
};

/**
 * get attack/defense slow DateTime.
 * 
 * @this {MainFrame}
 * @return {Date} the attack/defense slow date value
 */
com.rigantestools.MainFrame.getAttackDefenseSlowDateTime = function() {
    var datePicker = document.getElementById('rigantestools-attackDefenseSlowDate');
    var time = this._util.getAttribute('rigantestools-attackDefenseSlowTime', 'value');
    if (!this._util.valideTimeHHMM(time, true)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.format.time"));
        return null;
    }
    var hours = time.substring(0, time.indexOf(':'));
    var minutes = time.substring(time.indexOf(':') + 1);
    var date = new Date(datePicker.year, datePicker.month, datePicker.date, hours, minutes, 0, 0);
    return date;
};

/**
 * Get defense target link.
 * 
 * @this {MainFrame}
 * @return {String} target link
 */
com.rigantestools.MainFrame.getDefenseTargetLink = function() {
    var targetLink = this._util.getAttribute('rigantestools-defenseTargetLink', 'value');
    if (!this._util.valideHabitatLink(targetLink)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.format.castle.link"));
        return null;
    }
    return targetLink;
};

/**
 * indicate if it is necessary to show all defenses castles
 * 
 * @this {MainFrame}
 * @return {Boolean} true if necessary
 */
com.rigantestools.MainFrame.showDefenseAllCastles = function() {
    return this._util.getAttribute('rigantestools-defenseShowAllCastles', 'checked');
};

/**
 * indicate if we use unit type UO
 * 
 * @this {MainFrame}
 * @return {Boolean} true if checked
 */
com.rigantestools.MainFrame.getAttackDefenseSlowUnitType = function() {
	return (this._util.getAttribute('rigantestools-attackDefenseSlowUnitType', 'value') );
};



/**
 * indicate if we use all castles
 * 
 * @this {MainFrame}
 * @return {Boolean} true if checked
 */
com.rigantestools.MainFrame.getAttackDefenseSlowUsedAllCastles = function() {
    return this._util.getAttribute('rigantestools-defenseAttackDefenseSlowUsedAllCastles', 'checked');
};

com.rigantestools.MainFrame.getAttackDefenseSlowRalentit = function() {
    return this._util.getAttribute('rigantestools-defenseAttackDefenseSlowRalentit', 'checked');
};

/**
 * get the unit count
 * 
 * @this {MainFrame}
 * @return {Number} the unit count
 */
com.rigantestools.MainFrame.getAttackDefenseSlowUnitCount = function() {
	return Number(this._util.getAttribute('rigantestools-attackDefenseSlowUnitCount', 'value'));
};

com.rigantestools.MainFrame.getAttackDefenseSlowErrorMargin = function() {
	return Number(this._util.getAttribute('rigantestools-attackDefenseSlowErrorMargin', 'value'));
};




/**
 * indicate if it is the slow defense to calculate
 * 
 * @this {MainFrame}
 * @return {Boolean} true if slow defense
 */
com.rigantestools.MainFrame.isSlowDefenseType = function() {
    return this._util.getAttribute('rigantestools-defenseCastlesType', 'checked');
};

/**
 * get defense DateTime.
 * 
 * @this {MainFrame}
 * @return {Date} the defense date value
 */
com.rigantestools.MainFrame.getDefenseDateTime = function() {
    var datePicker = document.getElementById('rigantestools-defenseDate');
    var time = this._util.getAttribute('rigantestools-defenseTime', 'value');
    if (!this._util.valideTimeHHMM(time, true)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.format.time"));
        return null;
    }
    var hours = time.substring(0, time.indexOf(':'));
    var minutes = time.substring(time.indexOf(':') + 1);
    var date = new Date(datePicker.year, datePicker.month, datePicker.date, hours, minutes, 0, 0);
    return date;
};

/**
 * calculate target time and show
 * 
 * @this {MainFrame}
 * @return {Boolean} true if successful
 */
com.rigantestools.MainFrame.calculateWarTimeAndShow = function() {
    this.currentDateTime = new Date();
    var maxTime = 0;
    var minUO = 0;
    try {
        if (this._player === null) {
            return false;
        }
        
        var targetLink = this.getWarTargetLink();
        if (targetLink === null) {
            return false;
        }    
    
        var attackType = this.getAttackType();
        if(attackType===0) {
            var date = this.getWarDateTime();
            if (date === null) {
                return false;
            }    
            this.currentDateTime = date;
        
            maxTime = this.getWarMaxTime();
            if (maxTime === null) {
                return false;
            }    
        }
        else {
            minUO = this.getWarMinUO();
            if (minUO === null) {
                return false;
            }
        }
        var minPA = this.getWarMinPA();
        if (minPA === null) {
            return false;
        }
        
        var withUD = this.isWarWithUD();
        var withAllCastles = this.showWarAllCastles();
        var habitats = this._player.getHabitatList();
        
        var attackCalculate = new com.rigantestools_AttackCalculate(habitats, targetLink);
        if(attackType===0) {
            this.currentHabitatsWar = attackCalculate.getProgrammedAttack(this.currentDateTime, maxTime, minPA, withUD, withAllCastles);
        }
        else {
            this.currentHabitatsWar = attackCalculate.getFlashAttack(this.currentDateTime, minUO, minPA, withUD, withAllCastles);
            var maxDuration = 0;
            for(var index = 0; index < this.currentHabitatsWar.length; index++) {
                if(this.currentHabitatsWar[index].selectedDuration>maxDuration) {
                    maxDuration = this.currentHabitatsWar[index].selectedDuration;
                }
            }
            this.currentDateTime = new Date(this.currentDateTime.getTime() + maxDuration*1000);
        }
        // sort habitat
        this.refreshWarTable();
        this.sortcolumnWarTree(null, false);
        this._util.setVisibility('rigantestools-warActionBar', 'visible');
    }
    catch(e) {
        this._logger.error("calculateWarTimeAndShow", e);
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.data.not.found"));
    }
    return true;
};


/**
 * calculate target time and show
 * 
 * @this {MainFrame}
 * @return {Boolean} true if successful
 */
com.rigantestools.MainFrame.calculateDefenseTimeAndShow = function() {
    var index;
    
    try {
        if (this._player === null) {
            return false;
        }
        var targetLink = this.getDefenseTargetLink();
        if (targetLink === null) {
            return false;
        }
        var date = this.getDefenseDateTime();
        if (date === null) {
            return false;
        }
        var warTime = date.getTime();
    
        var showAllCastles = this.showDefenseAllCastles();
    
        var nbMinSpearman = this._util.getPref(com.rigantestools_Constant.PREF_NB_MIN_SPEARMAN_DEFENSE);
        if (nbMinSpearman === '') {
            nbMinSpearman = 300;
        }
        var nbMinCrossbowman = this._util.getPref(com.rigantestools_Constant.PREF_NB_MIN_CROSSBOWMAN_DEFENSE);
        if (nbMinCrossbowman === '') {
            nbMinCrossbowman = 300;
        }
        var nbMinScorpionRider = this._util.getPref(com.rigantestools_Constant.PREF_NB_MIN_SCORPIONRIDER_DEFENSE);
        if (nbMinScorpionRider === '') {
            nbMinScorpionRider = 300;
        }
    
        this.clearDefenseTab();
        var habitats = this._player.getHabitatList();
        this.currentHabitatsDefense = [];
        if (habitats.length > 0) {
            for (index = 0; index < habitats.length; index++) {
                var habitat = habitats[index];
                if (habitat.link !== targetLink) {
                    var spearmanCount = Math.max(0, habitat.getUnitCount(com.rigantestools_Constant.UNITTYPE.SPEARMAN) - Number(nbMinSpearman));
                    var crossbowmanCount = Math.max(0, habitat.getUnitCount(com.rigantestools_Constant.UNITTYPE.CROSSBOWMAN) - Number(nbMinCrossbowman));
                    var scorpionRiderCount = Math.max(0, habitat.getUnitCount(com.rigantestools_Constant.UNITTYPE.SCORPIONRIDER) - Number(nbMinScorpionRider));
                    var totalUD = spearmanCount + crossbowmanCount + scorpionRiderCount;
                    // check duration with spearman
                    var duration = habitat.getUnitDurationTo(com.rigantestools_Constant.UNITTYPE.SPEARMAN, targetLink);
                    var currentTime = new Date().getTime();
                    var ArrivalDate = currentTime + duration * 1000;
                    if ((spearmanCount === 0) || (duration !== 0) && (ArrivalDate > warTime)) {
                        spearmanCount = 0;
                        duration = habitat.getUnitDurationTo(com.rigantestools_Constant.UNITTYPE.CROSSBOWMAN, targetLink);
                        // check duration with crossbowman
                        ArrivalDate = currentTime + duration * 1000;
                        if ((crossbowmanCount === 0) || (duration !== 0) && (ArrivalDate > warTime)) {
                            crossbowmanCount = 0;
                            duration = habitat.getUnitDurationTo(com.rigantestools_Constant.UNITTYPE.SCORPIONRIDER, targetLink);
                            // check duration with lancer
                            ArrivalDate = currentTime + duration * 1000;
                            if ((scorpionRiderCount === 0) || (duration !== 0) && (ArrivalDate > warTime)) {
                                scorpionRiderCount = 0;
                                duration = 0;
                            }
                        }
                    }
                    // convert duration to string
                    var durationStr = '';
                    if (duration !== 0) {
                        durationStr = this._util.secToTimeStr(duration);
                    }
                    // convert startTime to string
                    var ArrivalTimeStr = '';
                    if (duration !== 0) {
                        ArrivalTimeStr = this._util.formatDateTime(new Date(ArrivalDate));
                    } else {
                        if (totalUD > 0) {
                            ArrivalTimeStr = this._util.getBundleString("mainframe.defense.longest");
                        } else {
                            ArrivalTimeStr = this._util.getBundleString("mainframe.defense.noUO");
                        }
                    }
                    // add habitate Defense
                    if (showAllCastles || duration > 0) {
                        var item = {
                            'name' : habitat.name,
                            'spearmanCount' : spearmanCount,
                            'crossbowmanCount' : crossbowmanCount,
                            'scorpionRiderCount' : scorpionRiderCount,
                            'totalUD' : spearmanCount + crossbowmanCount + scorpionRiderCount,
                            'duration' : duration,
                            'ArrivalDate' : ArrivalDate,
                            'durationStr' : durationStr,
                            'ArrivalTimeStr' : ArrivalTimeStr
                        };
                        this.currentHabitatsDefense.push(item);
                    }
                }
            }
        }
        // sort habitat
        this.sortcolumnDefenseTree(null);
        // set informations
        var nbCastles = 0;
        var spearmanCount = 0;
        var crossbowmanCount = 0;
        var scorpionRiderCount = 0;
        var totalUD = 0;
        var maxDuration = 0;
        var minDuration = 9999999;
        for (index = 0; index < this.currentHabitatsDefense.length; index++) {
            var item = this.currentHabitatsDefense[index];
            if (item.duration !== 0) {
                nbCastles++;
                spearmanCount += item.spearmanCount;
                crossbowmanCount += item.crossbowmanCount;
                scorpionRiderCount += item.scorpionRiderCount;
                totalUD += item.totalUD;
                if (item.duration < minDuration) {
                    minDuration = item.duration;
                }
                if (item.duration > maxDuration) {
                    maxDuration = item.duration;
                }
            }
        }
        this._util.setAttribute('rigantestools-defenseInfoTarget', 'value', targetLink);
        this._util.setAttribute('rigantestools-defenseInfoCastles', 'value', nbCastles);
        if (totalUD > 0) {
            this._util.setAttribute('rigantestools-defenseNbUD', 'value', totalUD + " (" + spearmanCount + "/" + crossbowmanCount + "/" + scorpionRiderCount + ")");
        }
        else {
            this._util.setAttribute('rigantestools-defenseNbUD', 'value', totalUD);
        }
        if (minDuration > 0 && minDuration !== 9999999) {
            this._util.setAttribute('rigantestools-defenseInfoTimeTargetMin', 'value', this._util.secToTimeStr(minDuration));
            this._util.setAttribute('rigantestools-defenseInfoArrivalTimeTargetMin', 'value', this._util.formatDateTime(new Date(new Date().getTime() + minDuration * 1000)));
        }
        if (maxDuration > 0) {
            this._util.setAttribute('rigantestools-defenseInfoTimeTargetMax', 'value', this._util.secToTimeStr(maxDuration));
            this._util.setAttribute('rigantestools-defenseInfoArrivalTimeTargetMax', 'value', this._util.formatDateTime(new Date(new Date().getTime() + maxDuration * 1000)));
        }
    }
    catch(e) {
        this._logger.error("calculateDefenseTimeAndShow", e);
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.data.not.found"));
    }
    return true;
};

/**
 * get simulation value
 * 
 * @this {MainFrame}
 * @param {String}
 *            id identifiant
 * @return {Number} value if numeric
 */
com.rigantestools.MainFrame.getSimulationValue = function(id)
{
    var value = this._util.getAttribute(id, 'value');
    if(this._util.isNumeric(value)) {
        if(value==="") {
            return 0;
        }
        else {
            return Number(value);
        }
    }
    this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.format.unit").replace("%NB%",value));
    return null;
};

/**
 * get simulation fortification value
 * 
 * @this {MainFrame}
 * @return {Number} value if numeric
 */
com.rigantestools.MainFrame.getSimulationFortificationValue = function()
{
    var value = this._util.getAttribute('rigantestools-simulationDefenseFortification', 'value');
    if(this._util.isNumeric(value)) {
        if(value==="") {
            return 1;
        }
        else {
            value = Number(value);
            return (1 + value*0.05);
        }
    }
    this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.format.unit").replace("%NB%",value));
    return null;
};

/**
 * get simulation period value
 * 
 * @this {MainFrame}
 * @return {Number} value of the simulation period
 */
com.rigantestools.MainFrame.getSimulationPeriodValue = function()
{
    if(this._util.getAttribute('rigantestools-simulationDefenseNight', 'checked')===true) {
        return 2;
    }
    return 1;
};
/**
 * get simulation research value
 * 
 * @this {MainFrame}
 * @param {String}
 *            unit
 * @param {String}
 *            type
 * @param {String}
 *            typeUnit
 * @param {Number}
 *            fortification
 * @param {Number}
 *            period
 * @return {Number} Coeff Battle Value
 */
com.rigantestools.MainFrame.getSimulationCoeffBattleValue = function(unit, type, typeUnit, fortification, period)
{
    var coeffsUnit = com.rigantestools_Constant.BATTLEVALUES[unit];
    var coeffsUnitType = coeffsUnit[type];
    var coeffBase = coeffsUnitType[typeUnit];
    var coeffSearch = 1;
    var coeffEnd = 1;
    if(type==="off") {
        if(this._util.getAttribute('rigantestools-simulationAttaqueSmithWeapons', 'checked')===true) {
            coeffSearch += 0.05;
        }
        if( (unit==="SPEARMAN" || unit==="SWORDMAN") && (this._util.getAttribute('rigantestools-simulationAttaqueWeaponsmithing', 'checked')===true) ) {
            coeffSearch += 0.05;
        }
        else if( (unit==="ARCHER" || unit==="CROSSBOWMAN") && (this._util.getAttribute('rigantestools-simulationAttaqueFlamingArrows', 'checked')===true) ) {
            coeffSearch += 0.05;
        }
        else if( (unit==="SCORPIONRIDER" || unit==="LANCER") && (this._util.getAttribute('rigantestools-simulationAttaqueSmith', 'checked')===true) ) {
            coeffSearch += 0.05;
        }
        coeffEnd = coeffBase*coeffSearch;
    }
    else {
        if(this._util.getAttribute('rigantestools-simulationDefenseGunsmith', 'checked')===true) {
            coeffSearch += 0.05;
        }
        if(this._util.getAttribute('rigantestools-simulationDefenseTank', 'checked')===true) {
            coeffSearch += 0.05;
        }
        if( (unit==="SPEARMAN" || unit==="SWORDMAN") && (this._util.getAttribute('rigantestools-simulationDefenseIronReinforcements', 'checked')===true) ) {
            coeffSearch += 0.05;
        }
        else if( (unit==="ARCHER" || unit==="CROSSBOWMAN") && (this._util.getAttribute('rigantestools-simulationDefensePoisonedArrowsh', 'checked')===true) ) {
            coeffSearch += 0.05;
        }
        else if( (unit==="SCORPIONRIDER" || unit==="LANCER") && (this._util.getAttribute('rigantestools-simulationDefenseHorseBreeding', 'checked')===true) ) {
            coeffSearch += 0.05;
        }
        coeffEnd = coeffBase*coeffSearch*fortification*period;
    }
    return coeffEnd;
};

/**
 * calculate simulation and show
 * 
 * @this {MainFrame}
 * @return {Boolean} true if successful
 */
com.rigantestools.MainFrame.calculateSimulationAndShow = function() {
    try {
        
        if (this._player === null) {
            return false;
        }
        // get attaque informations
        var attaqueSpearman = this.getSimulationValue("rigantestools-simulationAttaqueSpearman");
        if (attaqueSpearman === null) {
            return false;
        }
        var attaqueSwordman = this.getSimulationValue("rigantestools-simulationAttaqueSwordman");
        if (attaqueSwordman === null) {
            return false;
        }
        var attaqueArcher = this.getSimulationValue("rigantestools-simulationAttaqueArcher");
        if (attaqueArcher === null) {
            return false;
        }
        var attaqueCrossbowman = this.getSimulationValue("rigantestools-simulationAttaqueCrossbowman");
        if (attaqueCrossbowman === null) {
            return false;
        }
        var attaqueScorpionRider = this.getSimulationValue("rigantestools-simulationAttaqueScorpionRider");
        if (attaqueScorpionRider === null) {
            return false;
        }
        var attaqueLancer = this.getSimulationValue("rigantestools-simulationAttaqueLancer");
        if (attaqueLancer === null) {
            return false;
        }
        // get defense informations
        var defenseSpearman = this.getSimulationValue("rigantestools-simulationDefenseSpearman");
        if (defenseSpearman === null) {
            return false;
        }
        var defenseSwordman = this.getSimulationValue("rigantestools-simulationDefenseSwordman");
        if (defenseSwordman === null) {
            return false;
        }
        var defenseArcher = this.getSimulationValue("rigantestools-simulationDefenseArcher");
        if (defenseArcher === null) {
            return false;
        }
        var defenseCrossbowman = this.getSimulationValue("rigantestools-simulationDefenseCrossbowman");
        if (defenseCrossbowman === null) {
            return false;
        }
        var defenseScorpionRider = this.getSimulationValue("rigantestools-simulationDefenseScorpionRider");
        if (defenseScorpionRider === null) {
            return false;
        }
        var defenseLancer = this.getSimulationValue("rigantestools-simulationDefenseLancer");
        if (defenseLancer === null) {
            return false;
        }
        var fortification = this.getSimulationFortificationValue();
        if (fortification === null) {
            return false;
        }
        var period = this.getSimulationPeriodValue();
        
        var nbUnitOff = attaqueSpearman+attaqueSwordman+attaqueArcher+attaqueCrossbowman+attaqueScorpionRider+attaqueLancer;
        var nbUnitDef = defenseSpearman+defenseSwordman+defenseArcher+defenseCrossbowman+defenseScorpionRider+defenseLancer;
        
        var diviser = 2;
        var nbRound = 1;
        
        this.clearSimulationTab();
        
        this.currentUnitsSimulation = [];
        var item = {
            'attaqueSpearman' : attaqueSpearman,
            'attaqueSwordman' : attaqueSwordman,
            'attaqueArcher' : attaqueArcher,
            'attaqueCrossbowman' : attaqueCrossbowman,
            'attaqueScorpionRider' : attaqueScorpionRider,
            'attaqueLancer' : attaqueLancer,
            'defenseSpearman' : defenseSpearman,
            'defenseSwordman' : defenseSwordman,
            'defenseArcher' : defenseArcher,
            'defenseCrossbowman' : defenseCrossbowman,
            'defenseScorpionRider' : defenseScorpionRider,
            'defenseLancer' : defenseLancer
        };
        this.currentUnitsSimulation.push(item);
        
        while(nbUnitOff>0 && nbUnitDef>0) {
            this.addToSimulationRoundsTree(nbRound, nbUnitOff, nbUnitDef);
            
            var offInf = attaqueSpearman * this.getSimulationCoeffBattleValue("SPEARMAN","off","inf",fortification,period) + 
            attaqueSwordman * this.getSimulationCoeffBattleValue("SWORDMAN","off","inf",fortification,period) +
            attaqueArcher * this.getSimulationCoeffBattleValue("ARCHER","off","inf",fortification,period) + 
            attaqueCrossbowman * this.getSimulationCoeffBattleValue("CROSSBOWMAN","off","inf",fortification,period) + 
            attaqueScorpionRider * this.getSimulationCoeffBattleValue("SCORPIONRIDER","off","inf",fortification,period) + 
            attaqueLancer * this.getSimulationCoeffBattleValue("LANCER","off","inf",fortification,period);
            
            var offArt = attaqueSpearman * this.getSimulationCoeffBattleValue("SPEARMAN","off","art",fortification,period) + 
            attaqueSwordman * this.getSimulationCoeffBattleValue("SWORDMAN","off","art",fortification,period) +
            attaqueArcher * this.getSimulationCoeffBattleValue("ARCHER","off","art",fortification,period) + 
            attaqueCrossbowman * this.getSimulationCoeffBattleValue("CROSSBOWMAN","off","art",fortification,period) + 
            attaqueScorpionRider * this.getSimulationCoeffBattleValue("SCORPIONRIDER","off","art",fortification,period) + 
            attaqueLancer * this.getSimulationCoeffBattleValue("LANCER","off","art",fortification,period);
            
            var offCav = attaqueSpearman * this.getSimulationCoeffBattleValue("SPEARMAN","off","cav",fortification,period) + 
            attaqueSwordman * this.getSimulationCoeffBattleValue("SWORDMAN","off","cav",fortification,period) +
            attaqueArcher * this.getSimulationCoeffBattleValue("ARCHER","off","cav",fortification,period) + 
            attaqueCrossbowman * this.getSimulationCoeffBattleValue("CROSSBOWMAN","off","cav",fortification,period) + 
            attaqueScorpionRider * this.getSimulationCoeffBattleValue("SCORPIONRIDER","off","cav",fortification,period) + 
            attaqueLancer * this.getSimulationCoeffBattleValue("LANCER","off","cav",fortification,period);
            
            var defInf = defenseSpearman * this.getSimulationCoeffBattleValue("SPEARMAN","def","inf",fortification,period) + 
            defenseSwordman * this.getSimulationCoeffBattleValue("SWORDMAN","def","inf",fortification,period) +
            defenseArcher * this.getSimulationCoeffBattleValue("ARCHER","def","inf",fortification,period) + 
            defenseCrossbowman * this.getSimulationCoeffBattleValue("CROSSBOWMAN","def","inf",fortification,period) + 
            defenseScorpionRider * this.getSimulationCoeffBattleValue("SCORPIONRIDER","def","inf",fortification,period) + 
            defenseLancer * this.getSimulationCoeffBattleValue("LANCER","def","inf",fortification,period) + ((fortification-1)/0.05-1)*50;
            
            var defArt = defenseSpearman * this.getSimulationCoeffBattleValue("SPEARMAN","def","art",fortification,period) + 
            defenseSwordman * this.getSimulationCoeffBattleValue("SWORDMAN","def","art",fortification,period) +
            defenseArcher * this.getSimulationCoeffBattleValue("ARCHER","def","art",fortification,period) + 
            defenseCrossbowman * this.getSimulationCoeffBattleValue("CROSSBOWMAN","def","art",fortification,period) + 
            defenseScorpionRider * this.getSimulationCoeffBattleValue("SCORPIONRIDER","def","art",fortification,period) + 
            defenseLancer * this.getSimulationCoeffBattleValue("LANCER","def","art",fortification,period) + ((fortification-1)/0.05-1)*50;
            
            var defCav = defenseSpearman * this.getSimulationCoeffBattleValue("SPEARMAN","def","cav",fortification,period) + 
            defenseSwordman * this.getSimulationCoeffBattleValue("SWORDMAN","def","cav",fortification,period) +
            defenseArcher * this.getSimulationCoeffBattleValue("ARCHER","def","cav",fortification,period) + 
            defenseCrossbowman * this.getSimulationCoeffBattleValue("CROSSBOWMAN","def","cav",fortification,period) + 
            defenseScorpionRider * this.getSimulationCoeffBattleValue("SCORPIONRIDER","def","cav",fortification,period) + 
            defenseLancer * this.getSimulationCoeffBattleValue("LANCER","def","cav",fortification,period) + ((fortification-1)/0.05-1)*50;
            
            if(nbUnitOff<100 || nbUnitDef<100) {
                diviser = 1;
            }
            
            attaqueSpearman = attaqueSpearman-Math.ceil(Math.min(attaqueSpearman,attaqueSpearman*(defInf/offInf))/diviser);
            attaqueSwordman = attaqueSwordman-Math.ceil(Math.min(attaqueSwordman,attaqueSwordman*(defInf/offInf))/diviser);
            attaqueArcher = attaqueArcher-Math.ceil(Math.min(attaqueArcher,attaqueArcher*(defArt/offArt))/diviser);
            attaqueCrossbowman = attaqueCrossbowman-Math.ceil(Math.min(attaqueCrossbowman,attaqueCrossbowman*(defArt/offArt))/diviser);
            attaqueScorpionRider = attaqueScorpionRider-Math.ceil(Math.min(attaqueScorpionRider,attaqueScorpionRider*(defCav/offCav))/diviser);
            attaqueLancer = attaqueLancer-Math.ceil(Math.min(attaqueLancer,attaqueLancer*(defCav/offCav))/diviser);
            nbUnitOff = attaqueSpearman+attaqueSwordman+attaqueArcher+attaqueCrossbowman+attaqueScorpionRider+attaqueLancer;
            
            defenseSpearman = defenseSpearman-Math.ceil(Math.min(defenseSpearman,defenseSpearman*(offInf/defInf))/diviser);
            defenseSwordman = defenseSwordman-Math.ceil(Math.min(defenseSwordman,defenseSwordman*(offInf/defInf))/diviser);
            defenseArcher = defenseArcher-Math.ceil(Math.min(defenseArcher,defenseArcher*(offArt/defArt))/diviser);
            defenseCrossbowman = defenseCrossbowman-Math.ceil(Math.min(defenseCrossbowman,defenseCrossbowman*(offArt/defArt))/diviser);
            defenseScorpionRider = defenseScorpionRider-Math.ceil(Math.min(defenseScorpionRider,defenseScorpionRider*(offCav/defCav))/diviser);
            defenseLancer = defenseLancer-Math.ceil(Math.min(defenseLancer,defenseLancer*(offCav/defCav))/diviser);
            nbUnitDef = defenseSpearman+defenseSwordman+defenseArcher+defenseCrossbowman+defenseScorpionRider+defenseLancer;
            nbRound++;
            var item = {
                    'attaqueSpearman' : attaqueSpearman,
                    'attaqueSwordman' : attaqueSwordman,
                    'attaqueArcher' : attaqueArcher,
                    'attaqueCrossbowman' : attaqueCrossbowman,
                    'attaqueScorpionRider' : attaqueScorpionRider,
                    'attaqueLancer' : attaqueLancer,
                    'defenseSpearman' : defenseSpearman,
                    'defenseSwordman' : defenseSwordman,
                    'defenseArcher' : defenseArcher,
                    'defenseCrossbowman' : defenseCrossbowman,
                    'defenseScorpionRider' : defenseScorpionRider,
                    'defenseLancer' : defenseLancer
                };
            this.currentUnitsSimulation.push(item);
            
        }
        this.addToSimulationRoundsTree(nbRound, nbUnitOff, nbUnitDef);
        this.addToSimulationAttackerTree();
        this.addToSimulationDefenserTree();
        if(nbUnitOff>0) {
            this._util.setAttribute('rigantestools-simulationResultLabel', 'value', this._util.getBundleString("mainframe.simulation.off.success").replace("%NB%",nbRound));
            this._util.setAttribute('rigantestools-simulationResultLabel', 'status', 'off');
        }
        else {
            this._util.setAttribute('rigantestools-simulationResultLabel', 'value', this._util.getBundleString("mainframe.simulation.def.success").replace("%NB%",nbRound));
            this._util.setAttribute('rigantestools-simulationResultLabel', 'status', 'def');
        }
    }
    catch(e) {
        this._logger.error("calculateSimulationAndShow", e);
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.data.not.found"));
    }
    return true;
};

/**
 * calculate Attack/Defense Slow time and show
 * 
 * @this {MainFrame}
 * @return {Boolean} true if successful
 */
com.rigantestools.MainFrame.calculateAttackDefenseSlowTimeAndShow = function() {
    try {
        if (this._player === null) {
            return false;
        }
        var targetLink = this.getAttackDefenseSlowTargetLink();
        if (targetLink === null) {
            return false;
        }
        var date = this.getAttackDefenseSlowDateTime();
        if (date === null) {
            return false;
        }
        var duration = this.getAttackDefenseSlowDuration();
        if (duration === null) {
            return false;
        }
        var startTimeUnit = this.getAttackDefenseSlowStartUnitTime();
        if (startTimeUnit === null) {
            return false;
        }
        
 		var unitType = this.getAttackDefenseSlowUnitType();
		var unitCount = this.getAttackDefenseSlowUnitCount();
		var allCastles = this.getAttackDefenseSlowUsedAllCastles();
		var ralentit = this.getAttackDefenseSlowRalentit();
		var errorMargin = this.getAttackDefenseSlowErrorMargin();
		var onlyCastles = this._util.getAttribute('rigantestools-attackDefenseSlowOnlyCastles', 'value') ;
		var noCastles = this._util.getAttribute('rigantestools-attackDefenseSlowNoCastles', 'value') ;
        var maxperminute  = this._util.getAttribute('rigantestools-attackDefenseSlowMaxPerMinute', 'value') ;

        
        this.clearAttackDefenseSlowTab();
        var slowAttackDefenseCalculate = new com.rigantestools_SlowAttackDefenseCalculate(this._player.getHabitatList(), targetLink, date, duration, unitType, unitCount, startTimeUnit, allCastles, errorMargin, onlyCastles, noCastles, ralentit, maxperminute);
        this.currentHabitatsAttackDefenseSlow = slowAttackDefenseCalculate.getResultList();
        this.sortcolumnAttackDefenseSlowTree(null);
        
        this._generatedAttackDefenseSlowInformations = this._util.getBundleString("mainframe.attackDefenseSlow.target") + " : " + slowAttackDefenseCalculate.getTargetLink() + "##";
        this._generatedAttackDefenseSlowInformations += this._util.getBundleString("mainframe.attackDefenseSlow.nbLaunch") + " : " + slowAttackDefenseCalculate.getNbAttacks() + "##";
        this._generatedAttackDefenseSlowInformations += this._util.getBundleString("mainframe.attackDefenseSlow.firstDate") + " : " + this._util.formatDateTime(slowAttackDefenseCalculate.getFirstArrivalDate()) + "##";
        this._generatedAttackDefenseSlowInformations += this._util.getBundleString("mainframe.attackDefenseSlow.lastDate") + " : " + this._util.formatDateTime(slowAttackDefenseCalculate.getLastArrivalDate()) + "##";
        
        this._util.setAttribute('rigantestools-attackDefenseSlowInfoTarget', 'value', slowAttackDefenseCalculate.getTargetLink());
        this._util.setAttribute('rigantestools-attackDefenseSlowInfoCastles', 'value', slowAttackDefenseCalculate.getNbAttacks());
        this._util.setAttribute('rigantestools-attackDefenseSlowInfoFirstArrivalDate', 'value', this._util.formatDateTime(slowAttackDefenseCalculate.getFirstArrivalDate()));
        this._util.setAttribute('rigantestools-attackDefenseSlowInfoLastArrivalDate', 'value', this._util.formatDateTime(slowAttackDefenseCalculate.getLastArrivalDate()));
        this._util.setAttribute('rigantestools-attackDefenseSlowInfoStartTimeTargetMax', 'value', this._util.formatDateTime(slowAttackDefenseCalculate.getStartTimeTargetMax()));
        this._util.setAttribute('rigantestools-attackDefenseSlowInfoStartTimeTargetMin', 'value', this._util.formatDateTime(slowAttackDefenseCalculate.getStartTimeTargetMin()));
        this._util.setVisibility('rigantestools-attackDefenseSlowActionBar', 'visible');
    }
    catch(e) {
        this._logger.error("calculateAttackDefenseSlowTimeAndShow", e);
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.data.not.found"));
    }
};

/**
 * Clear window war informations
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.clearWarInformations = function() {
    this._util.setAttribute("rigantestools-warInfoTarget", "value", '');
    this._util.setAttribute("rigantestools-warInfoCastles", "value", '');
    this._util.setAttribute("rigantestools-warNbUO", "value", '');
    this._util.setAttribute("rigantestools-warNbCaptions", "value", '');
    this._util.setAttribute("rigantestools-warInfoTimeTargetMin", "value", '');
    this._util.setAttribute("rigantestools-warInfoTimeTargetMax", "value", '');
    this._util.setAttribute("rigantestools-warInfoStartTimeTargetMin", "value", '');
    this._util.setAttribute("rigantestools-warInfoStartTimeTargetMax", "value", '');
};

/**
 * Clear window defense informations
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.clearDefenseInformations = function() {
    this._util.setAttribute("rigantestools-defenseInfoTarget", "value", '');
    this._util.setAttribute("rigantestools-defenseInfoCastles", "value", '');
    this._util.setAttribute("rigantestools-defenseNbUD", "value", '');
    this._util.setAttribute("rigantestools-defenseInfoTimeTargetMin", "value", '');
    this._util.setAttribute("rigantestools-defenseInfoTimeTargetMax", "value", '');
    this._util.setAttribute("rigantestools-defenseInfoArrivalTimeTargetMin", "value", '');
    this._util.setAttribute("rigantestools-defenseInfoArrivalTimeTargetMax", "value", '');
};

/**
 * Clear window defense informations
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.clearAttackDefenseSlowInformations = function() {
    this._util.setAttribute("rigantestools-attackDefenseSlowInfoTarget", "value", '');
    this._util.setAttribute("rigantestools-attackDefenseSlowInfoCastles", "value", '');
    this._util.setAttribute("rigantestools-attackDefenseSlowInfoFirstArrivalDate", "value", '');
    this._util.setAttribute("rigantestools-attackDefenseSlowInfoLastArrivalDate", "value", '');
    this._util.setAttribute("rigantestools-attackDefenseSlowInfoStartTimeTargetMax", "value", '');
    this._util.setAttribute("rigantestools-attackDefenseSlowInfoStartTimeTargetMin", "value", '');
};

/**
 * set probability of the war in progress
 * 
 * @this {MainFrame}
 * @param {Array}
 *            habitatTransits
 */
com.rigantestools.MainFrame.addProability = function(habitatTransits) {
    var lasthab = null;
    var diff = 0;
    var minutes = 0;
    var nbhabitate = habitatTransits.length;
    var indexToSet = 0;
    var nbProb = 0;
    for(var indexHabTrans=0; indexHabTrans<nbhabitate; indexHabTrans++){
        var currenthab = habitatTransits[indexHabTrans];
        if(lasthab!==null) {
            diff = currenthab.date.getTime()-lasthab.date.getTime();
            if(diff<600000) {
                minutes += diff;
                if(minutes<600000) {
                    if(indexToSet<0) {
                        indexToSet = indexHabTrans-1;
                    }
                }
                else {
                    var value = (indexHabTrans-indexToSet)*(indexHabTrans-indexToSet);
                    nbProb += value;
                    for(var i=indexToSet; i < indexHabTrans; i++) {
                        habitatTransits[i].luck =value;
                    }
                    indexToSet = indexHabTrans;
                    minutes -= 600000;
                }
            }
            else {
                var value = (indexHabTrans-indexToSet)*(indexHabTrans-indexToSet);
                nbProb += value;
                for(var i=indexToSet; i < indexHabTrans; i++) {
                    habitatTransits[i].luck = value;
                }
                minutes = 0;
                indexToSet = indexHabTrans;
            }
        }
        lasthab = currenthab;
    }
    var value = (nbhabitate-indexToSet)*(nbhabitate-indexToSet);
    nbProb += value;
    for(var i=indexToSet; i < nbhabitate; i++) {
        habitatTransits[i].luck = value;
    }
    for(var i=0; i < nbhabitate; i++) {
        habitatTransits[i].luck = habitatTransits[i].luck*100/nbProb;
    }
    
};

/**
 * call on go to DL button clicked
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onGoToDLButtonClick = function(evt) {
	var link = "";
	var date = new Date();
	var index = this._util.getAttribute('rigantestools-warinprogress-tabbox', 'selectedIndex');
	if (index < this._AttackList.length) {
		link = this._AttackList[index].habitat_link;
		date = this._AttackList[index].trou;
	}
	this._util.setAttribute('rigantestools-attackDefenseSlowTargetLink', 'value', link);
	this._util.setAttribute('rigantestools-attackDefenseSlowTime', 'value', this._util.formatTime(date));
	var datePicker = document.getElementById('rigantestools-attackDefenseSlowDate');
	if (datePicker) {
	    datePicker._setValueNoSync(date);
	}
	this._util.setAttribute('rigantestools-tabbox', 'selectedIndex', 4);
}

/**
 * initialize window war in progess informations
 * 
 * @this {MainFrame}
 * @return {Boolean} true if successful
 */
com.rigantestools.MainFrame.initializeWarInProgressInformation = function() {
    try {
        var tabbox = document.getElementById("rigantestools-warinprogress-tabbox");
        while (tabbox.hasChildNodes()) {
            tabbox.removeChild(tabbox.firstChild);
        }
        // generate arrowscrollbox element
        var arrowscrollbox = this._util.JSONToDOM([ "xul:arrowscrollbox", { orient : "horizontal" }], document, {});
        // generate tabs element
        var tabs = this._util.JSONToDOM([ "xul:tabs", {}], document, {});
        // generate tabpanels element
        var tabpanels = this._util.JSONToDOM([ "xul:tabpanels", { flex : 1 }], document, {});
        
        var colsAttacks = [this._util.getBundleString("mainframe.warinprogress.castle"), "2", this._util.getBundleString("mainframe.warinprogress.player"), "3", this._util.getBundleString("mainframe.warinprogress.date"), "2"];
        var colsDefense = [this._util.getBundleString("mainframe.defenseinprogress.date"), "3", this._util.getBundleString("mainframe.defenseinprogress.totalUnits"), "2", this._util.getBundleString("mainframe.defenseinprogress.newUnits"), "2", this._util.getBundleString("mainframe.defenseinprogress.status"), "1"];
        var colsDefList = [this._util.getBundleString("mainframe.warinprogress.castle"), "3", this._util.getBundleString("mainframe.warinprogress.player"), "2", this._util.getBundleString("mainframe.warinprogress.date"), "2", this._util.getBundleString("mainframe.defenseinprogress.totalUnits"), "1"];
        var nbAttackFound = 0;
        this._generatedAttacks = [];
        this._generatedAttacksSummary = "";
        this._generatedAttacksSummary2OnTarget = "";
        this._generatedAttacksSummary2OnTransit = "";
    	this._AttackList = [] ;
        var that = this;

        // Add attaks to player
        var habitats = this._player.getHabitatList();
        for (var indexHab = 0; indexHab < habitats.length; indexHab++) {
            var habitat = habitats[indexHab];
            var habitatTransits = habitat.getHabitatTransits(com.rigantestools_Constant.TRANSITTYPE.ATTACKER, true);
            this.addProability(habitatTransits);
            var listAttackers = [];
            var listCastlesAttackers = [];
            // var listImpactTimes = [];
            if( (habitatTransits.length>0) || (habitat.getUnitAttackersCount()>0) ) {
                nbAttackFound++;
                // generate tab attacks element
                var tabAttack = this._util.JSONToDOM([ "xul:tab", { label : this._util.maxStringLength(habitat.name,20), style : "color: #FF0055;" }], document, {});
                tabs.appendChild(tabAttack);
                // generate treecols JSON
                var treecolsAttack = [ "xul:treecols", {}];
                for(var indexCol=0; indexCol<colsAttacks.length; indexCol = indexCol+2){
                    treecolsAttack.push([ "xul:treecol", { label :  colsAttacks[indexCol], flex : colsAttacks[indexCol+1], ignoreincolumnpicker : true}]);
                }
                // generate treechildren JSON
                var minDate = null;
                var maxDate = null;
                // var probableDate = null ;
                var treechildrenAttack = [ "xul:treechildren", {}];
                for(var indexHabTrans =0; indexHabTrans<habitatTransits.length; indexHabTrans++){
                    var found = false;
                    for(var indexlistAttackers=0;indexlistAttackers<listAttackers.length; indexlistAttackers++) {
                        var item = listAttackers[indexlistAttackers];
                        if(item.link===habitatTransits[indexHabTrans].sourceHabitatPlayerLink) {
                            found = true;
                            item.nb = item.nb+1 ;
                            break;
                        }
                    }
                    if(!found){
                        var item = {'name':habitatTransits[indexHabTrans].sourceHabitatPlayerName,'link':habitatTransits[indexHabTrans].sourceHabitatPlayerLink,'nb':1};
                        listAttackers.push(item);
                    }
                    found = false;
                    for(var indexlistCastlesAttackers=0;indexlistCastlesAttackers<listCastlesAttackers.length; indexlistCastlesAttackers++) {
                        var item = listCastlesAttackers[indexlistCastlesAttackers];
                        if(item.link===habitatTransits[indexHabTrans].sourceHabitatLink) {
                            found = true;
                            break;
                        }
                    }
                    if(!found){
                        var item = {'name':habitatTransits[indexHabTrans].sourceHabitatName,'link':habitatTransits[indexHabTrans].sourceHabitatLink};
                        listCastlesAttackers.push(item);
                    }
                    if(minDate===null || minDate>habitatTransits[indexHabTrans].date) {
                        minDate = habitatTransits[indexHabTrans].date;
                    }
                    if(maxDate===null || maxDate<habitatTransits[indexHabTrans].date) {
                        maxDate = habitatTransits[indexHabTrans].date;
                    }
                    
                    // TODO test to determine the date of the impact "likely"
                    // found=false ;
                    // for(var i=0; i<listImpactTimes.length; ++i ) {
                    // var item = listImpactTimes[i] ;
                    // if( item.date == habitatTransits[indexHabTrans].date ) {
                    // item.n = item.n+1 ;
                    // found = true ;
                    // }
                    // }
                    // if(!found) {
                     // var item =
                    // {'date':habitatTransits[indexHabTrans].date,'n':1};
                       // listImpactTimes.push(item);
                       // }
                    
                    
                    var properties = '';
                    if(indexHabTrans%2) {
                        properties = 'inGrey';
                    }
                    // add treeitem JSON
                    treechildrenAttack.push(
                        [ "xul:treeitem", {}, 
                           [ "xul:treerow", { properties : properties}, 
                             [ "xul:treecell", { label : habitatTransits[indexHabTrans].sourceHabitatName}],
                             [ "xul:treecell", { label : habitatTransits[indexHabTrans].sourceHabitatPlayerName}],
                             [ "xul:treecell", { label : this._util.formatDayTime(habitatTransits[indexHabTrans].date,true)}]
                           ]
                        ]
                    );
                }

 				var battleDate ;
 				if( habitat.nextBattleDate !==null ) battleDate = habitat.nextBattleDate ;
 				else battleDate = new Date ( minDate.getTime() + 600 * 1000 ) ; // minDate = impact time, thus add 10'
         		
         		var defense = new com.rigantestools_CurrentSlowDefenseCalculate( habitat, battleDate );

				// This is used in onGoToDLButtonClick to put informations in the SlowDefense tab
				var item = {'habitat_link':habitat.link,'trou':defense.trou};
				this._AttackList.push(item);

                // generate treecolsSlowDefense JSON
                var treecolsSlowDefense = [ "xul:treecols", {}];
                for(var indexCol=0; indexCol<colsDefense.length; indexCol = indexCol+2){
                    treecolsSlowDefense.push([ "xul:treecol", { label :  colsDefense[indexCol], flex : colsDefense[indexCol+1], ignoreincolumnpicker : true}]);
                }
               // generate treecolsDefList JSON
                var treecolsDefList = [ "xul:treecols", {}];
                for(var indexCol=0; indexCol<colsDefList.length; indexCol = indexCol+2){
                    treecolsDefList.push([ "xul:treecol", { label :  colsDefList[indexCol], flex : colsDefList[indexCol+1], ignoreincolumnpicker : true}]);
                }
                // generate treechildren JSON
                var treechildrenSlowDefense = [ "xul:treechildren", {}];
                var treechildrenDefList = [ "xul:treechildren", {}];
                if(defense) {
                    var bufferRound = defense.fightPreview.bufferRound;
                    for(var indexBuffer =0; indexBuffer<bufferRound.length; indexBuffer++){
                        var properties = '';
                        if(indexBuffer%2) {
                            properties = 'inGrey';
                        }
                        if(bufferRound[indexBuffer].issue) {
                            properties = 'inRed';
                        }
                        // add treeitem JSON
                        treechildrenSlowDefense.push(
                            [ "xul:treeitem", {}, 
                               [ "xul:treerow", { properties : properties}, 
                                 [ "xul:treecell", { label : this._util.formatTime(bufferRound[indexBuffer].date)}],
                                 [ "xul:treecell", { label : bufferRound[indexBuffer].unitCount}],
                                 [ "xul:treecell", { label : bufferRound[indexBuffer].newUnitCount}],
                                 [ "xul:treecell", { label : (bufferRound[indexBuffer].issue?this._util.getBundleString(""):"Ok")}]
                               ]
                            ]
                        );
                    }
 
 
                    
                   var deflist = defense.defense_list ;
                   for(var indexBuffer =0; indexBuffer<deflist.length; indexBuffer++){
                        var properties = '';
                        if(indexBuffer%2) {
                            properties = 'inGrey';
                        }
 
                        // add treeitem JSON
                        var datestring ;
                        if( deflist[indexBuffer].date !== null ) datestring = this._util.formatDayTime(deflist[indexBuffer].date,true) ;
                        else datestring = "" ;
                        treechildrenDefList.push(
                            [ "xul:treeitem", {}, 
                               [ "xul:treerow", { properties : properties}, 
                                 [ "xul:treecell", { label : deflist[indexBuffer].castle}],
                                 [ "xul:treecell", { label : deflist[indexBuffer].player}],
                                 [ "xul:treecell", { label : datestring}],
                                 [ "xul:treecell", { label : deflist[indexBuffer].nbud}]
                               ]
                            ]
                        );
                    }
                    
                }

                // TODO test to determine the date of the impact "likely"
                // if( minDate!==null && minDate !=maxDate ) {
                // listImpactTimes.sort(function(a, b) {
                // return a.date.getTime() - b.date.getTime();
                   // });
                   //    
                   //    
                   // for(var i=0; i<listImpactTimes.length; ++i ) {
                   // if( listImpactTimes[0].n > 1 ) {
                   // probableDate = listImpactTimes[0].date ;
                   // break;
                // }
                // }
                // }
                    
                 // Add attackers on target
                for(var i =0; i<habitat.listAttackersOnTarget.length; i++){
                    var found = false;
                    for(var indexlistAttackers=0;indexlistAttackers<listAttackers.length; indexlistAttackers++) {
                        var item = listAttackers[indexlistAttackers];
                        if(item.link===habitat.listAttackersOnTarget[i].link) {
                            found = true;
                            item.nb = habitat.listAttackersOnTarget[i].nb+item.nb ;
                            break;
                        }
                    }
                    if(!found){
                        var item = {'name':habitat.listAttackersOnTarget[i].name,'link':habitat.listAttackersOnTarget[i].link,'nb':habitat.listAttackersOnTarget[i].nb};
                        listAttackers.push(item);
                    }
                }
 

 
                 var nbS1 = Math.round( habitat.getUnitCount(com.rigantestools_Constant.UNITTYPE.SPEARMAN,true) + habitat.getUnitCount(com.rigantestools_Constant.UNITTYPE.SWORDMAN,true)/2 ) ;
                 var nbC1 = Math.round( habitat.getUnitCount(com.rigantestools_Constant.UNITTYPE.CROSSBOWMAN,true) + habitat.getUnitCount(com.rigantestools_Constant.UNITTYPE.ARCHER,true)/3 ) ;
                 var nbCL1 = Math.round( habitat.getUnitCount(com.rigantestools_Constant.UNITTYPE.SCORPIONRIDER,true) + habitat.getUnitCount(com.rigantestools_Constant.UNITTYPE.LANCER,true)/3 ) ;
                     
               
                var totalUD = (nbS1+nbC1+nbCL1) ;
                var totalUDDet = " ("+nbS1+"/"+nbC1+"/"+nbCL1+")";
                var habitatTransitsDefense = habitat.getHabitatTransits(com.rigantestools_Constant.TRANSITTYPE.DEFENSE,true);
                var nbS =0;
                var nbC=0;
                var nbCL=0;
                for(var key in habitatTransitsDefense) {
                    if (habitatTransitsDefense.hasOwnProperty(key)) {
                        nbS += Math.round(habitatTransitsDefense[key].getUnitCount(com.rigantestools_Constant.UNITTYPE.SPEARMAN) + habitatTransitsDefense[key].getUnitCount(com.rigantestools_Constant.UNITTYPE.SWORDMAN)/2) ;
                        nbC += Math.round(habitatTransitsDefense[key].getUnitCount(com.rigantestools_Constant.UNITTYPE.CROSSBOWMAN) + habitatTransitsDefense[key].getUnitCount(com.rigantestools_Constant.UNITTYPE.ARCHER)/3) ;
                        nbCL += Math.round(habitatTransitsDefense[key].getUnitCount(com.rigantestools_Constant.UNITTYPE.SCORPIONRIDER) + habitatTransitsDefense[key].getUnitCount(com.rigantestools_Constant.UNITTYPE.LANCER)/3) ;
                    }
                }
                var totalUDInProgress = (nbS+nbC+nbCL);
                var totalUDInProgressDet = " ("+nbS+"/"+nbC+"/"+nbCL+")";
                
                var xx1 = Math.round(habitat.getUnitAttackersCount(com.rigantestools_Constant.UNITTYPE.SWORDMAN) + habitat.getUnitAttackersCount(com.rigantestools_Constant.UNITTYPE.SPEARMAN)/5) ;
                var xx2 = Math.round(habitat.getUnitAttackersCount(com.rigantestools_Constant.UNITTYPE.ARCHER) + habitat.getUnitAttackersCount(com.rigantestools_Constant.UNITTYPE.CROSSBOWMAN)/2) ;
                var xx3 = Math.round(habitat.getUnitAttackersCount(com.rigantestools_Constant.UNITTYPE.LANCER) + habitat.getUnitAttackersCount(com.rigantestools_Constant.UNITTYPE.SCORPIONRIDER)/3) ;
                var totalUO = xx1+xx2+xx3 ;
                var totalUODet = " ("+xx1+"/"+xx2+"/"+xx3+")";

                // generate tabpanel element
                var tabpanel = this._util.JSONToDOM([ "xul:tabpanel", { orient : "vertical"} ,
                  [ "xul:hbox", { flex : 1 },
                    [ "xul:vbox", { flex : 1 }, 
                      [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.attackInformation")}],
                      [ "xul:tree", { flex : 1, hidecolumnpicker : true}, treecolsAttack, treechildrenAttack]
                    ],
                    [ "xul:spacer", { style : "width: 10px"}],
                    [ "xul:vbox", { flex : 1 },
                      [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.fightInformation")}],
                      [ "xul:tree", { flex : 1, hidecolumnpicker : true}, treecolsSlowDefense, treechildrenSlowDefense],
                      [ "xul:button", { label : "Go to DL", oncommand : function(evt) { that.onGoToDLButtonClick(evt);} }]
                   ],
                    [ "xul:spacer", { style : "width: 10px"}],
                    [ "xul:vbox", { flex : 1 },
                      [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.defenseInformation")}],
                      [ "xul:tree", { flex : 1, hidecolumnpicker : true}, treecolsDefList, treechildrenDefList]
                    ]
                  ],
                  [ "xul:spacer", { style : "height: 10px"}],
                  [ "xul:groupbox", { orient : "horizontal"}, 
                    [ "xul:caption", { label : "Informations" }],
                    [ "xul:vbox", {}, 
                        [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.castleTarget")}],
                        [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.nbUD")}],
                        [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.nbUDInProgress")}],
                        [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.nbUOAttackers")}]
                    ],
                    [ "xul:vbox", {}, 
                      [ "xul:label", { value : habitat.link}],
                      [ "xul:label", { value : totalUD + totalUDDet}],
                      [ "xul:label", { value : totalUDInProgress + totalUDInProgressDet}],
                      [ "xul:label", { value : totalUO + totalUODet}]
                    ],
                    [ "xul:spacer", { flex : 1 }],
                    [ "xul:vbox", {}, 
                      [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.nbPlayerAttackers")}],
                      [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.nbCastlesAttackers")}],
                      [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.firstDate")}],
                      [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.lastDate")}],
                      [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.maxdefensetime")}]
                    ],
                    [ "xul:vbox", {}, 
                      [ "xul:label", { value : listAttackers.length}],
                      [ "xul:label", { value : listCastlesAttackers.length}],
                      [ "xul:label", { value : this._util.formatDateTime(minDate)}],
                      [ "xul:label", { value : this._util.formatDateTime(maxDate)}],
                      [ "xul:label", { value : this._util.secToTimeStr(defense.maxDefenseTime)}]
                    ],
                    [ "xul:spacer", { flex : 1 }]
                  ]
                ], document, {});
                tabpanels.appendChild(tabpanel);
                
                // We generate the informations attack and the summary
                var message = "➡" + this._util.getBundleString("mainframe.warinprogress.castleTarget")+habitat.name+"\n"+habitat.link;
                message += "\n\n🚧" + this._util.getBundleString("mainframe.warinprogress.nbUD") + " " + totalUD + totalUDDet;
                message += "\n🚧" + this._util.getBundleString("mainframe.warinprogress.nbUDInProgress") + " " + totalUDInProgress + totalUDInProgressDet;
                if(totalUO>0) {
                    message += "\n👊" + this._util.getBundleString("mainframe.warinprogress.nbUOAttackers") + " " + totalUO + totalUODet;
                }
                if(minDate!==null) {
                    message += "\n\n📅" + this._util.getBundleString("mainframe.warinprogress.date") + " :";
                    message += "\n" + this._util.getBundleString("mainframe.warinprogress.firstUnit") + " " + this._util.formatDateTime(minDate);
                    if(maxDate!==null) {
                        message += "\n" + this._util.getBundleString("mainframe.warinprogress.lastUnit") + " " + this._util.formatDateTime(maxDate);
                    }
                }
                if(defense){
                    message += "\n" + this._util.getBundleString("mainframe.defenseinprogress.maxdefensetime") + " :" + this._util.secToTimeStr(defense.maxDefenseTime, true);
                }
                if(listAttackers.length>0) {
                    var playerAttackersMes = "\n👊" + this._util.getBundleString("mainframe.warinprogress.attackOf").replace("%NB%",listAttackers.length);
                    for(var indexPlayer =0; indexPlayer<listAttackers.length; indexPlayer++){
                        playerAttackersMes += "\n" + listAttackers[indexPlayer].link + " " + listAttackers[indexPlayer].name;
                    }
                    message += "\n" + playerAttackersMes;
                }
                if(listCastlesAttackers.length>0) {
                    message += "\n\n🏰" + this._util.getBundleString("mainframe.warinprogress.attackOfCastles").replace("%NB%",listCastlesAttackers.length);
                    for(var indexCastles =0; indexCastles<listCastlesAttackers.length; indexCastles++){
                        message += "\n" + listCastlesAttackers[indexCastles].link + " " + listCastlesAttackers[indexCastles].name;
                    }
                }
                this._generatedAttacks.push(message);
 
                  listAttackers.sort(function(a, b) {
                    return b.nb - a.nb;
                });
              
                // generate summary

                if( this._generatedAttacksSummary.length==0 ) {
                    this._generatedAttacksSummary += this._util.getBundleString("mainframe.warinprogress.LabelSummaryDetails") + "\n\n" ;
                }

                this._generatedAttacksSummary += this._util.getBundleString("mainframe.warinprogress.AttacksSummaryLink").replace("%LINK%", habitat.link).replace("%NAME%", habitat.name);
                
                if(listAttackers.length>0) {
                    if(listAttackers[0].name) {
                          this._generatedAttacksSummary += " " + listAttackers[0].link + " " + listAttackers[0].name ;                    
                           if(listAttackers.length>1) {
                               this._generatedAttacksSummary += " + " + this._util.getBundleString("mainframe.warinprogress.AttacksSummaryOtherPlayers").replace("%NBPLAYERS%", (listAttackers.length-1));
                        }
                    }
                    else {
                        this._generatedAttacksSummary += this._util.getBundleString("mainframe.warinprogress.AttacksSummaryAttackOf").replace("%NBPLAYERS%", listAttackers.length);
                    }
                    this._generatedAttacksSummary += "\n" ;
                  }
                else {
                       // This code is normally never reached, since list of
                    // attackers shouldn't be empty
                    this._generatedAttacksSummary += this._util.getBundleString("mainframe.warinprogress.AttacksSummaryFight");
                }
 
 

                   if( habitat.nextBattleDate !==null ) {
                    this._generatedAttacksSummary += this._util.getBundleString("mainframe.warinprogress.AttacksSummaryIconeDate") ;
                    this._generatedAttacksSummary += " " + this._util.getBundleString("mainframe.warinprogress.AttacksSummaryNextRound") + " " + this._util.formatDayTime(habitat.nextBattleDate) + "\n" ;
                 }
                   
                   if( (minDate!==null) ) { // incoming attacks
                       this._generatedAttacksSummary += this._util.getBundleString("mainframe.warinprogress.AttacksSummaryIconeDate") ;
                      this._generatedAttacksSummary += " " + this._util.getBundleString("mainframe.warinprogress.AttacksSummaryCastles").replace("%NBCASTLES%", listCastlesAttackers.length);
                    if( minDate===maxDate ) {
                           this._generatedAttacksSummary += " " + this._util.getBundleString("mainframe.warinprogress.AttacksSummaryDateOne").replace("%FISRTDATE%", this._util.formatDayTime(minDate));
                    }
                    else {
                           this._generatedAttacksSummary += " " + this._util.getBundleString("mainframe.warinprogress.AttacksSummaryDate").replace("%FISRTDATE%", this._util.formatDayTime(minDate)).replace("%LASTDATE%", this._util.formatDayTime(maxDate));
                        // if( probableDate !==null) {
                        // this._generatedAttacksSummary += " (Probable: " +
                        // probableDate + ")" ;
                        // }
                    }
                    this._generatedAttacksSummary += "\n" ; 
                }
                
                
                this._generatedAttacksSummary += this._util.getBundleString("mainframe.warinprogress.AttacksSummaryUD").replace("%NBUDTOTAL%", totalUD+totalUDInProgress).replace("%NBUD%", totalUD).replace("%NBUDPROGRESS%", totalUDInProgress);
                if(totalUO>0) {
                    this._generatedAttacksSummary += this._util.getBundleString("mainframe.warinprogress.AttacksSummaryUO").replace("%NBUO%", totalUO) + " " + totalUODet + "\n";
                }
                if(defense){
                    this._generatedAttacksSummary += this._util.getBundleString("mainframe.defenseinprogress.maxdefensetime") + " :" + this._util.secToTimeStr(defense.maxDefenseTime, true) + "\n";
                }
                this._generatedAttacksSummary += "\n";

                 if( habitat.nextBattleDate !==null )
                {
                    if( this._generatedAttacksSummary2OnTarget.length==0 ) {
                        this._generatedAttacksSummary2OnTarget += this._util.getBundleString("mainframe.warinprogress.LabelSummaryFight") + "\n" ;
                    }
                    this._generatedAttacksSummary2OnTarget += habitat.link ;
                    this._generatedAttacksSummary2OnTarget += ", " + totalUO + " UO" ;
                     this._generatedAttacksSummary2OnTarget += ", " + (totalUD+totalUDInProgress) + " UD" ;
                       this._generatedAttacksSummary2OnTarget += ", " + this._util.formatDayTime(habitat.nextBattleDate) ;
                       this._generatedAttacksSummary2OnTarget += "\n" ;
                   }
                   else
                   {
                       if( this._generatedAttacksSummary2OnTransit.length==0 ) {
                           this._generatedAttacksSummary2OnTransit += this._util.getBundleString("mainframe.warinprogress.LabelSummaryProgress") + "\n" ;
                    }
                    this._generatedAttacksSummary2OnTransit += habitat.link ;
                    this._generatedAttacksSummary2OnTransit += ", " + this._util.formatDayTime(minDate) ;
                     this._generatedAttacksSummary2OnTransit += ", " + listCastlesAttackers.length + " ch" ;
                     this._generatedAttacksSummary2OnTransit += ", " + (totalUD+totalUDInProgress) + " UD" ;
                       this._generatedAttacksSummary2OnTransit += "\n" ;
                }                     
                    
            }
        }
        // add player attaks
        var habitats = this._player.getHabitatList();
        var habitatTransitsList = [];
        for (var indexHab = 0; indexHab < habitats.length; indexHab++) {
            var habitatTransits = habitats[indexHab].getHabitatTransits(com.rigantestools_Constant.TRANSITTYPE.ATTACKER,false);
            for(var index=0; index<habitatTransits.length; index++) {
                if(habitatTransitsList[habitatTransits[index].destinationHabitatName]===undefined){
                    habitatTransitsList[habitatTransits[index].destinationHabitatName] = [];
                }
                habitatTransitsList[habitatTransits[index].destinationHabitatName].push(habitatTransits[index]);
            }
        }
        var cols = [this._util.getBundleString("mainframe.warinprogress.castle"),"2",this._util.getBundleString("mainframe.warinprogress.PA"),"1",this._util.getBundleString("mainframe.warinprogress.Swordman"),"1",this._util.getBundleString("mainframe.warinprogress.Archer"),"1",this._util.getBundleString("mainframe.warinprogress.Lancer"),"1",this._util.getBundleString("mainframe.warinprogress.date"),"2"];
        for(var key in habitatTransitsList) {
            if (habitatTransitsList.hasOwnProperty(key)) {
                nbAttackFound++;
                // generate tab element
                var tab = this._util.JSONToDOM([ "xul:tab", { label : this._util.maxStringLength(key,20), style : "color: #33CC99;" }], document, {});
                tabs.appendChild(tab);
                 // generate treecols JSON
                var treecols = [ "xul:treecols", {}];
                for(var indexCol=0; indexCol<cols.length; indexCol = indexCol+2){
                    treecols.push([ "xul:treecol", { label :  cols[indexCol], flex : cols[indexCol+1], ignoreincolumnpicker : true}]);
                }
                // generate treechildren JSON
                var minDate = -1;
                var maxDate = -1;
                var nbPA = 0;
                var nbSwordman = 0;
                var nbArcher = 0;
                var nbLancer = 0;
                var listCastlesAttackers = [];
                // sort array
                var habitatTransits = habitatTransitsList[key];
                habitatTransits.sort(function(a, b) {
                    return a.date.getTime() - b.date.getTime();
                });
                
                var treechildren = [ "xul:treechildren", {}];
                for(var indexHabTrans=0; indexHabTrans<habitatTransits.length; indexHabTrans++){
                    if(listCastlesAttackers.indexOf(habitatTransits[indexHabTrans].sourceHabitatLink)<0){
                        listCastlesAttackers.push(habitatTransits[indexHabTrans].sourceHabitatLink);
                    }
                    if(minDate<0 || minDate>habitatTransits[indexHabTrans].date) {
                        minDate = habitatTransits[indexHabTrans].date;
                    }
                    if(maxDate<0 || maxDate<habitatTransits[indexHabTrans].date) {
                        maxDate = habitatTransits[indexHabTrans].date;
                    }
                    // add PA
                    var pa = habitatTransits[indexHabTrans].getResourceCount(com.rigantestools_Constant.RESOURCETYPE.ARGENT);
                    nbPA += pa;
                    // add unitsCountSwordman
                    var unitsCountSwordman = habitatTransits[indexHabTrans].getUnitCount(com.rigantestools_Constant.UNITTYPE.SWORDMAN);
                    nbSwordman += unitsCountSwordman;
                    // add unitsCountArcher
                    var unitsCountArcher = habitatTransits[indexHabTrans].getUnitCount(com.rigantestools_Constant.UNITTYPE.ARCHER);
                    nbArcher += unitsCountArcher;
                    // add unitsCountSwordman
                    var unitsCountLancer = habitatTransits[indexHabTrans].getUnitCount(com.rigantestools_Constant.UNITTYPE.LANCER);
                    nbLancer += unitsCountLancer;
                                        
                    var properties = '';
                    if(indexHabTrans%2) {
                        properties = 'inGrey';
                    }
                    // add treeitem JSON
                    treechildren.push(
                        [ "xul:treeitem", {}, 
                           [ "xul:treerow", { properties : properties}, 
                             [ "xul:treecell", { label : habitatTransits[indexHabTrans].sourceHabitatName}],
                             [ "xul:treecell", { label : pa}],
                             [ "xul:treecell", { label : unitsCountSwordman}],
                             [ "xul:treecell", { label : unitsCountArcher}],
                             [ "xul:treecell", { label : unitsCountLancer}],
                             [ "xul:treecell", { label : this._util.formatDateTime(habitatTransits[indexHabTrans].date)}]
                           ]
                        ]
                    );
                }
                // generate tabpanel element
                var tabpanel = this._util.JSONToDOM([ "xul:tabpanel", { orient : "vertical"} ,
                  [ "xul:tree", { flex : 1, hidecolumnpicker : true}, treecols, treechildren],
                  [ "xul:spacer", { style : "height: 10px"}],
                  [ "xul:groupbox", { orient : "horizontal"}, 
                    [ "xul:caption", { label : "Informations" }],
                    [ "xul:vbox", {}, 
                        [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.castleTarget")}],
                        [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.nbUO")}],
                        [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.PA")}]
                    ],
                    [ "xul:vbox", {}, 
                      [ "xul:label", { value : habitatTransits[0].destinationHabitatLink}],
                      [ "xul:label", { value : (nbSwordman+nbArcher+nbLancer)+" ("+nbSwordman+"/"+nbArcher+"/"+nbLancer+")"}],
                      [ "xul:label", { value : nbPA}]
                    ],
                    [ "xul:spacer", { flex : 1 }],
                    [ "xul:vbox", {}, 
                      [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.nbCastlesAttackers")}],
                      [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.firstDate")}],
                      [ "xul:label", { value : this._util.getBundleString("mainframe.warinprogress.lastDate")}]
                    ],
                    [ "xul:vbox", {}, 
                      [ "xul:label", { value : listCastlesAttackers.length}],
                      [ "xul:label", { value : this._util.formatDateTime(minDate)}],
                      [ "xul:label", { value : this._util.formatDateTime(maxDate)}]
                    ],
                    [ "xul:spacer", { flex : 1 }]
                  ]
                ], document, {});
                tabpanels.appendChild(tabpanel);
                // We generate the informations attack
                var message = "👊" + this._util.getBundleString("mainframe.warinprogress.castleTarget") + " " + key+"\n"+habitatTransits[0].destinationHabitatLink;
                message += "\n\n" + this._util.getBundleString("mainframe.warinprogress.attackFrom").replace("%NB%",listCastlesAttackers.length).replace("%PA%",nbPA);
                message += "\n" + this._util.getBundleString("mainframe.warinprogress.nbUOSend").replace("%NB%",habitatTransits.length) + " " + (nbSwordman+nbArcher+nbLancer)+" ("+nbSwordman+"/"+nbArcher+"/"+nbLancer+")";
                message += "\n\n📅" + this._util.getBundleString("mainframe.warinprogress.date");
                if(minDate>0) {
                    message += "\n" + this._util.getBundleString("mainframe.warinprogress.firstUnit") + " " + this._util.formatDateTime(minDate);
                }
                if(maxDate>0) {
                    message += "\n" + this._util.getBundleString("mainframe.warinprogress.lastUnit") + " " + this._util.formatDateTime(maxDate);
                }
                this._generatedAttacks.push(message);
            }
        }
        
        this._util.setAttribute('rigantestools-tabWarInProgress','label',this._util.getBundleString('mainframe.warinprogress.tabtitle').replace("%NB%",nbAttackFound));
        if(nbAttackFound>0) {
            this._util.setVisibility('rigantestools-warinprogressActionBar',"visible");
            this._util.setVisibility('rigantestools-warinprogressNoWarInProgress',"collapse");
            arrowscrollbox.appendChild(tabs);
            tabbox.appendChild(arrowscrollbox);
            tabbox.appendChild(tabpanels);
        }
        else {
            this._util.setVisibility('rigantestools-warinprogressNoWarInProgress',"visible");
            this._util.setVisibility('rigantestools-warinprogressActionBar',"collapse");
        }
    }catch(e) {
        this._logger.error("initializeWarInProgressInformation", e);
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.data.not.found"));  
    }
};

/**
 * initialize window player informations
 * 
 * @this {MainFrame}
 * @return {Boolean} true if successful
 */
com.rigantestools.MainFrame.initializePlayerInformation = function() {
    try {
        if (this._player === null) {
            return;
        }
        var cols = [this._util.getBundleString("mainframe.player.castle"),"2",this._util.getBundleString("mainframe.player.PA"),"1",this._util.getBundleString("mainframe.player.nbUO"),"2",this._util.getBundleString("mainframe.player.nbUD"),"2"];
        this.currentHabitats = [];
        this._currentHabitatsColumnTreeSort = [];
        
        var tabbox = document.getElementById("rigantestools-playerCastles-tabbox");
        while (tabbox.hasChildNodes()) {
            tabbox.removeChild(tabbox.firstChild);
        }
        // generate arrowscrollbox element
        var arrowscrollbox = this._util.JSONToDOM([ "xul:arrowscrollbox", { orient : 'horizontal' }], document, {});
        // generate tabs element
        var tabs = this._util.JSONToDOM([ "xul:tabs", {}], document, {});
        arrowscrollbox.appendChild(tabs);
        tabbox.appendChild(arrowscrollbox);
        // generate tabpanels element
        var tabpanels = this._util.JSONToDOM([ "xul:tabpanels", { flex : 1 }], document, {});
        tabbox.appendChild(tabpanels);

        // create tabs
        var area = this._util.getPref(com.rigantestools_Constant.PREF_CASTLES_AREA);
        var provArea = [];
        if(area!=="" && area !== null) {
            provArea = area.split('#');
        }
        for (var indexProv = 0; indexProv < provArea.length+2; indexProv++) {
            this.currentHabitats.push([]);
            this._currentHabitatsColumnTreeSort.push(null);
            // generate label tab
            var label = '';
            if(indexProv===0) {
                label = this._util.getBundleString("mainframe.player.castleAll");
            }
            else if(indexProv>provArea.length) {
                label = this._util.getBundleString("mainframe.player.castleOther");
            }
            else {
                var province = provArea[indexProv-1].split('§');
                label = province[0];
            }
            // generate tab element
            var tab = this._util.JSONToDOM([ "xul:tab", { label : label}], document, {});
            tabs.appendChild(tab);
            
            // generate treecols
            var treecols = ["xul:treecols", {}];
            for(var indexCol=0; indexCol<cols.length; indexCol = indexCol+2){
                var that = this;
                treecols.push([ "xul:treecol" , { 'label' : cols[indexCol], 'flex' : cols[indexCol+1], 'name' : (indexCol/2), 'ignoreincolumnpicker' : true, 'persist' : 'width ordinal', 'class' : 'sortDirectionIndicator', 'sortDirection' : 'natural', 'indexProv' : indexProv, 'click' : function (evt) { 
                    that.sortcolumnPlayerTree(evt.target.getAttribute("indexProv"), evt.target); 
                }}]);
            }
             // generate tabpanel element
            var tabpanel = this._util.JSONToDOM(
                [ "xul:tabpanel", { orient : "vertical"}, 
                  [ "xul:tree", { flex : 1, hidecolumnpicker : true}, 
                     treecols, 
                     [ "xul:treechildren", { id : "rigantestools-player-tree" + indexProv}]
                  ], 
                  [ "xul:hbox", {}, 
                    [ "xul:label", { value : this._util.getBundleString("mainframe.player.nbCastles") + " :"}],
                    [ "xul:label", { id : "rigantestools-player-nbCasltes" + indexProv}], [ "xul:spacer", { flex : 1}],
                    [ "xul:label", { value : this._util.getBundleString("mainframe.player.totalCaption") + " :"}],
                    [ "xul:label", { id : "rigantestools-player-nbCaption" + indexProv}], [ "xul:spacer", { flex : 1}],
                    [ "xul:label", { value : this._util.getBundleString("mainframe.player.nbUO") + " :"}],
                    [ "xul:label", { id : "rigantestools-player-nbUO" + indexProv}], [ "xul:spacer", { flex : 1}],
                    [ "xul:label", { value : this._util.getBundleString("mainframe.player.nbUD") + " :"}],
                    [ "xul:label", { id : "rigantestools-player-nbUD" + indexProv}], [ "xul:spacer", { flex : 1}]
                  ]
               ], document, {});
            tabpanels.appendChild(tabpanel);
        }
        this._util.setAttribute('rigantestools-playerCastles-tabbox', 'selectedIndex', 0);
        
        var habitats = this._player.getHabitatList();
        for (var indexHab = 0; indexHab < habitats.length; indexHab++) {
            var habitat = habitats[indexHab];
            var paCount = habitat.getResourceCount(com.rigantestools_Constant.RESOURCETYPE.ARGENT);
            var swordmanCount = habitat.getUnitCount(com.rigantestools_Constant.UNITTYPE.SWORDMAN);
            var archerCount = habitat.getUnitCount(com.rigantestools_Constant.UNITTYPE.ARCHER);
            var lancerCount = habitat.getUnitCount(com.rigantestools_Constant.UNITTYPE.LANCER);
            var spearmanCount = habitat.getUnitCount(com.rigantestools_Constant.UNITTYPE.SPEARMAN);
            var crossbowmanCount = habitat.getUnitCount(com.rigantestools_Constant.UNITTYPE.CROSSBOWMAN);
            var scorpionRiderCount = habitat.getUnitCount(com.rigantestools_Constant.UNITTYPE.SCORPIONRIDER);
            var nbUO = swordmanCount + archerCount + lancerCount;
            var nbUD = spearmanCount + crossbowmanCount + scorpionRiderCount;
            var item = {
                'name' : habitat.name,
                'link' : habitat.link,
                'paCount' : paCount,
                'swordmanCount' : swordmanCount,
                'archerCount' : archerCount,
                'lancerCount' : lancerCount,
                'spearmanCount' : spearmanCount,
                'crossbowmanCount' : crossbowmanCount,
                'scorpionRiderCount' : scorpionRiderCount,
                'nbUO' : nbUO,
                'nbUD' : nbUD
            };
            this.currentHabitats[0].push(item);
            var inProv = false;
            for (var indexProv = 0; indexProv < provArea.length; indexProv++) {
                var province = provArea[indexProv].split('§');
                var mapX = habitat.getMapXFromLink(province[1]);
                var mapY = habitat.getMapYFromLink(province[1]);
                var distance = province[2];
                if (habitat.getDistanceTo(mapX, mapY) <= distance) {
                    this.currentHabitats[indexProv+1].push(item);
                    inProv = true;
                }
            }
            if(!inProv) {
                this.currentHabitats[provArea.length+1].push(item);
            }
        }
        for (var indexProv = 0; indexProv < provArea.length+2; indexProv++) {
            this.sortcolumnPlayerTree(indexProv, null);
        }
    }
    catch(e) {
        this._logger.error("initializePlayerInformation", e);
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.data.not.found"));
    }
    return true;
};

/**
 * Clear war tree
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.clearWarTree = function() {
    var element = document.getElementById("rigantestools-war-treechildren");
    while (element.hasChildNodes()) {
        element.removeChild(element.firstChild);
    }
};

/**
 * Clear defense tree
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.clearDefenseTree = function() {
    var element = document.getElementById("rigantestools-defense-tree");
    while (element.hasChildNodes()) {
        element.removeChild(element.firstChild);
    }
};

/**
 * Clear attack/defense slow tree
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.clearAttackDefenseSlowTree = function() {
    var element = document.getElementById("rigantestools-attackDefenseSlow-treechildren");
    while (element.hasChildNodes()) {
        element.removeChild(element.firstChild);
    }
};

/**
 * Clear simulation rounds tree
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.clearSimulationRoundsTree = function() {
    var element = document.getElementById("rigantestools-simulation-rounds-treechildren");
    while (element.hasChildNodes()) {
        element.removeChild(element.firstChild);
    }
};
/**
 * Clear simulation attacker tree
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.clearSimulationAttackerTree = function() {
    var element = document.getElementById("rigantestools-simulation-attacker-treechildren");
    while (element.hasChildNodes()) {
        element.removeChild(element.firstChild);
    }
};
/**
 * Clear simulation defenser tree
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.clearSimulationDefenserTree = function() {
    var element = document.getElementById("rigantestools-simulation-defenser-treechildren");
    while (element.hasChildNodes()) {
        element.removeChild(element.firstChild);
    }
};
/**
 * add to simulation attacker and defenser tree
 * 
 * @this {MainFrame}
 * @param {Number}
 *            index
 */
com.rigantestools.MainFrame.addToSimulationAttackerTree = function(index) {
    var treeChildrenAttacker = document.getElementById("rigantestools-simulation-attacker-treechildren");
    if(index===undefined) {
        index=-1;
    }
    if(index>=-1 && index<this.currentUnitsSimulation.length-1) {
        var nextLine = this.currentUnitsSimulation[index+1];
        if(index===-1) {
            nextLine = this.currentUnitsSimulation[this.currentUnitsSimulation.length-1];
            index++;
        }
        var line = this.currentUnitsSimulation[index];
        for(var loop=0;loop<3;loop++) {
            var properties = '';
            if(loop===1) {
                properties = 'inGrey';
            }
            var label = '';
            if(loop===0) {
                label = this._util.getBundleString("mainframe.simulation.survivors");
            }
            else if(loop===1) {
                label = this._util.getBundleString("mainframe.simulation.casualties");
            }
            else {
                label = this._util.getBundleString("mainframe.simulation.percasualties");
            }
            // add Spearman
            var valueSpearman = 0;
            if(loop===0) {
                valueSpearman = nextLine.attaqueSpearman;
            }
            else if(loop===1) {
                valueSpearman = line.attaqueSpearman-nextLine.attaqueSpearman;
            }
            else if(line.attaqueSpearman!==0) {
                valueSpearman = ((line.attaqueSpearman-nextLine.attaqueSpearman)/line.attaqueSpearman*100).toFixed(2);
            }
            // add Swordman
            var valueSwordman = 0;
            if(loop===0) {
                valueSwordman = nextLine.attaqueSwordman;
            }
            else if(loop===1) {
                valueSwordman = line.attaqueSwordman-nextLine.attaqueSwordman;
            }
            else if(line.attaqueSwordman!==0) {
                valueSwordman = ((line.attaqueSwordman-nextLine.attaqueSwordman)/line.attaqueSwordman*100).toFixed(2);
            }
            // add Archer
            var valueArcher = 0;
            if(loop===0) {
                valueArcher = nextLine.attaqueArcher;
            }
            else if(loop===1) {
                valueArcher = line.attaqueArcher-nextLine.attaqueArcher;
            }
            else if(line.attaqueArcher!==0) {
                valueArcher = ((line.attaqueArcher-nextLine.attaqueArcher)/line.attaqueArcher*100).toFixed(2);
            }
            // add Crossbowman
            var valueCrossbowman = 0;
            if(loop===0) {
                valueCrossbowman = nextLine.attaqueCrossbowman;
            }
            else if(loop===1) {
                valueCrossbowman = line.attaqueCrossbowman-nextLine.attaqueCrossbowman;
            }
            else if(line.attaqueCrossbowman!==0) {
                valueCrossbowman = ((line.attaqueCrossbowman-nextLine.attaqueCrossbowman)/line.attaqueCrossbowman*100).toFixed(2);
            }
            // add ScorpionRider
            var valueScorpionRider = 0;
            if(loop===0) {
                valueScorpionRider = nextLine.attaqueScorpionRider;
            }
            else if(loop===1) {
                valueScorpionRider = line.attaqueScorpionRider-nextLine.attaqueScorpionRider;
            }
            else if(line.attaqueScorpionRider!==0) {
                valueScorpionRider = ((line.attaqueScorpionRider-nextLine.attaqueScorpionRider)/line.attaqueScorpionRider*100).toFixed(2);
            }
            // add Lancer
            var valueLancer = 0;
            if(loop===0) {
                valueLancer = nextLine.attaqueLancer;
            }
            else if(loop===1) {
                valueLancer = line.attaqueLancer-nextLine.attaqueLancer;
            }
            else if(line.attaqueLancer!==0) {
                valueLancer = ((line.attaqueLancer-nextLine.attaqueLancer)/line.attaqueLancer*100).toFixed(2);
            }
            // generate treeitem element
            var treeitem = this._util.JSONToDOM([ "xul:treeitem", {}, [ "xul:treerow", {
                properties : properties
            }, [ "xul:treecell", {
                label : label
            } ], [ "xul:treecell", {
                label : valueSpearman
            } ], [ "xul:treecell", {
                label : valueSwordman
            } ], [ "xul:treecell", {
                label : valueArcher
            } ], [ "xul:treecell", {
                label : valueCrossbowman
            } ], [ "xul:treecell", {
                label : valueScorpionRider
            } ], [ "xul:treecell", {
                label : valueLancer
            } ] ] ], document, {});
            treeChildrenAttacker.appendChild(treeitem);
        }
    }
};
/**
 * add to simulation Defenser and defenser tree
 * 
 * @this {MainFrame}
 * @param {Number}
 *            index
 */
com.rigantestools.MainFrame.addToSimulationDefenserTree = function(index) {
    var treeChildrenDefenser = document.getElementById("rigantestools-simulation-defenser-treechildren");
    if(index===undefined) {
        index=-1;
    }
    if(index>=-1 && index<this.currentUnitsSimulation.length-1) {
        var nextLine = this.currentUnitsSimulation[index+1];
        if(index===-1) {
            nextLine = this.currentUnitsSimulation[this.currentUnitsSimulation.length-1];
            index++;
        }
        var line = this.currentUnitsSimulation[index];
        for(var loop=0;loop<3;loop++) {
            var properties = '';
            if(loop===1) {
                properties = 'inGrey';
            }
            // add label
            var label = '';        
            if(loop===0) {
                label = this._util.getBundleString("mainframe.simulation.survivors");
            }
            else if(loop===1) {
                label = this._util.getBundleString("mainframe.simulation.casualties");
            }
            else {
                label = this._util.getBundleString("mainframe.simulation.percasualties");
            }
            // add Spearman
            var valueSpearman = 0;
            if(loop===0) {
                valueSpearman = nextLine.defenseSpearman;
            }
            else if(loop===1) {
                valueSpearman = line.defenseSpearman-nextLine.defenseSpearman;
            }
            else if(line.defenseSpearman!==0) {
                valueSpearman = ((line.defenseSpearman-nextLine.defenseSpearman)/line.defenseSpearman*100).toFixed(2);
            }
            // add Swordman
            var valueSwordman = 0;
            if(loop===0) {
                valueSwordman = nextLine.defenseSwordman;
            }
            else if(loop===1) {
                valueSwordman = line.defenseSwordman-nextLine.defenseSwordman;
            }
            else if(line.defenseSwordman!==0) {
                valueSwordman = ((line.defenseSwordman-nextLine.defenseSwordman)/line.defenseSwordman*100).toFixed(2);
            }
            // add Archer
            var valueArcher = 0;
            if(loop===0) {
                valueArcher = nextLine.defenseArcher;
            }
            else if(loop===1) {
                valueArcher = line.defenseArcher-nextLine.defenseArcher;
            }
            else if(line.defenseArcher!==0) {
                valueArcher = ((line.defenseArcher-nextLine.defenseArcher)/line.defenseArcher*100).toFixed(2);
            }
            // add Crossbowman
            var valueCrossbowman = 0;
            if(loop===0) {
                valueCrossbowman = nextLine.defenseCrossbowman;
            }
            else if(loop===1) {
                valueCrossbowman = line.defenseCrossbowman-nextLine.defenseCrossbowman;
            }
            else if(line.defenseCrossbowman!==0) {
                valueCrossbowman = ((line.defenseCrossbowman-nextLine.defenseCrossbowman)/line.defenseCrossbowman*100).toFixed(2);
            }
            // add ScorpionRider
            var valueScorpionRider = 0;
            if(loop===0) {
                valueScorpionRider = nextLine.defenseScorpionRider;
            }
            else if(loop===1) {
                valueScorpionRider = line.defenseScorpionRider-nextLine.defenseScorpionRider;
            }
            else if(line.defenseScorpionRider!==0) {
                valueScorpionRider = ((line.defenseScorpionRider-nextLine.defenseScorpionRider)/line.defenseScorpionRider*100).toFixed(2);
            }
            // add Lancer
            var valueLancer = 0;
            if(loop===0) {
                valueLancer = nextLine.defenseLancer;
            }
            else if(loop===1) {
                valueLancer = line.defenseLancer-nextLine.defenseLancer;
            }
            else if(line.defenseLancer!==0) {
                valueLancer = ((line.defenseLancer-nextLine.defenseLancer)/line.defenseLancer*100).toFixed(2);
            }
            // generate treeitem element
            var treeitem = this._util.JSONToDOM([ "xul:treeitem", {}, [ "xul:treerow", {
                properties : properties
            }, [ "xul:treecell", {
                label : label
            } ], [ "xul:treecell", {
                label : valueSpearman
            } ], [ "xul:treecell", {
                label : valueSwordman
            } ], [ "xul:treecell", {
                label : valueArcher
            } ], [ "xul:treecell", {
                label : valueCrossbowman
            } ], [ "xul:treecell", {
                label : valueScorpionRider
            } ], [ "xul:treecell", {
                label : valueLancer
            } ] ] ], document, {});
            treeChildrenDefenser.appendChild(treeitem);
        }
    }
};
/**
 * add to simulation rounds tree
 * 
 * @this {MainFrame}
 * @param {String}
 *            round
 * @param {String}
 *            off
 * @param {String}
 *            def
 */
com.rigantestools.MainFrame.addToSimulationRoundsTree = function(round, off, def) {
    var treeChildren = document.getElementById("rigantestools-simulation-rounds-treechildren");
    var properties = '';
    if((round+1)%2) {
        properties = 'inGrey';
    }
    // generate treeitem element
    var treeitem = this._util.JSONToDOM([ "xul:treeitem", {}, [ "xul:treerow", {
        properties : properties
    }, [ "xul:treecell", {
        label : round
    } ], [ "xul:treecell", {
        label : off
    } ], [ "xul:treecell", {
        label : def
    } ] ] ], document, {});
    treeChildren.appendChild(treeitem);
};

/**
 * Refresh war tree
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.refreshWarTree = function() {

    this.clearWarTree();

    var date = this.currentDateTime;
    var nbCastlesWar = 0;
    var swordmanCount = 0;
    var archerCount = 0;
    var lancerCount = 0;
    var totalUO = 0;
    var paCount = 0;
    var paCountUD = 0;
    var maxDuration = 0;
    var minDuration = 9999999;

    var treeChildren = document.getElementById("rigantestools-war-treechildren");
    for (var index = 0; index < this.currentHabitatsWar.length; index++) {
        var item = this.currentHabitatsWar[index];
        var weight = this.getUnitWeight(item['selectedUnit']);
        var properties = '';
        if(index%2) {
            properties = 'inGrey';
        }
        // add PA
        var PACount = item['selectedPACount'];
        if (item['selectedPACount']<item['selectedPACountWithUD']) {
            PACount += " (" + item['selectedPACountWithUD'] + ")";
        }
        // add selected unit
        var selectedUnit = '';
        if (item['selectedUnit'] !== '') {
            selectedUnit = this._util.getBundleString("mainframe.war." + item['selectedUnit'].replace(" ", ""));
        }
        // duration
        var duration = '';
        if (item['selectedDuration'] > 0) {
            duration = this._util.secToTimeStr(item['selectedDuration']);
        }
        // startDateTime
        var startDateTime = '';
        if (item['inAreaTime'] === false && item['disableUnit'] === false) {
            startDateTime = this._util.getBundleString("mainframe.war.longest");
        }
        else if (item['disableUnit'] === true) {
            startDateTime = this._util.getBundleString("mainframe.war.diableUnits");
        }
        else {
            startDateTime = this._util.getBundleString("mainframe.war.inAreaTime");
        }
        if (item['selectedDuration'] > 0) {
            var startDate = new Date(date.getTime() - item['selectedDuration'] * 1000);
            startDateTime = this._util.formatDateTime(startDate);
        }
        // update global informations
        if (item['selectedDuration'] > 0) {
            nbCastlesWar++;
            paCount += item['selectedPACount'];
            paCountUD += item['selectedPACountWithUD'];
            if (weight < 3) {
                swordmanCount += item['swordmanCount'];
                totalUO += item['swordmanCount'];
            }
            if (weight < 6) {
                archerCount += item['archerCount'];
                totalUO += item['archerCount'];
            }
            if (weight < 7) {
                lancerCount += item['lancerCount'];
                totalUO += item['lancerCount'];
            }
            if (item['selectedDuration'] < minDuration) {
                minDuration = item['selectedDuration'];
            }
            if (item['selectedDuration'] > maxDuration) {
                maxDuration = item['selectedDuration'];
            }
        }
        // generate treeitem element
        var treeitem = this._util.JSONToDOM([ "xul:treeitem", {}, [ "xul:treerow", {
            properties : properties
        }, [ "xul:treecell", {
            label : item['name']
        } ], [ "xul:treecell", {
            label : PACount
        } ], [ "xul:treecell", {
            label : item['selectedSwordman']
        } ], [ "xul:treecell", {
            label : item['selectedArcher']
        } ], [ "xul:treecell", {
            label : item['selectedLancer']
        } ], [ "xul:treecell", {
            label : item['selectedTotalUO']
        } ], [ "xul:treecell", {
            label : selectedUnit
        } ], [ "xul:treecell", {
            label : duration
        } ], [ "xul:treecell", {
            label : startDateTime
        } ] ] ], document, {});
        treeChildren.appendChild(treeitem);
    }
    // update war informations
    var nbCastles = this._player.getHabitatList().length;
    var targetLink = this._util.getAttribute('rigantestools-warTargetLink', 'value');
    this._generatedWarInformations = this._util.getBundleString("mainframe.war.target") + " : " + targetLink + "##";
    this._generatedWarInformations += this._util.getBundleString("mainframe.war.nbCastles") + " : " + nbCastlesWar + "##";
    this._generatedWarInformations += this._util.getBundleString("mainframe.war.nbUO") + " : " + totalUO + " (" + swordmanCount + "/" + archerCount + "/" + lancerCount + ")##";
    var nbCaption = this.getNbCaption(paCount, nbCastles);
    this._generatedWarInformations += this._util.getBundleString("mainframe.war.totalCaption") + " : " + nbCaption;
    if ((paCount !== paCountUD) && (nbCaption !== this.getNbCaption(paCountUD, nbCastles))) {
        this._generatedWarInformations += " ( " + this.getNbCaption(paCountUD, nbCastles) + " avec UD)";
    }
    this._generatedWarInformations += "##";
    if (minDuration > 0) {
        this._generatedWarInformations += this._util.getBundleString("mainframe.war.min.duration") + " : " + this._util.secToTimeStr(minDuration) + "##";
    }
    if (maxDuration > 0) {
        this._generatedWarInformations += this._util.getBundleString("mainframe.war.max.duration") + " : " + this._util.secToTimeStr(maxDuration);
    }
    this._util.setAttribute('rigantestools-warInfoTarget', 'value', targetLink);
    this._util.setAttribute('rigantestools-warInfoAttackDate', 'value', this._util.formatDateTime(this.currentDateTime));
    this._util.setAttribute('rigantestools-warInfoCastles', 'value', nbCastlesWar);
    if (paCount === paCountUD) {
        this._util.setAttribute('rigantestools-warNbCaptions', 'value', this.getNbCaption(paCount, nbCastles) + " (" + paCount + " PA)");
    }
    else {
        this._util.setAttribute('rigantestools-warNbCaptions', 'value', this.getNbCaption(paCount, nbCastles) + " (" + paCount + " PA)  " + this._util.getBundleString("mainframe.war.withUD") + "  " + this.getNbCaption(paCountUD, nbCastles) + " (" + paCountUD
                + " PA)");
    }
    this.simulationSwordmanCount = swordmanCount;
    this.simulationArcherCount = archerCount;
    this.simulationLancerCount = lancerCount;
    if (totalUO > 0) {
        this._util.setAttribute('rigantestools-warNbUO', 'value', totalUO + " (" + swordmanCount + "/" + archerCount + "/" + lancerCount + ")");
    }
    else {
        this._util.setAttribute('rigantestools-warNbUO', 'value', totalUO);
    }
    if (minDuration > 0 && minDuration !== 9999999) {
        this._util.setAttribute('rigantestools-warInfoStartTimeTargetMin', 'value', this._util.formatDateTime(new Date(date.getTime() - minDuration * 1000)));
        this._util.setAttribute('rigantestools-warInfoTimeTargetMin', 'value', this._util.secToTimeStr(minDuration));
    }
    if (maxDuration > 0) {
        this._util.setAttribute('rigantestools-warInfoStartTimeTargetMax', 'value', this._util.formatDateTime(new Date(date.getTime() - maxDuration * 1000)));
        this._util.setAttribute('rigantestools-warInfoTimeTargetMax', 'value', this._util.secToTimeStr(maxDuration));
    }
};
/**
 * get Unit Weight
 * 
 * @this {MainFrame}
 * @param {String}
 *            unit
 * @return {Number} weight
 */
com.rigantestools.MainFrame.getUnitWeight = function(unit) {
    var weight = 8;
    if (unit === com.rigantestools_Constant.UNITTYPE.SCORPIONRIDER) {
        weight = 7;
    } else if (unit === com.rigantestools_Constant.UNITTYPE.LANCER) {
        weight = 6;
    } else if (unit === com.rigantestools_Constant.UNITTYPE.ARCHER) {
        weight = 5;
    } else if (unit === com.rigantestools_Constant.UNITTYPE.CROSSBOWMAN) {
        weight = 4;
    } else if (unit === com.rigantestools_Constant.UNITTYPE.SPEARMAN) {
        weight = 3;
    } else if (unit === com.rigantestools_Constant.UNITTYPE.SWORDMAN || unit === com.rigantestools_Constant.UNITTYPE.PUSHCART) {
        weight = 2;
    } else if (unit === com.rigantestools_Constant.UNITTYPE.OXCART) {
        weight = 1;
    }
    return weight;
};

/**
 * Refresh defense tree
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.refreshDefenseTree = function() {
    this.clearDefenseTree();
    var treeChildren = document.getElementById("rigantestools-defense-tree");
    for (var index = 0; index < this.currentHabitatsDefense.length; index++) {
        var item = this.currentHabitatsDefense[index];
        var properties = '';
        if(index%2) {
            properties = 'inGrey';
        }
        var treerow = [ "xul:treerow", { properties : properties }];
        for (var row in item) {
            if ( item.hasOwnProperty(row) && (row !== 'duration') && (row !== 'ArrivalDate')) {
                treerow.push([ "xul:treecell", {label : item[row]} ]);
            }
        }
        // generate treeitem element
        var treeitem = this._util.JSONToDOM([ "xul:treeitem", {}, treerow ], document, {});
        treeChildren.appendChild(treeitem);
    }
};

/**
 * Refresh Attack/Defense Slow tree
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.refreshAttackDefenseSlowTree = function() {
	this.clearAttackDefenseSlowTree();
	var treeChildren = document.getElementById("rigantestools-attackDefenseSlow-treechildren");
	for ( var index = 0; index < this.currentHabitatsAttackDefenseSlow.length; index++) {
		var item = this.currentHabitatsAttackDefenseSlow[index];
		var properties = '';
        if(index%2) {
            properties = 'inGrey';
        }
        var treerow = [ "xul:treerow", { properties : properties }];
		for (var row in item) {
			if(row.indexOf("Date")>=0) { 
				treerow.push([ "xul:treecell", {label : this._util.formatDayTime(item[row], true)} ]);
			} 
			else if(row==="unitType" || row==="ralentUnitType"){
				var unit = "";
				switch(item[row]) {
					case com.rigantestools_Constant.UNITTYPE.SPEARMAN: 
						unit = this._util.getBundleString("mainframe.attackDefenseSlow.Spearman");
						break;
					case com.rigantestools_Constant.UNITTYPE.SWORDMAN:
						unit = this._util.getBundleString("mainframe.attackDefenseSlow.Swordman");
						break;
					case com.rigantestools_Constant.UNITTYPE.ARCHER:
						unit = this._util.getBundleString("mainframe.attackDefenseSlow.Archer");
						break;
					case com.rigantestools_Constant.UNITTYPE.CROSSBOWMAN:
						unit = this._util.getBundleString("mainframe.attackDefenseSlow.Crossbowman");
						break;
					case com.rigantestools_Constant.UNITTYPE.SCORPIONRIDER:
						unit = this._util.getBundleString("mainframe.attackDefenseSlow.ScorpionRider");
						break;
					case com.rigantestools_Constant.UNITTYPE.LANCER:
						unit = this._util.getBundleString("mainframe.attackDefenseSlow.Lancer");
						break;
					default:
						
				}
				treerow.push([ "xul:treecell", {label : unit} ]);
			}
			else {
			    treerow.push([ "xul:treecell", {label : item[row]} ]);
			}
			
		}
		// generate treeitem element
        var treeitem = this._util.JSONToDOM([ "xul:treeitem", {}, treerow ], document, {});
        treeChildren.appendChild(treeitem);
	}
};

/**
 * Add to window player tree
 * 
 * @this {MainFrame}
 * @param {Number}
 *            indexProv
 */
com.rigantestools.MainFrame.refreshPlayerTree = function(indexProv) {
    var treeChildren = document.getElementById("rigantestools-player-tree" + indexProv);
    while (treeChildren.hasChildNodes()) {
        treeChildren.removeChild(treeChildren.firstChild);
    }
    var paCount = 0;
    var swordmanCount = 0;
    var archerCount = 0;
    var lancerCount = 0;
    var spearmanCount = 0;
    var crossbowmanCount = 0;
    var scorpionRiderCount = 0;
    var items = this.currentHabitats[indexProv];
    for (var index = 0; index < items.length; index++) {
        var item = items[index];
        paCount += item.paCount;
        swordmanCount += item.swordmanCount;
        archerCount += item.archerCount;
        lancerCount += item.lancerCount;
        spearmanCount += item.spearmanCount;
        crossbowmanCount += item.crossbowmanCount;
        scorpionRiderCount += item.scorpionRiderCount;
        var nbUO = 0;
        if (item.nbUO > 0) {
            nbUO = item.nbUO + " (" + item.swordmanCount + "/" + item.archerCount + "/" + item.lancerCount + ")";
        }
        var nbUD = 0;
        if (item.nbUD > 0) {
            nbUD = item.nbUD + " (" + item.spearmanCount + "/" + item.crossbowmanCount + "/" + item.scorpionRiderCount + ")";
        }
        var properties = '';
        if (index%2) {
            properties = 'inGrey';
        }
        // generate treeitem element
        var treeitem = this._util.JSONToDOM([ "xul:treeitem", {}, [ "xul:treerow", {
            properties : properties
        }, [ "xul:treecell", {
            label : item.name
        } ], [ "xul:treecell", {
            label : item.paCount
        } ], [ "xul:treecell", {
            label : nbUO
        } ], [ "xul:treecell", {
            label : nbUD
        } ] ] ], document, {});
        treeChildren.appendChild(treeitem);
    }
    if(this._util.getAttribute('rigantestools-player-nbCasltes'+indexProv, 'value')!==items.length) {
        this._util.setAttribute('rigantestools-player-nbCasltes'+indexProv, 'value', items.length);
                this._util.setAttribute('rigantestools-player-nbCaption'+indexProv, 'value', this.getNbCaption(paCount, this.currentHabitats[0].length) + " (" + paCount + " "+this._util.getBundleString("mainframe.player.PA")+")");
        var nbUO = swordmanCount + archerCount + lancerCount;
        this._util.setAttribute('rigantestools-player-nbUO'+indexProv, 'value', nbUO + " (" + swordmanCount + "/" + archerCount + "/" + lancerCount + ")");
        var nbUD = spearmanCount + crossbowmanCount + scorpionRiderCount;
        this._util.setAttribute('rigantestools-player-nbUD'+indexProv, 'value', nbUD + " (" + spearmanCount + "/" + crossbowmanCount + "/" + scorpionRiderCount + ")");
    }
};

/**
 * get number captions
 * 
 * @this {MainFrame}
 * @param {Number}
 *            paCount
 * @param {Number}
 *            nbCastles
 * @return {Number} nbCaption
 */
com.rigantestools.MainFrame.getNbCaption = function(paCount, nbCastles) {
    var nbCaption = 0;
    var nbPACaption = nbCastles * 1000;
    while (paCount >= nbPACaption) {
        nbCaption++;
        paCount = paCount - nbPACaption;
        nbPACaption = nbPACaption + 1000;
    }
    return nbCaption;
};
/**
 * call on calculate war button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onCalculateWarButtonClick = function(evt) {
   this.calculateWarTimeAndShow();
};

/**
 * call on calculate defense button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onCalculateDefenseButtonClick = function(evt) {
    this.calculateDefenseTimeAndShow();
};


/**
 * call on calculate attack/defense slow button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onCalculateAttackDefenseSlowButtonClick = function(evt) {
    this.calculateAttackDefenseSlowTimeAndShow();
};

/**
 * call on calculate simulation button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onCalculateSimulationButtonClick = function(evt) {
    this.calculateSimulationAndShow();
};

/**
 * call on modifiy area war button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onModifyAreaWarButtonClick = function(evt) {
    this._util.showOption(2);
};

/**
 * call on modifiy unit defense button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onModifyUnitDefenseButtonClick = function(evt) {
    this._util.showOption(3);
};


/**
 * call on simulate war button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onSimulateWarButtonClick = function(evt) {
    this.clearSimulationTab();
    this._util.setAttribute('rigantestools-simulationAttaqueSpearman', 'value', '');
    this._util.setAttribute('rigantestools-simulationAttaqueSwordman', 'value', this.simulationSwordmanCount);
    this._util.setAttribute('rigantestools-simulationAttaqueArcher', 'value', this.simulationArcherCount);
    this._util.setAttribute('rigantestools-simulationAttaqueCrossbowman', 'value', '');
    this._util.setAttribute('"rigantestools-simulationAttaqueScorpionRider', 'value', '');
    this._util.setAttribute('rigantestools-simulationAttaqueLancer', 'value', this.simulationLancerCount);
    this._util.setAttribute('rigantestools-tabbox', 'selectedIndex', 5);
    
};

/**
 * call on export war button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onExportWarButtonClick = function(evt) {  
    var informations = this._generatedWarInformations.split(new RegExp("[#]+", "g"));
    if(this._util.getPref(com.rigantestools_Constant.PREF_XLS_EXPORT_FORMAT) !== true) {
        this._exporter.WarInCSV(document.getElementById("rigantestools-war-treechildren"), informations);
    }  
    else {
        this._exporter.WarInXLS(document.getElementById("rigantestools-war-treechildren"), informations);
    }
};


/**
 * call on export Attack/Defense Slow button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onExportAttackDefenseSlowButtonClick = function(evt) {
    var informations = this._generatedAttackDefenseSlowInformations.split(new RegExp("[#]+", "g"));
    if(this._util.getPref(com.rigantestools_Constant.PREF_XLS_EXPORT_FORMAT) !== true) {
        this._exporter.AttackDefenseSlowInCSV(document.getElementById("rigantestools-attackDefenseSlow-treechildren"), informations);
    }
    else {
        this._exporter.AttackDefenseSlowInXLS(document.getElementById("rigantestools-attackDefenseSlow-treechildren"), informations);
    }
};

/**
 * call on print war button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onPrintWarButtonClick = function(evt) {
    var informations = this._generatedWarInformations.split(new RegExp("[#]+", "g"));
    this._exporter.WarInHTML(document.getElementById("rigantestools-war-treechildren"), informations);
};

/**
 * call on print Attack/Defense Slow button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onPrintAttackDefenseSlowButtonClick = function(evt) {
    var informations = this._generatedAttackDefenseSlowInformations.split(new RegExp("[#]+", "g"));
    this._exporter.AttackDefenseSlowInHTML(document.getElementById("rigantestools-attackDefenseSlow-treechildren"), informations);
};

/**
 * call on generate war button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onGenerateWarButtonClick = function(evt) {
    this._util.copieToClipboard(this._generatedWarInformations.replace(new RegExp("(##)", "g"), "\n"));
};

/**
 * call on generate Attack/Defense Slow button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onGenerateAttackDefenseSlowButtonClick = function(evt) {
    this._util.copieToClipboard(this._generatedAttackDefenseSlowInformations.replace(new RegExp("(##)", "g"), "\n"));
};

/**
 * call on generate war in progress button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onGenerateWarInProgressButtonClick = function(evt) {
    var selectedAttacks = document.getElementById("rigantestools-warinprogress-tabbox").selectedIndex;
    if(selectedAttacks<this._generatedAttacks.length) {
        this._util.copieToClipboard(this._generatedAttacks[selectedAttacks]);
    }
};

/**
 * call on generate war in progress summary button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onGenerateWarInProgressSummaryButtonClick = function(evt) {
    var ss =  this._generatedAttacksSummary2OnTarget + "\n\n" 
    + this._generatedAttacksSummary2OnTransit + "\n\n" 
    + this._generatedAttacksSummary ;
    this._util.copieToClipboard(ss);
};

/**
 * call on generate player button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onGenerateCasltesLinkPlayerButtonClick = function(evt) {
    var generatedCastlesLink = this._player.name + "\n" + this._player.link;
    var area = this._util.getPref(com.rigantestools_Constant.PREF_CASTLES_AREA);
    var provArea = [];
    if(area!=="" && area !== null){
        provArea = area.split('#');
    }
    var itemsProv = this.currentHabitats;
    for (var indexProv = 1; indexProv < itemsProv.length; indexProv++) {
        var habitats = itemsProv[indexProv];
        generatedCastlesLink += "\n\n";
        if(indexProv===itemsProv.length-1) {
            generatedCastlesLink += this._util.getBundleString("mainframe.player.castleOther") + " :\n";
        }
        else {
            var province = provArea[indexProv-1].split('§');
            generatedCastlesLink += province[0] + " :\n";
        }
        for (var index = 0; index < habitats.length; index++) {
            var item = habitats[index];
            generatedCastlesLink += item.link + " " + item.name + "\n";
        }
        
    }
    this._util.copieToClipboard(generatedCastlesLink);
};

/**
 * call on generate player button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onGenerateCastlesUOPlayerButtonClick = function(evt) {
    var generatedCastlesUO = "";
    var area = this._util.getPref(com.rigantestools_Constant.PREF_CASTLES_AREA);
    var provArea = [];
    if(area!=="" && area !== null){
        provArea = area.split('#');
    }
    var itemsProv = this.currentHabitats;
    for (var indexProv = 1; indexProv < itemsProv.length; indexProv++) {
        var habitats = itemsProv[indexProv];
        var nbCastles = 0;
        var swordmanCount = 0;
        var archerCount = 0;
        var lancerCount = 0;
        var paCount = 0;
        for (var index = 0; index < habitats.length; index++) {
            var item = habitats[index];
            nbCastles += 1;
            swordmanCount += item.swordmanCount;
            archerCount += item.archerCount;
            lancerCount += item.lancerCount;
            paCount += item.paCount;
        }
        if (nbCastles > 0) {
            if(indexProv===itemsProv.length-1) {
                generatedCastlesUO += this._util.getBundleString("mainframe.player.castleOther") + " : "+nbCastles +"\n";
            }
            else {
                var province = provArea[indexProv-1].split('§');
                generatedCastlesUO += province[0] + " : "+nbCastles +"\n";
            }
            generatedCastlesUO += "UO : " + (swordmanCount + archerCount + lancerCount) + " (" + swordmanCount + "/" + archerCount + "/" + lancerCount + ")\n";
            generatedCastlesUO += this._util.getBundleString("mainframe.player.totalCaption") + " : " + this.getNbCaption(paCount, itemsProv[0].length) + "\n\n";
        }
    }
    this._util.copieToClipboard(generatedCastlesUO);
};
/**
 * call on tree simulation selected rows click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onSelectTreeSimulationClick = function(evt) {
    var tree = document.getElementById("rigantestools-simulation-rounds-tree");
    var selectedTreeItemIndex = tree.currentIndex;
    if (selectedTreeItemIndex === -1 || selectedTreeItemIndex >= this.currentUnitsSimulation.length) {
        return;
    }
    if(selectedTreeItemIndex===(this.currentUnitsSimulation.length-1)) {
        selectedTreeItemIndex = -1;
    }
    // clear and show statistics
    this.clearSimulationAttackerTree();
    this.clearSimulationDefenserTree();
    this.addToSimulationAttackerTree(selectedTreeItemIndex);
    this.addToSimulationDefenserTree(selectedTreeItemIndex);
};
/**
 * call on war attack type change
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.onWarAttackTypeChange = function(evt) {
    if(this._util.getAttribute('rigantestools-attackType', 'selectedIndex')===0) {
        this._util.setVisibility('rigantestools-programmedAttackBox','visible');
        this._util.setVisibility('rigantestools-programmedAttackBox1','visible');
        this._util.setVisibility('rigantestools-programmedAttackBox2','collapse');
        this._util.setVisibility('rigantestools-warInfoAttackDateLabel','collapse');
        this._util.setVisibility('rigantestools-warInfoAttackDate','collapse');
    }
    else {
        this._util.setVisibility('rigantestools-programmedAttackBox','collapse');
        this._util.setVisibility('rigantestools-programmedAttackBox1','collapse');
        this._util.setVisibility('rigantestools-programmedAttackBox2','visible');
        this._util.setVisibility('rigantestools-warInfoAttackDateLabel','visible');
        this._util.setVisibility('rigantestools-warInfoAttackDate','visible');
    }
};
/**
 * call on tree war button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 */
com.rigantestools.MainFrame.activateWarTreeContext = function(evt) {
    var tree = document.getElementById("rigantestools-war-tree");
    var contextMenu = document.getElementById("rigantestools-war-treechildren-contextmenu");
    
    // init defaut contextMenu
    for (var i = 0; i < contextMenu.childNodes.length; i++) {
        var item = contextMenu.childNodes[i];
        contextMenu.childNodes[i].setAttribute("disabled", true);
        if (item.getAttribute('name') !== '') {
            item.label = this._util.getBundleString("mainframe.war." + item.getAttribute('name'));
        }
    }
    var numRanges = tree.view.selection.getRangeCount();
    if (numRanges===0) {
        return;
    }
    
    // set contextMenu
    document.getElementById("rigantestools-war-treechildren-contextmenu-noUnit").removeAttribute("disabled");

    // get items selected
    var contextmenu = [ { name : "spearman", label : "", nbEnabled : 0 }, 
            { name : "archer",  label : "", nbEnabled : 0 },
            { name : "swordman", label : "", nbEnabled : 0 },
            { name : "lancer", label : "", nbEnabled : 0 },
            { name : "crossbowman", label : "", nbEnabled : 0 },
            { name : "scorpionRider", label : "", nbEnabled : 0 },
            { name : "pushcart", label : "", nbEnabled : 0 },
            { name : "oxcart", label : "", nbEnabled : 0 }
    ];
    var start = {};
    var end = {};
    var datetime = this.currentDateTime.getTime();
    var currentDate = new Date();
    var nbSelectedItem = 0;
    for (var rangIndex = 0; rangIndex < numRanges; rangIndex++){
        tree.view.selection.getRangeAt(rangIndex,start,end);
        for (var index = start.value; index <= end.value; index++){
            nbSelectedItem++;
            if(index >=0 && index < this.currentHabitatsWar.length) {
                var item = this.currentHabitatsWar[index];
                for(var key in contextmenu) {
                    var itemMenu = contextmenu[key];
                    if (item[itemMenu.name+'Count'] > 0) {
                        var startDate = new Date(datetime - item[itemMenu.name+'Duration'] * 1000);
                        itemMenu.label = " (" + this._util.formatDateTime(startDate) + ")";
                        if (startDate > currentDate) {
                            itemMenu.nbEnabled++;
                        }
                    }
                }
            }
        }
    }
    // update contextmenu
    for(var key in contextmenu) {
        var itemMenu = contextmenu[key];
        this._logger.trace("update contextmenu:"+itemMenu.name+", "+itemMenu.label+", "+itemMenu.nbEnabled);
        if (itemMenu.nbEnabled===nbSelectedItem) {
             document.getElementById("rigantestools-war-treechildren-contextmenu-"+itemMenu.name).removeAttribute("disabled");
             if(itemMenu.nbEnabled===1) {
                 document.getElementById("rigantestools-war-treechildren-contextmenu-"+itemMenu.name).label += itemMenu.label;
             }
         }
    }
};
/**
 * call on select Items
 * 
 * @this {MainFrame}
 * @param {Object}
 *            item
 */
com.rigantestools.MainFrame.selectItems = function(items) {
    var tree = document.getElementById("rigantestools-war-tree");
    var treechildren = document.getElementById("rigantestools-war-treechildren");
    for (var itemIndex = 0; itemIndex < treechildren.childNodes.length; itemIndex++) {
        var itemName = treechildren.childNodes[itemIndex].childNodes[0].childNodes[0].getAttribute('label');
        for (var index = 0; index < items.length; index++) {
            var item = items[index];
            if (itemName === item.name) {
                tree.view.selection.rangedSelect(itemIndex,itemIndex,true);
                break;
            }
        }
    }
};
/**
 * call on tree war button click event
 * 
 * @this {MainFrame}
 * @param {Event}
 *            evt event of the element
 * @param {String}
 *            name
 */
com.rigantestools.MainFrame.selectTreeContext = function(evt, name) {
    var tree = document.getElementById("rigantestools-war-tree");
    var numRanges = tree.view.selection.getRangeCount();
    if (numRanges===0) {
        return;
    }
    var start = {};
    var end = {};
    var selectedItems = [];
    for (var rangIndex = 0; rangIndex < numRanges; rangIndex++){
        tree.view.selection.getRangeAt(rangIndex,start,end);
        for (var index = start.value; index <= end.value; index++){
            var item = this.currentHabitatsWar[index];
            selectedItems.push(item);
            switch(name) {
            case com.rigantestools_Constant.UNITTYPE.SPEARMAN:
                item['selectedUnit'] = name;
                item['selectedDuration'] = item['spearmanDuration'];
                item['disableUnit'] = false;
                break;
            case com.rigantestools_Constant.UNITTYPE.ARCHER:
                item['selectedUnit'] = name;
                item['selectedDuration'] = item['archerDuration'];
                item['disableUnit'] = false;
                break;
            case com.rigantestools_Constant.UNITTYPE.LANCER:
                item['selectedUnit'] = name;
                item['selectedDuration'] = item['lancerDuration'];
                item['disableUnit'] = false;
                break;
            case com.rigantestools_Constant.UNITTYPE.CROSSBOWMAN:
                item['selectedUnit'] = name;
                item['selectedDuration'] = item['crossbowmanDuration'];
                item['disableUnit'] = false;
                break;
            case com.rigantestools_Constant.UNITTYPE.SCORPIONRIDER:
                item['selectedUnit'] = name;
                item['selectedDuration'] = item['scorpionRiderDuration'];
                item['disableUnit'] = false;
                break;
            case com.rigantestools_Constant.UNITTYPE.PUSHCART:
                item['selectedUnit'] = name;
                item['selectedDuration'] = item['pushcartDuration'];
                item['disableUnit'] = false;
                break;
            case com.rigantestools_Constant.UNITTYPE.SWORDMAN:
                item['selectedUnit'] = name;
                item['selectedDuration'] = item['swordmanDuration'];
                item['disableUnit'] = false;
                break;
            case com.rigantestools_Constant.UNITTYPE.OXCART:
                item['selectedUnit'] = name;
                item['selectedDuration'] = item['oxcartDuration'];
                item['disableUnit'] = false;
                break;
                default:
                item['selectedUnit'] = '';
                item['selectedDuration'] = 0;
                item['disableUnit'] = true;
            }
        }
    }
    this.refreshWarTable();
    this.sortcolumnWarTree(this._currentHabitatsWarColumnTreeSort, true);
    this.selectItems(selectedItems);
};

/**
 * refresh war PA
 * 
 * @this {MainFrame}
 */
com.rigantestools.MainFrame.refreshWarTable = function() {
    for (var index = 0; index < this.currentHabitatsWar.length; index++) {
        var item = this.currentHabitatsWar[index];
        var weight = this.getUnitWeight(item['selectedUnit']);
        // calculate PA
        var PACountUO = 0;
        if (weight < 3) {
            PACountUO = Math.min(item['paCount'], item['swordmanPAStoreAmount'] + item['archerPAStoreAmount'] + item['lancerPAStoreAmount']);
        } else if (weight < 6) {
            PACountUO = Math.min(item['paCount'], item['archerPAStoreAmount'] + item['lancerPAStoreAmount']);
        } else if (weight < 7) {
            PACountUO = Math.min(item['paCount'], item['lancerPAStoreAmount']);
        }
        var PACountUD = 0;
        if (weight < 2) {
            PACountUD = item['oxcartPAStoreAmount'] + item['pushcartPAStoreAmount'] + item['spearmanPAStoreAmount'] + item['crossbowmanPAStoreAmount'] + item['scorpionPAStoreAmount'];
        } else if (weight < 3) {
            PACountUD = +item['pushcartPAStoreAmount'] + item['spearmanPAStoreAmount'] + item['crossbowmanPAStoreAmount'] + item['scorpionPAStoreAmount'];
        } else if (weight < 5) {
            PACountUD = item['crossbowmanPAStoreAmount'] + item['scorpionPAStoreAmount'];
        } else if (weight < 8) {
            PACountUD = item['scorpionPAStoreAmount'];
        }
        
        item['selectedPACount'] = PACountUO;
        var pacountwithUD = PACountUO;
        if (PACountUO < item['paCount'] && weight < 8) {
            pacountwithUD = Math.min(item['paCount'], PACountUO + PACountUD);
        }
        item['selectedPACountWithUD'] = pacountwithUD;
        // calculate selected swordman
        item['selectedSwordman'] = 0;
        var nbUO = 0;
        if (weight < 3) {
            nbUO += item['swordmanCount'];
            item['selectedSwordman'] = item['swordmanCount'];
        }
        // calculate selected archer
        item['selectedArcher'] = 0;
        if (weight < 6) {
            nbUO += item['archerCount'];
            item['selectedArcher'] = item['archerCount'];
        }
        // calculate selected lancer
        item['selectedLancer'] = 0;
        if (weight < 7) {
            nbUO += item['lancerCount'];
            item['selectedLancer'] = item['lancerCount'];
        }
        // add total UO
        item['selectedTotalUO'] = nbUO;        
    }
};

/**
 * sort column War Tree
 * 
 * @this {MainFrame}
 * @param {Object}
 *            column
 */
com.rigantestools.MainFrame.sortcolumnWarTree = function(column, withoutSortDirection) {
    var lastColumn = this._currentHabitatsWarColumnTreeSort;
    if (lastColumn !== null && lastColumn !== column) {
        lastColumn.removeAttribute("sortDirection");
    }
    var name = "duration";
    var sort = "descending";
    if (column !== null) {
        name = column.getAttribute("name");
        sort = column.getAttribute("sortDirection");
        this._currentHabitatsWarColumnTreeSort = column;
    }
    if ( (withoutSortDirection && sort === 'ascending') || (!withoutSortDirection && sort !== 'ascending')) {
        sort = "ascending";
    }
    else {
        sort = "descending";
    }
    if (column !== null) {
        column.setAttribute("sortDirection", sort);
    }
    switch (name) {
    case "castle":
        if (sort === "ascending") {
            this.currentHabitatsWar.sort(function(a, b) {
                if (b.name > a.name) {
                    return -1;
                }
                else if (b.name < a.name) {
                    return 1;
                }
                return 0;
            });
        } else {
            this.currentHabitatsWar.sort(function(a, b) {
                if (b.name > a.name) {
                    return 1;
                }
                else if (b.name < a.name) {
                    return -1;
                }
                return 0;
            });
        }
        break;
    case "castlePA":
        if (sort === "ascending") {
            this.currentHabitatsWar.sort(function(a, b) {
                if (b.selectedPACount > a.selectedPACount) {
                    return -1;
                }
                else if (b.selectedPACount < a.selectedPACount) {
                    return 1;
                }
                return 0;
            });
        } else {
            this.currentHabitatsWar.sort(function(a, b) {
                if (b.selectedPACount > a.selectedPACount) {
                    return 1;
                }
                else if (b.selectedPACount < a.selectedPACount) {
                    return -1;
                }
                return 0;
            });
        }
        break;
    case "swordman":
        if (sort === "ascending") {
            this.currentHabitatsWar.sort(function(a, b) {
                return a.selectedSwordman - b.selectedSwordman;
            });
        } else {
            this.currentHabitatsWar.sort(function(a, b) {
                return b.selectedSwordman - a.selectedSwordman;
            });
        }
        break;
    case "archer":
        if (sort === "ascending") {
            this.currentHabitatsWar.sort(function(a, b) {
                return a.selectedArcher - b.selectedArcher;
            });
        } else {
            this.currentHabitatsWar.sort(function(a, b) {
                return b.selectedArcher - a.selectedArcher;
            });
        }
        break;
    case "lancer":
        if (sort === "ascending") {
            this.currentHabitatsWar.sort(function(a, b) {
                return a.selectedLancer - b.selectedLancer;
            });
        } else {
            this.currentHabitatsWar.sort(function(a, b) {
                return b.selectedLancer - a.selectedLancer;
            });
        }
        break;
    case "totalUO":
        if (sort === "ascending") {
            this.currentHabitatsWar.sort(function(a, b) {
                if (b.selectedTotalUO > a.selectedTotalUO) {
                    return -1;
                }
                else if (b.selectedTotalUO < a.selectedTotalUO) {
                    return 1;
                }
                return 0;
            });
        } else {
            this.currentHabitatsWar.sort(function(a, b) {
                if (b.selectedTotalUO > a.selectedTotalUO) {
                    return 1;
                }
                else if (b.selectedTotalUO < a.selectedTotalUO) {
                    return -1;
                }
                return 0;
            });
        }
        break;
    case "slowUnit":
        if (sort === "ascending") {
            var that = this;
            this.currentHabitatsWar.sort(function(a, b) {
                var unitb = that.getUnitWeight(b.selectedUnit);
                var unita = that.getUnitWeight(a.selectedUnit);
                return unita - unitb;
            });
        } else {
            var that = this;
            this.currentHabitatsWar.sort(function(a, b) {
                var unitb = that.getUnitWeight(b.selectedUnit);
                var unita = that.getUnitWeight(a.selectedUnit);
                return unitb - unita;
            });
        }
        break;
    default:
        if (sort === "ascending") {
            this.currentHabitatsWar.sort(function(a, b) {
                return (b.selectedDuration - a.selectedDuration);
            });
        } else {
            this.currentHabitatsWar.sort(function(a, b) {
                return (a.selectedDuration - b.selectedDuration);
            });
        }
    }
    this.refreshWarTree();
};

/**
 * sort column Defense Tree
 * 
 * @this {MainFrame}
 * @param {Object}
 *            column
 */
com.rigantestools.MainFrame.sortcolumnDefenseTree = function(column) {
    var lastColumn = this._currentHabitatsDefenseColumnTreeSort;
    if (lastColumn !== null && lastColumn !== column) {
        lastColumn.removeAttribute("sortDirection");
    }
    var name = "duration";
    var sort = "descending";
    if (column !== null) {
        name = column.getAttribute("name");
        sort = column.getAttribute("sortDirection");
        this._currentHabitatsDefenseColumnTreeSort = column;
    }
    if (sort !== 'ascending') {
        sort = "ascending";
    }
    else {
        sort = "descending";
    }
    if (column !== null) {
        column.setAttribute("sortDirection", sort);
    }
    switch (name) {
    case "castle":
        if (sort === "ascending") {
            this.currentHabitatsDefense.sort(function(a, b) {
                if (b.name > a.name) {
                    return -1;
                }
                else if (b.name < a.name) {
                    return 1;
                }
                return 0;
            });
        } else {
            this.currentHabitatsDefense.sort(function(a, b) {
                if (b.name > a.name) {
                    return 1;
                }
                else if (b.name < a.name) {
                    return -1;
                }
                return 0;
            });
        }
        break;
    case "spearman":
        if (sort === "ascending") {
            this.currentHabitatsDefense.sort(function(a, b) {
                return a.spearmanCount - b.spearmanCount;
            });
        } else {
            this.currentHabitatsDefense.sort(function(a, b) {
                return b.spearmanCount - a.spearmanCount;
            });
        }
        break;
    case "crossbowman":
        if (sort === "ascending") {
            this.currentHabitatsDefense.sort(function(a, b) {
                return a.crossbowmanCount - b.crossbowmanCount;
            });
        } else {
            this.currentHabitatsDefense.sort(function(a, b) {
                return b.crossbowmanCount - a.crossbowmanCount;
            });
        }
        break;
    case "scorpionRider":
        if (sort === "ascending") {
            this.currentHabitatsDefense.sort(function(a, b) {
                return a.scorpionRiderCount - b.scorpionRiderCount;
            });
        } else {
            this.currentHabitatsDefense.sort(function(a, b) {
                return b.scorpionRiderCount - a.scorpionRiderCount;
            });
        }
        break;
    case "totalUD":
        if (sort === "ascending") {
            this.currentHabitatsDefense.sort(function(a, b) {
                return a.totalUD - b.totalUD;
            });
        } else {
            this.currentHabitatsDefense.sort(function(a, b) {
                return b.totalUD - a.totalUD;
            });
        }
        break;
    default:
        if (sort === "ascending") {
            this.currentHabitatsDefense.sort(function(a, b) {
                return (a.duration - b.duration);
            });
        } else {
            this.currentHabitatsDefense.sort(function(a, b) {
                return (b.duration - a.duration);
            });
        }
    }
    this.refreshDefenseTree();
};
/**
 * sort column Attack defense slow Tree
 * 
 * @this {MainFrame}
 * @param {Object}
 *            column
 */
com.rigantestools.MainFrame.sortcolumnAttackDefenseSlowTree = function(column) {
    var lastColumn = this._currentHabitatsAttackDefenseSlowColumnTreeSort;
    if (lastColumn !== null && lastColumn !== column) {
        lastColumn.removeAttribute("sortDirection");
    }
    var name = "duration";
    var sort = "descending";
    if (column !== null) {
        name = column.getAttribute("name");
        sort = column.getAttribute("sortDirection");
        this._currentHabitatsAttackDefenseSlowColumnTreeSort = column;
    }
    if (sort !== 'ascending') {
        sort = "ascending";
    }
    else {
        sort = "descending";
    }
    if (column !== null) {
        column.setAttribute("sortDirection", sort);
    }
    switch (name) {
    case "castle":
        if (sort === "ascending") {
            this.currentHabitatsAttackDefenseSlow.sort(function(a, b) {
                if (b.castle > a.castle) {
                    return -1;
                }
                else if (b.castle < a.castle) {
                    return 1;
                }
                return 0;
            });
        } else {
            this.currentHabitatsAttackDefenseSlow.sort(function(a, b) {
                if (b.castle > a.castle) {
                    return 1;
                }
                else if (b.castle < a.castle) {
                    return -1;
                }
                return 0;
            });
        }
        break;
    case "unitType":
        if (sort === "ascending") {
            this.currentHabitatsAttackDefenseSlow.sort(function(a, b) {
                if (b.unitType > a.unitType) {
                    return -1;
                }
                else if (b.unitType < a.unitType) {
                    return 1;
                }
                return 0;
            });
        } else {
            this.currentHabitatsAttackDefenseSlow.sort(function(a, b) {
                if (b.unitType < a.unitType) {
                    return -1;
                }
                else if (b.unitType > a.unitType) {
                    return 1;
                }
                return 0;
            });
        }
        break;
    case "unitCount":
        if (sort === "ascending") {
            this.currentHabitatsAttackDefenseSlow.sort(function(a, b) {
                return a.unitCount - b.unitCount;
            });
        } else {
            this.currentHabitatsAttackDefenseSlow.sort(function(a, b) {
                return b.unitCount - a.unitCount;
            });
        }
        break;
    case "startDate":
        if (sort === "ascending") {
            this.currentHabitatsAttackDefenseSlow.sort(function(a, b) {
                return (a.startDate - b.startDate);
            });
        } else {
            this.currentHabitatsAttackDefenseSlow.sort(function(a, b) {
                return (b.startDate - a.startDate);
            });
        }
        break;
    default:
        if (sort === "ascending") {
            this.currentHabitatsAttackDefenseSlow.sort(function(a, b) {
                return (a.arrivalDate - b.arrivalDate);
            });
        } else {
            this.currentHabitatsAttackDefenseSlow.sort(function(a, b) {
                return (b.arrivalDate - a.arrivalDate);
            });
        }
    }this.refreshAttackDefenseSlowTree();
};
/**
 * sort column Player Tree
 * 
 * @this {MainFrame}
 * @param {Number}
 *            index
 * @param {Object}
 *            column
 */
com.rigantestools.MainFrame.sortcolumnPlayerTree = function(index, column) {
    this._currentHabitatsColumnTreeSort[index] = this.sortcolumnPlayer(column, this._currentHabitatsColumnTreeSort[index], this.currentHabitats[index]);
    this.refreshPlayerTree(index);
};
/**
 * sort column player
 * 
 * @this {MainFrame}
 * @param {Object}
 *            column
 * @param {Object}
 *            lastColumn
 * @param {Object}
 *            tree
 */
com.rigantestools.MainFrame.sortcolumnPlayer = function(column, lastColumn, tree) {
    if (typeof lastColumn !== 'undefined' && lastColumn !== null && lastColumn !== column) {
        lastColumn.removeAttribute("sortDirection");
    }
    
    var name = "0";
    var sort = "descending";
    if (column !== null) {
        name = column.getAttribute("name");
        sort = column.getAttribute("sortDirection");
    }
    if (sort !== 'ascending') {
        sort = "ascending";
    }
    else {
        sort = "descending";
    }
    if (column !== null) {
        column.setAttribute("sortDirection", sort);
    }
    switch (name) {
    case "0":
        if (sort === "ascending") {
            tree.sort(function(a, b) {
                if (b.name > a.name) {
                    return -1;
                }
                else if (b.name < a.name) {
                    return 1;
                }
                return 0;
            });
        } else {
            tree.sort(function(a, b) {
                if (b.name > a.name) {
                    return 1;
                }
                else if (b.name < a.name) {
                    return -1;
                }
                return 0;
            });
        }

        break;
    case "2":
        if (sort === "ascending") {
            tree.sort(function(a, b) {
                return a.nbUO - b.nbUO;
            });
        } else {
            tree.sort(function(a, b) {
                return b.nbUO - a.nbUO;
            });
        }
        break;
    case "3":
        if (sort === "ascending") {
            tree.sort(function(a, b) {
                return a.nbUD - b.nbUD;
            });
        } else {
            tree.sort(function(a, b) {
                return b.nbUD - a.nbUD;
            });
        }
        break;
    default:
        if (sort === "ascending") {
            tree.sort(function(a, b) {
                return a.paCount - b.paCount;
            });
        } else {
            tree.sort(function(a, b) {
                return b.paCount - a.paCount;
            });
        }
    }
    return column;
};
