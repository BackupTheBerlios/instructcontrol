<?php

require_once '../config/ichelloworld.defines.php';
require_once '../library/instructioncontrol/InstructionControl.class.php';

InstructionControl::setOptions(array(
	'APE_CONFIG_SERVER'=>INSTRUCTIONCONTROL__APE_CONFIG_SERVER,
	'PDO_DATABASE_CONNECTION_STRING'=>INSTRUCTIONCONTROL__PDO_DATABASE_CONNECTION_STRING,
	'PDO_DATABASE_USERNAME'=>INSTRUCTIONCONTROL__PDO_DATABASE_USERNAME,
	'PDO_DATABASE_PASSWORD'=>INSTRUCTIONCONTROL__PDO_DATABASE_PASSWORD,
	));


class InstructionControlTest extends PHPUnit_Framework_TestCase {
	
	protected $backupGlobals = FALSE;
	
	private function getDbFunctions() {
		return InstructionControl::getDbFunctionsInstance();
	}
	
	public function providerLoadUser() {
		$n = genSaneGuid();
		$u = InstructionControl::getUser(null,$n);
		return array(
			array($u['login_key'],$n,false),
			array(genSaneGuid(),genSaneGuid(),true)
			);
	}
	/**
	 * @dataProvider providerLoadUser
	 */
	public function testLoadUser($uKey,$knownAs,$expectException) {
		try {
			// check its loaded correctly
			$u = InstructionControl::loadUser($uKey);
			$this->assertEquals($knownAs,$u['known_as']);
			$this->assertFalse($expectException,'should have throw Exception');
		} catch (InstructionControl_Exception $e)
		{
			$this->assertTrue($expectException,'should not have throw Exception');
		}
	}
	
	public function providerGetUser() {
		$n = genSaneGuid();
		$u = InstructionControl::getUser(null,$n);
		return array(
			array($u['login_key'],$n,false),
			array(null,genSaneGuid(),true)
			);
	}
	/**
	 * @dataProvider providerGetUser
	 */
	public function testGetUser($uKey,$knownAs) {
		$u = InstructionControl::getUser($uKey,$knownAs);
		$this->assertEquals($knownAs,$u['known_as']);
		$uKey = $u['login_key'];
		$g = genSaneGuid();
		$u = InstructionControl::getUser($uKey,$g);
		$this->assertEquals($g,$u['known_as']);
		$this->assertEquals($uKey,$u['login_key']);
		InstructionControl::setUserDetails($uKey,array('color'=>'FF0000'));
		$u = InstructionControl::getUser($uKey,$g);
		$this->assertEquals('FF0000',$u['color']);
		return $u['communication_key'];
	}
	
	public function providerSetUserChannelset() {
		$u = InstructionControl::getUser();
		$csid = InstructionControl::getChannelSetId(genSaneGuid());
		$channelId = InstructionControl::getChannelId($csid,'xxx');
		return array(array($u['login_key'],$csid));
	}
	/**
	 * @dataProvider providerSetUserChannelset
	 */
	public function testSetUserChannelset($loginKey,$channelsetId) {
		$this->assertEquals(0,sizeof(InstructionControl::listUserForChannelset($channelsetId)));
		$u = InstructionControl::getUser($loginKey);
		InstructionControl::setUserChannelset($u['id'],$channelsetId);
		$this->assertEquals(1,sizeof(InstructionControl::listUserForChannelset($channelsetId)));
		$v = array_pop(InstructionControl::listUserForChannelset($channelsetId));
		$this->assertEquals($u,$v);
	}
	
	public function providerGetChannelId() {
		$g1 = genSaneGuid();
		$csid = InstructionControl::getChannelSetId($g1);
		$g2 = genSaneGuid();
		$i = InstructionControl::getChannelId($csid,$g2);
		return array(
			array($i,$csid,$g2),
			);
	}
	/**
	 * @dataProvider providerGetChannelId
	 */
	public function testGetChannelId($id,$channelsetId,$name) {
		$this->assertEquals($id,
			InstructionControl::getChannelId($channelsetId,$name)
			);
		$g = genSaneGuid();
		$j = InstructionControl::getChannelId($channelsetId,$g);
		$k = InstructionControl::getChannelId($channelsetId,$g);
		$this->assertEquals($k,$j);
		return $k;
	}
	
	public function providerGetChannelsetId() {
		$g1 = genSaneGuid();
		$i = InstructionControl::getChannelsetId($g1);
		return array(
			array($i,$g1),
			);
	}
	/**
	 * @dataProvider providerGetChannelsetId
	 */
	public function testGetChannelsetId($id,$name) {
		$this->assertEquals($id,
			InstructionControl::getChannelsetId($name)
			);
		$g = genSaneGuid();
		$j = InstructionControl::getChannelsetId($g);
		$k = InstructionControl::getChannelsetId($g);
		$this->assertEquals($k,$j);
		return $k;
	}
	
	public function _getChannelId($g2) {
		$g1 = genSaneGuid();
		$csid = InstructionControl::getChannelSetId($g1);
		$i = InstructionControl::getChannelId($csid,$g2);
		return $i;
	}
	
	public function providerGetChannelsetChannelIds() {
		$gc0 = array();
		$g0 = InstructionControl::getChannelSetId(genSaneGuid());
		$gc1 = array();
		$g1 = InstructionControl::getChannelSetId(genSaneGuid());
		$gc1[] = InstructionControl::getChannelId($g1,genSaneGuid());
		$gc2 = array();
		$g2 = InstructionControl::getChannelSetId(genSaneGuid());
		$gc2[] = InstructionControl::getChannelId($g2,genSaneGuid());
		$gc2[] = InstructionControl::getChannelId($g2,genSaneGuid());
		$gc2[] = InstructionControl::getChannelId($g2,genSaneGuid());
		$gc2[] = InstructionControl::getChannelId($g2,genSaneGuid());
		$gc2[] = InstructionControl::getChannelId($g2,genSaneGuid());
		return array(
			array($g0,$gc0),
			array($g1,$gc1),
			array($g2,$gc2)
			);
	}
	
	/**
	 * @dataProvider providerGetChannelsetChannelIds
	 */
	public function testGetChannelsetChannelIds($id,$expectedChannelIds) {
		$this->assertEquals(
			$expectedChannelIds,
			InstructionControl::getChannelsetChannelIds($id)
			);
	}
		
	/**
	 */
	public function testReserveInstructionId() {
		$user = InstructionControl::getUser(null,genSaneGuid());
		$channelName = genSaneGuid();
		$channelId = $this->_getChannelId($channelName);
		$objectType = genSaneGuid();
		$id = InstructionControl::reserveInstructionId(
			$user['id'],
			$channelId,
			$objectType
			);
		foreach ($this->getDbFunctions()->pdoGetResults('
			select channel.name as n,object_type as o, position as p
			from instruction
			inner join channel on channel.id = instruction.channel_id
			where instruction.id = :i',array('i'=>$id)) as $row) {
			$this->assertEquals($row['n'],$channelName);
			$this->assertEquals($row['o'],$objectType);
			$p = $row['p'];
		}
		$id = InstructionControl::reserveInstructionId(
			$user['id'],
			$channelId,
			$objectType
			);
		foreach ($this->getDbFunctions()->pdoGetResults('
			select channel.name as n,object_type as o, position as p
			from instruction
			inner join channel on channel.id = instruction.channel_id
			where instruction.id = :i',array('i'=>$id)) as $row) {
			$this->assertEquals($row['n'],$channelName);
			$this->assertEquals($row['o'],$objectType);
			$this->assertEquals($row['p'],$p+1);
		}
		return array('position'=>$p+1,'id'=>$id);
	}
	
	public function providerAddInstructionData() {
		return array(
			array('car',array(
				'Color'=>'Red',
				'Speed'=>'Fast',
				'Specs'=>array('BHP'=>'300','Weight'=>'2Ton','Wheels'=>'4')
				)),
			array('bike',array(
				'Color'=>'Blue',
				'Speed'=>'Med',
				'Specs'=>array('BHP'=>'0.2','Weight'=>'1KG','Wheels'=>'2')
				)),
			array('walk',array(
				'Color'=>'Null',
				'Speed'=>'3MPH',
				'Specs'=>array('BHP'=>'NULL','Weight'=>'NULL','Wheels'=>'0'),
				'Articles'=>array(
					'Jeremy'=>array('Title'=>'Walking Sucks','Content'=>'Dont walk its stupid.')
					)
				)),
			);
	}
	/**
	 * @dataProvider providerAddInstructionData
	 */
	public function testAddInstructionData($objectType,$data) {
		$channel = genSaneGuid();
		$user = InstructionControl::getUser(null,genSaneGuid());
		$channel = genSaneGuid();
		$channelId = $this->_getChannelId($channel);
		$id = InstructionControl::reserveInstructionId(
			$user['id'],
			$channelId,
			$objectType
			);
		InstructionControl::addInstructionData($id,$data);
		$loaded = array_pop(InstructionControl::getInstructionForChannel($channelId));
		$expected = array(
			'object_type'=>$objectType,
			'communication_key'=>$user['communication_key'],
			'position'=>0,
			'data'=>$data);
		$this->assertEquals($expected,$loaded);
	}
	
	public function testGetInstructionForChannel() {
		// Load a load of data and check we can read it back.
		$channel = genSaneGuid();
		$channelId = $this->_getChannelId($channel);
		$user = InstructionControl::getUser(null,genSaneGuid());
		foreach ($this->providerAddInstructionData() as $dataChunk) {
			$data = $dataChunk[1];
			$objectType = $dataChunk[0];
			$id = InstructionControl::reserveInstructionId(
				$user['id'],
				$channelId,
				$objectType
				);
			InstructionControl::addInstructionData($id,$data);
		}
		$loadedData = InstructionControl::getInstructionForChannel($channelId);
		$position = 0;
		foreach ($this->providerAddInstructionData() as $dataChunk)
		{
			$data = $dataChunk[1];
			$objectType = $dataChunk[0];
			$loaded = array_shift($loadedData);
			$expected = array(
				'object_type'=>$objectType,
				'communication_key'=>$user['communication_key'],
				'position'=>$position++,
				'data'=>$data
				);
			$this->assertEquals($expected,$loaded);
		}
		// Also check that if we supply a non existant channel we get an empty
		// array
		$this->assertEquals(
			array(),
			InstructionControl::getInstructionForChannel(genSaneGuid())
			);
	}
	
	/**
	 * @depends testReserveInstructionId
	 */
	public function testGetPositionForInstructionId($data) {
		$p = InstructionControl::getPositionForInstructionId($data['id']);
		$this->assertEquals($data['position'],$p);
		$this->assertEquals(
			null,
			InstructionControl::getPositionForInstructionId(-1)
			);
	}
	
	public function testGetSetOptionOptions() {
		$ops = InstructionControl::getOptions();
		$k = genSaneGuid();
		$v = genSaneGuid();
		InstructionControl::setOptions(array($k=>$v));
		$this->assertEquals(
			$v,
			InstructionControl::getOption($k)
			);
		$newOps = array_merge($ops,array($k=>$v));
		InstructionControl::setOptions($newOps);
		foreach (InstructionControl::getOptions() as $k=>$v) {
			$this->assertEquals($newOps[$k],$v);
		}
		InstructionControl::setOptions($ops);
	}

	public function testGetCommunicationGuidsAreUnique() {
		$user = InstructionControl::getUser(null,genSaneGuid());
		$user2 = InstructionControl::getUser(null,genSaneGuid());
		$this->assertNotEquals($user['communication_key'],$user2['communication_key']);
	}
	
	public function testGetChannelname()
	{
		$g1 = InstructionControl::getChannelSetId(genSaneGuid());
		$n = genSaneGuid();
		$chanId = InstructionControl::getChannelId($g1,$n);
		$this->assertEquals($n,InstructionControl::getChannelname($chanId));
		$this->assertEquals(null,InstructionControl::getChannelname(-100));
	}
	
	public function testGetUserByCommunicationKey()
	{
		$csid = InstructionControl::getChannelSetId(genSaneGuid());
		$u = InstructionControl::getUser(null,$n);
		$u = InstructionControl::getUser($u['login_key'],$n);
		InstructionControl::setUserChannelset($u['id'],$csid);
		$v = InstructionControl::getUserByCommunicationKey($csid,$u['communication_key']);
		$this->assertEquals($u,$v);
		$w = InstructionControl::getUserByCommunicationKey($csid,genSaneGuid());
		$this->assertNull($w);
	}
	
}
