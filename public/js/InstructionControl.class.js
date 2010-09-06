/*
Copyright (C) 2010 Matthew Forrester.

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
*/

/**
 * File: InstructionControl.class.js
 *
 * A collection of tightly bound classes for easily dealing with multi client
 * screen syncing.
 */

// =============================================================================
// These functions are bound to thier proper places and are not designed to be
// used directly. See the class before "__" in the function name for 
// documentation
// =============================================================================

function InstructionClient__refreshUserList(userListDoc) {
	userList = InstructionControl.getReturnDocumentBody(userListDoc);
	var icInst = InstructionControl.getInstance();
	var lst = icInst.getClientInstance()._getOnlineUserCommunicationKeys();
	var icKnowsAbout = InstructionControl._getKeys(icInst.getUserList());
	
	for (var i=0;i<lst.length;i++) {
		if (userList[lst[i]]) {
			var already = false;
			for (var j=0;j<icKnowsAbout.length;j++) {
				if (icKnowsAbout[j] == lst[i]) {
					already = true;
				}
			}
			if (!already) {
				icInst._addUser(lst[i],userList[lst[i]]);
				return InstructionClient__refreshUserList(userListDoc);
			}
		}
	}
}

/**
 * PrivateFunction: ajaxSlave_MooTools
 *
 * Abstraction of sending data to the server through MooTools
 * 
 * Parameters:
 *
 *	method - string: Either 'get' or 'post' basically.
 *	url - string:	The URL for the AJAX request.
 *	data - Object: The data to send to the server.
 *	function - function: successFunction Optional parameter that will be called upon success.
 */
function ajaxSlave_MooTools(method,url,data,successFunction) {
	var client = InstructionControl.getInstance().getClientInstance();
	var params = client._slaveGetParams(method,url,data,successFunction)
	new Request.JSON(params).send();
}

/**
 * PrivateFunction: ajaxSlave_jQuery
 *
 * Abstraction of sending data to the server through MooTools
 *
 * Parameters:
 *
 *	method - string: Either 'get' or 'post' basically.
 *	url - string:	The URL for the AJAX request.
 *	data - Object: The data to send to the server.
 *	successFunction - function: Optional parameter that will be called upon success.
 */
function ajaxSlave_jQuery(method,url,data,successFunction) {
	var client = InstructionControl.getInstance().getClientInstance();
	var params = client._slaveGetParams(method,url,data,successFunction);
	params['dataType'] = 'json';
	$.ajax(params);
}

/**
 * Class: Instruction
 * 
 * An instruction is the main data that is communicated and synced between the
 * clients.
 *
 * See Also:
 *
 *	<InstructionControl::bind> to bind functions to when new Instruction occur.
 *
 *	<InstructionClient::send> is probably the main way you will interact with and create Instruction.
 */
function Instruction(communicationKey,objectType,data,position) {
	this._init(communicationKey,objectType,data,position);
} Instruction.prototype = {
	/**
	 * Constructor: _init
	 *
	 * Constructor.
	 *
	 * Parameters:
	 *
	 *	communicationKey - string: The CommunicationKey of the user who added it. 
	 *	objectType - string: The type of object represented by this <Instruction>.
	 *	data - Object: The data within the object.
	 *	position - Number: The execution position of this <Instruction>.
	 */                        
	_init: function(communicationKey,objectType,data,position) {
		this._communicationKey = communicationKey;
		this._objectType = objectType;
		this._data = data;
		this._position = new Number(position);
	},
	/**
	 * Function: getCommunicationKey
	 *
	 * Returns:
	 *
	 *	String - The CommunicationKey of the user who created this Instruction.
	 */
	getCommunicationKey: function() {
		return this._communicationKey;
	},
	/**
	 * Function: getPosition
	 * 
	 * Returns:
	 *
	 *	Number - The position inside the Channel.
	 */
	getPosition: function() {
		return this._position;
	},
	/**
	 * Function: getData
	 * 
	 * Returns:
	 *
	 *	Object - The data that was sent to the server.
	 */
	getData: function() {
		return this._data;
	},
	/**
	 * Function: getObjectType
	 * 
	 * Returns:
	 *
	 *	String - The ObjectType of the Instruction.
	 */
	getObjectType: function() {
		return this._objectType;
	}
}

/**
 * Class: InstructionClient
 *
 * Sends and receives Instruction from the server.
 *
 * This is an interface, which actually is documented only and doesn't even
 * exist, because JS has no knowledge of interfaces.
 *
 * See Also:
 *
 *	<InstructionClient_Ape> and <InstructionClient_JustMe>.
 *
 * Interface:
 *
 *	Implemented by <InstructionClient_Ape> and <InstructionClient_JustMe>
 */
	/**
	 * Constructor: _init
	 *
	 * Constructor.
	 *
	 * Parameters:
	 *
	 *	channelset - string: The name of the channelset the user is looking at.
	 *	communicationKey - sting: The key used to idenify this user to other users.
	 *	slaveFunction - function: This function will be called when an Instruction
	 *		is sent to the server and is abstracted away due to code portability.
	 *		The function here should have the parameters method, url, data and
	 *		successFunction of which successFunction may or may not be defined.
	 *		There are basic examples of this provided in <ajaxSlave_MooTools> and
	 *		<ajaxSlave_jQuery>.
	 *	url - string: The main URL that we will use to communicate with the server.
	 *	options - Object:
	 * 
	 * See Also:
	 *
	 *	<ajaxSlave_jQuery> and <ajaxSlave_MooTools> for examples implementations of
	 *	the saveFunction parameter
	 */
	/**
	 * Function: getCommunicationKey
	 *
	 * Returns:
	 *
	 *	String - The users communication key.
	 */
	/**
	 * Function: join
	 *
	 * Called by <InstructionControl> when a Channel is joined.
	 *
	 * Parameters:
	 *
	 *	channel - string: The name of the channel to join.
	 */
	/**
	 * PrivateFunction: _attached
	 *
	 * Called by InstructionControl when an InstructionClient is attached to it.
	 */
	/**
	 * PrivateFunction: _slaveGetParams
	 *
	 * Both MooTools and jQuery have a certain amount of commonality in the options
	 * object, so this code is shared between both the AjaxSlaves
	 *
	 * Access:
	 *
	 *	Protected
	 *
	 * Parameters:
	 *
	 *	method - string: Either 'get' or 'post' basically.
	 *	url - string:	The URL for the AJAX request.
	 *	data - Object: The data to send to the server.
	 *	function - function: successFunction Optional parameter that will be called upon success.
	 *
	 */
	var InstructionClient__slaveGetParams = function(method,url,data,successFunction) {
		var params = {
			'method':method,
			'url':url,
			'data':data
		}
		if (successFunction) {
			params['onSuccess'] = successFunction;
			params['success'] = successFunction;
		}
		return params;
	}
	/**
	 * PrivateFunction: _refreshUserList
	 *
	 * Queries the PHP for a list of user information and will push new users into
	 * InstructionControl itself.
	 * 
	 * Access:
	 *
	 *	Protected
	 * 
	 * Parameters:
	 *
	 *	userList - Object: A list of users, the communication keys (without uniqueness) are the keys
	 */
	/**
	 * Function: updateMyUserDetails
	 *
	 * Updates the users details upto the server.
	 *
	 * Parameters:
	 *
	 *	data - Object: Key value pairs to set your details to.
	 */
	 var InstructionClient__updateMyUserDetails = function(details) {
		var send = {
			'_REQUEST_METHOD':'PUT',
			'details':details
		};
		var f = function(returnData) {
			var ck = InstructionControl.getInstance().getClientInstance().getCommunicationKey();
			var returnDoc = InstructionControl.getReturnDocumentBody(returnData);
			InstructionControl.getInstance()._fireUpdateMyDetails(ck,returnDoc['details']);
		};
		var url = this._baseUrl+'/'+this._channelset+'/user/me';
		this._slaveFunction('post',url,send,f);
	}
	/**
	 * PrivateFunction: _getOnlineUserCommunicationKeys
	 *
	 * Returns:
	 *
	 *	The communiction keys of all users on the current channelset.
	 */
	/**
	 * Function: send
	 *
	 * See Also:
	 *
	 *	<InstructionControl::send>
	 */
	var InstructionClient__loadChannel = function(channel) {
		var afterLoad = function(returnDocument) {
			var returnData = InstructionControl.getReturnDocumentBody(returnDocument);
			var returnMetaData = InstructionControl.getReturnDocumentMetaData(returnDocument);
			InstructionControl.getInstance()._fireStartLoading(returnMetaData['channel'],returnData.length);

			var queue = []
			for (var i=0;i<returnData.length;i++) {
				queue.push([
					returnMetaData['channel'],
					new Instruction(
						returnData[i]['communication_key'],
						returnData[i]['object_type'],
						returnData[i]['data'],
						returnData[i]['position']
					)
				]);
			}
			
			timeoutInterval = 100;
			timeoutPeriod = 50;
			
			var f = function() {
				var startTime = new Date().getTime();
				while (queue.length && ((new Date().getTime() - startTime < timeoutInterval) || (timeoutInterval == -1))) {
					var d = queue.shift();
					var i = d[1];
					var c = d[0];
					InstructionControl.getInstance()._addRecievedInstruction(c,i);
				}
				if (queue.length) {
					setTimeout(f,timeoutPeriod);
				} else {
					InstructionControl.getInstance()._fireFinishLoading(c);
				}
			};
			f();
		}
		var url = this._baseUrl+'/'+this._channelset+'/'+channel;
		this._slaveFunction('get',url,{},afterLoad);
	};



/**
 * Class: InstructionClient_Ape
 *
 * A client that communicates with an APE server.
 *
 * Implements:
 *	<InstructionClient>
 *
 * See Also:
 *
 *	<http://www.ape-project.org/>.
 */
function InstructionClient_Ape(channelset,communicationKey,slaveFunction,baseUrl,options) {
	this._init(channelset,communicationKey,slaveFunction,baseUrl,options);
} InstructionClient_Ape.prototype = {
	_init: function(channelset,communicationKey,slaveFunction,baseUrl,options) {
		this._slaveFunction = slaveFunction;
		this._baseUrl = baseUrl;
		this._channelset = channelset;
		this._communicationKey = communicationKey;
		this._activeUsers = [];
		this._usedConnectAttempt = [];
		this._options = options;
		this._joined = {},
		this._events = new InstructionEventProcessor();    
	},
	updateMyUserDetails: InstructionClient__updateMyUserDetails,
	getCommunicationKey: function() {
		return this._communicationKey;
	},
	_slaveGetParams: InstructionClient__slaveGetParams,
	join: function(channel) {
		this._join(channel);
		this._loadChannel(channel);
	},
	_loadChannel: InstructionClient__loadChannel,
	_getApeCommunctionKeyUniqueness: function() {
		var n = InstructionClient_Ape._notUsedNumber(this._usedConnectAttempt,100);
		
		if (n == -1) {
			InstructionControl.fatalError('Could not find available connection_key');
		}
		
		this._usedConnectAttempt.push(n);
		return n;
	},
	/**
	 * PrivateFunction: _apeErrorHandler
	 *
	 * When APE returns an error this function will be called, currently it's only
	 * use to the spot if a nickname has already been used and try again
	 * with added uniqueness
	 * 
	 * Access:
	 * 
	 *	Private
	 */
	_apeErrorHandler: function(raw,pipe) {
		if (raw.data.code == '007') { // Username already taken
			var me = InstructionControl.getInstance().getClientInstance();
			
			var ck = new String(me._communicationKey)+me._getApeCommunctionKeyUniqueness();
			me._ape.load({'connectOptions':{'name':ck}});                 
		} else {
			InstructionControl.fatalError('OTHER ERROR'+JSON.encode(raw)+JSON.encode(pipe));
		}
	},
	_getOnlineUserCommunicationKeys: function() {
		var r = [];
		for (var i=0;i<this._activeUsers.length;i++) {
			r.push(this._activeUsers[i].substr(0,12));
		}
		return r;
	},
	/**
	 * PrivateFunction: _getApe
	 *
	 * Will get the actual APE client.
	 * 
	 * Access:
	 *
	 *	Private
	 *
	 * Returns:
	 *
	 *	Ape.Client
	 *
	 * See Also:
	 *
	 *	<http://www.ape-project.org/docs/client/client/>
	 */
	_getApe: function() {
		return this._ape;
	},
	_attached: function() {
		this._ape = new APE.Client();
		
		this._ape.load({
			connectOptions: {'name': this._communicationKey+this._getApeCommunctionKeyUniqueness()}
		});
		this._ape.onRaw('ERR',this._apeErrorHandler);
		
		this._ape.addEvent('ready',function() {
			InstructionControl.getInstance()._fireClientReady();
		});
		
		this._ape.addEvent('userJoin',function(apeUser) {
			var me = InstructionControl.getInstance().getClientInstance();
			me._activeUsers.push(apeUser.properties.name);
			var url = me._baseUrl+'/'+me._channelset+'/user';
			me._slaveFunction('get',url,{},InstructionClient__refreshUserList);
		});
		
		this._ape.addEvent('userLeft',function(apeUser) {
			// Quick access to more common things
			var me = InstructionControl.getInstance().getClientInstance();
			rCKey = apeUser.properties.name;
			// remove the ape ref
			me._activeUsers = InstructionControl._arrayRemoveValue(me._activeUsers,rCKey);
			// now see if we actually have it without the uniqueness bit
			var rem = true;
			for (var i=0;i<me._activeUsers.length;i++) {
				if (me._activeUsers[i].substr(0,12) == rCKey.substr(0,12)) {
					rem = false;
				}
			}
			// Remove it if we should.
			if (rem) {
				InstructionControl.getInstance()._removeUser(rCKey.substr(0,12));
			}
		});
		
		this._ape.onRaw('instruction',function(returnDoc,pipe) {
			
			var _addInstruction = function(returnData) {
				var i = new Instruction(
					returnData.communication_key,
					returnData.object_type,
					returnData.data,
					returnData.position
					);
				InstructionControl.getInstance()._addRecievedInstruction(
					returnData.channel,
					i,
					i.getPosition()
					);
			};
			
			var _updateUser = function(returnData) {
				InstructionControl.getInstance()._fireUpdateUserDetails(
					returnData.communication_key,
					returnData.details
					);
			};
			
			var docType = InstructionControl.getReturnDocumentType(returnDoc.data)
			var returnData = InstructionControl.getReturnDocumentBody(returnDoc.data);
			
			if (docType == 'USER_DETAILS') {
				var me = InstructionControl.getInstance().getClientInstance();
				if (returnData.communication_key != me._communicationKey) { 
					return _updateUser(returnData);
				}
			}
			return _addInstruction(returnData);
		});

	},
	_join: function(channel) {
		var commChannel = this._channelset+'_'+channel;
		if ((this._getApe().core != undefined) && (!this._joined[channel])) {
			this._getApe().core.join(commChannel);
			this._joined[channel] = 1;
		}
	},
	send: function(channel,objectType,data) {
		var send = {
			'object_type': objectType,
			'data': data,
			'_REQUEST_METHOD':'POST'
		};
		var f = function(returnDoc) {
			var client = InstructionControl.getInstance().getClientInstance();
			var returnData = InstructionControl.getReturnDocumentBody(returnDoc);
			InstructionControl.getInstance()._fireSent(returnData.channel,returnData.position);
		};
		var url = this._baseUrl+'/'+this._channelset+'/'+channel;
		this._slaveFunction('post',url,send,f);
	}
}

/**
 * PrivateFunction: _notUsedNumber
 *
 * Utility function to find a number less than or equal to max that is not
 *	in an array.
 * 
 * Access:
 *
 *	Private
 * 
 * Parameters:
 *
 *	usedArray - Array: The array to find an unused value from.
 *	max - Number: The highest value acceptable.
 */
InstructionClient_Ape._notUsedNumber = function(usedArray,max) {
	var seek = 0;
	var found = false;
	var attempted = [];
	while (!found) {
		seek = Math.floor(Math.random()*(max+1));
		found = true;
		for (var i=0;i<usedArray.length;i++) {
			if (seek == usedArray[i]) {
				found = false;
			}
		}
		if (attempted.length >= max+1) {
			return -1;
		}
		attempted = InstructionControl._arrayRemoveValue(attempted,seek);
		attempted.push(seek);
	}
	return seek;
}

/**
 * Class: InstructionClient_JustMe
 *
 * This class will only send Instructions to PHP classes through AJAX, it
 * implements InstructionClient.
 *
 * Implements:
 *
 *	<InstructionClient>
 */
function InstructionClient_JustMe(channelset,communicationKey,slaveFunction,baseUrl,options) {
	this._init(channelset,communicationKey,slaveFunction,baseUrl,options);
} InstructionClient_JustMe.prototype = {
	_init: function(channelset,communicationKey,slaveFunction,baseUrl,options) {
		this._baseUrl = baseUrl;
		this._channelset = channelset;
		this._options = options;
		this._communicationKey = communicationKey;
		this._slaveFunction = slaveFunction;
		this._events = new InstructionEventProcessor();
		this._joined = false;
	},
	updateMyUserDetails: InstructionClient__updateMyUserDetails,
	getCommunicationKey: function() {
		return this._communicationKey;
	},
	_slaveGetParams: InstructionClient__slaveGetParams,
	join: InstructionClient__loadChannel,
	_getOnlineUserCommunicationKeys: function() {
		return new Array(this._communicationKey);
	},
	_join: function (channel) {},
	_attached: function() {	
		if (this._joined == false) {
			this._joined = true;
			var url = this._baseUrl+'/'+this._channelset+'/user';
			this._slaveFunction('get',url,{},InstructionClient__refreshUserList);
		}
		InstructionControl.getInstance()._fireClientReady();
	},
	send: function(channelname,objectType,data) {
		var send = {
			'object_type': objectType,
			'data': data,
			'_REQUEST_METHOD':'POST'
		};

		var f = function(returnDoc) {
			var returnData = InstructionControl.getReturnDocumentBody(returnDoc);
			var i = new Instruction(
				returnData.communication_key,
				returnData.object_type,
				returnData.data,
				returnData.position
				);
			var client = InstructionControl.getInstance().getClientInstance();
			InstructionControl.getInstance()._fireSent(returnData.channel,returnData.position);
			InstructionControl.getInstance()._addRecievedInstruction(
				returnData.channel,
				i,
				returnData.position
				);
		};
		var url = this._baseUrl+'/'+this._channelset+'/'+channelname;
		return this._slaveFunction('post',url,send,f);
	}
}

/**
 * Class: InstructionQueue
 *
 * Simple class for dealing with a getting Instructions ready for processing.
 */
function InstructionQueue() {
	this._init();
} InstructionQueue.prototype = {
	/**
	 * Constructor: _init
	 *
	 * Constructor.
	 */
	_init: function() {
		this._queue = new Array();
		this._position = -1;
	},
	/**
	 * Function: add
	 *
	 * Adds an Instruction onto the Queue, previous Instruction do not have to
	 * already be on the queue, but it will not be gettable until they are.
	 *
	 * 
	 * Parameters:
	 *
	 *	instruction - Instruction: The instruction to add to the queue
	 *
	 * See Also:
	 *
	 *	<InstructionQueue::getNextForProcessing> for retrieval.
	 */
	add: function(instruction) {
		var position = instruction.getPosition();
		while (this._queue.length < position+1) {
			this._queue.push(null);
		}
		if (this._queue[position] == null) {
			this._queue[position] = instruction;
			return true;
		}
		return false;
	},
	/**
	 * Function: getNextForProcessing
	 *
	 * Gets the next Instruction that is processable (IE all previous ones have
	 * been already requested (and by inferance have been processed).
	 *
	 * Returns:
	 *
	 *	Instruction
	 *
	 * See Also:
	 *
	 *	<Instruction>
	 */
	getNextForProcessing: function() {
		if (this._position+1 >= this._queue.length) {
			return null;
		}
		if (this._queue[this._position+1] != null)
		{
			return this._queue[++this._position];
		}
		return null;
	},
	/**
	 * Function: getPosition
	 *
	 * Returns:
	 *
	 *	Number - The position of the Instruction that has just been retrieved 
	 *	from the InstructionQueue.
	 */
	getPosition: function(position) {
		return this._queue[position];
	}
}

/**
 * Class: InstructionEventProcessor
 *
 * A centralised way for handling events.
 */
function InstructionEventProcessor() {
	this._init();
} InstructionEventProcessor.prototype = {
	/**
	 * Constructor: _init
	 *
	 * Constructor.
	 */
	_init: function() {
		this._binds = {};
	},
	/**
	 * PrivateFunction: reset
	 *
	 * Will reset the whole instance, removing binds and everything else. 
	 */
	reset: function() {
		var keys = InstructionControl._getKeys(this._binds);
		for (var i=0;i<keys.length;i++) {
			delete this._binds[keys[i]];
		}
	},
	/**
	 * Function: bind
	 *
	 * Adds an callback function to be called when `eventName` is fired.
	 *
	 * 
	 * Parameters:
	 *
	 *	eventName - String: The name of the event you wish to capture
	 *	func - function: The function that will be fired for that event
	 *
	 */
	bind: function(eventName,func) {
		if (!this._binds.hasOwnProperty(eventName)) {
			this._binds[eventName] = new Array();
		}
		this._binds[eventName].push(func);
	},
	/**
	 * Function: getBindsFor
	 *
	 * Will retrieve all functions that are bound to a specific event
	 *
	 * 
	 * Parameters:
	 *
	 *	eventName - string: The event name to get the bound functions for
	 *
	 * Returns:
	 *
	 *	Array - The functions bound to the event
	 */
	getBindsFor: function(eventName) {
		if (this._binds.hasOwnProperty(eventName)) {
			return this._binds[eventName];
		}
		return new Array();
	},
	/**
	 * Function: fire
	 *
	 * Will fire an event
	 *
	 * 
	 * Parameters:
	 *
	 *	eventName - string: The name of the event to fire
	 */
	fire: function(eventName,data) {
		var keys = InstructionControl._getKeys(this._binds);
		var functions = this._binds[eventName];
		if (functions) {
			for (var j=0;j<functions.length;j++) {
				var f = functions[j];
				f(data);
			}
		}
	},
	/**
	 * Function: removeEvent
	 *
	 * Will remove all binds for a specific event.
	 *
	 * Parameters:
	 *
	 *	eventName - String: The event to remove events for.
	 */
	removeEvent: function(eventName) {
		delete this._binds[eventName];
	}
}

/**
 * Class: InstructionControl
 *
 * This is the main class, which serves as both Factory and most of the  inner
 * workings.
 */
function InstructionControl() {
	this._init();
} InstructionControl.prototype = {
	/**
	 * Constructor: _init
	 *
	 * Constructor.
	 */
	_init: function() {
		this._instructionChannels = {};
		this._eventProcessor = new InstructionEventProcessor();
		this._users = {};
		this._paused = [];
		this._clientReady = false;
	},
	/**
	 * Function: setClient
	 *
	 * Will attach an InstructionClient.
	 *
	 * Parameters:
	 *
	 *	client - InstructionClient
	 */
	setClient: function(client) {
		this._client = client;
		this._client._attached();
	},
	/**
	 * PrivateFunction: _joinInstructionChannel
	 *
	 * Adds an InstructionChannel to the InstructionControl.
	 *
	 * Access:
	 *
	 *	Private
	 * 
	 * Parameters:
	 *
	 *	name - String: The name of the channel to join.
	 */
	_joinInstructionChannel: function(name) {
		if (!this._instructionChannels[name])
		{
			this._instructionChannels[name] = {};
			this._instructionChannels[name]['queue'] = new InstructionQueue();
			// If there is no client yet, don't worry, we'll get it later and it
			// will resync itself (once).
			if (this.getClientInstance() == undefined)
			{
				InstructionControl.fatalError('Trying to join channels before client ready');
			}
			this.getClientInstance()._join(name);
		}
	},
	/**
	 * PrivateFunction: _getNextInstruction
	 *
	 * This will get the next Instruction that needs processing.
	 *
	 * Access:
	 *
	 *	Private
	 *                                                          
	 * 
	 * Parameters:
	 *
	 *	channelname - String: The name of the channel to get the next instruction for
	 *
	 * Returns:
	 *
	 *	Instruction due for processing next, or null if none is.
	 */
	_getNextInstruction: function(channelname) {
		var q = this._instructionChannels[channelname]['queue'];
		return q.getNextForProcessing();
	},
	/**
	 * Function: pause
	 *
	 * Pauses execution of a specific channel.
	 *
	 * Parameters:
	 *	
	 *	channelname - String: The name of the channel to pause
	 */
	pause: function(channelname) {
		this._paused.push(channelname);
	},
	/**
	 * Function: resume
	 *
	 * Continues execution of a specific channel.
	 *
	 * Parameters:
	 *	
	 *	channelname - String: The name of the channel to pause
	 */
	resume: function(channelname) {
		this._paused = InstructionControl._arrayRemoveValue(this._paused,channelname);
		this._process(channelname);
	},
	/**
	 * PrivateFunction: _process
	 * 
	 * Will process Instruction from a specific InstructionChannel.
	 * 
	 * Access:
	 * 
	 *	Private
	 * 
	 * Parameters:
	 * 
	 *	channelname - String: The channel that we want to be processed.
	 * 
	 * Returns:
	 * 
	 *	Boolean - true normally, false if paused
	 */
	_process: function(channelname) {
		if (!this._clientReady) {
			return false;
		}
		if (InstructionControl._inArray(this._paused,channelname)) {
			return false;
		}
		var instruction = this._getNextInstruction(channelname);
		while (instruction) {
			var bindKeys = new Array();
			bindKeys.push(this._getBindKeyForDataAdd(channelname,instruction.getObjectType()));
			bindKeys.push(this._getBindKeyForDataAdd(channelname,'*'))
			for (var i=0;i<bindKeys.length;i++)
			{
				this._eventProcessor.fire(bindKeys[i],instruction);
			}
			if (InstructionControl._inArray(this._paused,channelname)) {
				return false;
			}
			instruction = this._getNextInstruction(channelname);
		}
		return true;
	},
	/**
	 * PrivateFunction: _getBindKeyForDataAdd 
	 *
	 * Access:
	 *
	 *	Private
	 * 
	 * Retrieve the name of the main data event store
	 */
	_getBindKeyForDataAdd: function(channel,objectType) {
		return 'dataAdd_channel='+channel+',objectType='+objectType;
	},
	/**
	 * PrivateFunction: _getChannelNames
	 *
	 * Access:
	 *
	 *	Internal
	 *
	 * Returns:
	 *
	 *	Array containing the names of channels this <InstructionControl> is handling.
	 */
	_getChannelNames: function() {
		var r = new Array();
		for (c in this._instructionChannels) {
			r.push(c);
		}
		return r;
	},
	/**
	 * Function: bind
	 *
	 * Registers a callback to occur when a new Instruction is added.
	 *
	 * 
	 * Parameters:
	 *
	 *	instructionChannelName - String: The name that the Instruction must be
	 *		in if func is to be executed.
	 *	objectType - String: The type of Instruction required for func to be executed.
	 *	func - Function: The function to execute should the other parameters match.
	 *
	 * Callback Signature:
	 *
	 * > func(instruction)
	 *
	 *	instruction - Instruction: The Instruction that was just added
	 *
	 * See Also:
	 *
	 *	<Instruction>
	 */
	bind: function(channelname,objectType,func) {
		var bindKey = this._getBindKeyForDataAdd(channelname,objectType);
		this._eventProcessor.bind(bindKey,func);
	},
	/**
	 * PrivateFunction: _addRecievedInstruction
	 *
	 * Access:
	 *
	 *	Internal
	 *
	 * Used by <InstructionClient> to add things to the process queue.
	 *
	 * 
	 * Parameters:
	 *
	 *	channelname - string: The name of the channel that the Instruction resides in.
	 *	receivedInstruction - Instruction: The Instruction that has just been
	 *		processed by the server.
	 *	position - Number: The position of the receivedInstruction in the channel.
	 */
	_addRecievedInstruction: function(channelname,receivedInstruction) {
		this._joinInstructionChannel(channelname);
		this._instructionChannels[channelname]['queue'].add(receivedInstruction);
		this._process(channelname);
	},
	/**
	 * Function: getClientInstance
	 *
	 * Used for getting <InstructionClient>.
	 *
	 * Returns:
	 *
	 *	InstructionClient instance.
	 */
	getClientInstance: function() {
		return this._client;
	},
	/**
	 * Function: join
	 *
	 * Join a channel to recieve data from.
	 *
	 * Parameters:
	 *
	 *	channel - String: The name of a channel.
	 */
	join: function(channel) {
		this.getClientInstance().join(channel);
	},
	/**
	 * PrivateFunction: _addUser
	 *
	 * Adds a user to InstructionControl, will fire the userJoined event also.
	 *
	 * Access:
	 *
	 *	Internal
	 * 
	 * Parameters:
	 *
	 *	userRef - String: The communication key without uniqueness.
	 *	userInformation - Object: Extra information about the User
	 */
	_addUser: function(userRef,userInformation) {
		this._users[userRef] = userInformation;
		var funcs = this._eventProcessor.getBindsFor('InstructionControl.userJoined');
		for (var i=0;i<funcs.length;i++) {
			var f = funcs[i];
			f(userRef,userInformation);
		}
	},
	/**
	 * PrivateFunction: _removeUser
	 *
	 * Removes a user to InstructionControl, will fire the userLeft event also.
	 *
	 * Access:
	 *
	 *	Internal
	 * 
	 * Parameters:
	 *
	 *	userRef - String: The communication key without uniqueness.
	 *	userInformation - Object: Extra information about the User
	 */
	_removeUser: function(userRef) {
		delete this._users[userRef];
		this._eventProcessor.fire('InstructionControl.userLeft',userRef);
	},
	/**
	 * Function getUserList
	 *
	 * Will list all users which are currently on the ChannelSet.
	 *
	 * @return Object The keys will be the communcation keys of the user 
	 *	(without uniqueness) and the value will be any extra information.
	 */
	getUserList: function() {
		return this._users;
	},
	/**
	 * Function: bindUserJoined
	 *
	 * Bind a function to be called when users join the ChannelSet.
	 *
	 * Parameters:
	 *
	 *	func - function: The parameters of the function will be the 
	 *	communcation key and extra information.
	 *
	 * Callback Signature:
	 *
	 * > func(communicationKey,details)
	 *
	 *  communicationKey - String: The CommunicationKey of the new User.
	 *	details - Object: The publically accessible properties of that User.
	 */
	bindUserJoined: function(func) {
		this._eventProcessor.bind('InstructionControl.userJoined',func);
	},
	/**
	 * Function: bindUserLeft
	 *
	 * Bind a function to be called when users leave the ChannelSet.
	 *
	 * 
	 * Parameters:
	 *
	 *	func - function: The only parameter of the function will be the 
	 *	communcation key.
	 *
	 * Callback Signature:
	 *
	 * > func(communicationKey)
	 *
	 *  communicationKey - String: The CommunicationKey of the User who left.
	 */
	bindUserLeft: function(func) {
		this._eventProcessor.bind('InstructionControl.userLeft',func);
	},
	/**
	 * Function: bindSent
	 * 
	 * Add an function to be fired when an Instruction has been sent to the
	 * server, which does not necessarily mean it has been recieved or even
	 * executed by the Clients.
	 *
	 * Parameters:
	 *
	 *	This - func: function will be executed, it should have just one
	 * 		parameter, which will be the position that has been reserved for it.
	 *
	 * Callback Signature:
	 *
	 * > func(channel,position)
	 *
	 *  channel - String: The name of the channel the Instruction was added to.
	 *	position - Number: The position that the Instruction was added in.
	 */
	bindSent: function(func) {
		this._eventProcessor.bind('InstructionControl.bindSent',func);
	},
	/**
	 * Function _fireSent
	 * 
	 * Used by clients to notify InstructionControl that an Instruction has been
	 * sent.
	 *
	 * Access:
	 *
	 *	Internal
	 */
	_fireSent: function(channel,pos) {                                             
		var funcs = this._eventProcessor.getBindsFor('InstructionControl.bindSent');
		for (var i=0;i<funcs.length;i++) {
			var f = funcs[i];
			f(channel,pos);
		}
	},
	/**
	 * Function: bindClientReady
	 *
	 * Bind a function to fire when the InstructionClient becomes ready.
	 *
	 * Parameters:
	 *
	 *	func - function: The function to fire
	 *
	 * Callback Signature:
	 *
	 * > func()
	 */
	bindClientReady: function(func) {
		this._eventProcessor.bind('InstructionControl.bindClientReady',func);
	},
	/**
	 * PrivateFunction: _fireClientReady
	 *
	 * Fires all functions from <InstructionControl::bindClientReady>
	 */
	_fireClientReady: function() {
		this._eventProcessor.fire('InstructionControl.bindClientReady');
		this._clientReady = true;
		var channelNames = this._getChannelNames();
		for (var i=0;i<channelNames.length;i++) {
			this._process(channelNames[i]);
		}
	},
	/**
	 * Function: clientIsReady
	 *
	 * Used for finding out if InstructionControl is ready for communication 
	 *	with the server 
	 *
	 * Returns:
	 *
	 *	boolean - True if ready.
	 */
	clientIsReady: function() {
		return this._clientReady;
	},
	/**
	 * Function: updateMyUserDetails
	 *
	 * Handles the complexities of updating your user details, firing the correct
	 * event to update your screen, and notifying all other users of the change.
	 *
	 * Parameters:
	 *
	 *	detailsToUpdate - Object: Properties to update
	 */
	updateMyUserDetails: function(detailsToUpdate) {
		this.getClientInstance().updateMyUserDetails(detailsToUpdate);
	},
	/**
	 * PrivateFunction: _internal_updateUserDetails
	 *
	 * Updates the details about users held.
	 *
	 * Parameters:
	 *
	 *	detailsToUpdate - Object: Properties to update
	 *	communicationKey - String: The communication key of the user who has been updated
	 */
	_internal_updateUserDetails: function(communicationKey,details) {
		this._users[communicationKey] = details;
	},
	/**
	 * Function: bindUpdateUserDetails
	 *
	 * Binds a function to be called when a different user (not yourself) updates
	 * their user details.
	 *
	 * Parameters:
	 *
	 *	func - fnction: The function to fire
	 *
	 * Callback Signature:
	 *
	 * > func(communicationKey,details)
	 *
	 *  communicationKey - String: The CommunicationKey of the user who has just
	 *		updated their user details.
	 *	details - Object: The publically accessible properties that were updated.
	 */
	bindUpdateUserDetails: function(func) {
		this._eventProcessor.bind('InstructionControl.bindUpdateUserDetails',func);
	},
	/**
	 * PrivateFunction: _fireUpdateUserDetails
	 *
	 * Access:
	 *
	 *	Internal
	 *
	 * Parameters:
	 *
	 *	communicationKey - String: The communication key of the user who has been updated
	 *	userProperties - Object: The properties of that user
	 *
	 */
	_fireUpdateUserDetails: function(communicationKey,details) {
		var funcs = this._eventProcessor.getBindsFor('InstructionControl.bindUpdateUserDetails');
		this._internal_updateUserDetails(communicationKey,details);
		for (var i=0;i<funcs.length;i++) {
			var f = funcs[i];
			f(communicationKey,details);
		}
	},
	/**
	 * PrivateFunction: _fireStartLoading
	 *
	 * Parameters:
	 *
	 *	channel - String: The channelname
	 *
	 */
	_fireStartLoading: function(channel,countOfInstruction) {
		var funcs = this._eventProcessor.getBindsFor('InstructionControl.bindStartLoading');
		for (var i=0;i<funcs.length;i++) {
			var f = funcs[i];
			f(channel,countOfInstruction);
		}
	},
	/**
	 * PrivateFunction: _fireFinishLoading
	 *
	 * Parameters:
	 *
	 *	channel - String: The channelname
	 *
	 */
	_fireFinishLoading: function(channel) {
		this._eventProcessor.fire('InstructionControl.bindFinishLoading',channel);
	},
	/**
	 * Function: bindStartLoading
	 *
	 * Binds a function to be called when loading of data from a specific
	 * channel is started.
	 *
	 * Parameters:
	 *
	 *	func - fnction: The function to fire
	 *
	 * Callback Signature:
	 *
	 * > func(channelName,count)
	 *
	 *  channelName - String: The name of the Channel that has finished loading.
	 *	count - Number: The number of Instruction within a given channel.
	 */
	bindStartLoading: function(func) {
		this._eventProcessor.bind('InstructionControl.bindStartLoading',func);
	},
	/**
	 * Function: bindFinishLoading
	 *
	 * Binds a function to be called when loading of data from a specific
	 * channel is finished.
	 *
	 * Parameters:
	 *
	 *	func - fnction: The function to fire
	 *
	 * Callback Signature:
	 *
	 * > func(channelName)
	 *
	 *  channelName - String: The name of the Channel that has finished loading.
	 */
	bindFinishLoading: function(func) {
		this._eventProcessor.bind('InstructionControl.bindFinishLoading',func);
	},
	/**
	 * Function: bindUpdateMyDetails
	 *
	 * Binds a function to be called when the user updates thier details.
	 *
	 * Parameters:
	 *
	 *	func - function: The function to fire
	 *
	 * Callback Signature:
	 *
	 * > func(communicationKey,details)
	 *
	 *  communicationKey - String: Your CommunicationKey.
	 *	details - Object: The publically accessible properties that were updated.
	 */
	bindUpdateMyDetails: function(func) {
		this._eventProcessor.bind('InstructionControl.bindUpdateMyDetails',func);
	},
	/**
	 * PrivateFunction: _fireUpdateMyDetails
	 *
	 * Access:
	 *
	 *	Internal
	 *
	 */
	_fireUpdateMyDetails: function(communicationKey,details) {
		var funcs = this._eventProcessor.getBindsFor('InstructionControl.bindUpdateMyDetails');
		this._internal_updateUserDetails(communicationKey,details);
		for (var i=0;i<funcs.length;i++) {
			var f = funcs[i];
			f(communicationKey,details);
		}
	},
	/**
	 * Function: getUserDetails
	 *
	 * Returns details about a user.
	 *
	 * Parameters:
	 *
	 *	communicationKey - String: The CommunicationKey of the User
	 *
	 * Returns:
	 *
	 *	Object
	 */
	getUserDetails: function(communicationKey) {
		return this._users[communicationKey];
	},
	/**
	 * Function: send
	 *
	 * See Also:
	 *
	 *	<InstructionControl::send>
	 *
	 * Will send the <Instruction> upto the server through AJAX and handle any
	 * response necessary.
	 * 
	 * Parameters:
	 *
	 *	channel - String: The name of the channel to store the <Instruction> in.
	 *	objectType - String: The object type of the <Instruction>.
	 *	data - Object: Object containing the data within the <Instruction>.
	 *
	 * Note:
	 *
	 *	This just wraps <InstructionClient::send>
	 */
	send: function(channelname,objectType,data) {
		return this.getClientInstance().send(channelname,objectType,data);
	},
	/**
	 * Function: getInstruction
	 *
	 * Returns an Instruction at a specific position.
	 *
	 * Parameters:
	 *
	 *	channel - String: A channelname
	 *	position - Number: The position you wish to retrieve
	 *
	 * Returns:
	 *
	 *	Instruction
	 */
	getInstruction: function(channel,position) {
		var keys = InstructionControl._getKeys(this._instructionChannels);
		if (!InstructionControl._inArray(keys,channel)) {
			return null;
		}
		var q = this._instructionChannels[channel]['queue'];
		return q.getPosition(position);
	}                                                             
};
/**
 * Function: getInstance
 *
 * Returns:
 *
 *	InstructionControl
 */
InstructionControl.getInstance = function() {
	if (this._InstructionControl) {
		return this._InstructionControl
	}
	this._InstructionControl = new InstructionControl();
	return this._InstructionControl;
};
/**
 * PrivateFunction: _getKeys
 * 
 * Returns the keys within an Object.
 * 
 * Parameters:
 *
 *	obj - Object:
 * @return Object
 */
InstructionControl._getKeys = function(ob) {
	var keys = new Array();
	for (k in ob) {
		if (ob.hasOwnProperty(k)) {
			keys.push(k);
		}
	}
	return keys;
};
/**
 * PrivateFunction: _arrayRemoveValue
 * 
 * Utility function for removing a value from an Array
 * 
 * Parameters:
 *
 *	ar - Array: The Array to remove the value from.
 *	val - value: The value we want to remove, will use == to check.
 * @return Array
 */
InstructionControl._arrayRemoveValue = function(ar,val) {
	var newAr = new Array();
	for (var i=0;i<ar.length;i++) {
		if (ar[i] != val)
		{
			newAr.push(ar[i]);
		}
	}
	return newAr;
};

/**
 * PrivateFunction: _inArray
 *
 * Checks an Array to see if the value is within.
 *
 * Parameters:
 *	
 *	ar - Array: The array to check
 *	v - String: The value to look for
 *
 * Returns:
 *
 *	boolean - True if the item is in the Array
 */
InstructionControl._inArray = function(ar,v) {
	for (var i=0;i<ar.length;i++) {
		if (ar[i] == v) {
			return true;
		}
	}
	return false;
};
/**
 * Function getReturnDocumentBody
 *
 * We return data back from the server in a standard form for ease of trapping
 * errors. This function will take that JSON document inspect it, will take 
 * appropriate actions on errors and return the body portion if there is none.
 *
 * Data will be returned from the server in the following form:
 *
 * > {
 * > 	"header":{
 * > 		"system_error":{"55":"The database server is down"},
 * > 		"business_error":{"43":"This item is no longer for sale"},
 * > 		"validation_error":{"username":"Username can only be alpha numberic"}
 * > 	},
 * > 	"body":{"Your Data":"In Here"}
 * > }
 *
 * We call this a ReturnDocument.
 * 
 * Parameters:
 *
 *	jsonDoc - string JSON data returned by the server.
 *
 * Returns: The body of the document portion or undefined if errors found (as well 
 *	as notifying the user and pausing InstructionControl.
 */
InstructionControl.getReturnDocumentBody = function(jsonDoc) {
	var toCheck = ['system_error','business_error','validation_error'];
	for (var tcInd=0;tcInd<toCheck.length;tcInd++) {
		var errorData = jsonDoc['header'][toCheck[tcInd]];
		if (InstructionControl._getKeys(errorData).length > 0) {
			errorString = ["Errors:\n"];
			var errorKeys = InstructionControl._getKeys(errorData);
			for (var i=0;i<errorKeys.length;i++) {
				errorString.push(errorKeys[i]+': '+errorData[errorKeys[i]]);
			}
			var channels = InstructionControl.getInstance()._getChannelNames();
			for (var i=0;i<channels.length;i++) {
				InstructionControl.getInstance().pause(channels[i]);
			}
			InstructionControl.fatalError(errorString.join("\n"));
			return undefined;
		}
	}
	return jsonDoc.body;
};

/**
 * PrivateFunction: getReturnDocumentType
 *
 * Returns the document type from our standard ReturnDocument.
 *
 * Parameters:
 *            
 *	jsonDoc - string JSON data returned by the server.
 *
 * See Also:
 *
 *	<InstructionControl::getReturnDocumentBody> for a description of the ReturnDocument.
 */
InstructionControl.getReturnDocumentType = function(jsonDoc) {
	return jsonDoc['header']['document_type'];
};
InstructionControl.getReturnDocumentMetaData = function(jsonDoc) {
	return jsonDoc['header']['meta_data'];
};
InstructionControl.fatalError = function(message) {
	alert(message);
	throw(message);
};
