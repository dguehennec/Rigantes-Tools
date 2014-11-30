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

var EXPORTED_SYMBOLS = [ "rigantestools_Notifier" ];

/**
 * Creates an instance of Notifier.
 * 
 * @constructor
 * @this {Notifier}
 */
var rigantestools_Notifier = function(parent) {
    /** @private */
    /** The logger. */
    this._logger = new rigantestools_Logger("Notifier");
    /** @private */
    /** The util tool. */
    this._util = new rigantestools_Util();
    /** @private */
    /** the parent. */
    this._parent = parent;
    /** @private */
    /** indicate if active. */
    this._active = false;
    /** @private */
    /** the current player save. */
    this._player = null;
    /** @private */
    /** the number of unread messages. */
    this._nbUnreadMessages = 0;
    /** @private */
    /** the timer */
    this._timer = null;
};
/**
 * start Notifier.
 * 
 * @this {Notifier}
 */
rigantestools_Notifier.prototype.start = function() {
    this._logger.trace("start");
    this._active = true;
    var object = this;
    this._timer = this._util.setTimer(this._timer, function() {
        object.refresh();
    }, 30000);
};
/**
 * stop Notifier.
 * 
 * @this {Notifier}
 */
rigantestools_Notifier.prototype.stop = function() {
    this._logger.trace("stop");
    this._active = false;
    this._player = null;
    this._nbUnreadMessages = 0;
    this._timer.cancel();
};
/**
 * refresh Notifier.
 * 
 * @this {Notifier}
 */
rigantestools_Notifier.prototype.refresh = function() {

    if (!this._active) {
        return false;
    }
    var object = this;
    this._timer = this._util.setTimer(this._timer, function() {
        object.refresh();
    }, 30000);

    try {
        var player = this._parent.getPlayer();
        if (player !== null) {
            if (this._player === null) {
                this.setDefaultValue(player);
            } else {
                this.check(player);
            }
        }
    } catch (e) {
        return false;
    }
    return true;

};
/**
 * set player to default value of the Notifier.
 * 
 * @this {Notifier}
 * @param {Player}
 *            player the player refreshed
 */
rigantestools_Notifier.prototype.setDefaultValue = function(player) {
    this._player = player;
    this._nbUnreadMessages = player.unreadAllianceMessages + player.unreadDiscussionCount + player.unreadReportCount;
    this._util.notifyObservers(rigantestools_Constant.OBSERVER.REFRESH);
};

/**
 * get number unreadMessage.
 * 
 * @this {Notifier}
 * @return {Number} the number of unread messages
 */
rigantestools_Notifier.prototype.getNbUnreadMessage = function() {
    return this._nbUnreadMessages;
};
/**
 * check the player Notifier.
 * 
 * @this {Notifier}
 * @param {Player}
 *            player the player refreshed
 */
rigantestools_Notifier.prototype.check = function(player) {
    // check player
    var nbAttaque = player.habitatisAttacked - this._player.habitatisAttacked;
    if (nbAttaque > 0 && this._util.getPref(rigantestools_Constant.PREF_NOTIFICATION_NEW_ATTACK)) {
        this._util.showNotificaton(this._util.getBundleString("notifier.alert.title"), this._util.getBundleString("notifier.newAttaque.description"));
    } else if (nbAttaque < 0 && this._util.getPref("extensions.rigantestools.option.notificationNewAttaque")) {
        this._util.showNotificaton(this._util.getBundleString("notifier.alert.title"), this._util.getBundleString("notifier.attaqueFinished.description"));
    }
    var nbMessages = player.unreadDiscussionCount - this._player.unreadDiscussionCount;
    if (nbMessages > 0 && this._util.getPref(rigantestools_Constant.PREF_NOTIFICATION_NEW_MESSAGE)) {
        if (nbMessages === 1) {
            this._util.showNotificaton(this._util.getBundleString("notifier.information.title"), this._util.getBundleString("notifier.newMessage.description"));
        } else {
            this._util.showNotificaton(this._util.getBundleString("notifier.information.title"), this._util.getBundleString("notifier.newMessages.description").replace("X", nbMessages));
        }
    }
    var nbReport = player.unreadReportCount - this._player.unreadReportCount;
    if (nbReport > 0 && this._util.getPref(rigantestools_Constant.PREF_NOTIFICATION_NEW_REPORT)) {
        if (nbReport === 1) {
            this._util.showNotificaton(this._util.getBundleString("notifier.information.title"), this._util.getBundleString("notifier.newReport.description"));
        } else {
            this._util.showNotificaton(this._util.getBundleString("notifier.information.title"), this._util.getBundleString("notifier.newReports.description").replace("X", nbReport));
        }
    }
    var nbMessagesAlliance = player.unreadAllianceMessages - this._player.unreadAllianceMessages;
    if (nbMessagesAlliance > 0 && this._util.getPref(rigantestools_Constant.PREF_NOTIFICATION_NEW_ALLY_MESSAGE)) {
        if (nbMessagesAlliance === 1) {
            this._util.showNotificaton(this._util.getBundleString("notifier.information.title"), this._util.getBundleString("notifier.newAllianceMessage.description"));
        } else {
            this._util.showNotificaton(this._util.getBundleString("notifier.information.title"), this._util.getBundleString("notifier.newAllianceMessages.description")
                    .replace("X", nbMessagesAlliance));
        }
    }
    // check habitates
    var habitates = player.getHabitatList();
    for (var index = 0; index < habitates.length; index++) {
        var habitat = habitates[index];
        var currentHabitat = this.getcurrentHabitat(habitat.id);
        if (currentHabitat !== null) {
            if (habitat.nbhabitatesMissions < currentHabitat.nbhabitatesMissions && this._util.getPref(rigantestools_Constant.PREF_NOTIFICATION_MISSION_DONE)) {
                this._util.showNotificaton(this._util.getBundleString("notifier.information.title"), this._util.getBundleString("notifier.missionFinished.description").replace("X", habitat.name));
            }
            if (habitat.nbhabitatesTransits < currentHabitat.nbhabitatesTransits && this._util.getPref(rigantestools_Constant.PREF_NOTIFICATION_TRANSIT_DONE)) {
                this._util.showNotificaton(this._util.getBundleString("notifier.information.title"), this._util.getBundleString("notifier.transitFinished.description").replace("X", habitat.name));
            }
            if (habitat.nbUnitOrder < currentHabitat.nbUnitOrder && this._util.getPref(rigantestools_Constant.PREF_NOTIFICATION_UNIT_DONE)) {
                this._util.showNotificaton(this._util.getBundleString("notifier.information.title"), this._util.getBundleString("notifier.unitsFinished.description").replace("X", habitat.name));
            }
            if (habitat.nbKnowledgeOrder < currentHabitat.nbKnowledgeOrder && this._util.getPref(rigantestools_Constant.PREF_NOTIFICATION_KNOWLEDGE_DONE)) {
                this._util.showNotificaton(this._util.getBundleString("notifier.information.title"), this._util.getBundleString("notifier.knowledgeFinished.description").replace("X", habitat.name));
            }
            if (habitat.nbHabitatBuildingOrder < currentHabitat.nbHabitatBuildingOrder && this._util.getPref(rigantestools_Constant.PREF_NOTIFICATION_BUILDING_DONE)) {
                this._util.showNotificaton(this._util.getBundleString("notifier.information.title"), this._util.getBundleString("notifier.buildingFinished.description").replace("X", habitat.name));
            }
        }
    }
    this.setDefaultValue(player);
};

/**
 * get current habitat of the Notifier.
 * 
 * @this {Notifier}
 * @param {String}
 *            id id of the habitat
 * @return {Habitat} the habitat if found, null else
 */
rigantestools_Notifier.prototype.getcurrentHabitat = function(id) {
    var habitates = this._player.getHabitatList();
    for (var index = 0; index < habitates.length; index++) {
        var habitat = habitates[index];
        if (habitat.id === id) {
            return habitat;
        }
    }
    return null;
};

/**
 * Freeze the interface
 */
Object.freeze(rigantestools_Notifier);
