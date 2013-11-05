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
if (!com.rigantestools.domain) {
    com.rigantestools.domain = {};
}

/**
 * Creates an instance of Unit.
 * 
 * @constructor
 * @this {Unit}
 * @param {object}
 *            munit of the Lords And Knights HTML page.
 */
com.rigantestools.domain.Unit = function(munit) {
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
com.rigantestools.domain.Unit.prototype.initializeSecondsPerField = function() {
    switch(this._type) {
    	case com.rigantestools.constant.UNITTYPE.SPEARMAN:
    		this._secondsPerField = com.rigantestools.constant.BATTLEVALUES.SPEARMAN.speed;
    		break;
    	case com.rigantestools.constant.UNITTYPE.SWORDMAN:
    		this._secondsPerField = com.rigantestools.constant.BATTLEVALUES.SWORDMAN.speed;
    		break;
    	case com.rigantestools.constant.UNITTYPE.ARCHER:
    		this._secondsPerField = com.rigantestools.constant.BATTLEVALUES.ARCHER.speed;
    		break;
    	case com.rigantestools.constant.UNITTYPE.CROSSBOWMAN:
    		this._secondsPerField = com.rigantestools.constant.BATTLEVALUES.CROSSBOWMAN.speed;
    		break;
    	case com.rigantestools.constant.UNITTYPE.SCORPIONRIDER:
    		this._secondsPerField = com.rigantestools.constant.BATTLEVALUES.SCORPIONRIDER.speed;
    		break;
    	case com.rigantestools.constant.UNITTYPE.LANCER:
    		this._secondsPerField = com.rigantestools.constant.BATTLEVALUES.LANCER.speed;
    		break;
    	case com.rigantestools.constant.UNITTYPE.PUSHCART:
    		this._secondsPerField = com.rigantestools.constant.BATTLEVALUES.PUSHCART.speed;
    		break;
    	case com.rigantestools.constant.UNITTYPE.OXCART:
    		this._secondsPerField = com.rigantestools.constant.BATTLEVALUES.OXCART.speed;
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
com.rigantestools.domain.Unit.prototype.getSecondsPerField = function() {
    return this._secondsPerField;
};

/**
 * get store amount of the unit.
 * 
 * @this {Unit}
 * @return {number} store amount of the unit.
 */
com.rigantestools.domain.Unit.prototype.getStoreAmount = function() {
    return this._storeAmount;
};

/**
 * get seconds per field of the unit.
 * 
 * @this {Unit}
 * @return {number} seconds per field of the unit.
 */
com.rigantestools.domain.Unit.prototype.getCount = function() {
    return this._count;
};

/**
 * get type of the unit.
 * 
 * @this {Unit}
 * @return {UnitType} type of the unit.
 */
com.rigantestools.domain.Unit.prototype.getType = function() {
    return this._type;
};

/**
 * get corps of the unit.
 * 
 * @this {Unit}
 * @return {string} corps of the unit.
 */
com.rigantestools.domain.Unit.prototype.getCorps = function() {
    return this._corps;
};