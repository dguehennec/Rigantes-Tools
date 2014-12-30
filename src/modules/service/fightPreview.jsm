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

var EXPORTED_SYMBOLS = [ "rigantestools_FightPreview" ];

/**
 * Creates an instance of FightPreview.
 * 
 * @constructor
 * @this {FightPreview}
 * @param {isFortress}
 *            is it a Fortress?
 * @param {Array}
 *            listud the list of ud
 * @param {Date}
 *            battleDate the date of the battle
 */
var rigantestools_FightPreview = function(isFortress, listud, battleDate) {
    /** @private */
    this._logger = new rigantestools_Logger("rigantestools_FightPreview");
    this._logger.trace("init");
    /** @private */
    this._util = new rigantestools_Util();

    var comment = "";
    var nbcomment = 0;
    var stepDuration = 600;

    var minu;
    var minrenfort;

    // initialize minus units
    if (isFortress) {
        minu = 500;
        minrenfort = 252;
    } else {
        minu = 100;
        minrenfort = 52;
    }

    var mytime = battleDate.getTime();
    var listud_orig = this.CloneUDListe(listud);
    var starttime = mytime;
    var mydate = new Date(mytime)

    var seq_n = 1;
    var seq_t0 = mydate;
    var seq_t1 = mydate;
    var seq_res = "Ok";
    var last_result = "Ok";
    var totalnbud = this.countUnitsWithModifiers(listud_orig, 0);
    var done = 0;
    var index = 0;
    var trou_nbud = 0;

    this.fightpreview_trou = null;
    this.fightpreview_trou_nbud = 0;
    this.fightpreview_dltime = 0;
    this.bufferRound = [];

    var now = new Date();
    var previous_nbud = this.countUnits(listud, now.getTime());

    while (done == 0) {
        var nbud = this.countUnits(listud, mytime);
        var result;

        if (nbud >= minu) {
            result = "Ok";
        } else {
            result = "!TROU!";
            if (this.fightpreview_trou === null) {
                this.fightpreview_trou = mydate;
                this.fightpreview_dltime = mytime - starttime;
            }
            trou_nbud = this.countUnitsWithModifiers(listud_orig, mytime);
        }

        if (result != last_result) {
            if (nbcomment < 2) {
                if (nbcomment == 0) {
                    comment = this._util.getBundleString("fightPreview.safe").replace("%TIME%", this._util.formatTime(seq_t1));
                } else {
                    if (seq_t0 === seq_t1) {
                        comment += this._util.getBundleString("fightPreview.hole").replace("%TIME%", this._util.formatTime(seq_t0));
                    } else {
                        comment += this._util.getBundleString("fightPreview.holes").replace("%TIME0%", this._util.formatTime(seq_t0)).replace("%TIME1%", this._util.formatTime(seq_t1));
                    }
                    this.fightpreview_trou_nbud = trou_nbud;
                    var nbudrest = totalnbud - trou_nbud;
                    if (nbudrest >= 1000) {
                        comment += "\n" + this._util.getBundleString("fightPreview.holeUD").replace("%NBUD%", trou_nbud).replace("%NBUDREST%", nbudrest);
                    }
                }
                seq_t0 = mydate;
                seq_t1 = mydate;
                seq_n = 1;
                seq_res = result;
                nbcomment = nbcomment + 1;
            }
        } else {
            seq_t1 = mydate;
            seq_n = seq_n + 1;
        }
        last_result = result;

        var issue = (result != "Ok" ? true : false);
        var item = {
            'date' : mydate,
            'unitCount' : nbud,
            'newUnitCount' : nbud - previous_nbud,
            'issue' : issue
        };
        this.bufferRound.push(item);

        if (result != "Ok" && done !== true && this.moreArrivingUnits(listud, mytime)) {
            var nb = minrenfort;
            var item = {
                'nb' : nb,
                'type' : rigantestools_Constant.UNITTYPE.SCORPIONRIDER,
                'time' : mytime
            };
            listud.push(item);
        }

        this.resolveRound(listud, mytime, minu);
        previous_nbud = this.countUnits(listud, mytime);

        if (this.moreArrivingUnits(listud, mytime) == false && previous_nbud == 0) {
            done = true;
        }

        index = index + 1;
        mytime = mytime + stepDuration * 1000;
        mydate = new Date(mytime)
    }

    if (this.fightpreview_trou === null) {
        this.fightpreview_trou = mydate;
        this.fightpreview_dltime = mytime - starttime;
        this._logger.info("mytime=" + mytime + " starttime=" + starttime);
    }

    this.comment = comment;
}

/**
 * Count units with modifiers.
 * 
 * @this {FightPreview}
 * @param {Array}
 *            listud the list of ud
 * @param {Number}
 *            time the time
 * @return {Number} the number of units
 */
rigantestools_FightPreview.prototype.countUnitsWithModifiers = function(listud, time) {
    var index;
    var nb = 0;
    for (index = 0; index < listud.length; index++) {
        if (time == 0 || listud[index].time <= time) {
            if (listud[index].type == rigantestools_Constant.UNITTYPE.SWORDMAN) {
                nb = nb + Math.round(listud[index].nb / 2);
            } else if (listud[index].type == rigantestools_Constant.UNITTYPE.ARCHER) {
                nb = nb + Math.round(listud[index].nb / 3);
            } else if (listud[index].type == rigantestools_Constant.UNITTYPE.LANCER) {
                nb = nb + Math.round(listud[index].nb / 3);
            } else {
                nb = nb + listud[index].nb;
            }
        }
    }
    return nb;

};

/**
 * count units.
 * 
 * @this {FightPreview}
 * @param {Array}
 *            listud the list of ud
 * @param {Number}
 *            time the time
 * @return {Number} the number of units
 */
rigantestools_FightPreview.prototype.countUnits = function(listud, time) {
    var index;
    var nb = 0;
    for (index = 0; index < listud.length; index++) {
        if (listud[index].time <= time) {
            nb = nb + listud[index].nb;
        }
    }
    return nb;
}

/**
 * Clone UD liste.
 * 
 * @this {FightPreview}
 * @param {Array}
 *            listud the list of ud
 * @return {Array} the clone of listud
 */
rigantestools_FightPreview.prototype.CloneUDListe = function(listud) {
    var list = [];
    var index;
    for (index = 0; index < listud.length; index++) {
        var old = listud[index];
        var item = {
            'nb' : old.nb,
            'type' : old.type,
            'time' : old.time
        };
        list.push(item);
    }
    return list;
}

/**
 * is more Arriving Units.
 * 
 * @this {FightPreview}
 * @param {Array}
 *            listud the list of ud
 * @param {Number}
 *            time the time
 * @return {Boolean} true, if more Arriving Units
 */
rigantestools_FightPreview.prototype.moreArrivingUnits = function(listud, time) {
    var index;
    for (index = 0; index < listud.length; index++) {
        if (listud[index].time > time) {
            return true;
        }
    }
    return false;
}

/**
 * is more Arriving Units old.
 * 
 * @this {FightPreview}
 * @param {Array}
 *            listud the list of ud
 * @param {Number}
 *            time the time
 * @return {Boolean} true, if more Arriving Units
 */
rigantestools_FightPreview.prototype.moreArrivingUnitsOld = function(listud, time) {
    if (listud.length == 0) {
        return false;
    }

    if (listud[listud.length - 1].time > time) {
        return true;
    }

    return false;
}

/**
 * resolve Round.
 * 
 * @this {FightPreview}
 * @param {Array}
 *            listud the list of ud
 * @param {Number}
 *            time the time
 * @param {Number}
 *            minu the minu of units
 */
rigantestools_FightPreview.prototype.resolveRound = function(listud, time, minu) {
    var index;
    var nb = this.countUnits(listud, time);
    for (index = 0; index < listud.length; index++) {
        if (listud[index].time <= time) {
            if (nb < minu) {
                listud[index].nb = 0;
            } else {
                listud[index].nb = Math.floor(listud[index].nb / 2);
            }
        }
    }
}

/**
 * Freeze the interface
 */
Object.freeze(rigantestools_FightPreview);
