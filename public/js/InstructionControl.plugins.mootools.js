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

IcObjectTypePlugin_BuiltIn_StringNumberBase = new Class({
	Extends: IcObjectTypePlugin,
	initialize: function() {},
	getGroup: function() {
		return 'BuiltIn';
	},
	getPreviewValue: function(instruction) {
		return instruction.getData()['value'];
	},
	initPopup: function(popup) {
		var setThing = function(icPopup_Plugin) {
			return {
				'value':$('popup_template_add__input_value').get('value')
			}
		}
		$('popup_template_add__input_value').set('value',popup.getData().value);
		for (var i=0;i<this.getChecks().length;i++)
		{
			var checkName = this.getChecks()[i];
			popup.bindValidation(this['_check'+checkName]);
		}
		popup.bindDataCollection(setThing)
	}
});
IcObjectTypePlugin_BuiltIn_String = new Class({
	Extends: IcObjectTypePlugin_BuiltIn_StringNumberBase,                  
	getName: function() {
		return 'String';
	},
	getChecks: function() {
		return ['StringLength']
	},
	_checkStringLength: function(icPopup_Plugin) {
		if ($('popup_template_add__input_value').get('value').length == 0) {
			icPopup_Plugin.addValidationError(
				'popup_template_add__input_value',
				'You must specify a value'
				);
		}
	},
	getIconUrl: function(instruction) {
		return '/img/famfamfam/silk/text_align_left.png';
	}
});
IcPage.addObjectTypePlugin(new IcObjectTypePlugin_BuiltIn_String());


var IcObjectTypePlugin_BuiltIn_Number = new Class({
	Extends: IcObjectTypePlugin_BuiltIn_StringNumberBase,
	getIconUrl: function(instruction) {
		return '/img/famfamfam/silk/sum.png';
	},
	getChecks: function() {
		return ['IsNumber'];
	},
	_checkIsNumber: function(icPopup_Plugin) {
		var s = $('popup_template_add__input_value').get('value');
		if (!s.match(/^\-*[0-9]+(\.[0-9]+)?$/)) {
			icPopup_Plugin.addValidationError(
				'popup_template_add__input_value',
				'That is not a number'
				);
		}
	},
	getName: function() {
		return 'Number';
	}
});
IcPage.addObjectTypePlugin(new IcObjectTypePlugin_BuiltIn_Number());

var IcObjectTypePlugin_BuiltIn_Date = new Class({
	Extends: IcObjectTypePlugin,
	initialize: function() {},
	getGroup: function() {
		return 'BuiltIn';
	},
	getName: function() {
		return 'Date';
	},
	getIconUrl: function(instruction) {
		return '/img/famfamfam/silk/date.png';
	},
	getPreviewValue: function(instruction) {
		return this.getBody(instruction);
	},
	getBody: function(instruction) {
		var data = instruction.getData();
		return new Date(new Number(data['value'])*1000).toString('d MMMM yyyy');
	},
	initPopup: function(popup) {
		
		var setThing = function(icPopup_Plugin) {
			var ar = $('popup_template_add__input_value').get('value').split('/');
			return {
				'value':new Date(ar[2],new Number(ar[0])-1,ar[1]).getTime()/1000
			}
		}
		
		var checkHave = function(icPopup_Plugin) {
			var s = $('popup_template_add__input_value').get('value');
			if (!s.match(/^[0-9]+\/[0-9]+\/[0-9]+$/))
			{
				icPopup_Plugin.addValidationError(
					'popup_template_add__input_value',
					'You must select a date'
					);
			}
		}
		
		var checkNotError = function(icPopup_Plugin) {
			if ($('date_error')) {
				icPopup_Plugin.addValidationError(
					'popup_template_add__input_value',
					'You must select a date'
					);
			}
		}
		
		if (popup.getData().value) {
			var d = new Date(new Number(popup.getData().value)*1000);
			var dar = [
				new String(d.getMonth()+1),
				new String(d.getDate()),
				new String(d.getFullYear())
				];
			$('popup_template_add__input_value').set('value',dar.join('/'));
		}
		
		new StupidDate(
			$('popup_template_add__input_value'), {
			'onBadDate': function() {
				var e = new Element('span',{
					'id':'date_error',
					'html':'invalid date',
					'class':'error_text'
				});
				$('popup_template_add__time_row').grab(e)
			},
			'onGoodDate': function() {
				var e = $('date_error');
				if (e) {
					e.dispose();
				}
			}});
		
		popup.bindValidation(checkHave);
		popup.bindValidation(checkNotError);
		popup.bindDataCollection(setThing)
	}
}); 
IcPage.addObjectTypePlugin(new IcObjectTypePlugin_BuiltIn_Date());

var IcObjectTypePlugin_Extended_GoogleMaps = new Class({
	Extends: IcObjectTypePlugin,
	initialize: function() {},
	getGroup: function() {
		return 'Extended';
	},
	getName: function() {
		return 'GoogleMaps';
	},
	getIconUrl: function(instruction) {
		return '/img/famfamfam/silk/map.png';
	},
	initPopup: function(popup) {
		var map = null;
		var marker = null;
		var geocoder = new google.maps.Geocoder();
		
		map = new google.maps.Map(document.getElementById("popup_map_canvas"),{
			zoom: 12,
			center: new google.maps.LatLng(51.516207,-0.13087),
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			draggableCursor: 'pointer'
		});
		
		google.maps.event.addListener(map, 'click', function(ob) {
			if (marker) {
				marker.setVisible(false);
			}
			$('gm_lat').set('value',ob.latLng.lat());
			$('gm_lng').set('value',ob.latLng.lng());
			marker = new google.maps.Marker({
				position: ob.latLng, 
				map: map,
				title:"Where you clicked!"
			});
		});
		
		if (popup.getData().lat != null)
		{
			var loadedLat = popup.getData().lat;
			var loadedLng = popup.getData().lng;
			$('gm_lat').set('value',loadedLat);
			$('gm_lng').set('value',loadedLng);
			$('pos_name').set('value',popup.getData().pos_name);
			var latLng = new google.maps.LatLng(loadedLat,loadedLng);
			map.setCenter(latLng);
			map.setZoom(16);
			marker = new google.maps.Marker({
				position: latLng, 
				map: map,
				title:"Where you clicked!"
			});
		}
		
		$('do_search').addEvent('click',function() {
			var gotoGeoResultOne = function(results,status) {
				if (status != google.maps.GeocoderStatus.OK) {
					alert("Geocode was not successful for the following reason: " + status);
					return;
				}
				map.setCenter(results[0].geometry.location);
				map.setZoom(13);
			};
			geocoder.geocode({'address':$('place_box').get('value')},gotoGeoResultOne);
		});
		
		var checkHave = function(icPopup_Plugin) {
			if (!marker)
			{
				icPopup_Plugin.addValidationError(
					'pos_name',
					'You must select an area on the map'
				);
			}
		}
		var checkName = function(icPopup_Plugin) {
			if (!$('pos_name').get('value')) {
				icPopup_Plugin.addValidationError(
					'pos_name',
					'You must give the place a name'
				);
			}
		}
		var setThing = function(icPopup_Plugin) {
			return {
				'lat':$('gm_lat').get('value'),
				'lng':$('gm_lng').get('value'),
				'pos_name':$('pos_name').get('value')
			};
		}
		
		popup.bindValidation(checkHave);
		popup.bindValidation(checkName);
		popup.bindDataCollection(setThing)
	},
	getBody: function(instruction) {
		var data = instruction.getData();
		return data['pos_name'];
	},
	getPreviewValue: function(instruction) {
		var data = instruction.getData();
		var w=320;
		var h=240;
		var url = 'http://maps.google.com/maps/api/staticmap?size={w}x{h}&sensor=false'
		var url = url + '&center={lat},{lng}&zoom=16&markers={lat},{lng}';
		url = url.substitute({'lat':data.lat,'lng':data.lng,'w':w,'h':h});
		var img = '<img src="{url}" width="{w}" height="{h}" alt="{n}"/>';
		var imgHtml = img.substitute({
			'w':w,
			'h':h,
			'url':url,
			'n':data.pos_name
		});
		return '<div>{imgHtml}</div><div>{n}</div>'.substitute({
			'imgHtml':imgHtml,
			'n':data.pos_name
		});
	}
});
IcPage.addObjectTypePlugin(new IcObjectTypePlugin_Extended_GoogleMaps());

StupidDate = new Class({
	inputElement: null,
	d: null,
	m: null,
	y: null,
	options: null,
	onBadDateDefault: function(m,d,y) {
		var mWord = this.options.months[m-1];
		alert(mWord+' does not have '+d+' days.');
	},
	onGoodDateDefault: function(m,d,y) {
	},
	onGoodDate: null,
	onBadDate: null,
	initialize: function(el,options) {
		if ($type(options) == false) {
			options = new Hash({});
		}
		defaultOptions = new Hash({
			'days':['01','02','03','04','05','06','07','08','09',
				'10','11','12','13','14','15','16','17','18','19',
				'20','21','22','23','24','25','26','27','28','29',
				'30','31'],
			'months':[],
			'years':[],
			'onBadDate':this.onBadDateDefault,
			'onGoodDate':this.onGoodDateDefault,
		});
		for (var i=1900;i<2100;i++) {
			defaultOptions['years'].push(i);
		}
		for (var i=0;i<12;i++) {
			defaultOptions['months'].push(new Date(2000,i,1).toString('MMMM'));
		}
		this.options = defaultOptions.extend(options);
		
		this.inputElement = el;
		this.d = new Element('select');
		this.m = new Element('select');
		this.y = new Element('select');
		
		this.fillPulldown(this.d,this.options.days,1);
		this.fillPulldown(this.m,this.options.months,0);
		this.fillPulldown(this.y,this.options.years,null);
		
		el.grab(this.y,'after');
		el.grab(this.m,'after');
		el.grab(this.d,'after');
		
		this.updatePulldowns();
		this.doBindings();
		this.inputElement.hide();
	},
	fillPulldown: function(el,options,offset) {
		for (var i=0;i<options.length;i++) {
			var v = options[i];
			if ($type(offset) != false) {
				v = new Number(i)+offset;
			}
			el.grab(new Element('option',{
				'value':v,
				'html':options[i]
			}));
		}
	},
	doBindings: function() {
		var els = [this.d,this.m,this.y];
		for (var i=0;i<els.length;i++) {
			els[i].addEvent('change',function() {
				this.updateInputEl();
			}.bind(this));
		}
	},
	sanitizeD: function(str) {
		if ((str.match(/[0-9]{1,2}/)) && new Number(str) > 0) {
			return str.replace(/^0+/,'');
		}
		return '1'
	},
	sanitizeM: function(str) {
		return this.sanitizeD(str);
	},
	sanitizeY: function(str) {
		if (str.match(/[0-9]{4}/)) {
			return str;
		}
		if (str.match(/[0-9]{2}/)) {
			var n = new Number(str);
			if (n > 70) {
				return '19'+str;
			}
			return '20'+str;
		}
		return '1900';
	},
	updatePulldowns: function() {
		var values = this.inputElement.get('value').split('/');
		var updateAfter = false;
		if (!this.inputElement.get('value').match(/^[0-9]+\/[0-9]+\/[0-9]+$/)) {
			var d = new Date();
			values = [
				this.sanitizeM(new String(d.getMonth()+1)),
				this.sanitizeD(new String(d.getDate())),
				this.sanitizeY(new String(d.getFullYear()))
				];
			updateAfter = true;
		}
		this.d.set('value',this.sanitizeD(values[1]));
		console.log(this.sanitizeM(values[1]));
		this.m.set('value',this.sanitizeM(new String(new Number(values[0])-1)));
		this.y.set('value',this.sanitizeY(values[2]));
		if (updateAfter) {
			this.updateInputEl();
		}
	},
	checkSelectedDate: function() {
		var daysInMonth = Date.getDaysInMonth(
			this.y.get('value'),
			this.m.get('value')
			);
		var selectedD = new Number(this.d.get('value'));
		if (selectedD > daysInMonth) {
			this.options.onBadDate(
				this.m.get('value'),this.d.get('value'),this.y.get('value')
				);
		} else {
			this.options.onGoodDate(
				this.m.get('value'),this.d.get('value'),this.y.get('value')
				);
		}
	},
	updateInputEl: function() {
		var padZero = function(s) {             
			while (s.length < 2) {
				s = '0'+s;
			}
			return s;
		}
		var ar = [
			padZero(new String(new Number(this.m.get('value'))+1)),
			padZero(this.d.get('value')),
			padZero(this.y.get('value'))
		];
		this.inputElement.set('value',ar.join('/'));
		this.inputElement.fireEvent('change');
		this.checkSelectedDate();
	}
});

