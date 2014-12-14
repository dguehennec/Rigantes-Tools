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
    /**
     * The instance com in needed.
     * 
     * @constructor
     * @this {com}
     */
    var com = {};
}
if (!com.rigantestools) {
    /**
     * The instance rigantestools if needed.
     * 
     * @constructor
     * @this {rigantestools}
     */
    com.rigantestools = {};
}

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://rigantestools/constant/constants.jsm", com);
Components.utils.import("resource://rigantestools/service/logger.jsm", com);
Components.utils.import("resource://rigantestools/service/util.jsm", com);

/**
 * The Class Tests.
 * 
 * @constructor
 * @this {Tests}
 */
com.rigantestools.Tests = {};

/**
 * Init module.
 * 
 * @this {Tests}
 */
com.rigantestools.Tests.init = function() {
    /** @private */
    /** The util tool. */
    this._util = new com.rigantestools_Util(window);
    
    this.startUtilClassTests();
    this.startUtilPlayerClassTests();
}

com.rigantestools.Tests.startUtilClassTests = function() {
    var that = this;
    
    QUnit.test("getBundleString", function(assert) {
        assert.notEqual(that._util.getBundleString("locale"), "");
    });
    
    QUnit.test("getPref", function(assert) {
        assert.equal(that._util.getPref(com.rigantestools_Constant.PREF_CURRENT_VERSION), com.rigantestools_Constant.VERSION);
    });
    
    QUnit.test("isNumeric", function(assert) {
        function isNumeric(value, withDecimals, withNegatives, expected) {
            assert.equal(that._util.isNumeric(value, withDecimals, withNegatives), expected);
        }
        isNumeric("1", undefined, undefined, true);
        isNumeric("a", undefined, undefined, false);
        isNumeric("-1", undefined, undefined, false);
        isNumeric("-1", undefined, true, true);
        isNumeric("1.1", undefined, undefined, false);
        isNumeric("1.1", true, undefined, true);
    });
    
    QUnit.test("formatDayTime", function(assert) {
        assert.equal(that._util.formatDayTime(new Date("1/1/2014 22:46:16")), that._util.getBundleString("smallDay.2")+ " 22:46");
        
        var currentDate = new Date();
        assert.equal(that._util.formatDayTime(new Date(currentDate.getFullYear(),currentDate.getMonth(),currentDate.getDate()), true), "00:00");
    });
}

com.rigantestools.Tests.startUtilPlayerClassTests = function() {
    var that = this;
    this._utilPlayer = com.rigantestools_UtilPlayer;
    
    QUnit.test("updatePlayersList", function(assert) {
        var playerlist = [];
        playerlist.push({id : 12345, nick : "aaaa"});
        assert.equal(that._utilPlayer.updatePlayersList(playerlist, 20), true);
    });
    
    QUnit.test("getPlayer", function(assert) {
        var player = that._utilPlayer.getPlayer(12345, 20);
        assert.equal(player.nick, "aaaa");
    });
    
    QUnit.test("updatePlayer-Update", function(assert) {
        assert.equal(that._utilPlayer.updatePlayer({id : 12345, nick : "bbbb"}, 20), true);
    });
    
    QUnit.test("updatePlayer-Create", function(assert) {
        assert.equal(that._utilPlayer.updatePlayer({id : 12346, nick : "ccccc"}, 20), true);
    });
    
    QUnit.test("getPlayerUpdated", function(assert) {
        var player = that._utilPlayer.getPlayer(12345, 20);
        assert.equal(player.nick, "bbbb");
    });
    
    QUnit.test("getPlayers", function(assert) {
        var players = that._utilPlayer.getPlayers(20);
        assert.notEqual(players.length, 0);
    });
}