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
 * @param {Player}
 *            player the player
 */
 
 



var rigantestools_FightPreview = function( habitat, listud, battleDate )  {
	this._logger = new rigantestools_Logger("rigantestools_FightPreview");
 	this._logger.trace("init");

	var comment = "" ;
	var nbcomment = 0 ;
	var stepDuration = 600;

	var minu ;
	var minrenfort ;
	
	if( 0  ) { minu=250 ; minrenfort = 128 ; } //BattleServer 
	else { minu=100 ; minrenfort = 52 ; }


	var mytime = battleDate.getTime() ;
 	var listud_orig = this.CloneUDListe(listud) ;
	var starttime = mytime ;
	var mydate = new Date( mytime )

	var seq_n = 1 ;
	var seq_t0 = mydate ;
	var seq_t1 = mydate ;
	var seq_res = "Ok" ;
	var last_result = "Ok" ;
	var totalnbud = this.countUnitsWithModifiers( listud_orig, 0 ) ;
	var done = 0 ;
	var index=0 ;
	var trou_nbud = 0 ;
 	
	this.fightpreview_trou = null ;
	this.fightpreview_trou_nbud = 0 ;
	this.fightpreview_dltime = 0 ;

	this.bufferRound = [] ;

	var now = new Date() ;
	var previous_nbud = this.countUnits( listud, now.getTime() ) ;

	while( done==0 )
	{

		var nbud = this.countUnits( listud, mytime ) ;
		var result ;
		
		if( nbud >= minu ) result = "Ok" ;
		else 
		{
			result = "!TROU!" ;
			if( this.fightpreview_trou === null )
			{
				this.fightpreview_trou = mydate ;
				this.fightpreview_dltime  = mytime - starttime ;
			}
			trou_nbud = this.countUnitsWithModifiers( listud_orig, mytime ) ;
		}
		
		if( result != last_result )
		{
//			if( nbcomment < 3 )
//			{
//				comment = comment + this.formatTime(seq_t0) + " - " + this.formatTime(seq_t1) + " : " + seq_res + "\n" ;
//				seq_t0 = mydate ;
//				seq_t1 = mydate ;
//				seq_res = result ;
//				nbcomment = nbcomment+1 ;
//			}
			
			if( nbcomment < 2 )
			{
				if( nbcomment==0 )
				{
					comment = this.formatTime(seq_t0) + " - " + this.formatTime(seq_t1) + " ok" ;
					comment = "Safe jusqu'a " + this.formatTime(seq_t1) ; 
				}
				else 
				{
					if( seq_t0 === seq_t1 )
					{
						comment = comment + ". Trou a " + this.formatTime(seq_t0) ;
					}
					else
					{
						comment = comment + ". Trou de " + this.formatTime(seq_t0) + " a " + this.formatTime(seq_t1) ;
					}
					this.fightpreview_trou_nbud = trou_nbud ;
					var nbudrest = totalnbud-trou_nbud ;
					if( nbudrest >= 1000 )
					{
						comment = comment +"\n" + trou_nbud + " UD avant le trou, " + nbudrest + " apres"  ;
					}
				}
				seq_t0 = mydate ;
				seq_t1 = mydate ;
				seq_n = 1 ;
				seq_res = result ;
				nbcomment = nbcomment+1 ;
			}				
			
//			if( nbud < minu )
//			{
//				var k ;
//				int nb = Math.floor(minrenfort/2) ; 
//				int arrival = seq_t1 ;
//				for( k=0; k<seq_n; ++k )
//				{
//					var item = {'nb':nb,'type':com.rigantestools.constant.UNITTYPE.SCORPIONRIDER,'time':0};
//					listud.push(item);
//					nb = Math.trunc(nb/2) ; 
//					if( nb === 0 ) break ;
//				}
//			}

		}
		else
		{
			seq_t1 = mydate ;
			seq_n = seq_n + 1 ;
		}
		last_result = result ;
		
		var issue = ( result != "Ok" ? true : false ) ;
 		var item = {'date':mydate,'unitCount':nbud,'newUnitCount':nbud-previous_nbud, 'issue':issue};
		this.bufferRound.push( item ) ;
 
		

		
		if( result != "Ok" && done !== true && this.moreArrivingUnits(listud, mytime) )
		{
			var nb = minrenfort ; 
			var item = {'nb':nb,'type':rigantestools_Constant.UNITTYPE.SCORPIONRIDER,'time':mytime};
			listud.push(item);
		}
		
		
		this.resolveRound( listud, mytime, minu ) ;
		previous_nbud = this.countUnits( listud, mytime ) ;
		
		if( this.moreArrivingUnits(listud, mytime)==false && previous_nbud==0 ) done = true ;


		
		index = index+1 ;
		mytime = mytime + stepDuration * 1000 ;
		mydate = new Date( mytime )
	}		

	if( this.fightpreview_trou === null )
	{
		this.fightpreview_trou = mydate ;
		this.fightpreview_dltime  = mytime - starttime ;
		this._logger.info( "mytime="+mytime+" starttime="+starttime ) ;
	}

	this.comment = comment ;
}

	 	

rigantestools_FightPreview.prototype.formatTime = function(date) {
    if (date === null) {
        return "";
    }

    var e = (date.getHours() < 10) ? "0" + date.getHours() : date.getHours();
    var f = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();
    return e + ":" + f;
};


rigantestools_FightPreview.prototype.countUnitsWithModifiers = function( listud, time )
{
    var index;
    var nb = 0;
    for (index = 0; index < listud.length; index++) 
    {
     	if( time==0 || listud[index].time <= time ) 
     	{

			if( listud[index].type == rigantestools_Constant.UNITTYPE.SWORDMAN ) nb = nb + Math.round(listud[index].nb/2) ;
			else if( listud[index].type == rigantestools_Constant.UNITTYPE.ARCHER ) nb = nb + Math.round(listud[index].nb/3) ;
 			else if( listud[index].type == rigantestools_Constant.UNITTYPE.LANCER ) nb = nb + Math.round(listud[index].nb/3) ;
			else nb = nb + listud[index].nb ;     		
     	}
    }
	return nb ;	
 
};


rigantestools_FightPreview.prototype.countUnits = function( listud, time )
{
    var index;
    var nb = 0;
    for (index = 0; index < listud.length; index++) 
    {
     	if( listud[index].time <= time ) nb = nb + listud[index].nb ;

    }
	return nb ;
}	

rigantestools_FightPreview.prototype.CloneUDListe = function( listud )
{
	var list = [] ;
    var index ;
    for (index = 0; index < listud.length; index++) 
    {
     	var old = listud[index] ;
		var item = {'nb':old.nb,'type':old.type,'time':old.time};
		list.push(item) ;
    }
	return list ;
}		



rigantestools_FightPreview.prototype.moreArrivingUnits = function( listud, time )
{
    var index;
    for (index = 0; index < listud.length; index++) 
    {
     	if( listud[index].time > time ) return true ;

    }
	return false ;
}



rigantestools_FightPreview.prototype.moreArrivingUnitsOld = function( listud, time )
{
	if( listud.length==0 ) return false ;
	if( listud[listud.length-1].time > time ) return true ;
	return false ;
}

rigantestools_FightPreview.prototype.resolveRound = function( listud, time, minu )
{
    var index;
    var nb = this.countUnits( listud, time ) ;
    for (index = 0; index < listud.length; index++) 
    {
     	if( listud[index].time <= time ) 
     	{
     		if( nb < minu ) listud[index].nb = 0 ;
     		else listud[index].nb = Math.floor( listud[index].nb / 2 ) ;
     	}
    }
}


Object.freeze(rigantestools_FightPreview);




