<?php

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
 * Support classes for the REST service of InstructionControl. 
 *
 * The main InstructionControl class should have no dependences on these classes
 *  __at all__ but these do depend on InstructionControl. These are not meant to
 * be perfect solutions and certainly are not designed as an alternative to the
 * Zend Framework or Recess, they are mostly here to keep InstructionControl 
 * small, self contained and with no huge dependences.
 *
 * @see http://www.recessframework.org/
 * @see http://framework.zend.com/
 * @package InstructionControl_Utils
 */

/**
 * Base class for a basic view renderer
 *
 * @package InstructionControl_Utils
 */
abstract class InstructionControl_Utils_ViewRenderer {
	/**
	 * Renders a template.
	 *
	 * @param string $templateFilename The template file or resource.
	 * @param array $data An associative array of data to be passed to the 
	 *	template engine
	 */
	public abstract function renderTemplate($templateFilename,$data);
}

/**
 * View Renderer for plain PHP.
 *
 * @package InstructionControl_Utils
 */
class InstructionControl_Utils_ViewRenderer_Php extends InstructionControl_Utils_ViewRenderer {
	/**
	 * Renders a PHP file.
	 *
	 * @param string $templateFilename The name of a PHP file (can be anywhere
	 *	on the include path.
	 * @param array $data Data to pass to the PHP file, this data will be 
	 * `extract()`'d so `array('a'=>1,'b'=>2)` will be available as `$a` and `$b`.
	 *
	 * @see http://php.net/manual/en/function.extract.php
	 */
	public function renderTemplate($templateFilename,$data) {
		if (is_array($data)) {
			extract($data);
		}
		include $templateFilename;
	}
}

/**
 * View Renderer for the excellent Dwoo template engine.
 *
 * @see http://dwoo.org/
 *
 * @package InstructionControl_Utils
 */
class InstructionControl_Utils_ViewRenderer_Dwoo extends InstructionControl_Utils_ViewRenderer {
	/**
	 * Renders a Dwoo template.
	 *
	 * @param $templateFilename string The name of a template file.
	 * @param $data array Data to pass to the template.
	 *
	 * @see http://dwoo.org/
	 */
	public function renderTemplate($templateFilename,$data) {
		$dwoo = new Dwoo();
		$tpl = new Dwoo_Template_File($templateFilename);
		$compiler = new Dwoo_Compiler();
		if (!file_exists(INSTRUCTIONCONTROL__CONFIG_DWOO_COMPILEDIR)) {
			mkdir(INSTRUCTIONCONTROL__CONFIG_DWOO_COMPILEDIR);
		}
		$dwoo->setCompileDir(INSTRUCTIONCONTROL__CONFIG_DWOO_COMPILEDIR);
		$dwoo->output($tpl,$data);
	}
}

/**
 * Exception thrown when no valid route can be found.
 *
 * @package InstructionControl_Utils
 */
class InstructionControl_Utils_Router_CouldNotFindRoute_Exception extends Exception {}

/**
 * A very light router, can take extract parameters from the resource section of
 * a path and route based on request methods. It works by attaching callbacks to
 * routes.
 *
 * @package InstructionControl_Utils
 */
class InstructionControl_Utils_Router {
	
	private $routes = array();
	
	/**
	 * Constructor.
	 *
	 * @param string $pathInfo The request path, eg $_SERVER['PATH_INFO']
	 * @param string $serverRequestMethod The method used for the request, eg 
	 *	$_SERVER['REQUEST_METHOD']
	 * @param array $params Parameters passed  to the page, eg $_REQUEST
	 * @param string $requestMethodOverride Because proxies can get in the way
	 *	of different request methods, use this to overide $serverRequestMethod,
	 *	it could be forinstance $_REQUEST['_REQUEST_METHOD'].
	 */
	public function __construct($pathInfo,$serverRequestMethod,$params,$requestMethodOverride=null) {
		$this->pathInfo = $pathInfo;
		$this->requestMethod = $requestMethodOverride ? $requestMethodOverride : $serverRequestMethod;
		$this->params = $params;
	}
	
	/**
	 * Adds a route to the routing list.
	 *
	 * The routes are converted into a regular expression and ran in the order 
	 * they are added, so if a route is not being fired when you think it should
	 * be, examine the routes before it.
	 *
	 * @param string $requestMethod The HTTP method for example, GET, POST, DELETE etc.
	 * @param string $pathInfo The resource part of the URL eg /user/:login_name
	 * @param callback $callback The function to fire should the route get matched.
	 */
	public function addRoute($requestMethod,$pathInfo,$callback) {
		if (!array_key_exists($requestMethod,$this->routes)) {
			$this->routes[$requestMethod] = array();
		}
		$this->routes[$requestMethod][$pathInfo] = $callback;
	}
	
	/**
	 * Takes the route map and returns it with regex for the paths instead, 
	 *	this makes it usable by other code in the class.
	 */
	private function buildRegex() {
		$r = array();
		foreach ($this->routes as $requestMethod=>$routeInformation) {
			if (!array_key_exists($requestMethod,$r)) {
				$r[$requestMethod] = array();
			}
			foreach ($routeInformation as $k=>$v) {
				preg_match_all('/\:([0-9a-z_]+)+/',$k,$matches);
				$subs = array();
				foreach ($matches[1] as $match)
				{
					$subs[] = $match;
				}
				$nk = '/^'.preg_replace('/\:[0-9a-z_]+/','([0-9a-z_]+)',
					str_replace('/','\\/',$k)
					).'$/';;
				$vr['params'] = $subs;
				$vr['callback'] = $v;
				$r[$requestMethod][$nk] = $vr;
			}
		}
		return $r;
	}
	
	/**
	 * Does the work of figuring out what route is the correct one and what
	 * parameters are valid.
	 *
	 * @throws InstructionControl_Utils_Router_CouldNotFindRoute_Exception 
	 *	should no route be found
	 */
	private function calcs() {
		$routes = $this->buildRegex();
		$routes = $routes[$this->requestMethod];
		foreach ($routes as $routeRegex=>$data)
		{
			$matches = array();
			if (preg_match($routeRegex,$this->pathInfo,$matches))
			{
				$ps = array();
				foreach ($data['params'] as $k=>$v)
				{
					$ps[$v] = $matches[$k+1];
				}
				return array_merge($data,array(
					'callback'=>$data['callback'],
					'pathparams'=>$ps,
					));
			}
		}
		throw new InstructionControl_Utils_Router_CouldNotFindRoute_Exception('Could not find Route');
	}
	
	protected function _getCallback() {
		$data = $this->calcs();
		return $data['callback'];
	}
	
	/**
	 * Execute a route should it be found.
	 *
	 *
	 * @throws InstructionControl_Utils_Router_CouldNotFindRoute_Exception 
	 *	should no route be found
	 */
	public function fire() {
		return call_user_func($this->_getCallback(),$this->getParams(),$this);
	}
	
	/**
	 * Combines route params (from the path) with ones that were actually passed in.
	 *
	 * Warning no validation is done at all.
	 *
	 * @return array Associative array
	 */
	public function getParams() {
		$data = $this->calcs();
		return array_merge(
			$this->params,
			$data['pathparams']
			);
	}
	
}

/**
 * Basic controller for the InsructionControl RESTful service.
 *
 * @package InstructionControl_Utils
 */
class InstructionControl_Utils_Controller
{
	
	protected $defaultTemplate = null;
	protected $viewRenderer = null;
	
	/**
	 * Gets a session variable.
	 *
	 * @param string $k The key of the session variable.
	 */
	protected function getSessionVariable($k) {
		if (array_key_exists($k,$_SESSION)) {
			return $_SESSION[$k];
		}
		return null;
	}
	
	/**
	 * Sets a session variable.
	 *
	 * @param string $k The key of the session variable.
	 * @param var $v The value to store.
	 */
	protected function setSessionVariable($k,$v) {
		$_SESSION[$k] = $v;
	}
	
	/**
	 * Constructor.
	 *
	 * @param InstructionControl_Utils_ViewRenderer $viewRenderer The view renderer to use.
	 * @param string $defaultTemplate Just stored as an internal member variable
	 *	for use within all/some/none of the REST callbacks functions.
	 */
	public function __construct(InstructionControl_Utils_ViewRenderer $viewRenderer,$defaultTemplate) {
		$this->defaultTemplate = $defaultTemplate;
		$this->viewRenderer = $viewRenderer;
	}
	
	/**
	 * Creates and registers a new user in the Session.
	 *
	 * @param int $channelsetId The id of a Channelset
	 * @return array Information about the user that was just registered, this
	 *	will be all columns in the `user` table.
	 */
	private function _getUser_registerUser($channelsetId) {
		InstructionControl::startTransaction();
		if ($u = InstructionControl::getUser()) {
			InstructionControl::setUserChannelset($u['id'],$channelsetId);
			$this->setSessionVariable('USER_LOGIN_KEY',$u['login_key']);
		}
		InstructionControl::completeTransaction();
		return $u;
	}
	
	/**
	 * Registers a new user in the session if one does not exist and returns the
	 *	user in the session.
	 *
	 * @param int $channelsetId The id of a Channelset
	 * @return array All information about the user stored in the `user` table.
	 */
	protected function getUser($channelsetId) {
		if (!$this->getSessionVariable('USER_LOGIN_KEY')) {
			return $this->_getUser_registerUser($channelsetId);
		}
		return InstructionControl::getUser($this->getSessionVariable('USER_LOGIN_KEY'));
	}
	
	/**
	 * Returns the Id of a Channelset.
	 *
	 * @param string $name The name of a Channelset.
	 * @return int The Id of a Channelset
	 */
	protected function getChannelsetId($name)
	{
		if (!$this->getSessionVariable('KNOWN_CHANNELSET'))
		{
			$this->setSessionVariable('KNOWN_CHANNELSET',array());
		}
		if (in_array($name,$this->getSessionVariable('KNOWN_CHANNELSET')))
		{
			$ar = $this->getSessionVariable('KNOWN_CHANNELSET');
			return $ar[$name];
		}
		$sess = $this->getSessionVariable('KNOWN_CHANNELSET');
		$sess[$name] = InstructionControl::getChannelsetId($name);
		$this->setSessionVariable('KNOWN_CHANNELSET',$sess);
		return $sess[$name];
	}
	
	/**
	 * These are keys from the key value pair of `user` table that we do not 
	 * want to leak to the outside world.
	 *
	 * @todo 'communication_key' probably should not really be here, however with
	 * the current RESTFUL access methods it just makes the code slightly easier
	 * to write.
	 * @return array An array with the keys that need removing, values are 
	 *	empty, useful for using `array_diff()`
	 */
	protected function getProtectedUserPropertyKeys() {
		return array('id'=>'','login_key'=>'','communication_key'=>'');
	}
	
	/**
	 * This is an attempt to make feeding data into the page easier...
	 */
	protected function acquireData($params,$userRec) {
		return array(
			'config'=>array(
				'channelset'=>array(
					'name'=>$params['channelset']
					),
				'ape'=>array(
					'jsf'=>array(
						'root'=>INSTRUCTIONCONTROL__APE_JSF_ROOT,
						'url'=>INSTRUCTIONCONTROL__APE_CONFIG_BASEURL,
						),
					'server'=>INSTRUCTIONCONTROL__APE_CONFIG_SERVER,
					),
				'php_base_url'=>INSTRUCTIONCONTROL__PHP_URL,
				),
			'user'=>array(
				'communication_key'=>$userRec['communication_key'],
				)
			);
	}
	
	/**
	 * Renders the main page, so it's not really a RESTFUL API method at all!
	 *
	 * @param array $params Should have one kv pair with the key being 'channelset'.
	 */
	public function restGetChannelset($params) {
		$channelsetId = $this->getChannelSetId($params['channelset']);
		$userRec = $this->getUser($channelsetId);
		InstructionControl::setUserChannelset($userRec['id'],$channelsetId);
		
		$data = $this->acquireData($params,$userRec);
		
		$this->viewRenderer->renderTemplate($this->defaultTemplate,$data);
		return true;
	}
	
	/**
	 * Gets the data within a channel.
	 *
	 * Body of output document takes the form:
	 *
	 * <code>
	 * [{"object_type":"x","communication_key":"y","position":"99","data":{...},...]
	 * </code>
	 *
	 * @param array $params The following keys are expected: 
	 * 	`array('channelset'=>'name of channelset','channel'=>'name of channel')`
	 */
	public function restGetChannelsetChannel($params) {
		$channelsetId = $this->getChannelSetId($params['channelset']);
		$userRec = $this->getUser($channelsetId);
		InstructionControl::setUserChannelset($userRec['id'],$channelsetId);
		$data = InstructionControl::getInstructionForChannel(
			InstructionControl::getChannelId($channelsetId,$params['channel'])
			);
		header('HTTP/1.1 200 OK');
		echo json_encode(InstructionControl::generateReturnDocument(
			'CHANNEL_DATA',
			array(),array(),array(),array('channel'=>$params['channel']),$data
			));
		return true;
	}
	
	/**
	 * Lists public details about Users registered with a specific channelset.
	 *
	 * Body of output document takes the form:
	 *
	 * <code>
	 * {"user communication key":{"known_as":"Fred Basset"},...}
	 * </code>
	 *
	 * @param array $params Expects one key `channelset` which should be the
	 *	name of a channelset.
	 */
	public function restGetChannelsetUser($params) {
		$channelsetId = $this->getChannelSetId($params['channelset']);
		$allData = InstructionControl::listUserForChannelset($channelsetId);
		$r = array();
		foreach ($allData as $ad) {
			$r[$ad['communication_key']] = array_diff_key($ad,$this->getProtectedUserPropertyKeys());
		}
		header('HTTP/1.1 200 OK');
		echo json_encode(InstructionControl::generateReturnDocument(
			'USER_LIST',
			array(),array(),array(),array(),$r
			));
		return true;
	}

	/**
	 * Gets details of one specific user.
	 *
	 * Body of output document takes the form:
	 *
	 * <code>
	 * {"communication_key":"jd3432jssdfi","details":{"known_as":"Fred Basset",...}}
	 * </code>
	 *
	 * @param array $params Should take the form: 
	 *	`array('channelset'=>'name of channelset','communication_key'=>'of the user')`
	 */
	public function restGetChannelsetUserCommunicationkey($params) {
		$channelsetId = $this->getChannelSetId($params['channelset']);
		$userProperties = array_diff_key(
			InstructionControl::getUserByCommunicationKey($channelsetId,$params['communication_key']),
			$this->getProtectedUserPropertyKeys());
		if ($userProperties === null) {
			throw new Exception('Could not find user');
		}
		header('HTTP/1.1 200 OK');
		echo json_encode(InstructionControl::generateReturnDocument(
			'USER_DETAILS',
			array(),array(),array(),array(),
			array('communication_key'=>$params['communication_key'],'details'=>$userProperties)
			));
		return true;
	}
	
	/**
	 * Allows a user to update his/her user details
	 *
	 * @param array $params Is expected to have the following parameters: 
	 * 	`array('channelset'=>'name of channelset','details'=>array('k'=>'v pairs'))`
	 * @see InstructionControl_Utils_Controller::restGetChannelsetUserCommunicationkey()
	 *	for details about the output document
	 */
	public function restPutChannelsetUserMe($params) {
		$channelsetId = $this->getChannelSetId($params['channelset']);
		$userRec = $this->getUser($channelsetId);
		InstructionControl::setUserDetails($userRec['login_key'],$params['details']);
		$userProperties = InstructionControl::getUser($userRec['login_key']);
		$communicationKey = $userProperties['communication_key'];
		$userProperties = array_diff_key(
			$userProperties,
			$this->getProtectedUserPropertyKeys());
		$return = InstructionControl::generateReturnDocument(
			'USER_DETAILS',
			array(),array(),array(),array(),
			array('communication_key'=>$communicationKey,'details'=>$userProperties)
			);
		header('HTTP/1.1 202 Accepted');
		echo json_encode($return);
		if (INSTRUCTIONCONTROL__NOTIFY_OTHER_CLIENTS == 'APE') {
			InstructionControl::notifyOtherClientsApe($params['channelset'],null,$return);
		}
		return true;
	}

	/**
	 * Adds an Instruction to a Channel.
	 *
	 * Body of output document takes the form:
	 *
	 * <code>
	 * {"position":"12","channel":"main","data":{"k"=>"v pairs"},"object_type":"Car","communication_key":"g4c667c80947"}
	 * </code>
	 *
	 * @param array $params Expected in the form: 
	 *	`array('channelset'=>'name','channel'=>'name','object_type'=>'type of object','data'=>array('k'='v pairs'))
	 */
	public function restPostChannelsetChannel($params) {
		InstructionControl::startTransaction();
		$channelsetId = $this->getChannelSetId($params['channelset']);
		$userRec = $this->getUser($channelsetId);
		$channelId = InstructionControl::getChannelId($channelsetId,$params['channel']);
		$instructionId = InstructionControl::reserveInstructionId(
			$userRec['id'],
			$channelId,
			$params['object_type']
			);
		$data = array_key_exists('data',$_REQUEST) ? $_REQUEST['data'] : array();
		InstructionControl::addInstructionData($instructionId,$data);               
		InstructionControl::completeTransaction();
		$position = InstructionControl::getPositionForInstructionId($instructionId);
		$return = InstructionControl::generateReturnDocument(
			'INSTRUCTION',
			array(),array(),array(),array(),
			array('position'=>$position,'channel'=>$params['channel'],
				'data'=>$data,'object_type'=>$params['object_type'],
				'communication_key'=>$userRec['communication_key'])
			);
		header('HTTP/1.1 201 Created');
		echo json_encode($return);
		if (INSTRUCTIONCONTROL__NOTIFY_OTHER_CLIENTS == 'APE') {
			InstructionControl::notifyOtherClientsApe($params['channelset'],$channelId,$return);
		}
		return true;
	}
	
	/**
	 * Does a HTTP 303 redirect to the InstructionControl URL with a unique
	 *	channelset name appeneded.
	 */
	public function restRedirect($params) {
		header('HTTP/1.1 303 See Other');
		$url = INSTRUCTIONCONTROL__BASEURL.INSTRUCTIONCONTROL__PHP_URL;
		$url.= '/'.genSaneGuid();
		header('Location: '.$url);
	}
	
}
