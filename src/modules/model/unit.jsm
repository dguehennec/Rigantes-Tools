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

Components.utils.import("resource://rigantestools/constant/constants.jsm");

var EXPORTED_SYMBOLS = [ "rigantestools_Unit" ];

/**
 * Creates an instance of Unit.
 * 
 * @constructor
 * @this {Unit}
 * @param {object}
 *            munit of the Lords And Knights HTML page.
 */
var rigantestools_Unit = function(munit) {
    /** @private */
    this._type = munit.identifier;
    /** @private */
    this._storeAmount = munit.storeAmount;
    /** @private */
    this._corps = munit.corps;
    /** @private */
    this._secondsPerField = 0;
    /** @private */
    this._count = munit.count;

    this.initializeSecondsPerField();
};

/**
 * initialize seconds per field of the unit.
 * 
 * @this {Unit}
 * @return {number} seconds per field of the unit.
 */
rigantestools_Unit.prototype.initializeSecondsPerField = function() {
    switch (this._type) {
    case rigantestools_Constant.UNITTYPE.SPEARMAN:
        this._secondsPerField = rigantestools_Constant.BATTLEVALUES.SPEARMAN.speed;
        break;
    case rigantestools_Constant.UNITTYPE.SWORDMAN:
        this._secondsPerField = rigantestools_Constant.BATTLEVALUES.SWORDMAN.speed;
        break;
    case rigantestools_Constant.UNITTYPE.ARCHER:
        this._secondsPerField = rigantestools_Constant.BATTLEVALUES.ARCHER.speed;
        break;
    case rigantestools_Constant.UNITTYPE.CROSSBOWMAN:
        this._secondsPerField = rigantestools_Constant.BATTLEVALUES.CROSSBOWMAN.speed;
        break;
    case rigantestools_Constant.UNITTYPE.SCORPIONRIDER:
        this._secondsPerField = rigantestools_Constant.BATTLEVALUES.SCORPIONRIDER.speed;
        break;
    case rigantestools_Constant.UNITTYPE.LANCER:
        this._secondsPerField = rigantestools_Constant.BATTLEVALUES.LANCER.speed;
        break;
    case rigantestools_Constant.UNITTYPE.PUSHCART:
        this._secondsPerField = rigantestools_Constant.BATTLEVALUES.PUSHCART.speed;
        break;
    case rigantestools_Constant.UNITTYPE.OXCART:
        this._secondsPerField = rigantestools_Constant.BATTLEVALUES.OXCART.speed;
        break;
    default:
    }
};

/**
 * get seconds per field of the unit.
 * 
 * @this {Unit}
 * @return {number} seconds per field of the unit.
 */
rigantestools_Unit.prototype.getSecondsPerField = function() {
    return this._secondsPerField;
};

/**
 * get store amount of the unit.
 * 
 * @this {Unit}
 * @return {number} store amount of the unit.
 */
rigantestools_Unit.prototype.getStoreAmount = function() {
    return this._storeAmount;
};

/**
 * get seconds per field of the unit.
 * 
 * @this {Unit}
 * @return {number} seconds per field of the unit.
 */
rigantestools_Unit.prototype.getCount = function() {
    return this._count;
};

/**
 * get type of the unit.
 * 
 * @this {Unit}
 * @return {UnitType} type of the unit.
 */
rigantestools_Unit.prototype.getType = function() {
    return this._type;
};

/**
 * get corps of the unit.
 * 
 * @this {Unit}
 * @return {string} corps of the unit.
 */
rigantestools_Unit.prototype.getCorps = function() {
    return this._corps;
};

/**
 * Freeze the interface
 */
Object.freeze(rigantestools_Unit);
