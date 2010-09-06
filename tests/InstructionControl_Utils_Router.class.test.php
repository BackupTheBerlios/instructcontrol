<?php

require_once '../library/instructioncontrol/InstructionControl_Utils.class.php';

class InstructionControl_Utils_Router_Tester extends InstructionControl_Utils_Router {
	public function _getCallback() {
		return parent::_getCallback();
	}
}

class SuperLightStringRestRouterTest extends PHPUnit_Framework_TestCase {

	protected $backupGlobals = FALSE;
	
	function providerStuff() {
		
		$routerConfig = array(
			'GET'=>array(
				'/javascript'=>array($controller,'restJs'),
				'/:channelset'=>array($controller,'restGetChannelset'),
				'/:channelset/user'=>array($controller,'restGetChannelsetUser'),
				'/:channelset/user/:communication_key'=>array($controller,'restGetChannelsetUserCommunicationkey'),
				'/:channelset/:channel/:instruction'=>array($controller,'restGetChannelsetChannelInstruction'),
				'/:channelset/:channel'=>array($controller,'restGetChannelsetChannel'),
				'/'=>array($controller,'restRedirect'),
				''=>array($controller,'restRedirect'),
				),
			'POST'=>array(
				'/:channelset/:channel'=>array($controller,'restPostChannelsetChannel'),
				),
			'PUT'=>array(
				'/:channelset/user/me'=>array($controller,'restPutChannelsetUserMe'),
				),
			);
		
		return array(
			array(
				'/bob/smith/jones','GET',array('hi'=>'there'),
					array($controller,'restGetChannelsetChannelInstruction'),
					$routerConfig,
					array('hi'=>'there','channelset'=>'bob','channel'=>'smith','instruction'=>'jones'),
				),
			array(
				'/javascript','GET',array('hi'=>'there'),
					array($controller,'restJs'),
					$routerConfig,
					array('hi'=>'there'),
				),
			array(
				'/a/b','POST',array('hi'=>'there','iam'=>'bob'),
					array($controller,'restPostChannelsetChannel'),
					$routerConfig,
					array('hi'=>'there','iam'=>'bob','channelset'=>'a','channel'=>'b'),
				),
			);
	}
	
	/**
	 * @dataProvider providerStuff
	 */
	function testStuff($path,$method,$params,$expectedRoute,$routerConfig,$expectedOutParams) {
		$router = new InstructionControl_Utils_Router_Tester($path,$method,$params);
		
		foreach ($routerConfig as $requestMethod=>$requestMethodData) {
			foreach ($requestMethodData as $pathInfo=>$callback) {
				$router->addRoute($requestMethod,$pathInfo,$callback);
			}
		}
		
		$this->assertEquals(
			$expectedRoute,
			$router->_getCallback()
			);
		$this->assertEquals(
			$expectedOutParams,
			$router->getParams()
			);
			
		
	}

}
