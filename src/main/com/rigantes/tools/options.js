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
/**
 * The Class Options.
 * 
 * @constructor
 * @this {Options}
 */
com.rigantestools.Options = {};

/**
 * Initialize option.
 * 
 * @this {Option}
 */
com.rigantestools.Options.init = function() {
    this._util = new com.rigantestools.service.Util();
    if (window.arguments && typeof window.arguments[0] === 'number') {
        this._util.setAttribute('rigantestools-tabbox', 'selectedIndex', window.arguments[0]);
    }

    this._util.setAttribute("rigantestools-optionDefenseSpearman", "value", this._util.getPref(com.rigantestools.constant.PREF_NB_MIN_SPEARMAN_DEFENSE));
    this._util.setAttribute("rigantestools-optionDefenseCrossbowman", "value", this._util.getPref(com.rigantestools.constant.PREF_NB_MIN_CROSSBOWMAN_DEFENSE));
    this._util.setAttribute("rigantestools-optionDefenseScorpionRider", "value", this._util.getPref(com.rigantestools.constant.PREF_NB_MIN_SCORPIONRIDER_DEFENSE));
    this._util.setAttribute("rigantestools-optionNotificationNewMessage", "checked", this._util.getPref(com.rigantestools.constant.PREF_NOTIFICATION_NEW_MESSAGE));
    this._util.setAttribute("rigantestools-optionNotificationNewAllianceMessage", "checked", this._util.getPref(com.rigantestools.constant.PREF_NOTIFICATION_NEW_ALLY_MESSAGE));
    this._util.setAttribute("rigantestools-optionNotificationNewReport", "checked", this._util.getPref(com.rigantestools.constant.PREF_NOTIFICATION_NEW_REPORT));
    this._util.setAttribute("rigantestools-optionNotificationAttaque", "checked", this._util.getPref(com.rigantestools.constant.PREF_NOTIFICATION_NEW_ATTACK));
    this._util.setAttribute("rigantestools-optionNotificationHabitatesMissions", "checked", this._util.getPref(com.rigantestools.constant.PREF_NOTIFICATION_MISSION_DONE));
    this._util.setAttribute("rigantestools-optionNotificationHabitatesTransits", "checked", this._util.getPref(com.rigantestools.constant.PREF_NOTIFICATION_TRANSIT_DONE));
    this._util.setAttribute("rigantestools-optionNotificationUnitOrder", "checked", this._util.getPref(com.rigantestools.constant.PREF_NOTIFICATION_UNIT_DONE));
    this._util.setAttribute("rigantestools-optionNotificationKnowledgeOrder", "checked", this._util.getPref(com.rigantestools.constant.PREF_NOTIFICATION_KNOWLEDGE_DONE));
    this._util.setAttribute("rigantestools-optionNotificationBuildingOrder", "checked", this._util.getPref(com.rigantestools.constant.PREF_NOTIFICATION_BUILDING_DONE));
    this._util.setAttribute("rigantestools-optionAccessStatusBar", "checked", this._util.getPref(com.rigantestools.constant.PREF_ACCESS_STATUSBAR));
    this._util.setAttribute("rigantestools-optionXLSExportFormat", "checked", this._util.getPref(com.rigantestools.constant.PREF_XLS_EXPORT_FORMAT));
    this.currentCastlesArea = this._util.getPref(com.rigantestools.constant.PREF_CASTLES_AREA);
    this.currentWarTimeArea = this._util.getPref(com.rigantestools.constant.PREF_TIME_AREA);
    this.refreshAdvancedArea();
    this.refreshWarArea();
};

/**
 * refresh advanced area.
 * 
 * @this {Option}
 */
com.rigantestools.Options.refreshAdvancedArea = function() {
    // delete last areas
    var treeChildren = document.getElementById("rigantestools-advanced-area-treeChildren");
    while (treeChildren.hasChildNodes()) {
        treeChildren.removeChild(treeChildren.firstChild);
    }
    // check area not empty
    if (this.currentCastlesArea === '') {
        return;
    }
    var elems = this.currentCastlesArea.split('#');

    for ( var index = 0; index < elems.length; index++) {
        var elem = elems[index];
        var attributes = elem.split('§');
        var properties = '';
        if (index % 2) {
            properties = 'inGrey';
        }
        // generate treeitem element
        var treeitem = this._util.JSONToDOM([ "xul:treeitem", {}, [ "xul:treerow", {
            properties : properties
        }, [ "xul:treecell", {
            label : attributes[0]
        } ], [ "xul:treecell", {
            label : attributes[1]
        } ], [ "xul:treecell", {
            label : attributes[2]
        } ] ] ], document, {});
        treeChildren.appendChild(treeitem);
    }

    this._util.setAttribute('rigantestools-advanced-area-tree', 'currentIndex', -1);
    this._util.setAttribute('rigantestools-advanced-name', 'value', '');
    this._util.setAttribute('rigantestools-advanced-link', 'value', '');
    this._util.setAttribute('rigantestools-advanced-distance', 'value', '');
    this._util.setAttribute('rigantestools-advanced-deleteButton', 'disabled', true);
};

/**
 * save advanced area.
 * 
 * @this {Option}
 */
com.rigantestools.Options.saveAdvancedArea = function() {
    var index;
    var elems;

    var name = this._util.getAttribute('rigantestools-advanced-name', 'value');
    if (name === "") {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.option.name.empty.message"));
        return;
    }
    var link = this._util.getAttribute('rigantestools-advanced-link', 'value');
    if (!this._util.valideHabitatLink(link)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.format.castle.link"));
        return;
    }
    var distance = this._util.getAttribute('rigantestools-advanced-distance', 'value');
    if (distance === "" || !this._util.isNumeric(distance)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.option.distance.invalid.message").replace("%NB%", distance));
        return;
    }
    // delete char used by system
    name = name.replace("#", ".");
    name = name.replace("§", ".");
    var area = this.currentCastlesArea;
    elems = area.split('#');
    for (index = 0; index < elems.length; index++) {
        var elem = elems[index];
        if (elem[0] === name) {
            this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.option.name.duplicate.message"));
            return;
        }
    }

    var newElem = name + "§" + link + "§" + distance;
    var currentIndex = this._util.getAttribute('rigantestools-advanced-area-tree', 'currentIndex');
    var currentArea = this.currentCastlesArea;
    var newArea = '';
    if (currentIndex === undefined || currentIndex < 0) {
        if (currentArea !== '') {
            currentArea += '#';
        }
        currentArea += newElem;
        newArea = currentArea;
    } else {
        elems = currentArea.split('#');
        for (index = 0; index < elems.length; index++) {
            var currentElem = elems[index];
            if (index !== currentIndex) {
                if (newArea !== '') {
                    newArea += "#";
                }
                newArea += currentElem;
            } else {
                if (newArea !== '') {
                    newArea += "#";
                }
                newArea += newElem;
            }
        }
    }
    this.currentCastlesArea = newArea;
    // refresh area
    this.refreshAdvancedArea();
};

/**
 * delete advanced area.
 * 
 * @this {Option}
 */
com.rigantestools.Options.deleteAdvancedArea = function() {
    var currentIndex = this._util.getAttribute('rigantestools-advanced-area-tree', 'currentIndex');

    if (currentIndex === undefined || currentIndex < 0) {
        return false;
    }
    var newArea = '';
    var elems = this.currentCastlesArea.split('#');
    for ( var index = 0; index < elems.length; index++) {
        var elem = elems[index];
        if (index !== currentIndex) {
            if (newArea !== '') {
                newArea += "#";
            }
            newArea += elem;
        }
    }
    this.currentCastlesArea = newArea;
    // refresh area
    this.refreshAdvancedArea();
};

/**
 * on selected item in advanced tree option.
 * 
 * @this {Option}
 */
com.rigantestools.Options.areaAdvancedSelected = function() {
    var currentIndex = this._util.getAttribute('rigantestools-advanced-area-tree', 'currentIndex');
    if (currentIndex === undefined || currentIndex < 0) {
        return false;
    }

    var elems = this.currentCastlesArea.split('#');
    var elem = elems[currentIndex].split('§');
    this._util.setAttribute('rigantestools-advanced-name', 'value', elem[0]);
    this._util.setAttribute('rigantestools-advanced-link', 'value', elem[1]);
    this._util.setAttribute('rigantestools-advanced-distance', 'value', elem[2]);
    this._util.setAttribute('rigantestools-advanced-deleteButton', 'disabled', false);
};

/**
 * refresh war area.
 * 
 * @this {Option}
 */
com.rigantestools.Options.refreshWarArea = function() {
    // delete last areas
    var treeChildren = document.getElementById("rigantestools-war-area-treeChildren");
    while (treeChildren.hasChildNodes()) {
        treeChildren.removeChild(treeChildren.firstChild);
    }
    // check area not empty
    if (this.currentWarTimeArea === '') {
        return;
    }

    var elems = this.currentWarTimeArea.split('#');
    for ( var index = 0; index < elems.length; index++) {
        var elem = elems[index];
        var attributes = elem.split('/');
        var properties = '';
        if (index % 2) {
            properties = 'inGrey';
        }
        // generate attribute recurence
        var days = attributes[2].split(',');
        var attributeDay = '';
        var nbchecked = 0;
        for ( var dayIndex = 0; dayIndex < days.length; dayIndex++) {
            if (days[dayIndex] === 'true') {
                if (attributeDay !== '') {
                    attributeDay += ',';
                }
                attributeDay += this._util.getBundleString("smallDay." + dayIndex);
                nbchecked++;
            }
        }
        if (nbchecked === 7) {
            attributeDay = this._util.getBundleString("everyday");
        } else if (nbchecked === 5 && days[5] !== 'true' && days[6] !== 'true') {
            attributeDay = this._util.getBundleString("everyweek");
        } else if (nbchecked === 2 && days[5] === 'true' && days[6] === 'true') {
            attributeDay = this._util.getBundleString("everyWeekend");
        }

        // generate attribute enable
        var attributeEnable = this._util.getBundleString("no");
        if (attributes[3] === 'true') {
            attributeEnable = this._util.getBundleString("yes");
        }
        // generate treeitem element
        var treeitem = this._util.JSONToDOM([ "xul:treeitem", {}, [ "xul:treerow", {
            properties : properties
        }, [ "xul:treecell", {
            label : attributes[0]
        } ], [ "xul:treecell", {
            label : attributes[1]
        } ], [ "xul:treecell", {
            label : attributeDay
        } ], [ "xul:treecell", {
            label : attributeEnable
        } ] ] ], document, {});
        treeChildren.appendChild(treeitem);
    }

    this._util.setAttribute('rigantestools-war-area-tree', 'currentIndex', -1);
    this._util.setAttribute('rigantestools-startTime', 'value', '00:00');
    this._util.setAttribute('rigantestools-endTime', 'value', '00:00');
    this._util.setAttribute('rigantestools-optionRecurrenceMon', 'checked', true);
    this._util.setAttribute('rigantestools-optionRecurrenceTue', 'checked', true);
    this._util.setAttribute('rigantestools-optionRecurrenceWed', 'checked', true);
    this._util.setAttribute('rigantestools-optionRecurrenceThe', 'checked', true);
    this._util.setAttribute('rigantestools-optionRecurrenceFri', 'checked', true);
    this._util.setAttribute('rigantestools-optionRecurrenceSat', 'checked', true);
    this._util.setAttribute('rigantestools-optionRecurrenceSun', 'checked', true);
    this._util.setAttribute('rigantestools-optionAreaEnable', 'selected', true);
    this._util.setAttribute('rigantestools-deleteButton', 'disabled', true);
};

/**
 * get time area.
 * 
 * @this {Option}
 * @param id
 */
com.rigantestools.Options.getWarAreaTime = function(id) {
    if (!document.getElementById(id)) {
        return null;
    }
    var time = this._util.getAttribute(id, 'value');
    if (!this._util.valideTimeHHMM(time, true)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.format.time"));
        return null;
    }
    var hours = Number(time.substring(0, time.indexOf(':')));
    var minutes = Number(time.substring(time.indexOf(':') + 1));
    return hours * 3600 + minutes * 60;
};

/**
 * save area.
 * 
 * @this {Option}
 */
com.rigantestools.Options.saveWarArea = function() {
    var startTime = com.rigantestools.Options.getWarAreaTime('rigantestools-startTime');
    if (startTime === null) {
        return false;
    }
    var endTime = com.rigantestools.Options.getWarAreaTime('rigantestools-endTime');
    if (endTime === null) {
        return false;
    }

    if (startTime >= endTime) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.format.startTime"));
        return false;
    }

    var elem = this._util.getAttribute('rigantestools-startTime', 'value') + "/" + this._util.getAttribute('rigantestools-endTime', 'value') + "/";
    elem += this._util.getAttribute('rigantestools-optionRecurrenceMon', 'checked') + ",";
    elem += this._util.getAttribute('rigantestools-optionRecurrenceTue', 'checked') + ",";
    elem += this._util.getAttribute('rigantestools-optionRecurrenceWed', 'checked') + ",";
    elem += this._util.getAttribute('rigantestools-optionRecurrenceThe', 'checked') + ",";
    elem += this._util.getAttribute('rigantestools-optionRecurrenceFri', 'checked') + ",";
    elem += this._util.getAttribute('rigantestools-optionRecurrenceSat', 'checked') + ",";
    elem += this._util.getAttribute('rigantestools-optionRecurrenceSun', 'checked') + "/";
    elem += this._util.getAttribute('rigantestools-optionAreaEnable', 'selected');

    var currentIndex = this._util.getAttribute('rigantestools-war-area-tree', 'currentIndex');
    var currentArea = this.currentWarTimeArea;
    var newArea = '';
    if (currentIndex === undefined || currentIndex < 0) {
        if (currentArea !== '') {
            currentArea += '#';
        }
        currentArea += elem;
        newArea = currentArea;
    } else {
        var elems = currentArea.split('#');
        for ( var index = 0; index < elems.length; index++) {
            var currentElem = elems[index];
            if (index !== currentIndex) {
                if (newArea !== '') {
                    newArea += "#";
                }
                newArea += currentElem;
            } else {
                if (newArea !== '') {
                    newArea += "#";
                }
                newArea += elem;
            }
        }
    }
    this.currentWarTimeArea = newArea;
    // refresh area
    this.refreshWarArea();
};

/**
 * delete area.
 * 
 * @this {Option}
 */
com.rigantestools.Options.deleteWarArea = function() {
    var currentIndex = this._util.getAttribute('rigantestools-war-area-tree', 'currentIndex');

    if (currentIndex === undefined || currentIndex < 0) {
        return false;
    }

    var newArea = '';
    var elems = this.currentWarTimeArea.split('#');
    for ( var index = 0; index < elems.length; index++) {
        var elem = elems[index];
        if (index !== currentIndex) {
            if (newArea !== '') {
                newArea += "#";
            }
            newArea += elem;
        }
    }
    this.currentWarTimeArea = newArea;
    // refresh area
    this.refreshWarArea();
};
/**
 * on selected item in war tree option.
 * 
 * @this {Option}
 */
com.rigantestools.Options.areaWarSelected = function() {
    var currentIndex = this._util.getAttribute('rigantestools-war-area-tree', 'currentIndex');
    if (currentIndex === undefined || currentIndex < 0) {
        return false;
    }
    var elems = this.currentWarTimeArea.split('#');
    var elem = elems[currentIndex].split('/');
    this._util.setAttribute('rigantestools-startTime', 'value', elem[0]);
    this._util.setAttribute('rigantestools-endTime', 'value', elem[1]);
    var checkeds = elem[2].split(",");
    this._util.setAttribute('rigantestools-optionRecurrenceMon', 'checked', (checkeds[0] === 'true'));
    this._util.setAttribute('rigantestools-optionRecurrenceTue', 'checked', (checkeds[1] === 'true'));
    this._util.setAttribute('rigantestools-optionRecurrenceWed', 'checked', (checkeds[2] === 'true'));
    this._util.setAttribute('rigantestools-optionRecurrenceThe', 'checked', (checkeds[3] === 'true'));
    this._util.setAttribute('rigantestools-optionRecurrenceFri', 'checked', (checkeds[4] === 'true'));
    this._util.setAttribute('rigantestools-optionRecurrenceSat', 'checked', (checkeds[5] === 'true'));
    this._util.setAttribute('rigantestools-optionRecurrenceSun', 'checked', (checkeds[6] === 'true'));
    this._util.setAttribute('rigantestools-optionAreaEnable', 'selected', (elem[3] === 'true'));
    this._util.setAttribute('rigantestools-optionAreaDisable', 'selected', (elem[3] !== 'true'));
    this._util.setAttribute('rigantestools-deleteButton', 'disabled', false);
};

/**
 * Save option.
 * 
 * @this {Option}
 * @return {boolean} true if success
 */
com.rigantestools.Options.save = function() {

    var nbMinSpearman = this._util.getAttribute("rigantestools-optionDefenseSpearman", "value");
    if (!this._util.isNumeric(nbMinSpearman)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.option.nbMinSpearman.invalid.message"));
        return false;
    }
    var nbMinCrossbowman = this._util.getAttribute("rigantestools-optionDefenseCrossbowman", "value");
    if (!this._util.isNumeric(nbMinCrossbowman)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.option.nbMinCrossbowman.invalid.message"));
        return false;
    }
    var nbMinScorpionRider = this._util.getAttribute("rigantestools-optionDefenseScorpionRider", "value");
    if (!this._util.isNumeric(nbMinScorpionRider)) {
        this._util.showMessage(this._util.getBundleString("error"), this._util.getBundleString("error.option.nbMinScorpionRider.invalid.message"));
        return false;
    }

    this._util.setPref(com.rigantestools.constant.PREF_NB_MIN_SPEARMAN_DEFENSE, Number(nbMinSpearman));
    this._util.setPref(com.rigantestools.constant.PREF_NB_MIN_CROSSBOWMAN_DEFENSE, Number(nbMinCrossbowman));
    this._util.setPref(com.rigantestools.constant.PREF_NB_MIN_SCORPIONRIDER_DEFENSE, Number(nbMinScorpionRider));
    this._util.setPref(com.rigantestools.constant.PREF_NOTIFICATION_NEW_MESSAGE, this._util.getAttribute("rigantestools-optionNotificationNewMessage", "checked"));
    this._util.setPref(com.rigantestools.constant.PREF_NOTIFICATION_NEW_ALLY_MESSAGE, this._util.getAttribute("rigantestools-optionNotificationNewAllianceMessage", "checked"));
    this._util.setPref(com.rigantestools.constant.PREF_NOTIFICATION_NEW_REPORT, this._util.getAttribute("rigantestools-optionNotificationNewReport", "checked"));
    this._util.setPref(com.rigantestools.constant.PREF_NOTIFICATION_NEW_ATTACK, this._util.getAttribute("rigantestools-optionNotificationAttaque", "checked"));
    this._util.setPref(com.rigantestools.constant.PREF_NOTIFICATION_MISSION_DONE, this._util.getAttribute("rigantestools-optionNotificationHabitatesMissions", "checked"));
    this._util.setPref(com.rigantestools.constant.PREF_NOTIFICATION_TRANSIT_DONE, this._util.getAttribute("rigantestools-optionNotificationHabitatesTransits", "checked"));
    this._util.setPref(com.rigantestools.constant.PREF_NOTIFICATION_UNIT_DONE, this._util.getAttribute("rigantestools-optionNotificationUnitOrder", "checked"));
    this._util.setPref(com.rigantestools.constant.PREF_NOTIFICATION_KNOWLEDGE_DONE, this._util.getAttribute("rigantestools-optionNotificationKnowledgeOrder", "checked"));
    this._util.setPref(com.rigantestools.constant.PREF_NOTIFICATION_BUILDING_DONE, this._util.getAttribute("rigantestools-optionNotificationBuildingOrder", "checked"));
    this._util.setPref(com.rigantestools.constant.PREF_ACCESS_STATUSBAR, this._util.getAttribute("rigantestools-optionAccessStatusBar", "checked"));
    this._util.setPref(com.rigantestools.constant.PREF_XLS_EXPORT_FORMAT, this._util.getAttribute("rigantestools-optionXLSExportFormat", "checked"));
    this._util.setPref(com.rigantestools.constant.PREF_CASTLES_AREA, this.currentCastlesArea);
    this._util.setPref(com.rigantestools.constant.PREF_TIME_AREA, this.currentWarTimeArea);
    this._util.notifyObservers(com.rigantestools.constant.OBSERVER.REFRESH);
    window.close();
};
