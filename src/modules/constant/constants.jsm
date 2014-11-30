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

var EXPORTED_SYMBOLS = [ "rigantestools_Constant" ];

/**
 * The Class Constant.
 * 
 * @constructor
 * @this {Constant}
 */
var rigantestools_Constant = {};

/**
 * Logger level
 * 
 * @constant
 */
rigantestools_Constant.LOGGER = {
    LEVEL : 2,
    PRINT_STACK : true,
    PRINT_DATE : true
};

/**
 * Version
 * 
 * @constant
 */
rigantestools_Constant.VERSION = "3.0.0";
rigantestools_Constant.VERSION_NUMBER = 300;

/**
 * Preferences
 * 
 * @constant
 */
rigantestools_Constant.PREF_CURRENT_VERSION = "extensions.rigantestools.currentVersion";
rigantestools_Constant.PREF_ACCESS_STATUSBAR = "extensions.rigantestools.accessStatusBar";
rigantestools_Constant.PREF_XLS_EXPORT_FORMAT = "extensions.rigantestools.XLSExportFormat";
rigantestools_Constant.PREF_NOTIFICATION_NEW_ATTACK = "extensions.rigantestools.option.notificationNewAttack";
rigantestools_Constant.PREF_NOTIFICATION_NEW_MESSAGE = "extensions.rigantestools.option.notificationNewMessage";
rigantestools_Constant.PREF_NOTIFICATION_NEW_REPORT = "extensions.rigantestools.option.notificationNewReport";
rigantestools_Constant.PREF_NOTIFICATION_NEW_ALLY_MESSAGE = "extensions.rigantestools.option.notificationNewAllianceMessage";
rigantestools_Constant.PREF_NOTIFICATION_MISSION_DONE = "extensions.rigantestools.option.notificationHabitatesMissions";
rigantestools_Constant.PREF_NOTIFICATION_TRANSIT_DONE = "extensions.rigantestools.option.notificationHabitatesTransits";
rigantestools_Constant.PREF_NOTIFICATION_UNIT_DONE = "extensions.rigantestools.option.notificationUnitOrder";
rigantestools_Constant.PREF_NOTIFICATION_KNOWLEDGE_DONE = "extensions.rigantestools.option.notificationKnowledgeOrder";
rigantestools_Constant.PREF_NOTIFICATION_BUILDING_DONE = "extensions.rigantestools.option.notificationBuildingOrder";
rigantestools_Constant.PREF_CASTLES_AREA = "extensions.rigantestools.option.castlesArea";
rigantestools_Constant.PREF_TIME_AREA = "extensions.rigantestools.option.area";
rigantestools_Constant.PREF_NB_MIN_SPEARMAN_DEFENSE = "extensions.rigantestools.option.nbMinSpearmanDefense";
rigantestools_Constant.PREF_NB_MIN_CROSSBOWMAN_DEFENSE = "extensions.rigantestools.option.nbMinCrossbowmanDefense";
rigantestools_Constant.PREF_NB_MIN_SCORPIONRIDER_DEFENSE = "extensions.rigantestools.option.nbMinScorpionRiderDefense";

/**
 * Oberver
 * 
 * @constant
 * 
 */
rigantestools_Constant.OBSERVER = {
    REFRESH : "rigantestools.refresh"
};

/**
 * The string bundle info
 *
 * @constant
 *
 */
rigantestools_Constant.STRING_BUNDLE = {
    DEFAULT_URL : "chrome://rigantestools/locale/rigantestools.properties"
};

/**
 * List of battle type
 * 
 * @constant
 */
rigantestools_Constant.BATTLETYPE = {
    OWN_HABITAT : 0,
    EXTERNAL_UNITS_TO_DEFENSE : 1,
    ATTACKER : 2
};

/**
 * List of transit type
 * 
 * @constant
 */
rigantestools_Constant.TRANSITTYPE = {
    DEFENSE : 0,
    TRANSIT_DEFENSE : 1,
    ATTACKER : 2,
    TRANSIT_ATTACKER : 3,
    TRANSPORT : 4,
    TRANSIT_TRANSPORT : 5,
    SPY : 6,
    TRANSIT_SPY : 7
};
/**
 * List of unit type
 * 
 * @constant
 */
rigantestools_Constant.UNITTYPE = {
    'SPEARMAN' : 'Spearman',
    'SWORDMAN' : 'Swordman',
    'ARCHER' : 'Archer',
    'CROSSBOWMAN' : 'Crossbowman',
    'SCORPIONRIDER' : 'Scorpion Rider',
    'LANCER' : 'Lancer',
    'PUSHCART' : 'Pushcart',
    'OXCART' : 'Oxcart'
};

/**
 * List of battle units values
 * 
 * @constant
 */
rigantestools_Constant.BATTLEVALUES = {
    'SPEARMAN' : {
        'off' : {
            'inf' : 7,
            'art' : 5,
            'cav' : 12
        },
        'def' : {
            'inf' : 30,
            'art' : 19,
            'cav' : 56
        },
        'speed' : 700
    },
    'SWORDMAN' : {
        'off' : {
            'inf' : 39,
            'art' : 24,
            'cav' : 57
        },
        'def' : {
            'inf' : 24,
            'art' : 12,
            'cav' : 36
        },
        'speed' : 800
    },
    'ARCHER' : {
        'off' : {
            'inf' : 60,
            'art' : 20,
            'cav' : 10
        },
        'def' : {
            'inf' : 30,
            'art' : 14,
            'cav' : 10
        },
        'speed' : 500
    },
    'CROSSBOWMAN' : {
        'off' : {
            'inf' : 21,
            'art' : 15,
            'cav' : 9
        },
        'def' : {
            'inf' : 87,
            'art' : 57,
            'cav' : 31
        },
        'speed' : 600
    },
    'SCORPIONRIDER' : {
        'off' : {
            'inf' : 14,
            'art' : 24,
            'cav' : 21
        },
        'def' : {
            'inf' : 26,
            'art' : 57,
            'cav' : 35
        },
        'speed' : 300
    },
    'LANCER' : {
        'off' : {
            'inf' : 33,
            'art' : 99,
            'cav' : 57
        },
        'def' : {
            'inf' : 12,
            'art' : 24,
            'cav' : 15
        },
        'speed' : 400
    },
    'PUSHCART' : {
        'off' : {
            'inf' : 0,
            'art' : 0,
            'cav' : 0
        },
        'def' : {
            'inf' : 0,
            'art' : 0,
            'cav' : 0
        },
        'speed' : 800

    },
    'OXCART' : {
        'off' : {
            'inf' : 0,
            'art' : 0,
            'cav' : 0
        },
        'def' : {
            'inf' : 0,
            'art' : 0,
            'cav' : 0
        },
        'speed' : 1000

    }
};

/**
 * List of type of habitat modification
 * 
 * @constant 0 -> pay less (unit, building, knowledge, mission) 1 -> build faster (unit, building, knowledge) 2 -> store more (unit, building) 3 -> generate more (building, mission) 4 -> attack
 *           stronger (unit, building) 5 -> defend stronger (unit, building) 6 -> move faster (unit, mission)
 */
rigantestools_Constant.MODIFIERTYPE = {
    BUILDCOST : 0,
    BUILDSPEED : 1,
    AMOUNTSTORE : 2,
    AMOUNTGENERATE : 3,
    OFFENSE : 4,
    DEFENSE : 5,
    MOVEMENTSPEED : 6
};

/**
 * List of type of habitat resources
 * 
 * @constant
 */
rigantestools_Constant.RESOURCETYPE = {
    WOOD : 0,
    STONE : 1,
    ORE : 2,
    SUBJECT : 3,
    BRONZE : 4,
    ARGENT : 5
};

/**
 * Freeze the interface
 */
Object.freeze(rigantestools_Constant);
