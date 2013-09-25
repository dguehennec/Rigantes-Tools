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
 * The Class Constant.
 * 
 * @constructor
 * @this {Constant}
 */
if (!com.rigantestools.constant) {
    com.rigantestools.constant = {};
}

/**
 * Logger level
 * 
 * @constant
 */
com.rigantestools.constant.LOGGER_LEVEL = 0;
/**
 * Version
 * 
 * @constant
 */
com.rigantestools.constant.VERSION = "2.3.1";
com.rigantestools.constant.VERSION_NUMBER = 231;

/**
 * Preferences
 * 
 * @constant
 */
com.rigantestools.constant.PREF_CURRENT_VERSION = "extensions.rigantestools.currentVersion";
com.rigantestools.constant.PREF_ACCESS_STATUSBAR = "extensions.rigantestools.accessStatusBar";
com.rigantestools.constant.PREF_XLS_EXPORT_FORMAT = "extensions.rigantestools.XLSExportFormat";
com.rigantestools.constant.PREF_NOTIFICATION_NEW_ATTACK = "extensions.rigantestools.option.notificationNewAttack";
com.rigantestools.constant.PREF_NOTIFICATION_NEW_MESSAGE = "extensions.rigantestools.option.notificationNewMessage";
com.rigantestools.constant.PREF_NOTIFICATION_NEW_REPORT = "extensions.rigantestools.option.notificationNewReport";
com.rigantestools.constant.PREF_NOTIFICATION_NEW_ALLY_MESSAGE = "extensions.rigantestools.option.notificationNewAllianceMessage";
com.rigantestools.constant.PREF_NOTIFICATION_MISSION_DONE = "extensions.rigantestools.option.notificationHabitatesMissions";
com.rigantestools.constant.PREF_NOTIFICATION_TRANSIT_DONE = "extensions.rigantestools.option.notificationHabitatesTransits";
com.rigantestools.constant.PREF_NOTIFICATION_UNIT_DONE = "extensions.rigantestools.option.notificationUnitOrder";
com.rigantestools.constant.PREF_NOTIFICATION_KNOWLEDGE_DONE = "extensions.rigantestools.option.notificationKnowledgeOrder";
com.rigantestools.constant.PREF_NOTIFICATION_BUILDING_DONE = "extensions.rigantestools.option.notificationBuildingOrder";
com.rigantestools.constant.PREF_CASTLES_AREA = "extensions.rigantestools.option.castlesArea";
com.rigantestools.constant.PREF_TIME_AREA = "extensions.rigantestools.option.area";
com.rigantestools.constant.PREF_NB_MIN_SPEARMAN_DEFENSE = "extensions.rigantestools.option.nbMinSpearmanDefense";
com.rigantestools.constant.PREF_NB_MIN_CROSSBOWMAN_DEFENSE = "extensions.rigantestools.option.nbMinCrossbowmanDefense";
com.rigantestools.constant.PREF_NB_MIN_SCORPIONRIDER_DEFENSE = "extensions.rigantestools.option.nbMinScorpionRiderDefense";

/**
 * Oberver
 * 
 * @constant
 * 
 */
com.rigantestools.constant.OBSERVER = {
    REFRESH : "rigantestools.refresh"
};

/**
 * List of battle type
 * 
 * @constant
 */
com.rigantestools.constant.BATTLETYPE = {
    OWN_HABITAT : 0,
    EXTERNAL_UNITS_TO_DEFENSE : 1,
    ATTACKER : 2
};

/**
 * List of transit type
 * 
 * @constant
 */
com.rigantestools.constant.TRANSITTYPE = {
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
com.rigantestools.constant.UNITTYPE = {
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
com.rigantestools.constant.BATTLEVALUES = {
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
    }
};

/**
 * List of type of habitat modification
 * 
 * @constant 0 -> pay less (unit, building, knowledge, mission) 1 -> build
 *           faster (unit, building, knowledge) 2 -> store more (unit, building)
 *           3 -> generate more (building, mission) 4 -> attack stronger (unit,
 *           building) 5 -> defend stronger (unit, building) 6 -> move faster
 *           (unit, mission)
 */
com.rigantestools.constant.MODIFIERTYPE = {
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
com.rigantestools.constant.RESOURCETYPE = {
    WOOD : 0,
    STONE : 1,
    ORE : 2,
    SUBJECT : 3,
    BRONZE : 4,
    ARGENT : 5
};