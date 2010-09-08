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
 * File: InstructionControl.mootools.js
 *
 * Classes related to the running of the site as well as site initialization.
 */

/**
 * Function: throwError
 *
 * Global error handler.
 */
function throwError(msg) {
	msg = 'throwError: '+msg;
	alert(msg);
	throw msg;
}

/**
 * Class: Element
 *
 * Extensions to MooTools Element class.
 */
Element.implement({
	/**
	 * Function: getClassInfo
	 *
	 * We can store information within an Element itself, currently in the 
	 * stylesheet classes, this will retrieve the information. This is called
	 * ClassInfo here and has a key (ClassInfoKey) and a value (ClassInfoValue).
	 *
	 * infoKey - String: The name of the ClassInfoKey
	 *
	 * Returns:
	 *
	 *	String - The ClassInfoValue
	 */
	getClassInfo: function(infoKey) {
		var r = null;
		this.get('class').split(' ').each(function(cls) {
			var re = new RegExp('^'+infoKey+'\\'+Element.getClassInfoSeperator());
			if (cls.match(re)) {
				r = cls.replace(re,'');
				
			}
		});
		return r;
	},
	/**
	 * Function: removeClassInfo
	 *
	 * Remove ClassInfo from an Element.
	 *
	 * Parameters:
	 *
	 *	infoKey - String: a ClassInfoKey
	 *
	 * See Also:
	 *
	 *	<Element::getClassInfo>
	 */
	removeClassInfo: function(infoKey) {
		var rem = infoKey+Element.getClassInfoSeperator()+this.getClassInfo(infoKey);
		this.removeClass(rem);
	},
	/**
	 * Function: setClassInfo
	 *
	 * Sets the value of a ClassInfo
	 *
	 * Parameters:
	 *
	 *	infoKey - String: a ClassInfoKey
	 *	value - String: a ClassInfoValue
	 *
	 * See Also:
	 *
	 *	<Element::getClassInfo>
	 */
	setClassInfo: function(infoKey,value) {
		this.removeClassInfo(infoKey);
		this.addClass(infoKey+Element.getClassInfoSeperator()+value);
	},
	/**
	 * Function: getClassInfoSeperator
	 *
	 * Because ClassInfo is stored within the stylesheet classes of an Element
	 * MooTools can scan for things with specific ClassInfo. To aid this we
	 * expose the ClassInfoSeperator (which seperates the ClassInfoKey and 
	 * ClassInfoValue).
	 *
	 * Returns:
	 *
	 *	String
	 */
	getClassInfoSeperator: function() {
		return '-';
	},
	hide: function() {
		this.setStyle('display','none');
	},
	show: function() {
		this.setStyle('display','');
	}
});

var IcPopup__createInstance = function(me,template,data,options) {
	if (IcPopup._instance) {
		throwError('You can only create one instance at a time');
	}
	IcPopup._instance = me._createInstance(template,data,options);
	return IcPopup._instance;
};
var IcPopup__removeInstance = function() {
	if (IcPopup._instance) {
		delete IcPopup._instance;
		return
	}
	throwError('Could not find an active popup instance to delete');
}
var IcPopup__getActiveInstance = function(justChecking) {
	if (IcPopup._instance) {
		return IcPopup._instance;
	}
	if (justChecking == true) {
		return null;
	}
	throwError('Could not find an active IcPopup instance');
};

/**
 * Class: IcPopup
 * 
 * Class to hide implementation details of a popup class
 */
IcPopup = new Class({
	/**
	 * Function: initialize
	 *
	 * Constructor.
	 *
	 * Parameters:
	 *
	 *	template - String: The URL to load for the body of popup.
	 *	data - Object: Data to load into the popup
	 */
	initialize: function(template,data,options) {
		this._template = template;
		this._currentPopup = null;
		this._options = options
		this._data = data;
		this._loaded = false;
		this._eventProcessor = new InstructionEventProcessor();
	},
	/**
	 * Function: getData
	 *
	 * Returns:
	 *
	 *	Object - Data that was passed into the constructor. 
	 */
	getData: function() {
		return this._data;
	},
	/**
	 *
	 * Binds a function to be fired when a popup is displayed to the user.
	 *
	 * Parameters:
	 *
	 *	f - Function
	 */
	bindOnDisplay: function(f) {
		this._eventProcessor.bind('onDisplay',f);
	},
	/**
	 * Function: removeOnDisplayEvents
	 *
	 * Will remove all binds that are set to fire OnDisplay
	 */
	removeOnDisplayEvents: function() {
		this._eventProcessor.removeEvent('onDisplay');
	},
	/**
	 * Function: _fireOnDisplay
	 *
	 * Fires any events that are set using <IcPopup::bindOnDisplay>
	 */
	_fireOnDisplay: function() {
		this._eventProcessor.fire('onDisplay');
	},
	/**
	 * Function: _display
	 *
	 * Displays the popup to the User.
	 */
	display: function() {
		var req = new Request({
			'url':'/'+this._template+'.template.xhtml',
			'evalScripts':true
		});
		req.addEvent('success',function(text) {
			IcPopup.getActiveInstance()._currentPopup = new StickyWin.Modal({
					'content': text,
					'allowMultiple': false,
					'destroyOnClose': true,
					'maskOptions':{
						'destroyOnHide':true
					},
					'onDisplay': function() {
						var me = IcPopup.getActiveInstance();
						me._loaded = true;
						if (me._boot) {
							me._boot();
						}
						me._fireOnDisplay();
					},
					'onDestroy': function() {
						IcPopup.removeInstance();
					}
				});
			});
		req.get();
	},
	/**
	 * Hides the current popup.
	 */
	hide: function() {
		this._currentPopup.hide();
	}
});
IcPopup._createInstance = function(template,data) {
	return new IcPopup(template,data)
};
/**
 * Function: getActiveInstance
 *
 * Gets the active popup Instance.
 */
IcPopup.getActiveInstance = IcPopup__getActiveInstance;
/**
 * Function: createInstance
 *
 * Creates the instance of a popup, if one already exists it will error.
 */
IcPopup.createInstance = function(template,data,options) {
	return IcPopup__createInstance(IcPopup,template,data,options);
}
/**
 * Function: removeInstance
 *
 * Destroys the popup instance.
 */
IcPopup.removeInstance = IcPopup__removeInstance;

IcPopup.getDefaultPopupOptions = function() {
	return {
		'allowMultiple':false,
		'destroyOnClose':true,
		'maskOptions':{
			'style': {
				'opacity':0.0001
			},
			'destroyOnHide':true
		}
	};
}

/**
 * Class: IcPopup_Plugin
 * 
 * Popup for handling details of dealing with Instruction adding (editing in future).
 */
IcPopup_Plugin = new Class({
	Extends: IcPopup,
	initialize: function(template,data,options) {
		this.parent(template,data,options)
		this._plugin = null;
		if (this._options['plugin']) {
			this.bindOnDisplay(function() {
				var me = IcPopup_Plugin.getActiveInstance();
				me.removeOnDisplayEvents();
				me._uiSetPlugin(me._options['plugin']['group'],me._options['plugin']['name']);
				
			});
		}
		this._clearAllErrors();
	},
	/**
	 * Function: _uiSetPlugin
	 *
	 * This will select a plugin by fiddling with the Plugin selection controls
	 * rather than actually setting the plugin directly.
	 *
	 * Parameters:
	 *
	 *	group - String: The group name of a registered plugin.
	 *	name - String: The name of a registered plugin.
	 */
	_uiSetPlugin: function(group,name) {
		$('plugin_select_group').set('value',group).fireEvent('change');
		$$('input[name=plugin_select_name]').each(function(inpEl) {
			if (inpEl.get('value') == name) {
				inpEl.set('checked',true).fireEvent('change');
			}
		});
	},
	/**
	 * Function: bindValidation
	 * 
	 * Binds error checking functions to occur when the User clicks the OK button.
	 *
	 * Parameters:
	 *
	 *	f - Function:
	 */
	bindValidation: function(f) {
		this._eventProcessor.bind('Validation',f);
	},
	/**
	 * Function: bindDataCollection
	 *
	 * When the OK button is pressed on a a popup functions bound using this 
	 * function will be ran.
	 *
	 * Parameters:
	 *
	 *	func - Function:
	 */
	bindDataCollection: function(func) {
		this._eventProcessor.bind('DataCollection',func);
	},
	/**
	 * Function: bindCancel
	 *
	 * Binds functions to run when the user clicks the Cancel button.
	 *
	 * Parameters:
	 *
	 *	f - Function
	 */
	bindCancel: function(f) {
		this._eventProcessor.bind('Cancel',f);
	},
	/**
	 * Function: _fireCancelEvent
	 * 
	 * Calls all the functions to run when the cancel button is clicked.
	 *
	 * See also:
	 *
	 *	<IcPopup_Plugin::addCancelFunction>
	 */
	_fireCancelEvent: function() {
		this._disableFooterButtons();
		this._eventProcessor.fire('Cancel');
	},
	/**
	 * Function: _fireOkEvent
	 * 
	 * Fires all error checking functions, if everything is OK it will send a
	 * new Instruction off to the Server and close the popup.
	 *
	 * See also:
	 *
	 *	<IcPopup_Plugin::bindValidation>
	 */
	_fireOkEvent: function() {
		this._disableFooterButtons();
		this._eventProcessor.fire('Validation',this);
		
		if (!this._errors.validation.length && !this._errors.business.length)
		{
			this._disableFooterButtons();
			this._setStatusMessage('Sending...');
			
			var data = new Hash(this._data);
			var funcs = this._eventProcessor.getBindsFor('DataCollection')
			for (var i=0;i<funcs.length;i++) {
				data = data.extend(funcs[i]());
			}
			data = data.getClean();
			
			InstructionControl.getInstance().send(
				'main',
				this._plugin.getObjectTypeName(),
				data
				);
			return true;
		} else {
			this._enableFooterButtons();
		}
		return false;
	},
	/**
	 * Function: _disableFooterButtons
	 *
	 * Disables the OK/Cancel buttons on the popup.
	 */
	_disableFooterButtons: function() {
		$$('#popup_template_add div.footer input').each(function(e) {
			e.set('disabled',true);
		});
	},
	/**
	 * Function: _enableFooterButtons
	 *
	 * Enables the OK/Cancel buttons on the popup.
	 */
	_enableFooterButtons: function() {
		$$('#popup_template_add div.footer input').each(function(e) {
			e.set('disabled',false);
		});
	},
	/**
	 * Function: _setStatusMessage
	 *
	 * Inform the user of something happening on the popup.
	 */
    _setStatusMessage: function(str) {
        $$('#popup_template_add #status_area').each(function(e) {
			e.getChildren().dispose();
            e.grab(new Element('p',{
                'html':str
            }));
        });
    },
    /**
     * Function: _clearAllErrors
     *
     * Blanks out all user input errors ready fr re-validation.
     */
	_clearAllErrors: function() {
		this._errors = {'validation':new Array(),'business':new Array()};
	},
	/**
	 * Function: addValidationError
	 *
	 * Adds a validation error.
	 *
	 * Parameters:
	 *
	 *	fieldname - String: The field (or at least area) where the error has occured.
	 *	message - String: The message to present to the user.
	 */
	addValidationError: function(fieldname,message) {
		this._errors.validation.push({'fieldname':fieldname,'message':message});
		alert(fieldname+':'+message);
	},
	/**
	 * Function: addBusinessError
	 *
	 * Adds a business error, business errors are not necessarily related to user
	 * input, or maybe just are impossible to categorize into one specific field.
	 * They could also be related to external services.
	 *
	 * Parameters:
	 *
	 *	code - String: A unique identifier for the error
	 *	message - String: The message to present to the user.
	 */
	addBusinessError: function(code,message) {
		this._errors.business.push({'code':code,'message':message});
		alert(code+':'+message);
	},
	/**
	 * Function: _setPlugin             
	 *
	 * Sets the plugin used by this popup.
	 *
	 * Parameters:
	 *
	 *	plugin - IcPlugin: The plugin which this popup is rendering.
	 */
	_setPlugin: function(plugin) {
		this._plugin = plugin;
		IcPopup_Plugin.getActiveInstance()._eventProcessor.reset();
		$('popup_template_add_detail').getChildren().each(function(e) {
			e.dispose();
		});
		$('popup_template_add__submit_ok').set('disabled',true);
		$('popup_template_add__submit_ok').set('disabled',true);
		var r = new Request.HTML(
		{
			'update':$('popup_template_add_detail'),
			'evalScripts':false,
			'onSuccess':function() {
				var popup = IcPopup_Plugin.getActiveInstance();
				var r = popup._plugin.initPopup(popup,popup._data);
				$('popup_template_add__submit_ok').set('disabled',false);
				return r;
			}
		}
		).get(plugin.getPopupSource());
	},
    /**
     * Function: _notifyWaitingFor
     *
     * Notify the user that the Instruction has been sent to the server but has
     * not yet been executed by InstructionControl.
     *
     * Parameters:
     *
     *	position - Number: The position of the Instruction we are waiting for in
     *		the channel.
     */
    _notifyWaitingFor: function(position) {
		var t = 'Waiting for execution of Instruction {p}...';
        this._setStatusMessage(t.substitute({'p':position}));
        this._waitingFor = position;
    },
    /**
     * Function: _notifyInstructionProcessed
     *
     * Notify the user that InstructionControl has processed Instruction n, and
     *	your instruction is Instruction m... This is in some ways like a progress
     *	bar.
     *
     * This will also close the window!
     *
     * Parameters:
     *
     *	position - Number: The Instruction that has just been processed.
     */
    _notifyInstructionProcessed: function(position) {
    	var subs = {'p':position,'t':this._waitingFor};
        this._setStatusMessage('Processed Instruction {p}/{t}'.substitute(subs));
        if (position <= this._waitingFor) {
            this._setStatusMessage('Complete');
            this.hide();
        }
    },
	/**
	 * Function: _boot
	 *
	 * Attaches all the required events to make the popop work, which are not
	 * related to a specific plugin.
	 */
	_boot: function(plugin) {
		//IcPopup_Plugin.getActiveInstance()._removePlugin();
		// If someone clicks the cancel button just close it
		$('popup_template_add__submit_cancel').addEvent('click',function() {
			IcPopup_Plugin.getActiveInstance()._fireCancelEvent();
			IcPopup_Plugin.getActiveInstance().hide();
		});
		// If someone clicks the 
		$('popup_template_add__submit_ok').addEvent('click',function() {
			IcPopup_Plugin.getActiveInstance()._clearAllErrors();
			IcPopup_Plugin.getActiveInstance()._fireOkEvent();
		});
		var names = IcPage.getPluginGroupNames();
		var sel = $('plugin_select_group')
		for (var i=0;i<names.length;i++) {
			var n = names[i];
			var o = new Option(n,n);
			try {
				sel.add(o,null);
			} catch (err) {
				sel.add(o);
			}
		}
		sel.addEvent('change',function() {
			//IcPopup_Plugin.getActiveInstance()._removePlugin();
			$('plugin_selector_name').set('html','');
			IcPage.getPluginNames(sel.get('value')).each(function(op) {
				var o = op.getName();
				var rad = new Element('input',{
					'type':'radio',
					'value':o,
					'name':'plugin_select_name',
					'id':'plugin_selector_name_'+o,
					'events': {
						'change':function() {
							//IcPopup_Plugin.getActiveInstance()._removePlugin();
							var plugin = IcPage.getPlugin(
								$('plugin_select_group').get('value'),
								this.get('value')
								);
							IcPopup_Plugin.getActiveInstance()._setPlugin(plugin);
						}
					}
	
				});
				var lbl = new Element('label',{
					'for':'plugin_selector_name_'+o,
					'html':o
				});
				//var p = ;
				$('plugin_selector_name').adopt(new Element('p').adopt(rad,lbl));
			})
		});
		sel.fireEvent('change');
	}
});
IcPopup_Plugin._createInstance = function(template,data,options) {
	return new IcPopup_Plugin(template,data,options)
};
IcPopup_Plugin.createInstance = function(data,options) {
	return IcPopup__createInstance(IcPopup_Plugin,'popup_template_add',data,options);
}
IcPopup_Plugin.getActiveInstance = IcPopup__getActiveInstance;
IcPopup_Plugin.removeInstance = IcPopup__removeInstance;

/**
 * Class: IcEditUserPopup
 *
 * Control for editing your own user properties.
 */
IcPopup_EditUser = new Class({
	Extends: IcPopup,
	initialize: function(template,data,options) {
		this.parent(template,data,options)
	},
	_boot: function() {
		$('popup_edituser__user_known_as').set('value',this._data['known_as']);
		$('popup_edituser__user_color').addEvent('change',function() {
			this.setStyle('background-color','#'+this.get('value'));
		})
		$('popup_edituser__submit_ok').addEvent('click',function() {
			var me = IcPopup_EditUser.getActiveInstance();
			InstructionControl.getInstance().updateMyUserDetails({
				'known_as':$('popup_edituser__user_known_as').get('value'),
				'color':$('popup_edituser__user_color').get('value')
			});
			me.hide();
		});
		$('popup_edituser__submit_cancel').addEvent('click',function() {
			IcPopup_EditUser.getActiveInstance().hide();
		});
		var colors = ['FF0000','00FF00','0000FF','0000FF','FFFFFF','000000'];
		for (var i=0;i<colors.length;i++) {
			$('popup_edituser__user_color').grab(new Element('option',{
				'text':' ',
				'value':colors[i],
				'styles':{
					'background-color':'#'+colors[i],
					'color':'#'+colors[i]
				}
			}));
		}
		$('popup_edituser__user_color').set('value',this._data['color']);
		$('popup_edituser__user_color').setStyle('width','100px');
		$('popup_edituser__user_color').fireEvent('change');
	}
});
IcPopup_EditUser._createInstance = function(template,data,options) {
	return new IcPopup_EditUser(template,data,options)
};
IcPopup_EditUser.createInstance = function(data,options) {
	return IcPopup__createInstance(IcPopup_EditUser,'popup_template_edituser',data,options);
}
IcPopup_EditUser.getActiveInstance = IcPopup__getActiveInstance;
IcPopup_EditUser.removeInstance = IcPopup__removeInstance;

/**
 * Class: IcObjectTypePlugin
 *
 * This is a plugin system...
 */
var IcObjectTypePlugin = new Class({
	/**
	 * Function: initialize
	 *
	 * Constructor
	 */
	initialize: function() {},
	/**
	 * Function: getGroup
	 *
	 * Gets the PluginGroup name.
	 *
	 * Abstract:
	 *
	 * Returns:
	 *
	 *	String
	 */
	getGroup: function() {},
	/**
	 * Function: getName
	 *
	 * Gets the Plugin name.
	 *
	 * Abstract:
	 *
	 * Returns:
	 *
	 *	String
	 */
	getName: function() {},
	/**
	 * Gets the source document for the body of the adding/editing popup.
	 *
	 * Returns:
	 *
	 *	String
	 */
	getPopupSource: function() {
		return '/popup_template_plugin_{g}_{n}.template.xhtml'.substitute({
			'g':this.getGroup().toLowerCase(),
			'n':this.getName().toLowerCase()
		});
	},
	/**
	 * When an IcObjectTypePlugin is selected within the interface this 
	 * function will be ran, would probably want to override this to bind
	 * validation and data collection functions.
	 * 
	 * Parameters:
	 *
	 *	popup - IcPopup_Plugin: The popup that the user can see
	 *
	 * See Also:
	 *
	 *	<IcPopup_Plugin::bindValidation> and <IcPopup_Plugin::bindDataCollection> 
	 */
	initPopup: function(popup) {
	},
	getPreviewValue: function(instruction) {
		return JSON.encode(IcPage.stripUnderscoreKeys(instruction.getData()));
	},
	/**
	 * Function: _render
	 *
	 * Renders an InstructionElement onto the page in the correct position.
	 *
	 * Parameters:
	 *
	 *	instruction - Instruction: The Instruction to render.
	 */
	_render: function(instruction) {
		
		/**
		 * Finds the place in the row where the new element will go.
		 */
		var findPositionElement = function(pElement,position) {
			if (position == -1)
			{
				return false;
			}
			/**
			 * Inspects a possible wrapping span to see if it is correct
			 */
			var isWhatIamLookingFor = function(el,position) {
				if (el.getClassInfo('position') == position) {
					return true;
				}
				return false;
			};
			
			var child = pElement.getLast();
			while ((child)) {
				if (isWhatIamLookingFor(child,position)) {
					return child; // This is the item to the left
				}
				if (!child.getPrevious())
				{
					return child;
				}
				child = child.getPrevious();
			}
			throwError('Could not find position to insert');
		};
		
		/**
		 * Moves the StickyWin back onto the screen if it is off.
		 */
		var moveBubbleIfOffScreen = function() {
			var pos = $$('div.instructionelement_preview').pop().getPosition();
			if ((pos.x < 0) || (pos.y < 0)) {
				if (pos.x < 0) {
					pos.x = 0;
				}
				if (pos.y < 0) {
					pos.y= 0;
				}
				$$('div.instructionelement_preview').pop().getParent().setPosition(pos);
			}
		};
		
		/**
		 * Finds the correct row for an Instruction
		 */
		var getInstructionRow = function(rowIndex) {
			var instructionRow = null;
			$$('ul.instruction_row').each(function(el) {
				if (el.getClassInfo('row') == rowIndex) {
					instructionRow = el;
				}
			});
			if (instructionRow == null) {
				throwError('Could not find row');
			}
			return instructionRow;
		}
		
		/**
		 * When clicking on an InstructionElement, we show a preview of as much
		 * as possible information (rendered from the plugin itself). This 
		 * function will show that bubble.
		 *
		 * Parameters:
		 *
		 *	event - Event: The click event
		 */
		var showInstructionElementBubble = function(event) {
			
			var pos = this.getParent().getClassInfo('position');
			var instruction = InstructionControl.getInstance().getInstruction('main',pos);
			
			var bubble = '';
			bubble = bubble + '<div class="instructionelement_preview">';
			bubble = bubble + '	<div class="header"><h1>{header}</h1>{subheader}</div>';
			bubble = bubble + '	<div class="body">{body}</div>'; 			
			bubble = bubble + ' <div class="footer">';
			bubble = bubble + '   <div id="instructionelement_preview_sure_footer" style="display:none">';
			bubble = bubble + '     <span class="l">{surefooterl}</span>';
			bubble = bubble + '     {surefooterr}';
			bubble = bubble + '   </div>';
			bubble = bubble + '   <div id="instructionelement_preview_do_footer">';
			bubble = bubble + '     <span class="l">{dofooterl}</span>';
			bubble = bubble + '     {dofooterr}';
			bubble = bubble + '     <div style="clear:both"></div>';
			bubble = bubble + '   </div>';
			bubble = bubble + ' </div>';
			bubble = bubble + '</div>';
			                                                       
			var userDetails = IcPage.mergeUserDetailsWithDefaults(instruction.getCommunicationKey());
		
			var sureFooterL = [
				'are you sure?'
			];
			var sureFooterR = [
				'<a href="#" id="instructionelement_preview__cancel">no</a>',
				'<a href="#" id="instructionelement_preview__delete">yes</a>'
			];
			var doFooterR = [
				'<a href="#" id="instructionelement_preview__close">cancel</a>',
				'<a href="#" id="instructionelement_preview__edit">edit</a>'
			];
			var doFooterL = [
				'<a href="#" id="instructionelement_preview__deleteask">delete</a>'
			];
			
			var previewPopupOptions = new Hash({
				'content':bubble.substitute({
					'header':'<p>ObjectType: {objecttype}</p>'.substitute({
						'objecttype':instruction.getObjectType()
					}),
					'subheader':'<p>By: {user}</p>'.substitute({
						'user':userDetails['known_as']
					}),
					'body':me.getPreviewValue(instruction),
					'surefooterl':sureFooterL.join('&nbsp;'),
					'surefooterr':sureFooterR.join('&nbsp;'),
					'dofooterl':doFooterL.join('&nbsp;'),
					'dofooterr':doFooterR.join('&nbsp;')
				}),
				'relativeTo':event.target,
				'offset': { x:0, y:0 }
			});
			
			previewPopupOptions.extend(IcPopup.getDefaultPopupOptions());
			previewPopupOptions = previewPopupOptions.getClean();
			
			// IE does some strange footer lifting thing, if we move the bubble
			// no idea why, but for IE we will place the bubble so it will never
			// be off screen instead of moving it.
			if (Browser.Engine.trident) { previewPopupOptions['position'] = 'upperLeft'; }
			var previewPopup = new StickyWin.Modal(previewPopupOptions);
			if (!Browser.Engine.trident) { moveBubbleIfOffScreen(); }
			
			
			$('instructionelement_preview__edit').setClassInfo('position',pos);
			$('instructionelement_preview__delete').setClassInfo('position',pos);
			$('instructionelement_preview__close').addEvent('click',function() {
				previewPopup.hide();
				return false;
			});
			$('instructionelement_preview__cancel').addEvent('click',function() {
				$('instructionelement_preview_sure_footer').hide();
				$('instructionelement_preview_do_footer').show();
				return false;
			});
			$('instructionelement_preview__deleteask').addEvent('click',function() {
				$('instructionelement_preview_do_footer').hide();
				$('instructionelement_preview_sure_footer').show();
				return false;
			});
			$('instructionelement_preview__delete').addEvent('click',function() {
				var pos = this.getClassInfo('position');
				InstructionControl.getInstance().send('main','_deleteInstruction',{'_pos':pos});
				previewPopup.hide();
				return false;
			});
			$('instructionelement_preview__edit').addEvent('click',function() {
				var pos = this.getClassInfo('position');
				var ins = InstructionControl.getInstance().getInstruction('main',pos);
				var data = IcPage.stripUnderscoreKeys(ins.getData());
				data['_replaces'] = pos;
				var pn = ins.getObjectType().split('/');
				var plugin = {'group':pn[0],'name':pn[1]};
				previewPopup.hide();
				var popup = IcPopup_Plugin.createInstance(data,{'plugin':plugin});
				popup.display()
				return false;
			});
		}
		
		if (instruction.getData() == null)
		{
			return false;
		}
		
		// Set `me` to be what `this` should be
		var me = IcObjectTypePlugin.instanceFromObjectTypeName(instruction.getObjectType());
		
		// Make sure we have an _afterInstruction within an Instruction, even if we don't!
		var whereItGoes = new Hash(instruction.getData()).combine(
			{
				'_afterInstruction':-1,
				'_row':0,
				'_replaces':-1
			}
			).getClean();
		
		var instructionElement = me._getElement(instruction)
		
		instructionElement.addEvent('click',showInstructionElementBubble);

		var liEl = new Element('li');
		liEl.grab(instructionElement);
		liEl.grab(IcPage.createPlusElement());
		liEl.addClass('instruction');
		liEl.setClassInfo('position',instruction.getPosition());
		
		if (whereItGoes._replaces > -1) {
			var selector = 'li.instruction.position'+
				Element.getClassInfoSeperator()+whereItGoes._replaces;
			$$(selector).each(function(el) {
				liEl.replaces(el);
			});
		} else if (whereItGoes._afterInstruction > 0) {
			var insertAfter = findPositionElement(
				getInstructionRow(whereItGoes._row),
				whereItGoes._afterInstruction
				);
			insertAfter.grab(liEl,'after');
		} else {
			getInstructionRow(whereItGoes._row).grab(liEl);
		}
		
		IcPage.getSortables().addItems(liEl);
		
		IcPage.fixFirstPlus();
		
		return true;
	},
	/**
	 * Function: _getElement
	 *
	 * Returns the InstructionElement ready for insertion into the page.
	 *
	 * Parameters:
	 *
	 *	instruction - Instruction
	 *
	 * Returns:
	 *
	 *	Element - InstructionElement
	 */
	_getElement: function(instruction) {
		var e = new Element('span',{
			'html':this.getBody(instruction)
		});
		e.grab(new Element('img',{
			'class':'icon',
			'src':this.getIconUrl(instruction),
			'height':'16px',
			'width':'16px'
		}));
		IcPage.updateInstructionElementsUserColor(
			instruction.getCommunicationKey(),
			e
			);
		return e;		
	},
	/**
	 * Function: getBody
	 *
	 * Returns the text to go into an InstructionElement
	 *
	 * Parameters:
	 *
	 *	instruction - Instruction
	 *
	 * Returns:
	 *
	 *	String - The words within an InstructionElement
	 */
	getBody: function(instruction) {
		var data = instruction.getData();
		return data['value'];
	},
	/**
	 * Function: getIconUrl 
	 *
	 * Returns the source of an image, which will be used within an InstructionElement
	 *
	 * Parameters:
	 *
	 *	instruction - Instruction
	 *
	 * Returns:
	 *
	 *	String The URL from an InstructionElement
	 */                              
	getIconUrl: function(instruction) {
		return 'error.png';
	},
	/**
	 * Function: getObjectTypeName
	 *
	 * Returns a unique string name used for attaching events etc.
	 *
	 * Returns:
	 *
	 *	String
	 */
	getObjectTypeName: function() {
		return this.getGroup()+'/'+this.getName();
	}
});
/**
 * Function: instanceFromObjectTypeName
 *
 * Takes a IcObjectTypePlugin group and name (seperated by a "/") and returns
 * the singular instance of that for this page.
 *
 * Parameters:
 *
 *	name - String: in the form {groupname}/{name}, for example "BuiltIn/String".
 *
 * Returns
 *
 *	IcObjectTypePlugin 
 */
IcObjectTypePlugin.instanceFromObjectTypeName = function(name) {
	var ar = name.split('/');              
	return IcPage.getPlugin(ar[0],ar[1]);
}

/**
 * Class: IcPage
 *
 * Page level functions.
 */
IcPage = {
	/**
	 * Function: init
	 *
	 * This function will initialize the page and must be called upon first load.
	 */
	init: function() {
		
		var el = new Array();
		$$('#template__minner ul.instruction_row').each(function(e) {
			el.push(e);
		});
		
		// structures for loading Progressbar, done is an array of channel names 
		// (strings) that have finished loading. totals will have the key of a
		// channelname and the value of the total number of instruction within.
		// progress includes progress bar instances. processed is an object that
		// stores the amount of Instruction processed for a channel (kv pairs)
		IcPage.loading = {
			'done':[],
			'processed':{},
			'totals':{},
			'progress':null
		};
		
		IcPage._sortables = new Sortables(el, {
			clone: true,
			revert: false,
			opacity: 0.5,
			handle: '.movable',
			_oldOrder: null,
			initialize: function() { },
			onStart: function(element,clone) {
				clone.getChildren('a').dispose();
				InstructionControl.getInstance().pause('main');
				var res = new Array();
				this._oldOrder = IcPage.serializeInstructionPosition();
			},
			onComplete: function(element) {
				
				/* ==Functions ========================================== */
				
				/**
				 * Puts all li back into the old order
				 */
				var reset = function (oldPositions,newPositions,track,element) {
					var movement = IcPage.findMovement(oldPositions,newPositions,track);
					var instructionRow = null;
					$$('.instruction_row').each(function(posRow) {
						if (posRow.getClassInfo('row') == movement.from) {
							instructionRow = posRow;
						}
					});
					var oldPos = IcPage.findAfterValue(oldPositions[movement.from],track);
					if (oldPos == -1)
					{
						instructionRow.grab(element,'top');
						return true;;
					}
					
					instructionRow.getChildren().each(function(liEl) {
						if (liEl.getClassInfo('position') == oldPos) {
							liEl.grab(element,'after');
							return true;
						}
					});
					return false;
				};
				
				/**
				 * Calculates the position the element was dropped in
				 */
				var getNewPositionData = function(element) {
					var options = {
						'_row':element.getParents('.instruction_row').pop().getClassInfo('row')
					};
					options['_afterposition'] = -1;
					var prevChild = element.getPrevious();
					if (prevChild) {
						var p = prevChild.getClassInfo('position');
						if (p) {
							options['_afterposition'] = p;
						}
					}
					options['position'] = element.getClassInfo('position');
					return options;
				}
				
				if (this._oldOrder == null) {
					return false;
				}
				
				/* == Body ============================================== */
				var data = getNewPositionData(element);
				var newOrder = IcPage.serializeInstructionPosition();
				
				if (JSON.encode(this._oldOrder) == JSON.encode(newOrder)) {
					return;
				}
				
				var shadedClone = element.clone();
				shadedClone.setClassInfo('cposition',shadedClone.getClassInfo('position'));
				shadedClone.removeClassInfo('position');
				shadedClone.setStyle('opacity','0.5');
				shadedClone.addClass('cinstruction');
				shadedClone.removeClass('instruction');
				element.grab(shadedClone,'after');
				
				reset(
					this._oldOrder,
					newOrder,
					element.getClassInfo('position'),
					element
					);
				element.hide()
				InstructionControl.getInstance().send('main','_moveInstruction',data);
				InstructionControl.getInstance().resume('main');
				this._oldOrder = null;
			}
		});
	},
	/**
	 * Function: getPluginGroupNames
	 *
	 * Returns:
	 *
	 *	Array - The group names of plugins
	 */
	getPluginGroupNames: function() {
		return IcPage._getObjectTypePluginMetaData().getKeys();
	},
	/**
	 * Function: getPluginNames
	 * 
	 * Parameters:
	 *
	 *	groupname - String
	 *
	 * Returns:
	 *
	 *	Array - The names of Plugin for a specific GroupName.
	 */
	getPluginNames: function(name) {
		return IcPage._getObjectTypePluginMetaData().get(name);
	},
	/**
	 * Function: getPlugin
	 *
	 * Retrieves a Plugin from the registry of available Plugins.
	 *
	 * Parameters:
	 *
	 *	group - String: The GroupName of a Plugin.
	 *	name - String: The Name of a Plugin.
	 *
	 * Returns:
	 *
	 *	IcObjectTypePlugin
	 */
	getPlugin: function(group,name) {
		for(var i=0;i<IcPage._objectTypePlugin.length;i++) {
			var p = IcPage._objectTypePlugin[i];
			if ((p.getGroup() == group) && (p.getName() == name)) {
				return p;
			}
		}
		return null;
	},
	/**
	 * Function: _getObjectTypePluginMetaData
	 *
	 * Gets metadata about registry's plugins.
	 *
	 * Returns:
	 *
	 *	Object - Object, keys of Object are Groups, value will be an array of
	 * 		Names.
	 */
	_getObjectTypePluginMetaData: function() {
		var r = new Hash();
		IcPage._objectTypePlugin.each(function(item) {
			var ks = r.getKeys();
			if (!ks.contains(item.getGroup())) {
				r.set(item.getGroup(),new Array());
			}
			r.get(item.getGroup()).push(item);
		});
		return r;
	},
	/**
	 * Function: addObjectTypePlugin
	 *
	 * Adds a type of Plugin to the registry of available plugins.
	 *
	 * Parameters:
	 *
	 *	objectTypePlugin - IcObjectTypePlugin
	 */
	addObjectTypePlugin: function(objectTypePlugin) {
		IcPage._objectTypePlugin.push(objectTypePlugin);
		InstructionControl.getInstance().bind(
			'main',
			objectTypePlugin.getObjectTypeName(),
			objectTypePlugin._render
			);
	},
	/**
	 * Function: getSortables
	 *
	 * Gets the one Sortables instance for the page.
	 *
	 * Returns:
	 *
	 *	Sortables
	 */
	getSortables: function() {
		return IcPage._sortables;
	},
	/**
	 * Function: stripUnderscoreKeys
	 *
	 * Parameters:
	 *
	 *	Object: The object to find non-underscore properties of.
	 *
	 * Returns:
	 *
	 *	Object - an object with the same properties unless they begin with an 
	 *		underscore or are from the prototype.
	 */
	stripUnderscoreKeys: function(obj) {
		var r = {};
		var keys = InstructionControl._getKeys(obj);
		for (var i=0;i<keys.length;i++) {
			if (keys[i].substr(0,1) != '_') {
				r[keys[i]] = obj[keys[i]];
			}
		}
		return r;
	},
	/**
	 * Function: plusPopup
	 *
	 * Event which gets fired when clicking on a "+" link.
	 */
	plusPopup: function(event) {
		var row = event.target.getParents('.instruction_row').pop().getClassInfo('row');
		var afterInstruction = this.getParent();
		if (afterInstruction)
		{
			afterInstruction = afterInstruction.getClassInfo('position');
		}
		data = {};
		if (afterInstruction) {
			data['_afterInstruction'] = afterInstruction;
		}
		data['_row'] = row;
		var p = IcPopup_Plugin.createInstance(data,{});
		p.display()
		return false;
	},
	/**
	 * Function: fixFirstPlus
	 *
	 * Checks an InstructionRow to see if the first element is a plus only, if
	 * it is, it will remove it.
	 */
	fixFirstPlus: function() {
		$$('ul.instruction_row').each(function(row) {
			var hasElements = function(row) {
				var lis = []
				row.getChildren().each(function(e) {
					lis.push(e);
				});
				for (var i=0;i<lis.length;i++) {
					if (lis[i].hasClass('instruction')) {
						return true;
					}
				}
				return false;
			}
			row.getChildren('.first_plus').dispose();
			if (!hasElements(row)) {
				row.grab(new Element('li',{'class':'first_plus'}).grab(IcPage.createPlusElement()));
			}
		});
	},
	/**
	 * Function: checkWrapping
	 *
	 * Will the the size of every InstructionElememtn within the page and resize
	 * all the others so that no wierd wrapping will occur.
	 *
	 * This perhaps could be improved to look at the row, and only increase the 
	 * height of items that would be on the same line as itself, which may be
	 * complicated...
	 */
	checkWrapping: function() {
		$$('ul.instruction_row').each(function(row) {
			var maxHeight = 0;
			var lis = row.getChildren();
			for (var i=0;i<lis.length;i++) {
				if (lis[i].getSize().y > maxHeight) {
					maxHeight = lis[i].getSize().y;
				}
			}
			for (var i=0;i<lis.length;i++) {
				lis[i].getChildren().setStyle('line-height',maxHeight+2);
			}
		});
	},
	/**
	 * Function: createPlusElement
	 * 
	 * Creates the "+" link you see in an InstructionRow
	 *
	 * Returns:
	 *	Element
	 */
	createPlusElement: function() {
		return new Element('a',{
			'alt':'Add',
			'class':'adder',
			'html':'+',
			'href':'#',
			'events': { 'click':IcPage.plusPopup }
		});
	},
	
	/**
	 * Function: addRowAdder
	 *
	 * Will add the InstructionRowAdder to the bottom of all InstructionRow
	 *
	 * Parameters:
	 *	e - Element: The container you want to put it in.
	 */
	addRowAdder: function(e) {
		var classes = new Array('instruction_row_new','row','newClear');
		var newRow = new Element('ul',{
			'class':classes.join(' '),
			'events':{
				'click':function() {
					InstructionControl.getInstance().send(
						'main','_addRow',{}
					);
				}
			}
		});
		e.grab(newRow);
	},
	/**
	 * Function: findAfterValue
	 *
	 * Finds the element in an Array that a value is after.
	 *
	 * Parameters:
	 *
	 *	ar - Array 
	 *	track - The value to look fr
	 *
	 * Returns:
	 *
	 *	The value before `track` or -1 if there is no value before... or it is not 
	 *		found!
	 */
	findAfterValue: function(ar,track) {
		var res = -1;
		for (var i=0;i<ar.length;i++) {
			if (ar[i] == track) {
				return res;
			}
			res = ar[i];
		}
		return res;
	},
	/**
	 * Function: findMovement
	 *
	 * When an Instruction has moved, we need to find where it was (so we can 
	 * find the the Element to move) and where it is going to. This function will
	 * figure this out...
	 *
	 * Parameters:
	 *
	 *	before - Array: The return value from <IcPage::serializeInstructionPosition>
	 *	after - Array: The same as <before>, but after movement
	 *	track - Number: The id that we are tracking
	 *
	 * Returns:
	 *
	 *	Object - Has keys afterValue, from and to. These are the 
	 *		InstructionElement that it has been moved following (-1 if at the 
	 *		start), the row the InstructionElement was moved from and moved to
	 *		respectfully.
	 */
	findMovement: function (before,after,track) {
		
		var me_findDifference = function(ar1,ar2) {
			var keys = InstructionControl._getKeys(ar1);
			var difference = new Array();
			for (var i=0;i<keys.length;i++) {
				if (ar1[keys[i]].join(',') != ar2[keys[i]].join(',')) {
					difference.push(keys[i]);
				}
			}
			return difference;
		};
		
		var fromLocation = null;
		var toLocation = null;
		var keys = me_findDifference(before,after);
		if (keys.length == 1) {
			return {
				'from':keys[0],
				'to':keys[0],
				'afterValue':this.findAfterValue(after[keys[0]],track)
			};
		}
		var found = 0;
		fromLocation = keys[0];
		toLocation = keys[1];
		for (var i=0;i<after[keys[0]].length;i++) {
			if (track == after[keys[0]][i]) {
				found = 1;
			}
		}
		if (found) {
			fromLocation = keys[1];
			toLocation = keys[0];
		}
		return {
			'from':fromLocation,
			'to':toLocation,
			'afterValue':this.findAfterValue(after[toLocation],track)
		};
	},
	/**
	 * Function: serializeInstructionPosition
	 *
	 * Used for storing the order of InstructionElement within an InstructionRow
	 *
	 * Returns:
	 *
	 *	Object - With numeric keys, each key's value will be an Array of 
	 *	Instruction.Position in the order of InstructionElement of that Row.
	 */
	serializeInstructionPosition: function() {
		var serialized = { };
		$$('ul.instruction_row').each(function(instructionRow) {
			var rowIndex = instructionRow.getClassInfo('row');
			serialized[rowIndex] = new Array();
			if (instructionRow.getChildren()) {
				var instructions = instructionRow.getChildren('.instruction');
				instructions.each(function(ins) {
					// Right now i have no idea why an array is sometimes returned
					// when it should only return strings...
					var r = ins.getClassInfo('position');
					if ($type(r) == 'array') {
						r = r.pop();
					}
					if (serialized[rowIndex].indexOf(r) == -1) {
						serialized[rowIndex].push(r);
					}
				});
			}
		});
		return serialized;
	},
	/**
	 * Function: mergeUserDetailsWithDefaults
	 *
	 * A new user will not necessarily have a known_as or color, by having one
	 * function that will take a CommunicationKey and merge it with default
	 * values we can create code assuming they will always have a color and
	 * known_as.
	 *
	 * Parameters:
	 *
	 *	communicationKey - String - The CommunicationKey of a User
	 *
	 * Returns:
	 *
	 *	Object - Object will be in the form of {'color': 'FF0000','known_as':'Bob'}
	 */
	mergeUserDetailsWithDefaults: function(communicationKey) {
		var details = InstructionControl.getInstance().getUserDetails(communicationKey)
		if (!details) {
			details = {};
		}
		var r = {'known_as':communicationKey,'color':'DDDDDD'};
		var flds = InstructionControl._getKeys(r);
		for (var i=0;i<flds.length;i++) {
			if (details[flds[i]]) {
				r[flds[i]] = details[flds[i]];
			}
		}
		return r;
	},
	/**
	 * Function: updateInstructionElementsUserColor
	 *
	 * Takes a User's CommunicationKey are updates it with the news User 
	 * details, which is really just the color.
	 *
	 * Parameters:
	 *
	 *	communicationKey - String: The CommunicationKey of the user who has
	 *		updated thier details.
	 *	iElement - Element: An InstructionElement that will be updated with
	 *		the new details of that User
	 */
	updateInstructionElementsUserColor: function(communicationKey,iElement) {
		var udets = IcPage.mergeUserDetailsWithDefaults(communicationKey,udets);
		iElement.setStyle('background-image',
			'url("/rounded.php?foregroundcolor='+udets['color']+
				'&shape=r&radius=0&width=2&height=1&borderwidth=0")'
			);
	},
	/**
	 * Function: getChatElement
	 *
	 * The chat window is also controlled by Instruction. This will generate
	 *	an Element which can be added to the chat area.
	 *
	 * Parameters:
	 *
	 *	instruction - Instruction: The instruction that we want to get the chat
	 *		element for.
	 *
	 *	Returns:
	 *		Element
	 */
	getChatElement: function(instruction) {
		var line = instruction.getData()['text'];
		var userDetails = IcPage.mergeUserDetailsWithDefaults(instruction.getCommunicationKey());
		var chatLi = new Element('li',{
			'html':userDetails['known_as']+': '+line,
			'styles': {
				'background-image':'url("/rounded.php?foregroundcolor='+
					userDetails['color']+'&shape=r&radius=0&width=2&height=1'+
					'borderwidth=0")'
			}
		});
		chatLi.setClassInfo('position',instruction.getPosition());
		chatLi.setClassInfo('communication_key',instruction.getCommunicationKey());
		return chatLi;
	},
	/**
	 * Function: updateInstructionElementColor
	 * 
	 * Will update all Instruction from a specific communication key with a color.
	 *
	 * Parameters:
	 *	
	 *	communicationKey - string The communication key of the user who has changed
	 *		their color.
	 */
	updateUserWithNewUserColor: function(communicationKey) {
		var findPositionFromCommunicationKey = function(communicationKey) {
			var icInst = InstructionControl.getInstance();
			var curInstructionIndex = -1;
			var instruction = icInst.getInstruction('main',++curInstructionIndex);
			var positionsToUpdate = [];
			while (instruction) {
				if (communicationKey == instruction.getCommunicationKey()) {
					positionsToUpdate.push(instruction.getPosition());
				}
				instruction = icInst.getInstruction('main',++curInstructionIndex);
			}
			return positionsToUpdate;
		};
		
		var positionsToUpdate = findPositionFromCommunicationKey(communicationKey);
		var megaCssSelector = [];
		for (var i=0;i<positionsToUpdate.length;i++) {
			var selector = 'li.position'+Element.getClassInfoSeperator()+positionsToUpdate[i]+' span';
			$$(selector).each(function(el) {
				IcPage.updateInstructionElementsUserColor(communicationKey,el)
			});
		}
		var udets = IcPage.mergeUserDetailsWithDefaults(communicationKey);
		var selector = '#chat_history li.communication_key'+
			Element.getClassInfoSeperator()+communicationKey;
		$$(selector).each(function(el) {
			var newEl = IcPage.getChatElement(
				InstructionControl.getInstance().getInstruction(
				'chat',el.getClassInfo('position'))
				);
			el.grab(newEl,'after');
			el.dispose();
		});
	},
	/**
	 * Function: updateProgressbar
	 *
	 * Handles updating the position of a Progressbar.
	 *
	 * Parameters:
	 *
	 *	channel - String: The name of the channel to update the Progressbar for
	 *	instruction - Instruction: The Instruction that has just been processed
	 *
	 * See Also:
	 *
	 *	<Instruction>
	 */
	updateProgressbar: function(channel,instruction) {
		if (IcPage.loading.done > 1) {
			return true;
		}
		IcPage.loading.processed[channel] = instruction.getPosition()+1;
		var activeChannels = InstructionControl._getKeys(IcPage.loading.processed);
		var total = 0;
		var processed = 0;
		for (var i=0;i<activeChannels.length;i++) {
			total = total + IcPage.loading.totals[activeChannels[i]];
			processed = processed + IcPage.loading.processed[activeChannels[i]];
		}
		var percent = processed / total; 
		percent = ( percent * 100 ) | 0;
		IcPage.loading.progress.set(percent);
	}
}
IcPage._objectTypePlugin = [];

// =============================================================================
// Below here is specific implementatin details, instead of core logic
// =============================================================================

InstructionControl.getInstance().bindClientReady(function() {
	
	IcPage.init();
		
	InstructionControl.getInstance().bind('main','*', function(instruction) {
		var inst = IcPopup_Plugin.getActiveInstance(true);
		if (inst) {
			inst._notifyInstructionProcessed(instruction.getPosition());
		}
		return true;
	});
	
	InstructionControl.getInstance().bind('main','_addRow', function() {
		var e = null;
		$$('.instruction_row_new').each(function(el) {
			e = el;
		});
		e.addClass('instruction_row');
		e.removeClass('instruction_row_new');
		e.removeEvents();
		e.getChildren().each(function(f) {
			f.dispose();
		});
		e.grab(new Element('li').grab(IcPage.createPlusElement()).addClass('first_plus'));
		e.addClass('row'+Element.getClassInfoSeperator()+$$('.instruction_row').length);
		IcPage.addRowAdder(e.getParent());
		IcPage.getSortables().addLists(e);
	});
	
	InstructionControl.getInstance().bind('main','_deleteInstruction', function(instruction) {
		var sel = 'li.position'+Element.getClassInfoSeperator()+instruction.getData()['_pos'];
		$$(sel).each(function(element) {
			element.dispose();
		});
	});
	
	InstructionControl.getInstance().bind('main','_moveInstruction', function(instruction) {
		var toMove = null;
		var moveToRow = null;
		$$('ul.instruction_row li.instruction').each(function(el) {
			if (el.getClassInfo('position') == instruction.getData().position) {
				toMove = el;
			}
		});
		toMove.show();
		var s = 'li.cinstruction.cposition'+Element.getClassInfoSeperator()+instruction.getData().position;
		$$(s).each(function(e) {
			e.dispose();
		});
		$$('ul.instruction_row').each(function(e) {
			if (e.getClassInfo('row') == instruction.getData()._row) {
				moveToRow = e;
			}
		});
		if (instruction.getData()._afterposition == -1) {
			var r = moveToRow.grab(toMove,'top');
			IcPage.fixFirstPlus();
			return r;
		}
		moveToRow.getChildren().each(function(li) {
			var pos = li.getClassInfo('position')
			if (pos == instruction.getData()._afterposition) {
				li.grab(toMove,'after');
			}
		});
		IcPage.fixFirstPlus();
	});
	
	InstructionControl.getInstance().bindUserJoined(function(communicationKey,detailsReceived) {
		var userDets = IcPage.mergeUserDetailsWithDefaults(communicationKey);
		if (communicationKey == InstructionControl.getInstance().getClientInstance().getCommunicationKey()) {
			var li = new Element('li').adopt(
				new Element('a',{
					'html':userDets['known_as'],       
					'href':'#',
					'events':{
						'click':function() {
							var ck = InstructionControl.getInstance().getClientInstance().getCommunicationKey();
							var details = InstructionControl.getInstance().getUserDetails(ck);
							var pop = IcPopup_EditUser.createInstance(
								{
									'known_as':details['known_as'],
									'color':details['color']
								});
							pop.display();
							return false;
						}
					}
				})
				);
			li.addClass('its_me');
			li.setStyle('color','#'+userDets['color']);
			$('user_list').grab(li);
		} else {
			var li = new Element('li',{
				'class':'communication_key'+Element.getClassInfoSeperator()+communicationKey,
				'styles':{'color':'#'+userDets['color']}
			});
			li.grab(new Element('span',{'html':userDets['known_as']}));
			$('user_list').grab(li);
		}
		IcPage.updateUserWithNewUserColor(communicationKey);
	});
	
	InstructionControl.getInstance().bindUpdateMyDetails(function(cK,details) {
		$$('ul li.its_me a').pop().set('text',details['known_as']);
		$$('ul li.its_me').pop().setStyle('color','#'+details['color']);
		IcPage.updateUserWithNewUserColor(cK);
	});
	
	InstructionControl.getInstance().bindUpdateUserDetails(function(commKey,userDetails) {
		var selector = '#user_list li';
		$$(selector).each(function(liEl) {
			if (liEl.getClassInfo('communication_key') == commKey) {
				liEl.getChildren('span').each(function(le) {
					le.set('text',userDetails.known_as);
				});
				liEl.setStyle('color','#'+userDetails['color']);
			}
		});
		IcPage.updateUserWithNewUserColor(commKey);
	});
	
	InstructionControl.getInstance().bindUserLeft(function(userCommunicationKey) {
		$('user_list').getChildren().each(function(el) {
			if (el.getClassInfo('communication_key') == userCommunicationKey) {
				el.dispose();
			}
		});
		IcPage.updateUserWithNewUserColor(userCommunicationKey);
	});
		
	InstructionControl.getInstance().bindSent(function(channel,position) {
		if (channel == 'main') {
			var inst = IcPopup_Plugin.getActiveInstance(true);
			if (inst) {
				inst._notifyWaitingFor(position);
			}
		}
	});
	
	InstructionControl.getInstance().bind('chat','line',function(instruction) {
		$('chat_history').grab(IcPage.getChatElement(instruction));
		new Fx.Scroll($('chat_history')).toBottom();
	});
	
	$$('ul.instruction_row .adder').addEvents({
		click: IcPage.plusPopup
	});
	
	$$('ul.instruction_row_new').addEvent('click',function() {
		InstructionControl.getInstance().send(
			'main','_addRow',{}
			);
	});
	
	$('chat_submit').addEvent('click',function() {
		var v = $('chat_input').get('value');
		if (v) {
			InstructionControl.getInstance().send('chat','line',{'text':v});
		}
	});
	
	document.ondragstart =  function() { return false; };
	
	IcPage.loading.progress = new dwProgressBar({
		container: $('loading_channels'),
		startPercentage: 0,
		speed:1,
		boxID: 'box2',
		percentageID: 'perc2',
		displayID: 'text',
		displayText: true,
		step:15
	});

	$('show_credits').addEvent('click',function() {
		cP = IcPopup.createInstance('credits',{},{});
		cP.bindOnDisplay(function() {
			$('popup_template_credits__close').addEvent('click',function() {
				IcPopup.getActiveInstance().hide();
			});
		});
		cP.display();
	});
	
	InstructionControl.getInstance().bindStartLoading(function(channel,count) {
		IcPage.loading.totals[channel] = count;
	});
	InstructionControl.getInstance().bindFinishLoading(function(channel) {
		IcPage.loading.done.push(channel);
		if (IcPage.loading.done.length == 2)
		{
			$('popup_template_help_show').set('disabled',false)
		}
	});
	
	$('popup_template_help_show').addEvent('click',function() {
		$('template__container').show();
		$('loading_window').hide();
	});
	
	$('popup_template_help_continue').setClassInfo('showing',1);
	$('popup_template_help_continue').addEvent('click',function() {
		var n = new Number($('popup_template_help_continue').getClassInfo('showing'));
		$('help_content_'+new String(n)).hide();
		n = n + 1;
		$('help_content_'+new String(n)).show();
		$('popup_template_help_continue').setClassInfo('showing',n);
		if (n > 6) {
			$('popup_template_help_continue').hide();
			$('popup_template_help_show').setStyle('display','inline');
		}
	});
	
	InstructionControl.getInstance().bind('main','*',function(instruction) {
		IcPage.updateProgressbar('main',instruction);
	});
	InstructionControl.getInstance().bind('chat','*',function(instruction) {
		IcPage.updateProgressbar('chat',instruction);
	});
	
	InstructionControl.getInstance().join('main');
	InstructionControl.getInstance().join('chat');
	
});


