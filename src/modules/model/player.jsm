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
Components.utils.import("resource://rigantestools/model/habitat.jsm");
Components.utils.import("resource://rigantestools/constant/constants.jsm");

var EXPORTED_SYMBOLS = [ "rigantestools_Player" ];

/**
 * Creates an instance of Player.
 * 
 * @constructor
 * @this {Player}
 * @param {object}
 *            mplayer of the Lords And Knights HTML page.
 * @param {Number}
 *            worldID of the Lords And Knights HTML page.
 */
var rigantestools_Player = function(mplayer, worldID) {
    this._logger = new rigantestools_Logger("Player");
    this._logger.trace("init");
    /** @private */
    this._util = new rigantestools_Util();
    /** @private */
    this.world = worldID;
    /** @private */
    this.name = '';
    /** @private */
    this.id = 0;
    /** @private */
    this.points = 0;
    /** @private */
    this.link = '';
    /** @private */
    this.allianceName = '';
    /** @private */
    this.allianceId = 0;
    /** @private */
    this.creationDate = null;
    /** @private */
    this.habitatisAttacked = 0;
    /** @private */
    this.refreshDate = null;
    /** @private */
    this.unreadDiscussionCount = 0;
    /** @private */
    this.unreadReportCount = 0;
    /** @private */
    this.unreadAllianceMessages = 0;
    /** @private */
    this.habitateList = [];

    if (mplayer !== null) {
        this.init(mplayer);
    }
};

/**
 * init player informations.
 * 
 * @this {Player}
 * @param [mPlayer}
 *            mplayer of LordsAndKnight
 * @return {boolean} true if successful.
 */
rigantestools_Player.prototype.init = function(mplayer) {
    try {
        // Update player informations
        this.name = mplayer.nick;
        this.link = 'l+k://player?' + mplayer.id + '&' + this.world;
        this.id = mplayer.id;
        this.points = mplayer.points;
        if (mplayer.alliance) {
            this.allianceName = mplayer.alliance.name;
            this.allianceId = mplayer.alliance.id;
        }
        this.creationDate = mplayer.creationDate;
        this.habitateisAttacked = mplayer.habitateisAttacked;
        this.unreadDiscussionCount = mplayer.unreadDiscussionCount;
        this.unreadReportCount = mplayer.unreadReportCount;
        this.unreadAllianceMessages = 0;
        if (mplayer.unreadAllianceMessages) {
            this.unreadAllianceMessages += mplayer.unreadAllianceMessages;
        }
        if (mplayer.unreadThreadCount) {
            this.unreadAllianceMessages += mplayer.unreadThreadCount;
        }

        this.refreshDate = mplayer.touchDate;

        // Update Habitate
        if (!mplayer.habitate) {
            return false;
        }

        var mhabitate = mplayer.habitate;
        this.habitateList = [];
        for ( var sProp in mhabitate) {
            if (mhabitate.hasOwnProperty(sProp)) {
                var habitat = new rigantestools_Habitat(mhabitate[sProp], this.world);
                this.habitateList.push(habitat);
            }
        }
        this.habitateList.sort(function(a, b) {
            if (b.name > a.name) {
                return -1;
            } else if (b.name < a.name) {
                return 1;
            }
            return 0;
        });
        this.mplayer = mplayer;

        return true;
    } catch (e) {
        this._logger.error("init error:" + e);
        return false;
    }
};

/**
 * get player habitate list
 * 
 * @this {Player}
 * @return {Array} the list of habitat.
 */
rigantestools_Player.prototype.getHabitatList = function() {
    return this.habitateList;
};

/**
 * Freeze the interface
 */
Object.freeze(rigantestools_Player);
